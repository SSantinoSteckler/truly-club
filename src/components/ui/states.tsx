import { Inbox, TriangleAlert } from "lucide-react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <section className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-white/[.07] bg-white/[.035] px-5 py-7 text-center"><span className="grid size-11 place-items-center rounded-full bg-white/[.07] text-white/40"><Inbox className="size-5" strokeWidth={1.5} aria-hidden /></span><h3 className="mt-4 font-display text-xl font-semibold tracking-[-.03em]">{title}</h3><p className="mt-1.5 max-w-sm text-[13px] leading-5 text-white/40">{description}</p>{action && <div className="mt-4">{action}</div>}</section>;
}

export function ErrorState({ message = "No pudimos cargar esta información." }: { message?: string }) {
  return <div className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/[.07] px-4 py-3 text-sm text-[#ff8a98]"><TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} aria-hidden /><span>{message}</span></div>;
}

export function PageSkeleton() {
  return <div className="grid gap-5"><div><div className="skeleton h-4 w-28 rounded-full" /><div className="skeleton mt-4 h-14 w-2/3 rounded-xl" /></div><div className="grid gap-3 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="skeleton h-44 rounded-2xl" />)}</div><div className="skeleton h-72 rounded-2xl" /></div>;
}
