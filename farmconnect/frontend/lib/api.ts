import { getToken } from "./auth";
import { Platform } from "react-native";
import { API_URL } from "../constants/config";

// Use the centralized config for API URL
// const API_URL =
//   process.env.EXPO_PUBLIC_API_URL;

// console.log(`Using API URL from config: ${API_URL}`);

interface RequestOptions extends RequestInit {
  authenticated?: boolean;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
  retryCount = 0, // Track retries
): Promise<ApiResponse<T>> {
  const { authenticated = true, ...fetchOptions } = options;

  // Set default headers
  const headers = new Headers(fetchOptions.headers);

  // Set Content-Type if not provided
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add auth header if needed
  if (authenticated) {
    try {
      const token = await getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        console.error("No auth token found for authenticated request");
        throw new Error("Authentication token not found");
      }
    } catch (tokenError) {
      console.error("Error getting auth token:", tokenError);
      throw tokenError;
    }
  }

  // Prepare request
  const url = `${API_URL}${endpoint}${
    endpoint.includes("?") ? "&" : "?"
  }_t=${Date.now()}`;
  const request = new Request(url, {
    ...fetchOptions,
    headers,
  });

  console.log(`API Request: ${request.method} ${url}`);

  try {
    // Add a timeout to the fetch request
    const fetchPromise = fetch(request);
    const timeoutPromise = new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 10000),
    ); // 10 second timeout

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    let data;

    try {
      data = await response.json();
    } catch (parseError) {
      console.error(
        `Error parsing JSON response from ${endpoint}:`,
        parseError,
      );
      data = { error: "Invalid JSON response" };
    }

    console.log(`API Response ${endpoint}: Status ${response.status}`);

    if (!response.ok) {
      console.error(`API Error ${response.status}:`, data);
    }

    return {
      data,
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);

    // Retry logic (up to 2 retries) for network errors
    if (retryCount < 2 && error.message?.includes("Network request failed")) {
      console.log(`Retrying request (${retryCount + 1}/2): ${endpoint}`);
      // Wait a bit before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount)),
      );
      return apiRequest(endpoint, options, retryCount + 1);
    }

    // If all retries failed or it's not a network error
    throw error;
  }
}

// User API endpoints
export const userApi = {
  // Get all users (admin only)
  getAllUsers: () => apiRequest<{ users: any[] }>("/users"),

  // Get user by ID
  getUserById: (userId: string) =>
    apiRequest<{ user: any }>(`/users/${userId}`),

  // Update user
  updateUser: (userId: string, userData: any) =>
    apiRequest<{ message: string; user: any }>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  // Delete user (admin only)
  deleteUser: (userId: string) =>
    apiRequest<{ message: string }>(`/users/${userId}`, {
      method: "DELETE",
    }),

  // Change user roles (admin only)
  changeUserRoles: (userId: string, roles: string[]) =>
    apiRequest<{ message: string; user: any }>(`/users/${userId}/roles`, {
      method: "PATCH",
      body: JSON.stringify({ roles }),
    }),
};

// Cart API endpoints
export const cartApi = {
  // Get user's cart
  getCart: () => apiRequest<{ success: boolean; cart: any }>("/cart"),

  // Add item to cart
  addToCart: (productId: string, quantity: number) =>
    apiRequest<{ success: boolean; cart: any; message: string }>("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),

  // Update cart item quantity
  updateCartItem: (productId: string, quantity: number) =>
    apiRequest<{ success: boolean; cart: any; message: string }>("/cart", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    }),

  // Remove item from cart
  removeFromCart: (productId: string) =>
    apiRequest<{ success: boolean; cart: any; message: string }>(
      `/cart/${productId}`,
      {
        method: "DELETE",
      },
    ),

  // Clear cart
  clearCart: () =>
    apiRequest<{ success: boolean; cart: any; message: string }>(
      "/cart/clear",
      {
        method: "DELETE",
      },
    ),
};

// Product API endpoints
export const productApi = {
  // Get all products
  getAllProducts: (params = {}) =>
    apiRequest<{ success: boolean; products: any[]; totalProducts: number }>(
      "/products",
      {
        method: "GET",
      },
    ),

  // Get product by ID
  getProductById: (productId: string) =>
    apiRequest<{ success: boolean; product: any }>(`/products/${productId}`, {
      method: "GET",
    }),

  // Get products by category
  getProductsByCategory: (category: string) =>
    apiRequest<{ success: boolean; products: any[]; totalProducts: number }>(
      `/products?category=${category}`,
      {
        method: "GET",
      },
    ),

  // Get products for the authenticated farmer (more reliable)
  getMyProducts: () =>
    apiRequest<{ success: boolean; products: any[] }>("/products/my-products", {
      method: "GET",
    }),

  // Get products by farmer ID
  getProductsByFarmer: (farmerId: string) =>
    apiRequest<{ success: boolean; products: any[] }>(
      `/products/farmer/${farmerId}`,
      {
        method: "GET",
      },
    ),

  // Create a new product
  createProduct: (productData: any) =>
    apiRequest<{ success: boolean; product: any }>("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  // Test endpoint for creating a product (bypasses some auth checks)
  testCreateProduct: (farmerId: string, productData: any) =>
    apiRequest<{ success: boolean; product: any }>(
      `/products/test-create/${farmerId}`,
      {
        method: "POST",
        body: JSON.stringify(productData),
      },
    ),

  // Update an existing product
  updateProduct: (productId: string, productData: any) =>
    apiRequest<{ success: boolean; product: any }>(`/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  // Delete a product
  deleteProduct: (productId: string) =>
    apiRequest<{ success: boolean; message: string }>(
      `/products/${productId}`,
      {
        method: "DELETE",
      },
    ),
};

// Order API endpoints
export const orderApi = {
  // Get all orders for the current user
  getUserOrders: () =>
    apiRequest<{ success: boolean; orders: any[] }>("/orders/user", {
      method: "GET",
    }),

  // Get all orders for the farmer
  getFarmerOrders: () =>
    apiRequest<{ success: boolean; orders: any[] }>("/orders/farmer", {
      method: "GET",
    }),

  // Get order by ID
  getOrderById: (orderId: string) =>
    apiRequest<{ success: boolean; order: any }>(`/orders/${orderId}`, {
      method: "GET",
    }),

  // Create a new order
  createOrder: (orderData: any) =>
    apiRequest<{ success: boolean; order: any }>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  // Cancel order
  cancelOrder: (orderId: string) =>
    apiRequest<{ success: boolean; message: string }>(
      `/orders/${orderId}/cancel`,
      {
        method: "PATCH",
      },
    ),
};
