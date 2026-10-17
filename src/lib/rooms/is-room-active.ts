import type { RoomStatus } from "@/types/database";

// Permanent rooms are opened and paused manually; the clock never changes access.
export interface RoomWindow { status: RoomStatus }

export function getEffectiveRoomStatus(room: RoomWindow): RoomStatus {
  return room.status;
}

export function isRoomActive(room: RoomWindow) {
  return room.status === "live";
}
