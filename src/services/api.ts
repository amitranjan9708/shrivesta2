// API service layer for communicating with the backend
// Import config to get the correct API URL based on environment
import { config } from "../config/env";

const API_BASE_URL = config.API_BASE_URL;

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

    const defaultHeaders: Record<string, string> = {};

    // Get token from localStorage if available
    const token = localStorage.getItem("authToken");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
      console.log("API Request - Token found, adding Authorization header");
    } else {
      console.warn("API Request - No token found in localStorage");
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include", // Include cookies for CORS
    };

    // If the body is not FormData and no explicit Content-Type, set JSON
    const isFormData = (options as any).body instanceof FormData;
    if (!isFormData) {
      (config.headers as Record<string, string>)["Content-Type"] =
        (config.headers as Record<string, string>)["Content-Type"] ||
        "application/json";
    }

    console.log("API Request:", url, "Method:", options.method || "GET");
    console.log("API Request Headers:", Object.keys(config.headers as Record<string, string>));

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
        
        // Handle 403 Forbidden - user is authenticated but not authorized
        if (response.status === 403) {
          console.error("403 Forbidden - User does not have required permissions");
          const errorMsg = data.message || data.error || "Access denied: You don't have permission to access this resource";
          // Include userRole if provided by backend
          if (data.userRole) {
            console.error(`User role: ${data.userRole}, required: ADMIN`);
          }
          return {
            success: false,
            error: errorMsg,
          };
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

      // If backend already returned a success structure with data, unwrap it
      if (data.success === true && data.data !== undefined) {
        return {
          success: true,
          data: data.data,
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
          error: `Unable to connect to server. Please check if the backend server is running at ${API_BASE_URL}`,
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
      emailSent: boolean;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    return response;
  }

  async verifyOTP(email: string, otp: string) {
    const response = await this.request<{
      message: string;
      user: { id: number; name: string; email: string; role: string; isVerified: boolean };
      verificationEmailSent: boolean;
    }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });

    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ 
      message: string;
      user: { id: number; name: string; email: string; role: string; isVerified: boolean };
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

  async verifyEmail(token: string) {
    const params = new URLSearchParams({ token });
    return this.request<{ message: string }>(`/auth/verify-email?${params.toString()}`, {
      method: "GET",
    });
  }

  async resendVerificationEmail(email: string) {
    return this.request<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  async getProfile() {
    return this.request<{ user: { id: number; name: string; email: string; shippingAddress?: string; createdAt: string; isVerified?: boolean } }>("/auth/profile");
  }

  async getShippingAddress() {
    return this.request<{ shippingAddress: string | null; pincode: string | null }>("/auth/shipping-address");
  }

  async updateShippingAddress(shippingAddress: string, pincode?: string) {
    return this.request<{ user: { id: number; name: string; email: string; shippingAddress: string | null; pincode: string | null }; shippingAddress: string | null; pincode: string | null }>("/auth/shipping-address", {
      method: "PUT",
      body: JSON.stringify({ shippingAddress, pincode }),
    });
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
  async getProducts(
    subcategory?: string,
    sortBy?: string,
    minPrice?: string,
    maxPrice?: string,
    minRating?: string,
    subcategories?: string
  ) {
    let endpoint = "/products";
    const params = new URLSearchParams();
    if (subcategory) {
      params.append("subcategory", subcategory);
    }
    if (sortBy) {
      params.append("sortBy", sortBy);
    }
    if (minPrice) {
      params.append("minPrice", minPrice);
    }
    if (maxPrice) {
      params.append("maxPrice", maxPrice);
    }
    if (minRating) {
      params.append("minRating", minRating);
    }
    if (subcategories) {
      params.append("subcategories", subcategories);
    }
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    return this.request(endpoint);
  }

  async getProductById(id: string) {
    return this.request(`/products/${id}`);
  }

  // Admin endpoints
  async adminGetProducts() {
    return this.request("/admin/products");
  }

  async adminDeleteProduct(id: number) {
    return this.request(`/admin/products/${id}`, { method: "DELETE" });
  }

  async adminCreateProduct(input: {
    product: string;
    subtitle: string;
    oldPrice: number;
    salePrice: number;
    rating: number;
    ratingCount: number;
    subcategory: string;
    images: File[];
  }) {
    const form = new FormData();
    form.append("product", String(input.product));
    form.append("subtitle", String(input.subtitle));
    form.append("oldPrice", String(input.oldPrice));
    form.append("salePrice", String(input.salePrice));
    form.append("rating", String(input.rating));
    form.append("ratingCount", String(input.ratingCount));
    form.append("subcategory", String(input.subcategory));
    input.images.forEach((f) => form.append("images", f));

    return this.request("/admin/products", {
      method: "POST",
      body: form,
      // Let browser set multipart boundary; do not set Content-Type
      headers: {},
    });
  }

  async adminGetSalesStats() {
    return this.request("/admin/stats/sales");
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

  // Payment endpoints - Stripe Checkout
  async createCheckoutSession(data: {
    amount: number;
    orderId?: string;
    customerEmail?: string;
    customerName?: string;
  }) {
    return this.request<{
      sessionId: string;
      url: string;
    }>("/payment/create-checkout-session", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyPaymentSession(sessionId: string) {
    return this.request("/payment/verify-session", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  }

  // Legacy endpoints (for backward compatibility)
  async createPaymentIntent(amount: number, currency: string = "inr") {
    return this.request<{
      sessionId: string;
      url: string;
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

  // Review endpoints
  async getProductReviews(productId: string) {
    return this.request(`/reviews/product/${productId}`);
  }

  async createReview(productId: string, rating: number, comment?: string) {
    return this.request(`/reviews/product/${productId}`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    });
  }

  async updateReview(reviewId: string, rating?: number, comment?: string) {
    return this.request(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify({ rating, comment }),
    });
  }

  async deleteReview(reviewId: string) {
    return this.request(`/reviews/${reviewId}`, {
      method: "DELETE",
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
