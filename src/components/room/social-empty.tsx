import type { LucideIcon } from "lucide-react";

export function SocialEmpty({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex min-h-[56dvh] flex-col items-center justify-center px-8 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-white/[.07] text-white/55"><Icon className="size-7" strokeWidth={1.5} aria-hidden /></span>
      <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-.035em]">{title}</h2>
      <p className="mt-2 max-w-xs text-sm leading-6 text-white/40">{description}</p>
    </div>
  );
}
