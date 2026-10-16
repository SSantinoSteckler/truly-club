import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/room/profile-form";
import { getRoomBySlug, signAvatarPaths } from "@/lib/rooms/data";
import { isRoomActive } from "@/lib/rooms/is-room-active";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { room } = await getRoomBySlug(slug);
  if (!room) return null;
  if (!isRoomActive(room)) redirect(`/r/${slug}`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) redirect(`/r/${slug}/auth`);

  const [profileResult, interestsResult, intentsResult, selectedResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("interests").select("*").eq("active", true).order("sort_order"),
    supabase.from("profile_intents").select("*").eq("active", true).order("sort_order"),
    supabase.from("profile_interests").select("interest_id").eq("profile_id", user.id),
  ]);
  if (!profileResult.data) redirect(`/r/${slug}`);
  if (profileResult.data.onboarding_completed) redirect(`/r/${slug}`);

  const [profileWithUrl] = await signAvatarPaths([profileResult.data]);
  return (
    <section className="py-3">
      <ProfileForm
        slug={slug}
        roomId={room.id}
        userId={user.id}
        interests={interestsResult.data ?? []}
        intents={intentsResult.data ?? []}
        profile={profileResult.data}
        selectedInterests={selectedResult.data?.map((item) => item.interest_id) ?? []}
        currentAvatarUrl={profileWithUrl.avatar_url}
      />
    </section>
  );
}
