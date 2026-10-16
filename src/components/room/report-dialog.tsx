"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Select, Textarea } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import type { ReasonRow } from "@/types/database";

export function ReportDialog({ roomId, reporterId, reportedId, reasons, onClose }: { roomId: string; reporterId: string; reportedId: string; reasons: ReasonRow[]; onClose: () => void }) {
  const [reasonId, setReasonId] = useState(reasons[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  async function submit() { setLoading(true); const { error: resultError } = await createClient().from("reports").insert({ room_id: roomId, reporter_user_id: reporterId, reported_user_id: reportedId, reason_id: reasonId, description: description || null }); setLoading(false); if (resultError) return setError(resultError.message); onClose(); }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-end bg-black/75 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="safe-bottom w-full max-w-[480px] rounded-t-[1.75rem] border border-white/10 bg-[#171718] p-5 sm:rounded-[1.75rem]">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/20 sm:hidden" />
        <div className="flex items-start justify-between gap-4"><div><h2 id="report-title" className="font-display text-2xl font-semibold tracking-[-.035em]">Reportar perfil</h2><p className="mt-2 text-sm leading-5 text-white/45">Es privado. El equipo de la sala va a revisarlo.</p></div><button type="button" onClick={onClose} aria-label="Cerrar" className="social-icon-button size-10 shrink-0"><X className="size-5" aria-hidden /></button></div>
        <div className="mt-6 grid gap-5"><label><span className="mb-2 block text-xs font-semibold text-white/55">Motivo</span><Select value={reasonId} onChange={(event) => setReasonId(event.target.value)}>{reasons.map((reason) => <option key={reason.id} value={reason.id}>{reason.label}</option>)}</Select></label><label><span className="mb-2 block text-xs font-semibold text-white/55">¿Qué pasó? · opcional</span><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Agregá contexto" /></label>{error && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-[#ff8a98]">{error}</p>}<div className="grid grid-cols-2 gap-3"><button type="button" className="min-h-12 rounded-xl bg-white/[.07] text-sm font-semibold" onClick={onClose}>Cancelar</button><button type="button" className="min-h-12 rounded-xl bg-accent text-sm font-bold text-white disabled:opacity-40" disabled={loading} onClick={submit}>{loading ? "Enviando…" : "Enviar reporte"}</button></div></div>
      </div>
    </div>
  );
}
