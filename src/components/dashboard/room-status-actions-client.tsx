"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { RoomRow, RoomStatus } from "@/types/database";

export function RoomStatusActionsClient({ room }: { room: Pick<RoomRow, "id" | "status" | "start_at"> }) {
  const router = useRouter();
  const [loading, setLoading] = useState<RoomStatus>();
  const [error, setError] = useState<string>();

  async function update(status: RoomStatus) {
    setLoading(status); setError(undefined);
    const patch: { status: RoomStatus; start_at?: string } = { status };
    if (status === "live" && new Date(room.start_at) > new Date()) patch.start_at = new Date().toISOString();
    const { error: resultError } = await createClient().from("rooms").update(patch).eq("id", room.id);
    setLoading(undefined);
    if (resultError) return setError(resultError.message);
    router.refresh();
  }

  const canSchedule = room.status === "draft" && new Date(room.start_at) > new Date();

  return <div><div className="flex flex-wrap gap-2">{canSchedule && <Button variant="secondary" loading={loading === "scheduled"} onClick={() => update("scheduled")}>Programar para la fecha</Button>}{["draft", "scheduled"].includes(room.status) && <Button loading={loading === "live"} onClick={() => update("live")}>Comenzar sala</Button>}{room.status === "live" && <Button variant="danger" loading={loading === "ended"} onClick={() => update("ended")}>Finalizar sala</Button>}{!["ended", "cancelled"].includes(room.status) && <Button variant="ghost" loading={loading === "cancelled"} onClick={() => update("cancelled")}>Cancelar</Button>}</div>{error && <p className="mt-2 text-xs text-danger">{error}</p>}</div>;
}
