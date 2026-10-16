import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleKey } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getEffectiveRoomStatus } from "@/lib/rooms/is-room-active";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, PublicRoom } from "@/types/database";

export async function syncOrganizationRoomLifecycle(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  now = new Date(),
) {
  const timestamp = now.toISOString();
  const [endedResult, liveResult] = await Promise.all([
    supabase
      .from("rooms")
      .update({ status: "ended" })
      .eq("organization_id", organizationId)
      .in("status", ["scheduled", "live"])
      .lte("end_at", timestamp),
    supabase
      .from("rooms")
      .update({ status: "live" })
      .eq("organization_id", organizationId)
      .eq("status", "scheduled")
      .lte("start_at", timestamp)
      .gt("end_at", timestamp),
  ]);

  if (endedResult.error) logger.error("Could not close expired rooms", new Error(endedResult.error.message), { organizationId });
  if (liveResult.error) logger.error("Could not start scheduled rooms", new Error(liveResult.error.message), { organizationId });
}

export async function syncPublicRoomLifecycle(room: PublicRoom, now = new Date()): Promise<PublicRoom> {
  const status = getEffectiveRoomStatus(room, now);
  if (!getServiceRoleKey()) return { ...room, status };

  try {
    const admin = createAdminClient();
    if (status === "live") {
      const { error } = await admin.from("rooms").update({ status: "live" }).eq("id", room.id).eq("status", "scheduled");
      if (error) throw error;
    } else if (status === "ended") {
      const { error } = await admin.from("rooms").update({ status: "ended" }).eq("id", room.id).in("status", ["scheduled", "live"]);
      if (error) throw error;
    }
  } catch (error) {
    logger.error("Could not synchronize public room lifecycle", error, { roomId: room.id, status });
  }

  return { ...room, status };
}
