import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function Legal({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <main className="business-shell min-h-dvh bg-[#070707] px-4 py-6 text-white sm:px-8 lg:px-14">
      <header className="mx-auto flex max-w-[86rem] items-center justify-between border-b border-white/[.08] pb-4">
        <Link href="/" aria-label="Truly, inicio"><BrandLogo priority className="h-6" /></Link>
        <span className="text-[10px] font-semibold text-white/40">Legal / {index}</span>
      </header>
      <article className="mx-auto grid max-w-[72rem] gap-10 py-14 lg:grid-cols-[.8fr_1.2fr] lg:py-24">
        <div>
          <p className="text-xs font-semibold text-violet">Truly</p>
          <h1 className="mt-4 max-w-[9ch] font-display text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-[.88] tracking-[-.065em]">{title}</h1>
        </div>
        <div className="border-t border-white/[.1] pt-6">
          <div className="grid gap-7 text-sm leading-7 text-white/50 [&_strong]:text-white">{children}</div>
          <Link href="/" className="mt-12 inline-flex text-xs font-semibold text-white underline decoration-white/25 underline-offset-4 hover:decoration-violet">Volver al inicio →</Link>
        </div>
      </article>
    </main>
  );
}
