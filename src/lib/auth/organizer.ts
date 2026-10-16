import "server-only";

import { redirect } from "next/navigation";
import { syncOrganizationRoomLifecycle } from "@/lib/rooms/lifecycle";
import { createClient } from "@/lib/supabase/server";
import type { OrganizationRow, OrganizationRole } from "@/types/database";

export interface OrganizerContext {
  userId: string;
  email: string | null;
  organization: OrganizationRow | null;
  role: OrganizationRole | null;
}

export async function getOrganizerContext(options: { requireOrganization?: boolean } = {}): Promise<OrganizerContext> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) redirect("/login");

  const { data: membership } = await supabase.from("organization_members").select("organization_id, role").eq("user_id", user.id).limit(1).maybeSingle();
  let organization: OrganizationRow | null = null;
  if (membership) {
    const result = await supabase.from("organizations").select("*").eq("id", membership.organization_id).single();
    organization = result.data;
    if (organization) await syncOrganizationRoomLifecycle(supabase, organization.id);
  }
  if (options.requireOrganization && !organization) redirect("/dashboard/organization");
  return { userId: user.id, email: user.email ?? null, organization, role: membership?.role ?? null };
}
