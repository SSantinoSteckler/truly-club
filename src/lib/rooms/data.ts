import "server-only";

import { logger } from "@/lib/logger";
import { syncPublicRoomLifecycle } from "@/lib/rooms/lifecycle";
import { createClient } from "@/lib/supabase/server";
import type { PublicRoom } from "@/types/database";

export async function getRoomBySlug(slug: string): Promise<{ room: PublicRoom | null; error?: string }> {
  const supabase = await createClient(); const { data, error } = await supabase.rpc("get_public_room", { room_slug: slug });
  if (error) logger.error("Public room lookup failed", new Error(error.message), { slug, code: error.code });
  const room = data?.[0] ? await syncPublicRoomLifecycle(data[0]) : null;
  return { room, error: error?.message };
}

export async function signAvatarPaths<T extends { avatar_path: string | null }>(items: T[]): Promise<Array<T & { avatar_url: string | null }>> {
  const paths = [...new Set(items.flatMap((item) => item.avatar_path ? [item.avatar_path] : []))];
  if (!paths.length) return items.map((item) => ({ ...item, avatar_url: null }));
  const supabase = await createClient(); const { data } = await supabase.storage.from("avatars").createSignedUrls(paths, 60 * 10);
  const urls = new Map(data?.map((result) => [result.path, result.signedUrl]) ?? []);
  return items.map((item) => ({ ...item, avatar_url: item.avatar_path ? urls.get(item.avatar_path) ?? null : null }));
}
