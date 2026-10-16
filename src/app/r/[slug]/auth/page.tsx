import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { RoomAuthForm } from "@/components/room/room-auth-form";
import { getRoomBySlug } from "@/lib/rooms/data";
import { isRoomActive } from "@/lib/rooms/is-room-active";
import { createClient } from "@/lib/supabase/server";

export default async function RoomAuthPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const { room } = await getRoomBySlug(slug);
  if (!room) return null;
  if (!isRoomActive(room)) redirect(`/r/${slug}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && !user.is_anonymous) redirect(`/r/${slug}`);

  return (
    <section className="flex min-h-[calc(100dvh-5rem)] flex-col py-2">
      <div className="mx-auto w-full max-w-sm">
        <span className="grid size-12 place-items-center rounded-full bg-white/[.07] text-white/70"><LockKeyhole className="size-5" strokeWidth={1.7} aria-hidden /></span>
        <h1 className="mt-6 font-display text-[2.5rem] font-semibold leading-[.95] tracking-[-.055em]">Entrá con tu cuenta</h1>
        <p className="mt-3 text-sm leading-6 text-white/45">Usamos tu cuenta para guardar tu identidad y que puedas volver a entrar desde cualquier dispositivo.</p>
        <div className="mt-8"><RoomAuthForm roomId={room.id} slug={slug} initialError={query.error ? "No pudimos confirmar el email. Solicitá un enlace nuevo o iniciá sesión si ya lo confirmaste." : undefined} /></div>
      </div>
    </section>
  );
}
