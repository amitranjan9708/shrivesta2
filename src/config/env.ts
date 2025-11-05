// Environment configuration
export const config = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  NODE_ENV: import.meta.env.VITE_NODE_ENV || "development",
  STRIPE_PUBLISHABLE_KEY:
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
} as const;

// Debug Stripe key (remove in production)
if (import.meta.env.DEV) {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
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

