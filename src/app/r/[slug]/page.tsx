import { Clock3, MapPin } from "lucide-react";
import { RoomEntry } from "@/components/room/room-entry";
import { RoomLifecycleRefresh } from "@/components/room/room-lifecycle-refresh";
import { getRoomBySlug } from "@/lib/rooms/data";
import { isRoomActive } from "@/lib/rooms/is-room-active";

export default async function RoomWelcomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { room } = await getRoomBySlug(slug);
  if (!room) return null;
  const active = isRoomActive(room);
  const text = active ? "Sala abierta ahora" : "Sala pausada por el lugar. Volvé a entrar cuando la abran.";

  return (
    <section className="flex min-h-[calc(100dvh-5.25rem)] flex-col pb-3 pt-1">
      <RoomLifecycleRefresh />
      <div className="social-panel relative flex min-w-0 flex-1 flex-col overflow-hidden p-6">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${active ? "bg-[#7cff6b]/15 text-[#a0ff94]" : "bg-white/[.07] text-white/50"}`}>
            <span className={`size-2 rounded-full ${active ? "bg-[#7cff6b]" : "bg-white/30"}`} aria-hidden />
            {active ? "Abierta" : "Pausada"}
          </span>
          <span className="text-xs text-white/35">Sala privada</span>
        </div>

        <div className="my-auto py-12">
          <p className="flex items-center gap-2 text-sm font-medium text-white/45"><MapPin className="size-4" strokeWidth={1.7} aria-hidden />{room.venue_name || room.venue_city || "Sala del lugar"}</p>
          <h1 className="mt-4 max-w-full font-display text-[clamp(2.65rem,13vw,4.5rem)] font-semibold leading-[.9] tracking-[-.06em] text-white [overflow-wrap:anywhere]">{room.name}</h1>
          {room.description && <p className="mt-5 max-w-sm text-[15px] leading-6 text-white/55">{room.description}</p>}
        </div>

        <div className="flex items-center gap-2 border-t border-white/[.08] pt-4 text-xs text-white/45">
          <Clock3 className="size-4" strokeWidth={1.7} aria-hidden />
          <span>{text}</span>
        </div>
      </div>

      <RoomEntry roomId={room.id} slug={slug} active={active} statusText={text} />
      <p className="mx-auto mt-4 max-w-xs text-center text-[10px] leading-4 text-white/30">Al entrar aceptás los <a href="/terms" className="underline underline-offset-2">términos</a> y la <a href="/privacy" className="underline underline-offset-2">política de privacidad</a>.</p>
    </section>
  );
}
