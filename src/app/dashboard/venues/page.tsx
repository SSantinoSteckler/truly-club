import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { VenueForm } from "@/components/dashboard/venue-form";
import { EmptyState } from "@/components/ui/states";
import { getOrganizerContext } from "@/lib/auth/organizer";
import { createClient } from "@/lib/supabase/server";

export default async function VenuesPage() {
  const { organization } = await getOrganizerContext({ requireOrganization: true });
  const supabase = await createClient();
  const { data: venues } = await supabase.from("venues").select("*").eq("organization_id", organization!.id).order("created_at", { ascending: false });
  return <><PageHeader eyebrow="Ubicaciones" title="Lugares" description="Guardá sedes reutilizables para crear nuevas salas más rápido." /><div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr] xl:items-start"><section><div className="mb-3 flex items-center justify-between px-1"><h2 className="font-display text-xl font-semibold">Tus lugares</h2><span className="rounded-full bg-white/[.07] px-2.5 py-1 text-[11px] font-semibold">{venues?.length ?? 0}</span></div>{!venues?.length ? <EmptyState title="Sin lugares todavía" description="Agregá el espacio donde va a ocurrir tu primer evento." /> : <div className="overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.035]">{venues.map((venue) => <article key={venue.id} className="flex min-h-16 items-center gap-3 border-b border-white/[.07] px-3.5 last:border-0"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[.07] text-white/40"><MapPin className="size-4" strokeWidth={1.7} aria-hidden /></span><div className="min-w-0"><h3 className="truncate font-display text-base font-semibold">{venue.name}</h3><p className="mt-0.5 truncate text-[12px] text-white/35">{venue.address ? `${venue.address}, ` : ""}{venue.city}</p></div></article>)}</div>}</section><section className="rounded-2xl border border-white/[.07] bg-white/[.04] p-4"><h2 className="font-display text-xl font-semibold">Nuevo lugar</h2><p className="mt-1.5 text-[13px] text-white/35">Agregalo una vez y reutilizalo en todos tus eventos.</p><div className="mt-5"><VenueForm organizationId={organization!.id} /></div></section></div></>;
}
