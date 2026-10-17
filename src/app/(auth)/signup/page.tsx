import { AuthForm } from "@/components/auth/auth-form";
import { AuthSwitch } from "@/components/auth/auth-switch";

export const metadata = { title: "Crear cuenta" };

export default function SignupPage() {
  return (
    <>
      <AuthSwitch active="signup" />
      <div className="pt-10">
        <h1 className="font-display text-[clamp(2.8rem,8vw,4.25rem)] font-semibold leading-[.9] tracking-[-.06em]">Creá tu espacio.</h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-white/40">Una cuenta para crear lugares, abrir salas y compartir sus QR.</p>
      </div>
      <div className="mt-9"><AuthForm mode="signup" /></div>
    </>
  );
}
