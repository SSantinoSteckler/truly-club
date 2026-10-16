import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function DELETE() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return new Response("No autorizado", { status: 401 }); const { count } = await supabase.from("organizations").select("id", { count: "exact", head: true }).eq("created_by", user.id); if (count) return new Response("Transferí o eliminá tu organización antes de borrar la cuenta.", { status: 409 }); try { const admin = createAdminClient(); const { error } = await admin.auth.admin.deleteUser(user.id); if (error) throw error; await supabase.auth.signOut(); return new Response(null, { status: 204 }); } catch (error) { logger.error("account_delete_failed", error, { userId: user.id }); return new Response("No se pudo eliminar la cuenta. Verificá la configuración server-only.", { status: 500 }); } }
