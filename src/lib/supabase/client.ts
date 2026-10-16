import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

let browserClient: SupabaseClient<Database> | undefined;

export function createClient() {
  if (!browserClient) {
    const env = getPublicEnv();
    browserClient = createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
  }
  return browserClient;
}

