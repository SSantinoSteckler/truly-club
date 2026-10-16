import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="business-shell flex min-h-dvh flex-col bg-[#070707] text-white">
      <header className="border-b border-white/[.07]">
        <div className="mx-auto flex h-16 w-full max-w-[86rem] items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Truly, inicio"><BrandLogo priority className="h-6" /></Link>
          <Link href="/" className="text-[11px] font-semibold text-white/40 hover:text-white">Volver al inicio ↗</Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <section className="w-full max-w-[27rem]">{children}</section>
      </div>

      <footer className="mx-auto flex w-full max-w-[86rem] items-center justify-between border-t border-white/[.07] px-4 py-5 text-[10px] text-white/30 sm:px-6">
        <span>Acceso para organizadores</span>
        <span className="flex gap-4"><Link href="/privacy" className="hover:text-white">Privacidad</Link><Link href="/terms" className="hover:text-white">Términos</Link></span>
      </footer>
    </main>
  );
}
