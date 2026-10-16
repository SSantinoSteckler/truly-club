import type { DistributionItem } from "@/types/analytics";

export function BarList({ items }: { items: DistributionItem[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  if (!items.length) return <p className="py-5 text-sm text-white/35">Todavía no hay datos suficientes.</p>;
  return <div className="grid gap-4">{items.map((item) => <div key={item.label}><div className="mb-2 flex items-center justify-between gap-3"><span className="truncate text-xs text-white/55">{item.label}</span><strong className="text-xs tabular-nums text-white/70">{item.value}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-accent" style={{ width: `${(item.value / max) * 100}%` }} /></div></div>)}</div>;
}
