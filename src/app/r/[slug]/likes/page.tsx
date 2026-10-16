import { Heart } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RealtimeRefresh } from "@/components/room/realtime-refresh";
import { SocialEmpty } from "@/components/room/social-empty";
import { getAttendeeSession } from "@/lib/rooms/session";
import { signAvatarPaths } from "@/lib/rooms/data";
import { formatDateTime } from "@/utils/date";

export default async function LikesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAttendeeSession(slug);
  if (!session) return null;
  const { data } = await session.supabase.rpc("get_received_likes", { target_room_id: session.room.id });
  const likes = await signAvatarPaths(data ?? []);

  return (
    <section>
      <RealtimeRefresh roomId={session.room.id} />
      <header className="flex items-end justify-between gap-4 px-1 pb-6 pt-2">
        <div><h1 className="social-screen-title">Likes</h1><p className="mt-2 text-sm text-white/40">Personas a las que les gustaste</p></div>
        <span className="grid size-11 place-items-center rounded-full bg-accent text-sm font-bold tabular-nums text-white">{likes.length}</span>
      </header>
      {!likes.length ? (
        <SocialEmpty icon={Heart} title="Todavía no hay likes" description="Cuando alguien de esta sala te elija, va a aparecer acá al instante." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {likes.map((like) => (
            <article key={like.like_id} className="overflow-hidden rounded-[1.35rem] bg-white/[.06]">
              <Avatar src={like.avatar_url} name={like.display_name} className="aspect-[4/5] size-auto w-full rounded-none" />
              <div className="p-3">
                <div className="flex items-center justify-between gap-2"><p className="truncate font-display text-lg font-semibold tracking-[-.025em]">{like.display_name}</p><Heart className="size-4 shrink-0 text-accent" fill="currentColor" strokeWidth={0} aria-hidden /></div>
                <p className="mt-1 text-[10px] text-white/35">{formatDateTime(like.liked_at)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
