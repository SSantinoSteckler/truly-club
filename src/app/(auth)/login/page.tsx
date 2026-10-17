import { AuthForm } from "@/components/auth/auth-form";
import { AuthSwitch } from "@/components/auth/auth-switch";

export const metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <>
      <AuthSwitch active="login" />
      <div className="pt-10">
        <h1 className="font-display text-[clamp(2.8rem,8vw,4.25rem)] font-semibold leading-[.9] tracking-[-.06em]">Ingresá a tu espacio.</h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-white/40">Administrá tus salas, sus accesos y la actividad de cada evento.</p>
      </div>
      <div className="mt-9"><AuthForm mode="login" /></div>
    </>
  );
}
