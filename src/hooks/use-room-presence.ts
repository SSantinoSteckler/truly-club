"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRoomPresence(roomId: string) { const [active, setActive] = useState(true); useEffect(() => { const supabase = createClient(); let stopped = false; async function heartbeat() { if (stopped || document.visibilityState !== "visible") return; const { data } = await supabase.rpc("heartbeat_presence", { target_room_id: roomId }); if (data === false) setActive(false); } void heartbeat(); const interval = window.setInterval(heartbeat, 30_000); const onVisible = () => { if (document.visibilityState === "visible") void heartbeat(); }; document.addEventListener("visibilitychange", onVisible); return () => { stopped = true; clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); }; }, [roomId]); return active; }

