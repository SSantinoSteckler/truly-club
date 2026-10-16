import { Settings } from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "@/components/room/profile-form";
import { signAvatarPaths } from "@/lib/rooms/data";
import { getAttendeeSession } from "@/lib/rooms/session";

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAttendeeSession(slug);
  if (!session) return null;
  const [interestsResult, intentsResult, selectedResult] = await Promise.all([
    session.supabase.from("interests").select("*").eq("active", true).order("sort_order"),
    session.supabase.from("profile_intents").select("*").eq("active", true).order("sort_order"),
    session.supabase.from("profile_interests").select("interest_id").eq("profile_id", session.user.id),
  ]);
  const [profile] = await signAvatarPaths([session.profile]);

  return (
    <section>
      <header className="flex items-center justify-between gap-4 px-1 pb-6 pt-2">
        <div><h1 className="social-screen-title">Tu perfil</h1><p className="mt-2 text-sm text-white/40">Así te ve la gente de la sala</p></div>
        <Link href={`/r/${slug}/settings`} className="social-icon-button" aria-label="Abrir ajustes"><Settings className="size-5" strokeWidth={1.7} aria-hidden /></Link>
      </header>
      <ProfileForm mode="edit" slug={slug} roomId={session.room.id} userId={session.user.id} interests={interestsResult.data ?? []} intents={intentsResult.data ?? []} profile={session.profile} selectedInterests={selectedResult.data?.map((item) => item.interest_id) ?? []} currentAvatarUrl={profile.avatar_url} />
    </section>
  );
}
