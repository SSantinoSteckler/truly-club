"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { RoomRow } from "@/types/database";

export function RoomStatusActionsClient({ room }: { room: Pick<RoomRow, "id" | "status" | "name"> }) {
  const router = useRouter();
  const busyRef = useRef(false);
  const [loading, setLoading] = useState<"status" | "delete">();
  const [error, setError] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function update() {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading("status");
    setError(undefined);
    try {
      const { data, error } = await createClient().from("rooms").update({ status: room.status === "live" ? "draft" : "live" }).eq("id", room.id).select("id").single();
      if (error) throw error;
      if (!data) throw new Error("No tenés permiso para modificar esta sala.");
      router.refresh();
    } catch {
      setError("No pudimos cambiar el estado. Verificá tus permisos e intentá nuevamente.");
    } finally {
      busyRef.current = false;
      setLoading(undefined);
    }
  }

  async function remove() {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading("delete");
    setError(undefined);
    try {
      const { data, error } = await createClient().from("rooms").delete().eq("id", room.id).select("id").single();
      if (error) throw error;
      if (!data) throw new Error("No tenés permiso para eliminar esta sala.");
      router.replace("/dashboard/rooms");
      router.refresh();
    } catch {
      busyRef.current = false;
      setLoading(undefined);
      setError("No pudimos eliminar la sala. Solo el propietario o un administrador puede hacerlo.");
    }
  }

  return <div>
    <div className="flex flex-wrap gap-2">
      <Button type="button" disabled={Boolean(loading)} loading={loading === "status"} onClick={update}>{room.status === "live" ? "Pausar sala" : "Abrir sala"}</Button>
      <Button type="button" variant="ghost" disabled={Boolean(loading)} onClick={() => setConfirmDelete(true)}>Eliminar sala</Button>
    </div>
    {confirmDelete && <div className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-3">
      <p className="text-sm font-semibold">¿Eliminar {room.name}?</p>
      <p className="mt-2 text-xs leading-5 text-white/50">Se borrarán la sala y sus interacciones. Su QR dejará de funcionar. Las cuentas de tus clientes se conservan. Esta acción no se puede deshacer.</p>
      <div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" variant="danger" disabled={Boolean(loading)} loading={loading === "delete"} onClick={remove}>Eliminar definitivamente</Button><Button type="button" size="sm" variant="ghost" disabled={Boolean(loading)} onClick={() => setConfirmDelete(false)}>Conservar sala</Button></div>
    </div>}
    {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
  </div>;
}
