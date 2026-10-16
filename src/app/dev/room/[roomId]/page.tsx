import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

const names = ["Sofi", "Mateo", "Lola", "Tomás", "Mica", "Juli", "Vale", "Nico", "Cami", "Fran"];

async function assertDevRoomAccess(roomId: string) {
  if (process.env.NODE_ENV !== "development") notFound();
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) redirect("/login");
  const room = await supabase.from("rooms").select("id").eq("id", roomId).maybeSingle();
  if (!room.data) notFound();
}

export default async function DevRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { roomId } = await params;
  await assertDevRoomAccess(roomId);

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return <main className="business-shell min-h-dvh p-8"><div className="mx-auto max-w-3xl border-y border-danger py-8"><p className="type-label text-danger">Development / error</p><h1 className="mt-5 font-display text-5xl font-semibold">Simulador no configurado.</h1><p className="mt-6 max-w-xl text-sm leading-6 text-muted">Agregá SUPABASE_SERVICE_ROLE_KEY a .env.local. La clave se usa solo en este Server Component de desarrollo.</p></div></main>;
  }

  const roomResult = await admin.from("rooms").select("id,name,status").eq("id", roomId).single();
  if (!roomResult.data) notFound();
  const { data: presences } = await admin.from("room_presence").select("user_id,active,last_seen_at").eq("room_id", roomId);
  const demoIds = presences?.map((presence) => presence.user_id) ?? [];

  async function generateUsers() {
    "use server";
    await assertDevRoomAccess(roomId);
    const service = createAdminClient();
    const [intentResult, interestsResult] = await Promise.all([
      service.from("profile_intents").select("id").eq("key", "single").single(),
      service.from("interests").select("id").limit(8),
    ]);
    for (const [index, name] of names.entries()) {
      const email = `sim-${roomId.slice(0, 8)}-${index}-${crypto.randomUUID().slice(0, 8)}@truly.local`;
      const created = await service.auth.admin.createUser({ email, password: crypto.randomUUID(), email_confirm: true, user_metadata: { full_name: name } });
      if (!created.data.user) continue;
      const userId = created.data.user.id;
      await service.from("profiles").update({ display_name: name, age: 21 + index, bio: `Perfil demo ${index + 1} para probar Truly`, intent_id: intentResult.data?.id ?? null, onboarding_completed: true, is_demo: true }).eq("id", userId);
      if (interestsResult.data?.length) {
        const selected = interestsResult.data.slice(index % 4, index % 4 + 3);
        await service.from("profile_interests").insert(selected.map((interest) => ({ profile_id: userId, interest_id: interest.id })));
      }
      const timestamp = new Date().toISOString();
      await service.from("room_presence").upsert({ room_id: roomId, user_id: userId, active: true, joined_at: timestamp, last_seen_at: timestamp, left_at: null }, { onConflict: "room_id,user_id" });
    }
    revalidatePath(`/dev/room/${roomId}`);
  }

  async function generateLikes() {
    "use server";
    await assertDevRoomAccess(roomId);
    const service = createAdminClient();
    const { data } = await service.from("room_presence").select("user_id").eq("room_id", roomId).eq("active", true);
    const ids = data?.map((row) => row.user_id) ?? [];
    const rows = ids.flatMap((from, index) => ids[(index + 1) % ids.length] ? [{ room_id: roomId, from_user_id: from, to_user_id: ids[(index + 1) % ids.length] }] : []);
    if (rows.length) await service.from("likes").upsert(rows, { onConflict: "room_id,from_user_id,to_user_id", ignoreDuplicates: true });
    revalidatePath(`/dev/room/${roomId}`);
  }

  async function togglePresence() {
    "use server";
    await assertDevRoomAccess(roomId);
    const service = createAdminClient();
    const targetId = demoIds[0];
    if (!targetId) return;
    const { data } = await service.from("room_presence").select("active").eq("room_id", roomId).eq("user_id", targetId).maybeSingle();
    const timestamp = new Date().toISOString();
    await service.from("room_presence").update({ active: !data?.active, last_seen_at: timestamp, left_at: data?.active ? timestamp : null }).eq("room_id", roomId).eq("user_id", targetId);
    revalidatePath(`/dev/room/${roomId}`);
  }

  return <main className="business-shell min-h-dvh p-5 md:p-10"><div className="mx-auto max-w-6xl"><PageHeader eyebrow="Laboratorio / development" title={`Simulador · ${roomResult.data.name}`} description="Estas acciones revalidan al organizador y usan service role exclusivamente del lado servidor." /><div className="grid border-y border-foreground md:grid-cols-3"><DevAction index="01" title="Generar 10 asistentes" description="Crea identidades Auth, perfiles, intereses y presencia activa." action={generateUsers} label="Generar usuarios" /><DevAction index="02" title="Generar likes" description="Cada usuario activo da un like al siguiente." action={generateLikes} label="Generar likes" /><DevAction index="03" title="Alternar presencia" description="Activa o desactiva el primer asistente de la lista." action={togglePresence} label="Alternar" /></div><section className="mt-16"><div className="flex items-baseline justify-between border-b border-foreground pb-3"><h2 className="font-display text-4xl font-semibold">Presencias</h2><span className="font-display text-3xl font-semibold tabular-nums">{String(presences?.length ?? 0).padStart(2, "0")}</span></div><div className="max-h-96 overflow-auto">{presences?.map((presence, index) => <div key={presence.user_id} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-line py-3 text-xs"><span className="text-[9px] tabular-nums text-muted">{String(index + 1).padStart(2, "0")}</span><span className="truncate font-mono text-muted">{presence.user_id}</span><span className={presence.active ? "font-bold uppercase tracking-[.1em] text-emerald-700" : "text-muted"}>{presence.active ? "activa" : "offline"}</span></div>)}</div></section></div></main>;
}

function DevAction({ index, title, description, action, label }: { index: string; title: string; description: string; action: () => Promise<void>; label: string }) {
  return <section className="flex min-h-72 flex-col border-b border-line p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"><span className="text-[9px] tabular-nums text-muted">{index}</span><h2 className="mt-8 font-display text-2xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-muted">{description}</p><form action={action} className="mt-auto pt-7"><button className="min-h-11 border border-foreground px-4 text-[10px] font-bold uppercase tracking-[.1em] hover:bg-foreground hover:text-background">{label} →</button></form></section>;
}
