// Environment variable validation for deployment
export const validateEnv = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!import.meta.env.VITE_SUPABASE_URL) {
    errors.push("VITE_SUPABASE_URL is not configured");
  }
  
  if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    errors.push("VITE_SUPABASE_PUBLISHABLE_KEY is not configured");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Check if environment is production
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

// Get Supabase URL safely
export const getSupabaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    console.error("Supabase URL is not configured");
    return "";
  }
  return url;
};
