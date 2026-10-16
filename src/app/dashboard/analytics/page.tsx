import { BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOrganizerContext } from "@/lib/auth/organizer";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/utils/date";

export default async function AnalyticsPage() {
  const { organization } = await getOrganizerContext({ requireOrganization: true });
  const { data: rooms } = await (await createClient()).from("rooms").select("id,name,start_at,status").eq("organization_id", organization!.id).order("start_at", { ascending: false });
  return <><PageHeader eyebrow="Datos" title="Analytics" description="Elegí una sala para revisar presencia e interacción de forma agregada." />{!rooms?.length ? <EmptyState title="No hay eventos para analizar" description="Las métricas aparecen apenas creás una sala." /> : <div className="overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.035]">{rooms.map((room) => <Link key={room.id} href={`/dashboard/rooms/${room.id}/analytics`} className="group flex min-h-16 items-center gap-3 border-b border-white/[.07] px-3.5 last:border-0 hover:bg-white/[.05]"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent"><BarChart3 className="size-4" strokeWidth={1.7} aria-hidden /></span><div className="min-w-0 flex-1"><p className="truncate font-display text-base font-semibold">{room.name}</p><p className="mt-0.5 text-[11px] text-white/35">{formatDateTime(room.start_at)}</p></div><StatusBadge status={room.status} /><ChevronRight className="hidden size-4 text-white/20 transition-transform group-hover:translate-x-1 sm:block" aria-hidden /></Link>)}</div>}</>;
}
