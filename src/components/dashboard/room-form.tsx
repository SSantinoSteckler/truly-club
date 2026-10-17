"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Infinity as InfinityIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { roomSchema } from "@/lib/rooms/validation";
import { createClient } from "@/lib/supabase/client";
import type { VenueRow } from "@/types/database";
import { slugify } from "@/utils/slug";

type Values = z.infer<typeof roomSchema>;

export function RoomForm({ organizationId, venues }: { organizationId: string; venues: VenueRow[] }) {
  const router = useRouter();
  const creatingRef = useRef(false);
  const [isCreated, setIsCreated] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: "", description: "", venueId: "" },
  });

  async function submit(values: Values) {
    if (creatingRef.current) return;
    creatingRef.current = true;
    try {
      const slug = `${slugify(values.name)}-${crypto.randomUUID().slice(0, 6)}`;
      const { data, error } = await createClient().from("rooms").insert({
        organization_id: organizationId,
        venue_id: values.venueId || null,
        name: values.name,
        slug,
        description: values.description || null,
        start_at: null,
        end_at: null,
        status: "live",
      }).select("id").single();
      if (error) throw error;
      setIsCreated(true);
      router.push(`/dashboard/rooms/${data.id}`);
    } catch (error) {
      creatingRef.current = false;
      const message = error && typeof error === "object" && "message" in error ? String(error.message) : "No pudimos crear la sala. Intentá nuevamente.";
      setError("root", { message });
    }
  }

  return (
    <form onSubmit={(event) => event.preventDefault()} className="rounded-2xl border border-white/[.07] bg-white/[.04] p-4 sm:p-5">
      <div className="flex items-start gap-3 rounded-xl bg-accent/10 p-4">
        <InfinityIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <div><p className="text-sm font-semibold">Una sala permanente para tu lugar</p><p className="mt-1 text-[13px] leading-6 text-white/45">Creala una sola vez y compartí siempre el mismo QR. No vence: podés pausarla, volver a abrirla o eliminarla desde el panel.</p></div>
      </div>
      <fieldset disabled={isSubmitting || isCreated} className="mt-6 grid gap-5 disabled:opacity-60">
        <Field label="Nombre de la sala" error={errors.name?.message}><Input autoFocus placeholder="El nombre de tu lugar" {...register("name")} /></Field>
        <Field label="Descripción · opcional" error={errors.description?.message}><Textarea placeholder="Contales a tus clientes qué van a encontrar" {...register("description")} /></Field>
        <Field label="Lugar · opcional" error={errors.venueId?.message}><Select {...register("venueId")}><option value="">Sin lugar asignado</option>{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name} — {venue.city}</option>)}</Select></Field>
      </fieldset>
      {errors.root?.message && <p role="alert" className="mt-5 rounded-xl bg-accent/10 px-4 py-3 text-sm text-[#ff8a98]">{errors.root.message}</p>}
      <div className="mt-6 flex justify-end border-t border-white/[.07] pt-4">
        <Button type="button" size="lg" loading={isSubmitting || isCreated} onClick={(event) => { if (event.detail > 1) return; void handleSubmit(submit)(event); }}>
          {isSubmitting || isCreated ? "Creando sala…" : "Crear sala"}
          {!isSubmitting && !isCreated && <ArrowRight className="size-5" aria-hidden />}
        </Button>
      </div>
    </form>
  );
}
