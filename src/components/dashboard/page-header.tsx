export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-6 lg:mb-7">
      {eyebrow && <p className="mb-2 text-[11px] font-semibold text-accent">{eyebrow}</p>}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0"><h1 className="max-w-[20ch] font-display text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-[.95] tracking-[-.055em] [overflow-wrap:anywhere]">{title}</h1>{description && <p className="mt-3 max-w-xl text-[13px] leading-5 text-white/40">{description}</p>}</div>
        {action && <div className="flex shrink-0">{action}</div>}
      </div>
    </header>
  );
}
