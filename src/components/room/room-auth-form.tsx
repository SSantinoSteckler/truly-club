"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { GoogleIcon } from "@/components/auth/google-icon";
import { Field, Input } from "@/components/ui/field";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/utils/cn";

const schema = z.object({ email: z.email("Ingresá un email válido"), password: z.string().min(8, "Usá al menos 8 caracteres") });
type Values = z.infer<typeof schema>;
type Mode = "signup" | "login";
type Notice = { kind: "error" | "success"; text: string };

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("email not confirmed")) return "Primero confirmá tu email desde el mensaje que te enviamos.";
  if (normalized.includes("invalid login credentials")) return "El email o la contraseña no coinciden.";
  if (normalized.includes("user already registered")) return "Ese email ya está registrado. Elegí Iniciar sesión.";
  if (normalized.includes("rate limit")) return "Hiciste demasiados intentos. Esperá unos minutos y volvé a probar.";
  if (normalized.includes("failed to fetch") || normalized.includes("network")) return "No pudimos conectar con Supabase. Revisá tu conexión.";
  return message;
}

export function RoomAuthForm({ roomId, slug, initialError }: { roomId: string; slug: string; initialError?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [notice, setNotice] = useState<Notice | undefined>(initialError ? { kind: "error", text: initialError } : undefined);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register, handleSubmit, clearErrors, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  function changeMode(nextMode: Mode) { setMode(nextMode); setNotice(undefined); clearErrors(); }

  async function onGoogleSignIn() {
    setNotice(undefined);
    setIsGoogleLoading(true);
    const supabase = createClient();

    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (currentUser?.is_anonymous) await supabase.auth.signOut({ scope: "local" });
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", `/r/${slug}/onboarding`);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (error) {
      logger.error("Room Google authentication failed", error, { roomId, mode });
      const message = error instanceof Error ? error.message : "No pudimos conectarte con Google.";
      setNotice({ kind: "error", text: authErrorMessage(message) });
      setIsGoogleLoading(false);
    }
  }

  async function onSubmit(values: Values) {
    setNotice(undefined);
    const supabase = createClient();
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (currentUser?.is_anonymous) await supabase.auth.signOut({ scope: "local" });
      if (mode === "signup") {
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", `/r/${slug}/onboarding`);
        const result = await supabase.auth.signUp({ email: values.email, password: values.password, options: { emailRedirectTo: callbackUrl.toString() } });
        if (result.error) throw result.error;
        if (result.data.session) { router.replace(`/r/${slug}/onboarding`); return; }
        setNotice({ kind: "success", text: "Te enviamos un email de confirmación. Abrilo desde este dispositivo para continuar." });
        return;
      }
      const loginResult = await supabase.auth.signInWithPassword(values);
      if (loginResult.error) throw loginResult.error;
      const profileResult = await supabase.from("profiles").select("onboarding_completed").eq("id", loginResult.data.user.id).maybeSingle();
      if (profileResult.error) throw profileResult.error;
      if (!profileResult.data?.onboarding_completed) { router.replace(`/r/${slug}/onboarding`); return; }
      const joinResult = await supabase.rpc("join_room", { target_room_id: roomId });
      if (joinResult.error) throw joinResult.error;
      router.replace(`/r/${slug}/discover`);
    } catch (error) {
      logger.error("Room email authentication failed", error, { roomId, mode });
      const message = error instanceof Error ? error.message : "No pudimos autenticarte.";
      setNotice({ kind: "error", text: authErrorMessage(message) });
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 rounded-2xl bg-white/[.07] p-1">
        <button type="button" className={cn("min-h-11 rounded-xl px-3 text-sm font-semibold", mode === "signup" ? "bg-white text-black" : "text-white/45")} onClick={() => changeMode("signup")}>Registrarme</button>
        <button type="button" className={cn("min-h-11 rounded-xl px-3 text-sm font-semibold", mode === "login" ? "bg-white text-black" : "text-white/45")} onClick={() => changeMode("login")}>Ingresar</button>
      </div>

      <button
        className="mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 text-sm font-bold text-black disabled:opacity-40"
        type="button"
        disabled={isSubmitting || isGoogleLoading}
        onClick={onGoogleSignIn}
      >
        {isGoogleLoading ? <span className="size-4 animate-spin rounded-full border-2 border-black border-r-transparent" aria-hidden /> : <GoogleIcon className="size-5 shrink-0" />}
        <span>{mode === "signup" ? "Registrarme con Google" : "Ingresar con Google"}</span>
      </button>

      <div className="my-5 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-white/[.08]" />
        <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/25">o con email</span>
        <span className="h-px flex-1 bg-white/[.08]" />
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" inputMode="email" placeholder="tu@email.com" {...register("email")} /></Field>
        <Field label="Contraseña" error={errors.password?.message}><Input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="8 caracteres o más" {...register("password")} /></Field>
        {notice && <p className={cn("rounded-xl px-4 py-3 text-sm leading-5", notice.kind === "success" ? "bg-[#7cff6b]/10 text-[#a0ff94]" : "bg-danger/10 text-[#ff8a98]")} role={notice.kind === "error" ? "alert" : "status"}>{notice.text}</p>}
        <button className="mt-1 flex min-h-14 w-full items-center justify-between rounded-2xl bg-accent px-5 text-base font-bold text-white disabled:opacity-40" type="submit" disabled={isSubmitting || isGoogleLoading}>
          <span>{mode === "signup" ? "Crear mi cuenta" : "Entrar a la sala"}</span>
          {isSubmitting ? <span className="size-4 animate-spin rounded-full border-2 border-white border-r-transparent" aria-hidden /> : <ArrowRight className="size-5" strokeWidth={2} aria-hidden />}
        </button>
      </form>

      <p className="mt-5 text-center text-[10px] leading-4 text-white/30">Al continuar aceptás los <Link href="/terms" className="underline">términos</Link> y la <Link href="/privacy" className="underline">política de privacidad</Link>.</p>
    </div>
  );
}
