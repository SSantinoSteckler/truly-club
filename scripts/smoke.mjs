import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error("Configurá las variables públicas en .env.local");

const attendee = () => createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
const first = attendee(); const second = attendee(); const visitor = attendee();
const expect = (condition, message) => { if (!condition) throw new Error(`Smoke test: ${message}`); };

const roomResult = await visitor.rpc("get_public_room", { room_slug: "friday-night-demo" });
expect(!roomResult.error && roomResult.data?.[0]?.status === "live", "la sala pública debe estar live");
const roomId = roomResult.data[0].id;

for (const [client, email] of [[first, "attendee-1@truly.local"], [second, "attendee-2@truly.local"]]) {
  const login = await client.auth.signInWithPassword({ email, password: "TrulyDemo123!" });
  expect(Boolean(login.data.user) && !login.error, `debe iniciar sesión ${email}`);
  const join = await client.rpc("join_room", { target_room_id: roomId });
  expect(!join.error, `${email} debe poder entrar a la sala`);
}

const firstId = (await first.auth.getUser()).data.user?.id;
const secondId = (await second.auth.getUser()).data.user?.id;
expect(Boolean(firstId && secondId), "ambos usuarios deben conservar identidad");
const discovery = await first.rpc("discover_room_profiles", { target_room_id: roomId, page_size: 30 });
expect(discovery.data?.some((profile) => profile.id === secondId), "discovery debe incluir al segundo asistente activo");

await first.from("likes").delete().eq("room_id", roomId).eq("to_user_id", secondId);
await second.from("likes").delete().eq("room_id", roomId).eq("to_user_id", firstId);
const firstLike = await first.from("likes").insert({ room_id: roomId, from_user_id: firstId, to_user_id: secondId });
const secondLike = await second.from("likes").insert({ room_id: roomId, from_user_id: secondId, to_user_id: firstId });
expect(!firstLike.error && !secondLike.error, "los likes recíprocos deben insertarse");
const notifications = await second.rpc("get_my_notifications", { target_room_id: roomId, result_limit: 50 });
expect(notifications.data?.some((notification) => notification.type === "like"), "debe existir el aviso de like");
expect(!notifications.data?.some((notification) => notification.type === "match"), "los likes recíprocos no deben crear avisos de match");

await first.from("blocks").delete().eq("blocked_user_id", secondId);
const block = await first.from("blocks").insert({ blocker_user_id: firstId, blocked_user_id: secondId });
expect(!block.error, "el bloqueo propio debe estar permitido");
const afterBlock = await first.rpc("discover_room_profiles", { target_room_id: roomId, page_size: 30 });
expect(!afterBlock.data?.some((profile) => profile.id === secondId), "un bloqueo debe ocultar al usuario en ambos sentidos");

console.log("Smoke test OK: Auth con email, perfil, sala, presencia, discovery, likes, notificaciones y bloqueo.");
