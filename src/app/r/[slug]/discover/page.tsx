import { redirect } from "next/navigation";
import { Discovery } from "@/components/room/discovery";
import { getAttendeeSession } from "@/lib/rooms/session";
import { signAvatarPaths } from "@/lib/rooms/data";
import { isRoomActive } from "@/lib/rooms/is-room-active";

export default async function DiscoverPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const session = await getAttendeeSession(slug); if (!session) return null; if (!isRoomActive(session.room)) redirect(`/r/${slug}`); const presence = await session.supabase.from("room_presence").select("active").eq("room_id", session.room.id).eq("user_id", session.user.id).maybeSingle(); if (!presence.data?.active) redirect(`/r/${slug}`); const [profilesResult, likesResult, reasonsResult] = await Promise.all([session.supabase.rpc("discover_room_profiles", { target_room_id: session.room.id, page_size: 30 }), session.supabase.from("likes").select("to_user_id").eq("room_id", session.room.id).eq("from_user_id", session.user.id), session.supabase.from("report_reasons").select("*").eq("active", true).order("sort_order")]); const profiles = await signAvatarPaths(profilesResult.data ?? []); return <Discovery roomId={session.room.id} userId={session.user.id} profiles={profiles} likedIds={likesResult.data?.map((like) => like.to_user_id) ?? []} reasons={reasonsResult.data ?? []} />; }
