import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AttendeeSettings } from "@/components/room/attendee-settings";
import { AccountSettings } from "@/components/dashboard/account-settings";
import { getAttendeeSession } from "@/lib/rooms/session";

export default async function AttendeeSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAttendeeSession(slug);
  if (!session) return null;
  const { data: blocks } = await session.supabase.from("blocks").select("blocked_user_id").eq("blocker_user_id", session.user.id);
  return (
    <section>
      <header className="flex items-center gap-3 px-1 pb-6 pt-2"><Link href={`/r/${slug}/profile`} className="social-icon-button" aria-label="Volver al perfil"><ChevronLeft className="size-5" strokeWidth={1.8} aria-hidden /></Link><div><h1 className="social-screen-title">Ajustes</h1><p className="mt-1 text-sm text-white/40">Cuenta, privacidad y presencia</p></div></header>
      <AttendeeSettings roomId={session.room.id} slug={slug} email={session.user.email ?? "Cuenta sin email"} blockedIds={blocks?.map((block) => block.blocked_user_id) ?? []} />
      <section className="mt-4 rounded-2xl border border-accent/20 bg-accent/[.06] p-4">
        <h2 className="font-display text-xl font-semibold text-white">Eliminar cuenta</h2>
        <p className="mb-4 mt-2 text-sm leading-5 text-white/45">Borra tu acceso y todos los datos personales asociados.</p>
        <AccountSettings social />
      </section>
    </section>
  );
}
