"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GoogleIcon } from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({ email: z.email("Ingresá un email válido"), password: z.string().min(8, "Usá al menos 8 caracteres") });
type Values = z.infer<typeof schema>;

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("email not confirmed")) return "Primero confirmá tu email desde el mensaje que te enviamos.";
  if (normalized.includes("invalid login credentials")) return "El email o la contraseña no coinciden.";
  if (normalized.includes("user already registered")) return "Ese email ya está registrado. Probá iniciar sesión.";
  if (normalized.includes("email address not authorized")) return "Supabase no puede enviar el correo a esta dirección hasta configurar un servidor SMTP.";
  if (normalized.includes("rate limit")) return "Se alcanzó el límite de emails de Supabase. Esperá unos minutos o configurá SMTP.";
  if (normalized.includes("failed to fetch") || normalized.includes("network")) return "No pudimos conectar con Supabase. Revisá tu conexión.";
  return message;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [message, setMessage] = useState<string>();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onGoogleSignIn() {
    setMessage(undefined);
    setIsGoogleLoading(true);
    const supabase = createClient();

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/dashboard");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "No pudimos conectarte con Google.";
      setMessage(authErrorMessage(detail));
      setIsGoogleLoading(false);
    }
  }

  async function onSubmit(values: Values) {
    setMessage(undefined);
    const supabase = createClient();
    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/dashboard");
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { emailRedirectTo: callbackUrl.toString() },
        });
        if (error) throw error;
        if (data.session) {
          window.location.replace("/dashboard");
          return;
        }
        setMessage("Te enviamos un email para confirmar la cuenta. Después de confirmarlo, ya vas a poder ingresar.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw error;
      window.location.replace("/dashboard");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "No pudimos autenticarte.";
      setMessage(authErrorMessage(detail));
    }
  }

  return (
    <div className="grid gap-5">
      <Button
        className="w-full rounded-xl border-white/15 bg-white text-black hover:border-white hover:bg-white/90"
        type="button"
        variant="secondary"
        size="lg"
        loading={isGoogleLoading}
        disabled={isSubmitting}
        onClick={onGoogleSignIn}
      >
        {!isGoogleLoading && <GoogleIcon />}
        <span>{mode === "login" ? "Ingresar con Google" : "Registrarme con Google"}</span>
      </Button>

      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-white/[.08]" />
        <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/25">o con email</span>
        <span className="h-px flex-1 bg-white/[.08]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form grid gap-5">
        <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="vos@empresa.com" {...register("email")} /></Field>
        <Field label="Contraseña" error={errors.password?.message}><Input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="8 caracteres o más" {...register("password")} /></Field>
        {message && <p className="border-l-2 border-violet bg-white/[.035] px-4 py-3 text-xs leading-5 text-white/60">{message}</p>}
        <Button className="mt-2 w-full justify-between rounded-xl" type="submit" size="lg" loading={isSubmitting} disabled={isGoogleLoading}><span>{mode === "login" ? "Ingresar" : "Crear cuenta"}</span><span aria-hidden>→</span></Button>
      </form>
    </div>
  );
}
