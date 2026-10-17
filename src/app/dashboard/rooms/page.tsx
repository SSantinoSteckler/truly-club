import { Infinity as InfinityIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOrganizerContext } from "@/lib/auth/organizer";
import { getEffectiveRoomStatus } from "@/lib/rooms/is-room-active";
import { createClient } from "@/lib/supabase/server";

export default async function RoomsPage() {
  const { organization } = await getOrganizerContext({ requireOrganization: true });
  const { data: rooms } = await (await createClient()).from("rooms").select("*").eq("organization_id", organization!.id).order("created_at", { ascending: false });
  return <><PageHeader eyebrow="Tus lugares" title="Salas" description="Salas permanentes, sin horarios ni vencimiento. Compartí el mismo QR todos los días." action={<LinkButton href="/dashboard/rooms/new">Crear sala</LinkButton>} />{!rooms?.length ? <EmptyState title="Todavía no hay salas" description="Creá la primera y obtené su link y QR permanente." action={<LinkButton href="/dashboard/rooms/new">Crear la primera</LinkButton>} /> : <div className="overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.035]">{rooms.map((room) => <Link href={`/dashboard/rooms/${room.id}`} key={room.id} className="group flex min-h-16 items-center gap-3 border-b border-white/[.07] px-3.5 last:border-0 hover:bg-white/[.05]"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[.07] text-white/40"><InfinityIcon className="size-4" strokeWidth={1.6} aria-hidden /></span><div className="min-w-0 flex-1"><p className="truncate font-display text-base font-semibold tracking-[-.02em]">{room.name}</p><p className="mt-0.5 truncate text-[11px] text-white/35">Sala permanente · mismo QR</p></div><StatusBadge status={getEffectiveRoomStatus(room)} /><ChevronRight className="hidden size-4 text-white/20 transition-transform group-hover:translate-x-1 sm:block" strokeWidth={1.7} aria-hidden /></Link>)}</div>}</>;
}
