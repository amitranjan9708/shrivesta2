// Environment configuration
export const config = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  NODE_ENV: import.meta.env.VITE_NODE_ENV || "development",
} as const;

