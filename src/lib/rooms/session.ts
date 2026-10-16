import "server-only";

import { redirect } from "next/navigation";
import { getRoomBySlug } from "@/lib/rooms/data";
import { createClient } from "@/lib/supabase/server";

export async function getAttendeeSession(slug: string) { const { room } = await getRoomBySlug(slug); if (!room) return null; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user || user.is_anonymous) redirect(`/r/${slug}/auth`); const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single(); if (!profile?.onboarding_completed) redirect(`/r/${slug}/onboarding`); return { room, user, profile, supabase }; }
