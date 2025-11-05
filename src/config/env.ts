// Environment configuration
const ENV = (import.meta as any).env.VITE_ENV || "local"; // 'local' or 'production'

// API Base URL based on environment
const getApiBaseUrl = () => {
  // If ENV is production, prioritize production URL
  if (ENV === "production") {
    // Check if VITE_RENDER_API_URL is set
    if ((import.meta as any).env.VITE_RENDER_API_URL) {
      return (import.meta as any).env.VITE_RENDER_API_URL;
    }
    // If VITE_API_BASE_URL is explicitly set and not localhost, use it
    const explicitUrl = (import.meta as any).env.VITE_API_BASE_URL;
    if (explicitUrl && !explicitUrl.includes("localhost")) {
      return explicitUrl;
    }
    // Default production URL
    return "https://api-shrivesta-backend.onrender.com/api/v1";
  }
  
  // For local development
  // If explicitly set, use that
  if ((import.meta as any).env.VITE_API_BASE_URL) {
    return (import.meta as any).env.VITE_API_BASE_URL;
  }
  
  // Default to localhost for local development
  return "http://localhost:3000/api/v1";
};

export const config = {
  API_BASE_URL: getApiBaseUrl(),
  ENV: ENV,
  NODE_ENV: (import.meta as any).env.VITE_NODE_ENV || (import.meta as any).env.MODE || "development",
  STRIPE_PUBLISHABLE_KEY:
    (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || "",
} as const;

// Debug configuration (only in development)
if ((import.meta as any).env.DEV) {
  console.log("🔧 Environment Configuration:");
  console.log("  ENV:", ENV);
  console.log("  API_BASE_URL:", config.API_BASE_URL);
  
  const stripeKey = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (stripeKey) {
    if (stripeKey.startsWith("sk_")) {
      console.error("❌ ERROR: You're using a SECRET key (sk_test_...) in the frontend!");
      console.error("   Frontend needs PUBLISHABLE key (pk_test_...)");
      console.error("   Secret keys should ONLY be in backend/.env");
    } else if (stripeKey.startsWith("pk_")) {
      console.log("✅ Stripe Publishable Key:", `${stripeKey.substring(0, 20)}...`);
    } else {
      console.warn("⚠️ Invalid Stripe key format:", stripeKey.substring(0, 20) + "...");
    }
  } else {
    console.warn("⚠️ Stripe Publishable Key: NOT SET");
  }
}

