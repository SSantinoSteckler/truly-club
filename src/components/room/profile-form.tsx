"use client";

import imageCompression from "browser-image-compression";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Camera, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field, Input, Textarea } from "@/components/ui/field";
import { logger } from "@/lib/logger";
import { profileSchema } from "@/lib/rooms/validation";
import { createClient } from "@/lib/supabase/client";
import type { InterestRow, IntentRow, ProfileRow } from "@/types/database";
import { cn } from "@/utils/cn";

type FormInput = z.input<typeof profileSchema>;
type Values = z.output<typeof profileSchema>;
type Step = 1 | 2 | 3 | 4;

type ProfileFormProps = {
  slug: string;
  roomId: string;
  userId: string;
  interests: InterestRow[];
  intents: IntentRow[];
  profile: ProfileRow;
  selectedInterests: string[];
  currentAvatarUrl?: string | null;
  mode?: "onboarding" | "edit";
};

const stepCopy = {
  1: { eyebrow: "Tu identidad", title: "¿Cómo te llamás?", description: "Esto es lo primero que van a ver de vos." },
  2: { eyebrow: "Tu foto", title: "Mostrate como sos", description: "Elegí una foto clara y reciente." },
  3: { eyebrow: "Tus intereses", title: "¿Qué te gusta?", description: "Elegí hasta 8 para encontrar gente con algo en común." },
  4: { eyebrow: "Tu intención", title: "¿Qué buscás hoy?", description: "Una señal simple para el resto de la sala." },
} satisfies Record<Step, { eyebrow: string; title: string; description: string }>;

function createAvatarFileName() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ProfileForm({ slug, roomId, userId, interests, intents, profile, selectedInterests, currentAvatarUrl, mode = "onboarding" }: ProfileFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl ?? null);
  const [fileError, setFileError] = useState<string>();
  const [selected, setSelected] = useState(selectedInterests);

  const { register, handleSubmit, setValue, setError, clearErrors, trigger, formState: { errors, isSubmitting } } = useForm<FormInput, undefined, Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile.onboarding_completed ? profile.display_name : "",
      age: profile.age ?? undefined,
      bio: profile.bio ?? "",
      intentId: profile.intent_id ?? intents[0]?.id ?? "",
      interestIds: selectedInterests,
    },
  });

  useEffect(() => {
    if (!file || !preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [file, preview]);

  function chooseImage(nextFile?: File) {
    setFileError(undefined);
    if (!nextFile) return;
    if (!( ["image/jpeg", "image/png", "image/webp"] as string[]).includes(nextFile.type)) { setFileError("Usá una imagen JPG, PNG o WebP."); return; }
    if (nextFile.size > 10 * 1024 * 1024) { setFileError("La foto no puede pesar más de 10 MB."); return; }
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  }

  function toggleInterest(interestId: string) {
    const next = selected.includes(interestId) ? selected.filter((id) => id !== interestId) : selected.length < 8 ? [...selected, interestId] : selected;
    setSelected(next);
    setValue("interestIds", next, { shouldValidate: true, shouldDirty: true });
  }

  async function removePhoto() {
    if (!profile.avatar_path) { setFile(undefined); setPreview(null); return; }
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ avatar_path: null }).eq("id", userId);
    if (error) { setFileError(error.message); return; }
    await supabase.storage.from("avatars").remove([profile.avatar_path]);
    setFile(undefined);
    setPreview(null);
    window.dispatchEvent(new Event("truly:profile-updated"));
  }

  async function nextStep() {
    if (step === 1 && !(await trigger(["displayName", "age", "bio"]))) return;
    if (step === 2 && !preview) { setFileError("Elegí una foto para continuar."); return; }
    if (step === 3 && selected.length === 0) { setError("interestIds", { message: "Elegí al menos un interés" }); return; }
    clearErrors("interestIds");
    setStep((current) => Math.min(current + 1, 4) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(values: Values) {
    if (!preview) { setFileError("Elegí una foto para continuar."); if (mode === "onboarding") setStep(2); return; }
    const supabase = createClient();
    let uploadedPath: string | undefined;
    try {
      if (file) {
        const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true, fileType: "image/webp" });
        uploadedPath = `${userId}/${createAvatarFileName()}.webp`;
        const upload = await supabase.storage.from("avatars").upload(uploadedPath, compressed, { contentType: "image/webp", upsert: false });
        if (upload.error) throw upload.error;
      }
      const result = await supabase.rpc("complete_onboarding", {
        profile_name: values.displayName,
        profile_age: values.age,
        profile_bio: values.bio ?? "",
        profile_intent_id: values.intentId,
        selected_interest_ids: values.interestIds,
        new_avatar_path: uploadedPath ?? null,
      });
      if (result.error) throw result.error;
      if (uploadedPath && profile.avatar_path && profile.avatar_path !== uploadedPath) await supabase.storage.from("avatars").remove([profile.avatar_path]);
      window.dispatchEvent(new Event("truly:profile-updated"));
      if (mode === "onboarding") {
        const join = await supabase.rpc("join_room", { target_room_id: roomId });
        if (join.error) throw join.error;
        router.replace(`/r/${slug}/discover`);
        return;
      }
      router.refresh();
    } catch (error) {
      if (uploadedPath) await supabase.storage.from("avatars").remove([uploadedPath]);
      logger.error("Profile update failed", error, { roomId, mode });
      setError("root", { message: error instanceof Error ? error.message : "No pudimos guardar tu perfil." });
    }
  }

  const identityFields = (
    <div className="grid gap-5">
      <Field label="Nombre" error={errors.displayName?.message}><Input className="text-base" autoComplete="name" placeholder="¿Cómo te dicen?" {...register("displayName")} /></Field>
      <Field label="Edad" error={errors.age?.message}><Input className="text-base" inputMode="numeric" type="number" min={18} max={99} placeholder="24" {...register("age")} /></Field>
      <Field label="Bio · opcional" error={errors.bio?.message}><Textarea className="min-h-24 text-base" placeholder="Una frase sobre vos" maxLength={160} {...register("bio")} /></Field>
    </div>
  );

  const photoField = (
    <div>
      <label className="group relative mx-auto block aspect-[4/5] w-full max-w-sm cursor-pointer overflow-hidden rounded-[1.75rem] bg-[#19191a]">
        {preview ? <Image src={preview} alt="Vista previa de tu foto" fill unoptimized className="object-cover transition duration-300 group-hover:scale-[1.015]" sizes="(max-width: 480px) 100vw, 400px" /> : (
          <span className="absolute inset-0 grid place-items-center text-center"><span><span className="mx-auto grid size-16 place-items-center rounded-full bg-white/10"><Camera className="size-7" strokeWidth={1.6} aria-hidden /></span><span className="mt-4 block text-sm font-semibold text-white/65">Agregar una foto</span></span></span>
        )}
        <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseImage(event.target.files?.[0])} />
        {preview && <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">Cambiar foto</span>}
      </label>
      <div className="mt-3 flex items-center justify-between gap-4 px-1 text-[11px] text-white/35"><span>JPG, PNG o WebP · máx. 10 MB</span>{preview && <button type="button" className="font-semibold text-white/60 hover:text-white" onClick={removePhoto}>Quitar</button>}</div>
      {fileError && <p className="mt-3 rounded-xl bg-accent/10 px-4 py-3 text-sm text-[#ff8a98]" role="alert">{fileError}</p>}
    </div>
  );

  const interestField = (
    <div>
      <div className="mb-4 flex items-center justify-between text-xs text-white/40"><span>Elegí entre 1 y 8</span><span className="tabular-nums">{selected.length} / 8</span></div>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => {
          const active = selected.includes(interest.id);
          return <button key={interest.id} type="button" aria-pressed={active} className={cn("flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold", active ? "border-white bg-white text-black" : "border-white/10 bg-white/[.05] text-white/65 hover:border-white/30 hover:text-white")} onClick={() => toggleInterest(interest.id)}>{active && <Check className="size-4" strokeWidth={2.3} aria-hidden />}{interest.label}</button>;
        })}
      </div>
      {errors.interestIds?.message && <p className="mt-3 text-sm text-[#ff8a98]">{errors.interestIds.message}</p>}
    </div>
  );

  const intentField = (
    <fieldset>
      <legend className="sr-only">¿Qué buscás hoy?</legend>
      <div className="grid gap-2.5">
        {intents.map((intent) => (
          <label key={intent.id} className="group flex min-h-16 cursor-pointer items-center justify-between rounded-2xl border border-white/[.08] bg-white/[.045] px-4 text-base font-semibold transition-colors has-[:checked]:border-white has-[:checked]:bg-white has-[:checked]:text-black">
            <span>{intent.label}</span>
            <span className="grid size-6 place-items-center rounded-full border border-current/30 group-has-[:checked]:border-black group-has-[:checked]:bg-black group-has-[:checked]:text-white"><Check className="size-3.5 opacity-0 group-has-[:checked]:opacity-100" strokeWidth={2.5} aria-hidden /></span>
            <input className="sr-only" type="radio" value={intent.id} {...register("intentId")} />
          </label>
        ))}
      </div>
      {errors.intentId?.message && <p className="mt-3 text-sm text-[#ff8a98]">Elegí una intención.</p>}
    </fieldset>
  );

  if (mode === "edit") {
    return (
      <form onSubmit={handleSubmit(submit)} className="grid gap-4">
        <ProfileSection title="Información básica">{identityFields}</ProfileSection>
        <ProfileSection title="Tu foto">{photoField}</ProfileSection>
        <ProfileSection title="Intereses">{interestField}</ProfileSection>
        <ProfileSection title="Qué buscás">{intentField}</ProfileSection>
        {errors.root?.message && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-[#ff8a98]">{errors.root.message}</p>}
        <button className="mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-base font-bold text-white disabled:opacity-40" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="size-4 animate-spin rounded-full border-2 border-white border-r-transparent" aria-hidden />}Guardar cambios</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
      <div className="flex gap-1.5" aria-label={`Paso ${step} de 4`}>{([1, 2, 3, 4] as Step[]).map((item) => <span key={item} className={cn("h-1 flex-1 rounded-full", item <= step ? "bg-white" : "bg-white/10")} />)}</div>
      <div className="mt-6">
        <p className="text-xs font-semibold text-accent">{stepCopy[step].eyebrow} · {step}/4</p>
        <h1 className="mt-2 font-display text-[2.35rem] font-semibold leading-[.95] tracking-[-.055em] text-white">{stepCopy[step].title}</h1>
        <p className="mt-2 text-sm leading-5 text-white/40">{stepCopy[step].description}</p>
      </div>

      <div className="mt-7 flex-1">{step === 1 && identityFields}{step === 2 && photoField}{step === 3 && interestField}{step === 4 && intentField}</div>
      {errors.root?.message && <p className="mt-4 rounded-xl bg-accent/10 px-4 py-3 text-sm text-[#ff8a98]">{errors.root.message}</p>}

      <div className="safe-bottom sticky bottom-0 z-20 -mx-3 mt-8 flex items-center gap-3 border-t border-white/[.06] bg-[#070707] px-3 pt-3">
        {step > 1 && <button type="button" className="social-icon-button shrink-0" onClick={() => setStep((current) => Math.max(current - 1, 1) as Step)} aria-label="Volver"><ArrowLeft className="size-5" strokeWidth={1.8} aria-hidden /></button>}
        {step < 4 ? (
          <button className="flex min-h-14 flex-1 items-center justify-between rounded-2xl bg-white px-5 text-base font-bold text-black" type="button" onClick={nextStep}><span>Continuar</span><ArrowRight className="size-5" strokeWidth={2} aria-hidden /></button>
        ) : (
          <button className="flex min-h-14 flex-1 items-center justify-between rounded-2xl bg-accent px-5 text-base font-bold text-white disabled:opacity-40" type="submit" disabled={isSubmitting}><span>{isSubmitting ? "Guardando…" : "Entrar a la sala"}</span><ArrowRight className="size-5" strokeWidth={2} aria-hidden /></button>
        )}
      </div>
    </form>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="social-panel p-4"><h2 className="mb-5 font-display text-xl font-semibold tracking-[-.025em] text-white">{title}</h2>{children}</section>;
}
