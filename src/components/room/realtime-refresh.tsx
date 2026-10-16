"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRoomPresence } from "@/hooks/use-room-presence";
import { useRoomRealtime } from "@/hooks/use-room-realtime";

export function RealtimeRefresh({ roomId }: { roomId: string }) { const router = useRouter(); useRoomPresence(roomId); const refresh = useCallback(() => router.refresh(), [router]); useRoomRealtime(roomId, refresh); return null; }

