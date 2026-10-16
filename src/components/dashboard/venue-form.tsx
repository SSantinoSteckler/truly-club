"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { venueSchema } from "@/lib/rooms/validation";
import { createClient } from "@/lib/supabase/client";

type Values = z.infer<typeof venueSchema>;
export function VenueForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(venueSchema) });
  async function submit(values: Values) {
    const { error } = await createClient().from("venues").insert({ organization_id: organizationId, name: values.name, address: values.address || null, city: values.city });
    if (error) return setError("root", { message: error.message });
    reset(); router.refresh();
  }
  return <form onSubmit={handleSubmit(submit)} className="grid gap-4"><Field label="Nombre" error={errors.name?.message}><Input placeholder="Club Demo" {...register("name")} /></Field><Field label="Dirección (opcional)" error={errors.address?.message}><Input placeholder="Av. Siempre Viva 123" {...register("address")} /></Field><Field label="Ciudad" error={errors.city?.message}><Input placeholder="Buenos Aires" {...register("city")} /></Field>{errors.root?.message && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-[#ff8a98]">{errors.root.message}</p>}<Button className="mt-1 w-full border-accent bg-accent text-white" type="submit" loading={isSubmitting}>Agregar lugar</Button></form>;
}
