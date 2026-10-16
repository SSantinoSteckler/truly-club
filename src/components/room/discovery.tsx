"use client";

import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, Heart, MoreHorizontal, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ReportDialog } from "@/components/room/report-dialog";
import { useRoomPresence } from "@/hooks/use-room-presence";
import { useRoomRealtime } from "@/hooks/use-room-realtime";
import { createClient } from "@/lib/supabase/client";
import type { DiscoveryProfile, ReasonRow } from "@/types/database";
import { cn } from "@/utils/cn";

type Profile = DiscoveryProfile & { avatar_url: string | null };

export function Discovery({ roomId, userId, profiles, likedIds, reasons }: { roomId: string; userId: string; profiles: Profile[]; likedIds: string[]; reasons: ReasonRow[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState(new Set(likedIds));
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [likePulse, setLikePulse] = useState(false);
  const active = useRoomPresence(roomId);
  const refresh = useCallback((table: string) => { if (table === "room_presence") router.refresh(); }, [router]);
  useRoomRealtime(roomId, refresh);

  const safeIndex = Math.min(index, Math.max(0, profiles.length - 1));
  const profile = profiles[safeIndex];

  function move(direction: -1 | 1) {
    setMenu(false);
    setIndex((current) => Math.max(0, Math.min(current + direction, profiles.length - 1)));
  }

  async function like() {
    if (!profile || liked.has(profile.id)) return;
    const { error } = await createClient().from("likes").insert({ room_id: roomId, from_user_id: userId, to_user_id: profile.id });
    if (error) return toast.error(error.code === "23505" ? "Ya le diste like" : error.message);
    setLiked((current) => new Set(current).add(profile.id));
    setLikePulse(true);
    window.setTimeout(() => setLikePulse(false), 360);
    if ("vibrate" in navigator) navigator.vibrate(18);
    toast.success(`Le avisamos a ${profile.display_name}`);
    window.setTimeout(() => { if (safeIndex < profiles.length - 1) move(1); }, 280);
  }

  async function block() {
    if (!profile || !window.confirm(`¿Bloquear a ${profile.display_name}? Dejarán de verse mutuamente.`)) return;
    const { error } = await createClient().from("blocks").insert({ blocker_user_id: userId, blocked_user_id: profile.id });
    if (error) return toast.error(error.message);
    setMenu(false);
    router.refresh();
    toast.success("Perfil bloqueado");
  }

  if (!active) return <DiscoveryMessage title="La sala terminó" description="Ya no se muestran personas ni se permiten interacciones nuevas." />;
  if (!profile) return <DiscoveryMessage title="Sos de los primeros" description="Dejá Truly abierto. Cuando alguien entre, va a aparecer acá en tiempo real." />;

  const isLiked = liked.has(profile.id);
  return (
    <section className="pb-1">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-medium text-white/60">
          <UsersRound className="size-4" strokeWidth={1.8} aria-hidden />
          <span>{profiles.length} {profiles.length === 1 ? "persona" : "personas"} ahora</span>
        </div>
        <span className="text-[11px] tabular-nums text-white/35">{safeIndex + 1} / {profiles.length}</span>
      </div>

      <div className="relative">
        {menu && (
          <div className="absolute right-3 top-14 z-30 min-w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#202022] p-1 text-sm font-medium text-white shadow-2xl shadow-black/50">
            <button type="button" onClick={() => setReporting(true)} className="block min-h-11 w-full rounded-xl px-3 text-left hover:bg-white/10">Reportar perfil</button>
            <button type="button" onClick={block} className="block min-h-11 w-full rounded-xl px-3 text-left text-[#ff7b89] hover:bg-white/10">Bloquear</button>
          </div>
        )}

        <article key={profile.id} className="animate-image-in relative h-[calc(100dvh-13.5rem)] min-h-[29rem] max-h-[43rem] overflow-hidden rounded-[1.75rem] bg-[#252525]">
          {profile.avatar_url ? (
            <Image unoptimized fill priority sizes="(max-width: 480px) 100vw, 480px" src={profile.avatar_url} alt={profile.display_name} className="object-cover" />
          ) : (
            <div className="grid size-full place-items-center bg-[#262629] text-white"><span className="font-display text-[40vw] font-semibold leading-none sm:text-[11rem]">{profile.display_name.slice(0, 1)}</span></div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.9)_0%,rgba(0,0,0,.16)_48%,rgba(0,0,0,.2)_100%)]" />

          <button type="button" aria-expanded={menu} aria-label="Acciones sobre este perfil" className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm" onClick={() => setMenu(!menu)}><MoreHorizontal className="size-5" aria-hidden /></button>
          {profile.intent_label && <p className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-sm">{profile.intent_label}</p>}

          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex items-baseline gap-2">
              <h1 className="min-w-0 font-display text-[2.45rem] font-semibold leading-none tracking-[-.055em] text-white [overflow-wrap:anywhere]">{profile.display_name}</h1>
              {profile.age && <span className="text-xl font-medium tabular-nums text-white/80">{profile.age}</span>}
            </div>
            {profile.bio && <p className="mt-2 max-w-sm text-sm leading-5 text-white/75">{profile.bio}</p>}
            {!!profile.interests.length && <div className="mt-3 flex flex-wrap gap-1.5">{profile.interests.slice(0, 4).map((interest) => <span key={interest.id} className="social-chip">{interest.label}</span>)}</div>}
          </div>
          {likePulse && <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center"><span className="animate-like-hit grid size-24 place-items-center rounded-full bg-white text-accent shadow-2xl"><Heart className="size-12" fill="currentColor" strokeWidth={0} aria-hidden /></span></div>}
        </article>
      </div>

      <div className="flex min-h-[4.75rem] items-center justify-center gap-5 pt-2">
        <button type="button" aria-label="Perfil anterior" disabled={safeIndex === 0} onClick={() => move(-1)} className="social-icon-button disabled:opacity-20"><ChevronLeft className="size-6" strokeWidth={1.8} aria-hidden /></button>
        <button type="button" aria-label={isLiked ? "Ya le diste like" : `Dar like a ${profile.display_name}`} disabled={isLiked} onClick={like} className={cn("grid size-16 place-items-center rounded-full shadow-lg transition-transform active:scale-95", isLiked ? "bg-white/10 text-white/45" : "bg-accent text-white shadow-violet/25 hover:scale-105")}>
          {isLiked ? <Check className="size-7" strokeWidth={2.2} aria-hidden /> : <Heart className="size-7" fill="currentColor" strokeWidth={0} aria-hidden />}
        </button>
        <button type="button" aria-label="Perfil siguiente" disabled={safeIndex >= profiles.length - 1} onClick={() => move(1)} className="social-icon-button disabled:opacity-20"><ChevronRight className="size-6" strokeWidth={1.8} aria-hidden /></button>
      </div>

      {reporting && <ReportDialog roomId={roomId} reporterId={userId} reportedId={profile.id} reasons={reasons} onClose={() => { setReporting(false); setMenu(false); toast.success("Reporte enviado"); }} />}
    </section>
  );
}

function DiscoveryMessage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[68dvh] flex-col items-center justify-center px-8 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-white/[.07] text-white/70"><UsersRound className="size-7" strokeWidth={1.5} aria-hidden /></span>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-[-.045em]">{title}</h1>
      <p className="mt-3 max-w-xs text-sm leading-6 text-white/45">{description}</p>
    </div>
  );
}
