import { Building2, Crown, UserRound } from "lucide-react";
import { OrganizationForm } from "@/components/dashboard/organization-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { getOrganizerContext } from "@/lib/auth/organizer";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizationPage() {
  const context = await getOrganizerContext();
  if (!context.organization) return <><PageHeader eyebrow="Workspace" title="Creá tu organización" description="Reuní equipo, lugares y salas bajo los mismos permisos." /><div className="max-w-xl rounded-2xl border border-white/[.07] bg-white/[.04] p-5"><OrganizationForm /></div></>;
  const supabase = await createClient();
  const { data: members } = await supabase.from("organization_members").select("user_id, role, created_at").eq("organization_id", context.organization.id);
  return <><PageHeader eyebrow="Workspace" title={context.organization.name} description="Administrá la identidad y los miembros de tu operación." /><section className="grid gap-3 sm:grid-cols-2"><OrganizationDatum icon={Building2} label="Identificador" value={context.organization.slug} mono /><OrganizationDatum icon={Crown} label="Tu rol" value={context.role ?? "—"} /></section><section className="mt-8"><div className="mb-4 flex items-center justify-between px-1"><h2 className="font-display text-2xl font-semibold">Miembros</h2><span className="rounded-full bg-white/[.07] px-3 py-1.5 text-xs font-semibold">{members?.length ?? 0}</span></div><div className="overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.04]">{members?.map((member) => <div key={member.user_id} className="flex min-h-18 items-center gap-3 border-b border-white/[.07] px-4 last:border-0"><span className="grid size-10 place-items-center rounded-full bg-white/[.07] text-white/45"><UserRound className="size-4" strokeWidth={1.7} aria-hidden /></span><span className="min-w-0 flex-1 truncate font-mono text-xs text-white/40">{member.user_id.slice(0, 12)}…</span><span className="rounded-full bg-white/[.07] px-3 py-1.5 text-xs font-semibold capitalize">{member.role}</span></div>)}</div><p className="mt-4 text-xs leading-5 text-white/30">La estructura ya admite varios miembros. Las invitaciones por email quedan preparadas para una evolución posterior.</p></section></>;
}

function OrganizationDatum({ icon: Icon, label, value, mono }: { icon: typeof Building2; label: string; value: string; mono?: boolean }) { return <div className="flex min-h-36 flex-col justify-between rounded-2xl border border-white/[.07] bg-white/[.04] p-4"><div className="flex items-center gap-2 text-white/40"><Icon className="size-4" strokeWidth={1.7} aria-hidden /><span className="text-xs font-semibold">{label}</span></div><p className={mono ? "break-all font-mono text-sm text-white/70" : "font-display text-3xl font-semibold capitalize"}>{value}</p></div>; }
