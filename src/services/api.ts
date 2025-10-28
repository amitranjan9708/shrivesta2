// API service layer for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

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

    const defaultHeaders = {
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

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }

  // Auth endpoints
  async register(userData: { name: string; email: string; password: string }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ token: string }>("/auth/login", {
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
    return this.request("/auth/profile");
  }

  async changePassword(passwordData: {
    currentPassword: string;
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

  // Order endpoints
  async createOrder(orderData: any) {
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

  // Payment endpoints
  async createPaymentIntent(amount: number, currency: string = "usd") {
    return this.request("/payment/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({ amount, currency }),
    });
  }

  async confirmPayment(paymentIntentId: string) {
    return this.request("/payment/confirm", {
      method: "POST",
      body: JSON.stringify({ paymentIntentId }),
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
