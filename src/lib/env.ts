const PLACEHOLDER_URL = "http://127.0.0.1:54321";
const PLACEHOLDER_KEY = "placeholder-anon-key";

export function getPublicEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

export function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}
