import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiService } from "../services/api";

interface User {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  updateProfile: (
    userData: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await apiService.getProfile();
          console.log("Auth check - Profile response:", response);
          
          // Handle nested response structure (same as cart)
          const userData = response.data?.user || (response.data as any)?.data?.user;
          
          if (response.success && userData) {
            // Convert id to string for consistency
            setUser({
              ...userData,
              id: userData.id.toString(),
            });
          } else {
            // Only remove token if it's explicitly an auth failure
            const errorLower = (response.error || "").toLowerCase();
            const isAuthError = 
              errorLower.includes("401") || 
              errorLower.includes("not authorized") ||
              errorLower.includes("token expired") ||
              errorLower.includes("invalid token");
            
            if (isAuthError) {
              console.warn("Auth check - Token invalid, removing");
              localStorage.removeItem("authToken");
              setUser(null);
            } else {
              // Network errors or other issues - keep token and user state
              console.warn("Auth check - Profile fetch failed but keeping token:", response.error);
              // Don't clear user state on network errors - might be temporary
            }
          }
        } catch (error) {
          // Don't remove token on network errors - might be temporary
          console.error("Auth check - Network error (keeping token):", error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for token removal events from API service
    const handleTokenRemoved = () => {
      console.log("AuthContext - Token removed event received");
      setUser(null);
    };

    window.addEventListener("auth-token-removed", handleTokenRemoved);
    return () => {
      window.removeEventListener("auth-token-removed", handleTokenRemoved);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      if (response.success && response.data?.user && response.data?.token) {
        // Convert id to string for consistency
        setUser({
          ...response.data.user,
          id: response.data.user.id.toString(),
        });
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || response.data?.message || "Login failed" 
        };
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiService.register({ name, email, password });
      if (response.success) {
        const message =
          (response.data as any)?.message ||
          "Registration successful. Please verify your email.";
        return { success: true, message };
      } else {
        return {
          success: false,
          error: response.error || response.data?.message || "Registration failed",
        };
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await apiService.changePassword(userData as any);
      if (response.success) {
        setUser((prev) => (prev ? { ...prev, ...userData } : null));
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || "Profile update failed",
        };
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

