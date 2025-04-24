import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import * as AuthService from "./auth";
import { User } from "./auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isFarmer: boolean;
  isCustomer: boolean;
  login: (email: string, password: string) => Promise<AuthService.AuthResponse>;
  register: (
    username: string,
    email: string,
    password: string,
    userType?: "customer" | "farmer",
  ) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [isFarmer, setIsFarmer] = useState<boolean>(false);
  const [isCustomer, setIsCustomer] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const authenticated = await AuthService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);

          // Check roles
          if (currentUser?.roles) {
            console.log("Checking roles:", currentUser.roles);
            setIsAdmin(currentUser.roles.includes("admin"));
            setIsModerator(currentUser.roles.includes("moderator"));
            setIsFarmer(currentUser.roles.includes("farmer"));

            // Anyone who is not a farmer is considered a customer
            // This will accept 'user', 'customer' or any default role
            setIsCustomer(!currentUser.roles.includes("farmer"));
          }
        }
      } catch (error) {
        console.error("Auth status check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthService.AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);

      // Set role flags
      console.log("Setting roles from login response:", response.user.roles);
      setIsAdmin(response.user.roles.includes("admin"));
      setIsModerator(response.user.roles.includes("moderator"));
      setIsFarmer(response.user.roles.includes("farmer"));

      // Anyone who is not a farmer is considered a customer
      setIsCustomer(!response.user.roles.includes("farmer"));

      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    userType: "customer" | "farmer" = "customer",
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("AuthContext: Starting registration process");

      const user = await AuthService.register(
        username,
        email,
        password,
        userType,
      );
      console.log("AuthContext: Registration successful", user);

      return user;
    } catch (error) {
      console.error("AuthContext registration error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Registration failed. Please try again.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsModerator(false);
      setIsFarmer(false);
      setIsCustomer(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const updatedUser = await AuthService.getUserProfile();
      setUser(updatedUser);

      // Update role flags
      console.log("Refreshing user roles:", updatedUser.roles);
      setIsAdmin(updatedUser.roles.includes("admin"));
      setIsModerator(updatedUser.roles.includes("moderator"));

      // Set farmer role
      const isFarmerRole = updatedUser.roles.includes("farmer");
      setIsFarmer(isFarmerRole);

      // Anyone who is not a farmer is considered a customer
      setIsCustomer(!isFarmerRole);
    } catch (error) {
      // If error (e.g., token expired), log out
      console.error("Error refreshing user:", error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isModerator,
    isFarmer,
    isCustomer,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
