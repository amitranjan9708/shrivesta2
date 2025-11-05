// API service layer for communicating with the backend
// Use proxy in development, full URL in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? "/api/v1" : "http://localhost:3000/api/v1");

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const isAuthEndpoint = endpoint.includes("/auth/");

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Get token from localStorage if available
    const token = localStorage.getItem("authToken");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include", // Include cookies for CORS
    };

    console.log("API Request:", url, "Method:", options.method || "GET");

    try {
      const response = await fetch(url, config);
      let data;
      
      // Try to parse JSON, but handle cases where response might not be JSON
      try {
        data = await response.json();
      } catch {
        // If response is not JSON, use the status text
        data = { message: response.statusText || "An error occurred" };
      }

      console.log("API Response:", response.status, data);

      if (!response.ok) {
        // Handle 401 Unauthorized - be more conservative about token removal
        if (response.status === 401) {
          // Check the error message to see if it's a real auth failure
          const errorMessage = (data.message || data.error || "").toLowerCase();
          const isRealAuthError = 
            errorMessage.includes("not authorized") ||
            errorMessage.includes("token expired") ||
            errorMessage.includes("invalid token") ||
            errorMessage.includes("unauthorized");
          
          // Only clear token if it's a real auth failure on auth endpoints
          // OR if it's explicitly a token expiration/invalid token error
          if (isAuthEndpoint && isRealAuthError) {
            console.warn("401 Unauthorized on auth endpoint - clearing token");
            localStorage.removeItem("authToken");
            // Dispatch event to notify AuthContext
            window.dispatchEvent(new Event("auth-token-removed"));
          } else if (isRealAuthError && !isAuthEndpoint) {
            // Token is expired/invalid on protected endpoint - clear it
            console.warn("Token expired/invalid on protected endpoint - clearing token");
            localStorage.removeItem("authToken");
            window.dispatchEvent(new Event("auth-token-removed"));
          } else {
            // Might be a temporary server issue - don't remove token
            console.warn("401 Unauthorized - might be temporary, keeping token");
          }
        }
        
        return {
          success: false,
          error: data.message || data.error || `HTTP error! status: ${response.status}`,
        };
      }

      // Check if backend returned success: false even with HTTP 200
      if (data.success === false) {
        return {
          success: false,
          error: data.message || data.error || "Request failed",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API request failed:", error);
      // Handle network errors specifically
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      // Provide more helpful error messages
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        return {
          success: false,
          error: "Unable to connect to server. Please check if the backend server is running on http://localhost:3000",
        };
      }
      
      // Don't treat network errors as auth failures
      // Network errors shouldn't trigger logout
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Auth endpoints
  async register(userData: { name: string; email: string; password: string }) {
    const response = await this.request<{
      message: string;
      user: { id: number; name: string; email: string; role: string };
      token: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Store token if registration successful
    if (response.success && response.data?.token) {
      localStorage.setItem("authToken", response.data.token);
    }

    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ 
      message: string;
      user: { id: number; name: string; email: string; role: string };
      token: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store token if login successful
    if (response.success && response.data?.token) {
      localStorage.setItem("authToken", response.data.token);
    }

    return response;
  }

  async getProfile() {
    return this.request<{ user: { id: number; name: string; email: string; createdAt: string } }>("/auth/profile");
  }

  async changePassword(passwordData: {
    oldPassword: string;
    newPassword: string;
  }) {
    return this.request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  }

  async logout() {
    localStorage.removeItem("authToken");
    return { success: true };
  }

  // Product endpoints
  async getProducts() {
    return this.request("/products");
  }

  async getProductById(id: string) {
    return this.request(`/products/${id}`);
  }

  // Cart endpoints
  async addToCart(productId: string, quantity: number = 1) {
    return this.request("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async getCart() {
    return this.request("/cart");
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request(`/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(productId: string) {
    return this.request(`/cart/${productId}`, {
      method: "DELETE",
    });
  }

  // Payment endpoints
  async createPaymentIntent(amount: number, currency: string = "inr") {
    return this.request<{
      clientSecret: string;
      paymentIntentId: string;
    }>("/payment/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({ amount, currency }),
    });
  }

  async verifyPaymentIntent(paymentIntentId: string) {
    return this.request("/payment/verify", {
      method: "POST",
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  // Order endpoints
  async createOrder(orderData: {
    shippingAddress: string;
    pincode: string;
    paymentMethod: string;
    paymentIntentId: string;
  }) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request("/orders");
  }

  async getOrderById(id: string) {
    return this.request(`/orders/${id}`);
  }

  // Delivery tracking endpoints
  async getDeliveryTracking(orderId: string) {
    return this.request(`/delivery/${orderId}`);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
