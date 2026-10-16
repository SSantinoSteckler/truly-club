import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getPublicEnv, getServiceRoleKey } from "@/lib/env";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const key = getServiceRoleKey();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada");
  const { supabaseUrl } = getPublicEnv();
  return createClient<Database>(supabaseUrl, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
