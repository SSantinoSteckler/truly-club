import { describe, expect, it } from "vitest";
import { canDiscoverProfile } from "./rules";

describe("room rules", () => {
  it("filters self, inactive and either direction of a block", () => {
    expect(canDiscoverProfile({ viewerId: "a", profileId: "a", active: true, blockedPairs: [] })).toBe(false);
    expect(canDiscoverProfile({ viewerId: "a", profileId: "b", active: false, blockedPairs: [] })).toBe(false);
    expect(canDiscoverProfile({ viewerId: "a", profileId: "b", active: true, blockedPairs: [["b", "a"]] })).toBe(false);
    expect(canDiscoverProfile({ viewerId: "a", profileId: "b", active: true, blockedPairs: [] })).toBe(true);
  });
});
