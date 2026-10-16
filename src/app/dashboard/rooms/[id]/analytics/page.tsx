import { Clock3, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import { BarList } from "@/components/dashboard/bar-list";
import { PageHeader } from "@/components/dashboard/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { getOrganizerContext } from "@/lib/auth/organizer";
import { parseAnalytics } from "@/lib/analytics/parse";
import { createClient } from "@/lib/supabase/server";

export default async function RoomAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getOrganizerContext({ requireOrganization: true });
  const supabase = await createClient();
  const [roomResult, analyticsResult] = await Promise.all([supabase.from("rooms").select("id,name").eq("id", id).single(), supabase.rpc("room_analytics", { target_room_id: id })]);
  if (!roomResult.data) notFound();
  const data = parseAnalytics(analyticsResult.data);
  return <><PageHeader eyebrow="Analytics de sala" title={roomResult.data.name} description="Una lectura agregada de presencia; la interacción privada no se expone." action={<LinkButton href={`/api/rooms/${id}/analytics.csv`} variant="secondary">Exportar CSV</LinkButton>} /><section className="grid gap-3 xl:grid-cols-[1.3fr_.7fr]"><div className="flex min-h-56 flex-col justify-between rounded-2xl bg-white p-5 text-black"><div className="flex items-center gap-2 text-[13px] font-semibold text-black/50"><UsersRound className="size-4" strokeWidth={1.7} aria-hidden />Personas ingresaron</div><p className="font-display text-[clamp(4rem,9vw,7rem)] font-semibold leading-[.76] tracking-[-.08em] tabular-nums">{data.total_attendees}</p><p className="text-[13px] font-semibold">Pico de {data.max_concurrent} simultáneas</p></div><div className="grid grid-cols-2 gap-3"><AnalyticsCard icon={UsersRound} label="Activas ahora" value={data.active_now} /><AnalyticsCard icon={Clock3} label="Hora pico" value={data.peak_hour || "—"} /></div></section><div className="mt-6 grid gap-3 xl:grid-cols-3"><Distribution title="Edades"><BarList items={data.age_distribution} /></Distribution><Distribution title="Intereses"><BarList items={data.top_interests} /></Distribution><Distribution title="Intenciones"><BarList items={data.intent_distribution} /></Distribution></div></>;
}

function AnalyticsCard({ icon: Icon, label, value }: { icon: typeof UsersRound; label: string; value: number | string }) { return <div className="flex min-h-28 flex-col justify-between rounded-xl border border-white/[.07] bg-white/[.04] p-3.5"><Icon className="size-4 text-white/35" strokeWidth={1.7} aria-hidden /><div><p className="font-display text-2xl font-semibold tabular-nums">{value}</p><p className="mt-0.5 text-[11px] text-white/40">{label}</p></div></div>; }
function Distribution({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-white/[.07] bg-white/[.04] p-4"><h2 className="mb-4 font-display text-xl font-semibold">{title}</h2>{children}</section>; }
