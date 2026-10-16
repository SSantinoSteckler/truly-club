import { Radio, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { getOrganizerContext } from "@/lib/auth/organizer";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

type Metrics = { active_rooms: number; total_attendees: number; active_now: number };
function asMetrics(value: Json | null): Metrics { const item = (value ?? {}) as Partial<Metrics>; return { active_rooms: item.active_rooms ?? 0, total_attendees: item.total_attendees ?? 0, active_now: item.active_now ?? 0 }; }

export default async function DashboardPage() {
  const { organization } = await getOrganizerContext();
  if (!organization) return <><PageHeader title="Creá tu espacio" description="La organización reúne tu equipo, lugares y eventos." /><EmptyState title="Todavía no hay una organización" description="Creala para empezar a operar Truly Business." action={<LinkButton href="/dashboard/organization">Crear organización</LinkButton>} /></>;

  const supabase = await createClient();
  const metricResult = await supabase.rpc("organization_dashboard_metrics", { target_organization_id: organization.id });
  const metrics = asMetrics(metricResult.data);

  return (
    <>
      <PageHeader eyebrow={organization.name} title="Resumen de hoy" description="Una vista operativa de las salas y personas activas." action={<LinkButton href="/dashboard/rooms/new">Nueva sala</LinkButton>} />
      {metricResult.error && <div className="mb-5"><ErrorState message={metricResult.error.message} /></div>}

      <section className="grid gap-3 md:grid-cols-[1.25fr_.75fr]">
        <div className="relative flex min-h-40 flex-col justify-between overflow-hidden rounded-xl bg-white p-4 text-black xl:min-h-32">
          <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold text-black/50"><UsersRound className="size-4" strokeWidth={1.8} aria-hidden />Asistentes totales</span><span className="rounded-full bg-black px-2 py-1 text-[9px] font-semibold text-white">Histórico</span></div>
          <p className="font-display text-[clamp(3.25rem,5vw,4.5rem)] font-semibold leading-[.8] tracking-[-.075em] tabular-nums">{metrics.total_attendees}</p>
          <div className="flex items-center gap-2 text-xs font-semibold"><span className="size-1.5 rounded-full bg-[#35d65d]" aria-hidden />{metrics.active_now} activas ahora</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard icon={Radio} label="Salas activas" value={metrics.active_rooms} live />
          <MetricCard icon={UsersRound} label="En línea" value={metrics.active_now} />
        </div>
      </section>
    </>
  );
}

function MetricCard({ icon: Icon, label, value, live }: { icon: typeof Radio; label: string; value: number; live?: boolean }) {
  return <div className="flex min-h-28 flex-col justify-between rounded-xl border border-white/[.07] bg-white/[.045] p-3.5 xl:min-h-32"><div className="flex items-center justify-between"><Icon className="size-4 text-white/40" strokeWidth={1.7} aria-hidden />{live && <span className="size-1.5 rounded-full bg-[#35d65d]" aria-hidden />}</div><div><p className="font-display text-3xl font-semibold tabular-nums">{value}</p><p className="mt-0.5 text-[11px] text-white/40">{label}</p></div></div>;
}
