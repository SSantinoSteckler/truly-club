"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { organizationSchema } from "@/lib/rooms/validation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/utils/slug";

type Values = z.infer<typeof organizationSchema>;
export function OrganizationForm() {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(organizationSchema) });
  async function submit(values: Values) {
    const suffix = crypto.randomUUID().slice(0, 6);
    const { error } = await createClient().rpc("create_organization", { organization_name: values.name, organization_slug: `${slugify(values.name)}-${suffix}` });
    if (error) return setError("root", { message: error.message });
    router.push("/dashboard"); router.refresh();
  }
  return <form onSubmit={handleSubmit(submit)} className="grid gap-4"><Field label="Nombre de la organización" error={errors.name?.message}><Input autoFocus placeholder="Mi productora" {...register("name")} /></Field>{errors.root?.message && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-[#ff8a98]">{errors.root.message}</p>}<Button className="w-full border-accent bg-accent text-white" type="submit" loading={isSubmitting}>Crear organización</Button></form>;
}
