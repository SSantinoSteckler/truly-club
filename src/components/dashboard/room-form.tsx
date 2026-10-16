"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { roomSchema } from "@/lib/rooms/validation";
import { createClient } from "@/lib/supabase/client";
import type { VenueRow } from "@/types/database";
import { cn } from "@/utils/cn";
import { toDateTimeLocal } from "@/utils/date";
import { slugify } from "@/utils/slug";

type Values = z.infer<typeof roomSchema>;
type Step = 1 | 2 | 3;

const copy = {
  1: { label: "Información", title: "¿Qué está pasando?", description: "Poné un nombre claro y una breve descripción." },
  2: { label: "Ubicación", title: "¿Dónde se encuentran?", description: "Vinculá un lugar existente o dejalo sin asignar." },
  3: { label: "Horario", title: "¿Cuándo ocurre?", description: "La sala queda preparada y vos decidís cuándo comenzarla." },
} satisfies Record<Step, { label: string; title: string; description: string }>;

export function RoomForm({ organizationId, venues }: { organizationId: string; venues: VenueRow[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const now = new Date();
  const later = new Date(now.getTime() + 4 * 60 * 60_000);
  const { register, handleSubmit, setError, trigger, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(roomSchema), defaultValues: { startAt: toDateTimeLocal(now), endAt: toDateTimeLocal(later), venueId: "" } });

  async function next() { if (step === 1 && !(await trigger(["name", "description"]))) return; if (step === 2 && !(await trigger("venueId"))) return; setStep((current) => Math.min(3, current + 1) as Step); }
  async function submit(values: Values) { const slug = `${slugify(values.name)}-${crypto.randomUUID().slice(0, 6)}`; const { data, error } = await createClient().from("rooms").insert({ organization_id: organizationId, venue_id: values.venueId || null, name: values.name, slug, description: values.description || null, start_at: new Date(values.startAt).toISOString(), end_at: new Date(values.endAt).toISOString(), status: "draft" }).select("id").single(); if (error) return setError("root", { message: error.message }); router.push(`/dashboard/rooms/${data.id}`); router.refresh(); }

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-2xl border border-white/[.07] bg-white/[.04] p-4 sm:p-5">
      <div className="flex gap-1.5" aria-label={`Paso ${step} de 3`}>{([1, 2, 3] as Step[]).map((item) => <span key={item} className={cn("h-1 flex-1 rounded-full", item <= step ? "bg-white" : "bg-white/10")} />)}</div>
      <div className="mt-5"><p className="text-[11px] font-semibold text-accent">{copy[step].label} · {step}/3</p><h2 className="mt-1.5 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[.98] tracking-[-.045em]">{copy[step].title}</h2><p className="mt-1.5 text-[13px] text-white/40">{copy[step].description}</p></div>

      <div className="mt-6 min-h-[11rem]">
        {step === 1 && <div className="grid gap-5"><Field label="Nombre de la sala" error={errors.name?.message}><Input autoFocus placeholder="Friday Night" {...register("name")} /></Field><Field label="Descripción · opcional" error={errors.description?.message}><Textarea className="min-h-28" placeholder="Contale a las personas qué está pasando" {...register("description")} /></Field></div>}
        {step === 2 && <div><Field label="Lugar" error={errors.venueId?.message}><Select {...register("venueId")}><option value="">Sin lugar asignado</option>{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name} — {venue.city}</option>)}</Select></Field><p className="mt-4 text-sm leading-6 text-white/35">Podés reutilizar un mismo lugar en todos los eventos que organices.</p></div>}
        {step === 3 && <div className="grid gap-5 sm:grid-cols-2"><Field label="Comienza" error={errors.startAt?.message}><Input type="datetime-local" {...register("startAt")} /></Field><Field label="Finaliza" error={errors.endAt?.message}><Input type="datetime-local" {...register("endAt")} /></Field></div>}
      </div>

      {errors.root?.message && <p className="my-4 rounded-xl bg-accent/10 px-4 py-3 text-sm text-[#ff8a98]">{errors.root.message}</p>}
      <div className="mt-5 flex items-center gap-3 border-t border-white/[.07] pt-4">
        {step > 1 && <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1) as Step)} className="grid size-12 shrink-0 place-items-center rounded-full bg-white/[.07] text-white" aria-label="Volver"><ArrowLeft className="size-5" strokeWidth={1.8} aria-hidden /></button>}
        {step < 3 ? <button type="button" onClick={next} className="ml-auto flex min-h-13 min-w-40 items-center justify-between rounded-xl bg-white px-4 text-sm font-bold text-black">Continuar<ArrowRight className="size-5" strokeWidth={2} aria-hidden /></button> : <button type="submit" disabled={isSubmitting} className="ml-auto flex min-h-13 min-w-48 items-center justify-between rounded-xl bg-accent px-4 text-sm font-bold text-white disabled:opacity-40">{isSubmitting ? "Preparando…" : "Preparar sala"}{isSubmitting ? <span className="size-4 animate-spin rounded-full border-2 border-white border-r-transparent" aria-hidden /> : <Check className="size-5" strokeWidth={2} aria-hidden />}</button>}
      </div>
    </form>
  );
}
