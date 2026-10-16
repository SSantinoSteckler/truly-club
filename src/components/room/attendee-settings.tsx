"use client";

import { DoorOpen, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AttendeeSettings({ roomId, slug, email, blockedIds }: { roomId: string; slug: string; email: string; blockedIds: string[] }) {
  const router = useRouter();
  async function leave() { await createClient().rpc("leave_room", { target_room_id: roomId }); router.push(`/r/${slug}`); router.refresh(); }
  async function unblock(id: string) { await createClient().from("blocks").delete().eq("blocked_user_id", id); router.refresh(); }
  async function signOut() { const supabase = createClient(); await supabase.rpc("leave_room", { target_room_id: roomId }); await supabase.auth.signOut(); router.replace(`/r/${slug}`); router.refresh(); }

  return (
    <div className="grid gap-3">
      <SettingSection icon={UserRound} title="Tu cuenta"><p className="truncate text-sm text-white/55">{email}</p><button type="button" onClick={signOut} className="mt-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-white"><LogOut className="size-4" strokeWidth={1.8} aria-hidden />Cerrar sesión</button></SettingSection>
      <SettingSection icon={ShieldCheck} title="Perfiles bloqueados">
        {blockedIds.length ? <div className="mt-1 grid gap-2">{blockedIds.map((id) => <div key={id} className="flex items-center justify-between gap-3 rounded-xl bg-black/25 p-3"><span className="min-w-0 truncate font-mono text-[10px] text-white/35">{id}</span><button type="button" className="shrink-0 text-xs font-semibold text-white/70" onClick={() => unblock(id)}>Desbloquear</button></div>)}</div> : <p className="text-sm text-white/40">No bloqueaste a nadie.</p>}
      </SettingSection>
      <SettingSection icon={DoorOpen} title="Presencia"><p className="text-sm leading-5 text-white/45">Podés salir manualmente. Si cerrás Truly, tu presencia pasa a offline cuando vence el tiempo de actividad.</p><button type="button" onClick={leave} className="mt-4 min-h-11 rounded-xl border border-white/10 px-4 text-sm font-semibold text-white">Salir de esta sala</button></SettingSection>
    </div>
  );
}

function SettingSection({ icon: Icon, title, children }: { icon: typeof UserRound; title: string; children: React.ReactNode }) {
  return <section className="social-panel p-4"><div className="mb-4 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-white/[.07] text-white/60"><Icon className="size-4" strokeWidth={1.7} aria-hidden /></span><h2 className="font-display text-xl font-semibold">{title}</h2></div>{children}</section>;
}
