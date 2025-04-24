import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/config";

// API URL

// const API_URL = process.env.EXPO_PUBLIC_API_URL;
console.log("Auth module using API URL:", API_URL);

// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  roles: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Storage Keys
const TOKEN_KEY = "@auth_token";
const USER_KEY = "@auth_user";

// Register a new user
export const register = async (
  username: string,
  email: string,
  password: string,
  userType: "customer" | "farmer" = "customer",
): Promise<User> => {
  try {
    // Trim inputs to ensure no whitespace issues
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    // Map userType to roles array - customer/buyer/user are all treated as the same role
    let roles = [];
    if (userType === "farmer") {
      roles = ["farmer"];
    } else {
      // "customer" is the same as "user" (or "buyer") in the system
      roles = ["user"]; // using the default "user" role for all customers/buyers
    }

    console.log("Registering user:", {
      username: trimmedUsername,
      email: trimmedEmail,
      userType,
      roles,
    });

    console.log(
      "Request payload:",
      JSON.stringify({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        roles,
      }),
    );

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        roles,
      }),
    });

    console.log("Registration status code:", response.status);
    const data = await response.json();
    console.log("Registration response:", JSON.stringify(data));

    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        // Handle validation errors
        console.log("Validation errors:", JSON.stringify(data.errors));
        const errorMessage = data.errors.map((err: any) => err.msg).join(", ");
        throw new Error(errorMessage || "Registration failed");
      }
      console.log("Non-validation error:", data.message);
      throw new Error(data.message || "Registration failed");
    }

    return data.user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Login user
export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    console.log("Logging in user:", { email });

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login response status:", response.status);

    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        // Handle validation errors
        const errorMessage = data.errors.map((err: any) => err.msg).join(", ");
        throw new Error(errorMessage || "Login failed");
      }
      throw new Error(data.message || "Login failed");
    }

    // Save auth data to storage
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    console.log("Retrieved user from storage:", userJson);
    const user = userJson ? JSON.parse(userJson) : null;
    if (user) {
      console.log("User roles from storage:", user.roles);
    }
    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

// Get stored token
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Get token error:", error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};

// Get user profile from API
export const getUserProfile = async (): Promise<User> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get user profile");
    }

    // Update stored user
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
};

// Change password
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to change password");
    }
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};

// Check if user has a specific role
export const hasRole = async (role: string): Promise<boolean> => {
  const user = await getCurrentUser();
  return user ? user.roles.includes(role) : false;
};

// Check if user is admin
export const isAdmin = async (): Promise<boolean> => {
  return hasRole("admin");
};

// Check if user is moderator
export const isModerator = async (): Promise<boolean> => {
  return hasRole("moderator");
};

// Check if user is a farmer
export const isFarmer = async (): Promise<boolean> => {
  return hasRole("farmer");
};

// Check if user is a customer (buyer)
export const isCustomer = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  // Anyone who is not a farmer is considered a customer
  return user ? !user.roles.includes("farmer") : false;
};
