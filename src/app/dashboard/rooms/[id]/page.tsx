import { CalendarClock, KeyRound, MapPin, MessageSquareText } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { RoomQr } from "@/components/dashboard/room-qr";
import { RoomStatusActions } from "@/components/dashboard/room-status-actions";
import { LinkButton } from "@/components/ui/link-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOrganizerContext } from "@/lib/auth/organizer";
import { getPublicEnv } from "@/lib/env";
import { getEffectiveRoomStatus } from "@/lib/rooms/is-room-active";
import { createClient } from "@/lib/supabase/server";
import type { RoomRow, VenueRow } from "@/types/database";
import { formatDateTime } from "@/utils/date";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getOrganizerContext({ requireOrganization: true });
  const supabase = await createClient();
  const { data } = await supabase.from("rooms").select("*").eq("id", id).single();
  if (!data) notFound();
  const room = data as RoomRow;
  const effectiveStatus = getEffectiveRoomStatus(room);
  let venue: VenueRow | null = null;
  if (room.venue_id) venue = (await supabase.from("venues").select("*").eq("id", room.venue_id).single()).data;
  const roomUrl = `${getPublicEnv().siteUrl.replace(/\/$/, "")}/r/${room.slug}`;

  return <><PageHeader eyebrow="Operación de sala" title={room.name} description="Controlá el estado, compartí el acceso y consultá sus resultados." action={<LinkButton href={`/dashboard/rooms/${room.id}/analytics`}>Ver analytics</LinkButton>} /><div className="grid min-w-0 gap-4 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start"><section className="min-w-0 overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.035]"><div className="border-b border-white/[.07] p-3.5"><div className="flex items-center justify-between"><p className="text-[13px] font-semibold">Estado actual</p><StatusBadge status={effectiveStatus} /></div><div className="mt-3"><RoomStatusActions room={{ ...room, status: effectiveStatus }} /></div></div><RoomDatum icon={CalendarClock} label="Comienza" value={formatDateTime(room.start_at)} /><RoomDatum icon={CalendarClock} label="Finaliza" value={formatDateTime(room.end_at)} /><RoomDatum icon={MapPin} label="Lugar" value={venue ? `${venue.name}, ${venue.city}` : "Sin lugar"} /><RoomDatum icon={MessageSquareText} label="Descripción" value={room.description || "Sin descripción"} /><div className="p-3.5"><div className="flex items-center gap-2 text-white/40"><KeyRound className="size-3.5" strokeWidth={1.7} aria-hidden /><p className="text-[11px] font-semibold">Código interno</p></div><p className="mt-2 break-all font-mono text-[9px] text-white/30">{room.access_code}</p></div></section><RoomQr url={roomUrl} roomName={room.name} /></div></>;
}

function RoomDatum({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) { return <div className="border-b border-white/[.07] p-3.5"><div className="flex items-center gap-2 text-white/40"><Icon className="size-3.5" strokeWidth={1.7} aria-hidden /><p className="text-[11px] font-semibold">{label}</p></div><p className="mt-2 text-[13px] leading-5 text-white/70">{value}</p></div>; }
