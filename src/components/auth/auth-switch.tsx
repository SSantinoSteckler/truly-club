import Link from "next/link";
import { cn } from "@/utils/cn";

export function AuthSwitch({ active }: { active: "login" | "signup" }) {
  return (
    <nav className="grid grid-cols-2 border-b border-white/[.1]" aria-label="Acceso a Truly Business">
      <AuthSwitchLink href="/login" active={active === "login"}>Ingresar</AuthSwitchLink>
      <AuthSwitchLink href="/signup" active={active === "signup"}>Crear cuenta</AuthSwitchLink>
    </nav>
  );
}

function AuthSwitchLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} aria-current={active ? "page" : undefined} className={cn("relative pb-3 text-xs font-semibold", active ? "text-white after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-violet" : "text-white/35 hover:text-white")}>{children}</Link>;
}
