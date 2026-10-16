import type { RoomStatus } from "@/types/database";

export interface RoomWindow { status: RoomStatus; start_at: string | Date; end_at: string | Date }

export function getEffectiveRoomStatus(room: RoomWindow, now = new Date()): RoomStatus {
  if (room.status === "draft" || room.status === "cancelled" || room.status === "ended") return room.status;

  const starts = new Date(room.start_at).getTime();
  const ends = new Date(room.end_at).getTime();
  const time = now.getTime();
  if (![starts, ends, time].every(Number.isFinite)) return room.status;

  if (time >= ends) return "ended";
  if (time >= starts) return "live";
  return "scheduled";
}

export function isRoomActive(room: RoomWindow, now = new Date()) {
  return getEffectiveRoomStatus(room, now) === "live";
}
