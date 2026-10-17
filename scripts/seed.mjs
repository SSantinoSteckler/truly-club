import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("Configurá NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local");
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const existing = await supabase.from("organizations").select("id").eq("slug", "truly-demo").maybeSingle();
if (existing.data) {
  console.log("El seed Truly Demo ya existe. No se realizaron cambios.");
  process.exit(0);
}

const users = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
let owner = users.data.users.find((user) => user.email === "owner.demo@truly.local");
if (!owner) {
  const created = await supabase.auth.admin.createUser({ email: "owner.demo@truly.local", password: "TrulyDemo123!", email_confirm: true, user_metadata: { full_name: "Owner Demo" } });
  owner = created.data.user;
}
if (!owner) throw new Error("No se pudo crear el owner demo");

const org = await supabase.from("organizations").insert({ name: "Truly Demo", slug: "truly-demo", created_by: owner.id }).select("id").single();
if (!org.data) throw org.error;
await supabase.from("organization_members").insert({ organization_id: org.data.id, user_id: owner.id, role: "owner" });
const venue = await supabase.from("venues").insert({ organization_id: org.data.id, name: "Club Demo", address: "Av. Demo 123", city: "Buenos Aires" }).select("id").single();
if (!venue.data) throw venue.error;
const room = await supabase.from("rooms").insert({ organization_id: org.data.id, venue_id: venue.data.id, name: "Friday Night", slug: "friday-night-demo", description: "Sala permanente creada por el seed opcional de desarrollo.", start_at: null, end_at: null, status: "live" }).select("id").single();
if (!room.data) throw room.error;

const intents = await supabase.from("profile_intents").select("id,key"); const interests = await supabase.from("interests").select("id").order("sort_order");
const demoNames = ["Sofi", "Mateo", "Lola", "Tomás", "Mica", "Juli", "Vale", "Nico", "Cami", "Fran"];
for (const [index, name] of demoNames.entries()) {
  const created = await supabase.auth.admin.createUser({ email: `attendee-${index + 1}@truly.local`, password: "TrulyDemo123!", email_confirm: true, user_metadata: { full_name: name } });
  if (!created.data.user) continue; const id = created.data.user.id; const intent = intents.data?.[index % (intents.data.length || 1)];
  await supabase.from("profiles").update({ display_name: name, age: 21 + index, bio: "Perfil de desarrollo — no usar en producción", intent_id: intent?.id ?? null, onboarding_completed: true, is_demo: true }).eq("id", id);
  const chosen = interests.data?.slice(index % 5, index % 5 + 3) ?? [];
  if (chosen.length) await supabase.from("profile_interests").insert(chosen.map((interest) => ({ profile_id: id, interest_id: interest.id })));
  await supabase.from("room_presence").insert({ room_id: room.data.id, user_id: id, joined_at: new Date(Date.now() - index * 3 * 60_000).toISOString(), last_seen_at: new Date().toISOString(), active: true });
}
console.log(`Seed listo. Sala: ${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/r/friday-night-demo`);
console.log("Owner demo: owner.demo@truly.local / TrulyDemo123! (solo desarrollo)");
