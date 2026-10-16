import { NotificationList } from "@/components/room/notification-list";
import { getAttendeeSession } from "@/lib/rooms/session";
import { signAvatarPaths } from "@/lib/rooms/data";

export default async function NotificationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAttendeeSession(slug);
  if (!session) return null;
  const { data } = await session.supabase.rpc("get_my_notifications", { target_room_id: session.room.id, result_limit: 50 });
  const notifications = await signAvatarPaths((data ?? []).filter((item) => item.type === "like").map((item) => ({ ...item, avatar_path: item.actor_avatar_path })));
  return (
    <section>
      <header className="px-1 pb-5 pt-2"><h1 className="social-screen-title">Actividad</h1><p className="mt-2 text-sm text-white/40">Lo que está pasando con tu perfil</p></header>
      <NotificationList roomId={session.room.id} items={notifications} />
    </section>
  );
}
