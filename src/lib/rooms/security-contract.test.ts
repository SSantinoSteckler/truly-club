import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/202608250001_initial_schema.sql"), "utf8");
const likesOnlyMigration = readFileSync(join(process.cwd(), "supabase/migrations/202608260007_likes_only.sql"), "utf8");
const privateTables = ["profiles", "organizations", "organization_members", "venues", "rooms", "room_presence", "profile_interests", "likes", "matches", "notifications", "blocks", "reports"];

describe("database security contract", () => {
  it("enables RLS for every private application table", () => {
    for (const table of privateTables) expect(migration).toContain(`alter table public.${table} enable row level security;`);
  });
  it("enforces non-self likes and canonical unique matches", () => {
    expect(migration).toContain("constraint likes_not_self check (from_user_id <> to_user_id)");
    expect(migration).toContain("constraint matches_canonical_order check (user_one_id < user_two_id)");
    expect(migration).toContain("unique (room_id, user_one_id, user_two_id)");
  });
  it("keeps avatars private and scoped by owner path", () => {
    expect(migration).toContain("values ('avatars', 'avatars', false");
    expect(migration).toContain("(storage.foldername(name))[1] = auth.uid()::text");
  });
  it("never grants broad table privileges to browser roles", () => {
    expect(migration).not.toMatch(/grant all privileges on all tables in schema public to (anon|authenticated)/i);
  });
  it("keeps reciprocal likes in likes-only mode", () => {
    expect(likesOnlyMigration).toContain("create trigger likes_create_notification");
    expect(likesOnlyMigration).not.toContain("insert into public.matches");
    expect(likesOnlyMigration).toContain("revoke execute on function public.get_room_matches(uuid) from authenticated");
  });
});
