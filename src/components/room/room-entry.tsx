"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";

const ENTRY_TIMEOUT_MS = 15_000;
class EntryTimeoutError extends Error { constructor(step: string) { super(`Timeout while ${step}`); this.name = "EntryTimeoutError"; } }
async function withEntryTimeout<T>(operation: PromiseLike<T>, step: string): Promise<T> { let timeoutId: ReturnType<typeof setTimeout> | undefined; const timeout = new Promise<never>((_, reject) => { timeoutId = setTimeout(() => reject(new EntryTimeoutError(step)), ENTRY_TIMEOUT_MS); }); try { return await Promise.race([Promise.resolve(operation), timeout]); } finally { if (timeoutId) clearTimeout(timeoutId); } }

function entryErrorMessage(error: unknown) {
  if (error instanceof EntryTimeoutError) return "Supabase tardó demasiado en responder. Revisá tu conexión e intentá nuevamente.";
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();
  if (normalized.includes("failed to fetch") || normalized.includes("network") || normalized.includes("fetch")) return "No pudimos conectar con Supabase. Revisá tu conexión y las variables NEXT_PUBLIC_SUPABASE_* del deploy.";
  if (normalized.includes("profile_not_created")) return "La identidad se creó, pero falta el perfil base. Verificá que todas las migrations estén aplicadas en Supabase.";
  if (normalized.includes("room is not active")) return "La sala ya no está activa. Actualizá la página para ver su estado.";
  return "No pudimos preparar tu acceso. Intentá nuevamente; si continúa, revisá la configuración de Supabase.";
}

export function RoomEntry({ roomId, slug, active, statusText }: { roomId: string; slug: string; active: boolean; statusText: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function enter() {
    if (loading || !active) return;
    setLoading(true);
    setError(undefined);
    try {
      const supabase = createClient();
      const userResult = await withEntryTimeout(supabase.auth.getUser(), "checking the session");
      const user = userResult.data.user;
      if (!user || user.is_anonymous) {
        if (user?.is_anonymous) await withEntryTimeout(supabase.auth.signOut({ scope: "local" }), "closing the anonymous session");
        router.replace(`/r/${slug}/auth`);
        return;
      }
      const profileResult = await withEntryTimeout(supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle(), "loading the attendee profile");
      if (profileResult.error) throw profileResult.error;
      if (!profileResult.data) throw new Error("PROFILE_NOT_CREATED");
      if (!profileResult.data.onboarding_completed) { router.replace(`/r/${slug}/onboarding`); return; }
      const joinResult = await withEntryTimeout(supabase.rpc("join_room", { target_room_id: roomId }), "joining the room");
      if (joinResult.error) throw joinResult.error;
      router.replace(`/r/${slug}/discover`);
    } catch (caughtError) {
      logger.error("Attendee room entry failed", caughtError, { roomId });
      setError(entryErrorMessage(caughtError));
    } finally { setLoading(false); }
  }

  return (
    <div className="pt-3">
      <button className="flex min-h-16 w-full items-center justify-between rounded-2xl bg-accent px-5 text-left text-white shadow-lg shadow-violet/20 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none" disabled={!active} onClick={enter}>
        <span className="text-base font-bold">{loading ? "Comprobando…" : active ? "Entrar a la sala" : "Ingreso no disponible"}</span>
        {loading ? <span className="block size-5 animate-spin rounded-full border-2 border-white border-r-transparent" aria-hidden /> : <ArrowRight className="size-5" strokeWidth={2} aria-hidden />}
      </button>
      {!active && <p className="mt-3 text-center text-xs text-white/40">{statusText}</p>}
      {error && <p className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm leading-5 text-[#ff8a98]" role="alert">{error}</p>}
      {loading && <p className="mt-3 text-center text-xs text-white/40" aria-live="polite">Comprobando tu cuenta…</p>}
    </div>
  );
}
