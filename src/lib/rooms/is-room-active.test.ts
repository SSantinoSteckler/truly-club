import { describe, expect, it } from "vitest";
import { getEffectiveRoomStatus, isRoomActive } from "./is-room-active";

const room = { status: "live" as const, start_at: "2026-08-25T20:00:00Z", end_at: "2026-08-26T02:00:00Z" };

describe("isRoomActive", () => {
  it("activates scheduled and live rooms automatically inside their window", () => {
    expect(isRoomActive(room, new Date("2026-08-25T22:00:00Z"))).toBe(true);
    expect(isRoomActive({ ...room, status: "scheduled" }, new Date("2026-08-25T22:00:00Z"))).toBe(true);
  });
  it("rejects drafts and ended windows", () => {
    expect(isRoomActive({ ...room, status: "draft" }, new Date("2026-08-25T22:00:00Z"))).toBe(false);
    expect(isRoomActive(room, new Date("2026-08-26T02:00:00Z"))).toBe(false);
  });
  it("derives scheduled, live and ended labels from the clock", () => {
    const scheduled = { ...room, status: "scheduled" as const };
    expect(getEffectiveRoomStatus(scheduled, new Date("2026-08-25T19:59:00Z"))).toBe("scheduled");
    expect(getEffectiveRoomStatus(scheduled, new Date("2026-08-25T22:00:00Z"))).toBe("live");
    expect(getEffectiveRoomStatus(scheduled, new Date("2026-08-26T02:00:00Z"))).toBe("ended");
  });
});
