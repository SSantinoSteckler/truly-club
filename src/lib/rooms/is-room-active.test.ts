import { afterEach, describe, expect, it, vi } from "vitest";
import { getEffectiveRoomStatus, isRoomActive } from "./is-room-active";
import { roomSchema } from "./validation";

const room = { status: "live" as const, start_at: null, end_at: null };

describe("permanent room access", () => {
  afterEach(() => vi.useRealTimers());

  it("keeps an open room available across days and years", () => {
    vi.useFakeTimers();
    for (const date of ["2026-10-16T22:00:00Z", "2026-10-17T05:00:00Z", "2030-01-01T00:00:00Z"]) {
      vi.setSystemTime(new Date(date));
      expect(isRoomActive(room)).toBe(true);
      expect(getEffectiveRoomStatus(room)).toBe("live");
    }
  });

  it("blocks access while paused and restores it only when reopened", () => {
    expect(isRoomActive({ ...room, status: "draft" })).toBe(false);
    expect(getEffectiveRoomStatus({ ...room, status: "draft" })).toBe("draft");
    expect(isRoomActive({ ...room, status: "live" })).toBe(true);
  });

  it("does not automatically reopen legacy unavailable states", () => {
    for (const status of ["scheduled", "ended", "cancelled"] as const) {
      expect(isRoomActive({ status })).toBe(false);
    }
  });

  it("allows creation without dates but still requires a valid name and place", () => {
    expect(roomSchema.safeParse({ name: "Mi bar", venueId: "" }).success).toBe(true);
    expect(roomSchema.safeParse({ name: "", venueId: "" }).success).toBe(false);
    expect(roomSchema.safeParse({ name: "Mi bar", venueId: "not-a-venue" }).success).toBe(false);
  });
});
