import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ReportStatusSelect } from "@/components/dashboard/report-status";
import { EmptyState } from "@/components/ui/states";
import { getOrganizerContext } from "@/lib/auth/organizer";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/utils/date";

export default async function ModerationPage() {
  const { organization, userId } = await getOrganizerContext({ requireOrganization: true });
  const supabase = await createClient();
  const { data: rooms } = await supabase.from("rooms").select("id,name").eq("organization_id", organization!.id);
  const roomIds = rooms?.map((room) => room.id) ?? [];
  const { data: reports } = roomIds.length ? await supabase.from("reports").select("*").in("room_id", roomIds).order("created_at", { ascending: false }) : { data: [] };
  const userIds = [...new Set((reports ?? []).map((report) => report.reported_user_id))];
  const reasonIds = [...new Set((reports ?? []).map((report) => report.reason_id))];
  const profiles = userIds.length ? (await supabase.from("profiles").select("id,display_name").in("id", userIds)).data ?? [] : [];
  const reasons = reasonIds.length ? (await supabase.from("report_reasons").select("id,label").in("id", reasonIds)).data ?? [] : [];
  const roomMap = new Map(rooms?.map((room) => [room.id, room.name]));
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile.display_name]));
  const reasonMap = new Map(reasons.map((reason) => [reason.id, reason.label]));
  return <><PageHeader eyebrow="Seguridad" title="Moderación" description="Revisá reportes de tus salas y resolvé cada caso con contexto." />{!reports?.length ? <EmptyState title="No hay reportes" description="Si una persona denuncia un perfil, el caso aparece acá." /> : <div className="grid gap-3">{reports.map((report) => <article key={report.id} className="rounded-2xl border border-white/[.07] bg-white/[.04] p-5"><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent"><ShieldAlert className="size-5" strokeWidth={1.7} aria-hidden /></span><div className="min-w-0 flex-1"><p className="text-xs text-white/35">{roomMap.get(report.room_id)} · {formatDateTime(report.created_at)}</p><h2 className="mt-2 font-display text-2xl font-semibold">{profileMap.get(report.reported_user_id) ?? "Perfil reportado"}</h2><p className="mt-2 text-sm font-semibold text-[#ff8a98]">{reasonMap.get(report.reason_id)}</p>{report.description && <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">{report.description}</p>}</div><div className="shrink-0"><p className="mb-2 text-xs font-semibold text-white/35">Estado</p><ReportStatusSelect reportId={report.id} status={report.status} userId={userId} /></div></div></article>)}</div>}</>;
}
