import { notFound } from "next/navigation";
import { BottomNav } from "@/components/room/bottom-nav";
import { SocialHeader } from "@/components/room/social-header";
import { getRoomBySlug } from "@/lib/rooms/data";

export const dynamic = "force-dynamic";
export default async function RoomLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) { const { slug } = await params; const { room } = await getRoomBySlug(slug); if (!room) notFound(); return <div className="social-shell"><div className="social-canvas mx-auto min-h-dvh max-w-[480px]"><SocialHeader slug={slug} roomName={room.name} /><main className="social-page">{children}</main><BottomNav slug={slug} /></div></div>; }
