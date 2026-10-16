"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Heart } from "lucide-react";
import { SocialEmpty } from "@/components/room/social-empty";
import { Avatar } from "@/components/ui/avatar";
import { useRoomRealtime } from "@/hooks/use-room-realtime";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/types/database";
import { formatDateTime } from "@/utils/date";

type Notification = AppNotification & { avatar_url: string | null };

export function NotificationList({ roomId, items }: { roomId: string; items: Notification[] }) {
  const router = useRouter();
  const refresh = useCallback((table: "room_presence" | "likes" | "notifications") => { if (table === "notifications") router.refresh(); }, [router]);
  useRoomRealtime(roomId, refresh);

  useEffect(() => {
    const ids = items.filter((item) => !item.read_at).map((item) => item.id);
    if (ids.length) void createClient().from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
  }, [items]);

  if (!items.length) return <SocialEmpty icon={Bell} title="Todo tranquilo" description="Cuando alguien te dé like, va a aparecer acá sin que tengas que refrescar." />;

  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <article key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/[.055] p-3">
          <Avatar src={item.avatar_url} name={item.actor_name} className="size-14 rounded-full" />
          <div className="min-w-0 flex-1"><p className="text-sm leading-5"><strong className="font-semibold text-white">{item.actor_name}</strong> <span className="text-white/50">te dio like.</span></p><p className="mt-1 text-[10px] text-white/30">{formatDateTime(item.created_at)}</p></div>
          <span className="grid size-9 place-items-center rounded-full bg-accent/15 text-accent"><Heart className="size-4" fill="currentColor" strokeWidth={0} aria-hidden /></span>
        </article>
      ))}
    </div>
  );
}
