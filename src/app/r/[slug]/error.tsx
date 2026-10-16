"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

export default function RoomError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[68dvh] flex-col items-center justify-center px-8 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-accent/10 text-accent"><TriangleAlert className="size-7" strokeWidth={1.6} aria-hidden /></span>
      <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-.045em]">Algo salió mal</h2>
      <p className="mt-2 max-w-xs text-sm leading-6 text-white/40">No pudimos cargar esta parte de la sala.</p>
      <button type="button" className="mt-6 flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-black" onClick={reset}><RefreshCw className="size-4" strokeWidth={2} aria-hidden />Reintentar</button>
    </div>
  );
}
