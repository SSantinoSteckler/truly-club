import { RoomStatusActionsClient } from "@/components/dashboard/room-status-actions-client";
import type { RoomRow } from "@/types/database";

export function RoomStatusActions({ room }: { room: RoomRow }) {
  return <RoomStatusActionsClient room={{ id: room.id, status: room.status, start_at: room.start_at }} />;
}

