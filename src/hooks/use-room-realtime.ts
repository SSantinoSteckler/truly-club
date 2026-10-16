"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRoomRealtime(roomId: string, onChange: (table: "room_presence" | "likes" | "notifications") => void) { useEffect(() => { const supabase = createClient(); const channel = supabase.channel(`room-${roomId}-${Date.now()}-${Math.random().toString(36).slice(2)}`).on("postgres_changes", { event: "*", schema: "public", table: "room_presence", filter: `room_id=eq.${roomId}` }, () => onChange("room_presence")).on("postgres_changes", { event: "INSERT", schema: "public", table: "likes", filter: `room_id=eq.${roomId}` }, () => onChange("likes")).on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `room_id=eq.${roomId}` }, () => onChange("notifications")).subscribe(); return () => { void supabase.removeChannel(channel); }; }, [roomId, onChange]); }
