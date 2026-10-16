import { Mail, Trash2 } from "lucide-react";
import { AccountSettings } from "@/components/dashboard/account-settings";
import { PageHeader } from "@/components/dashboard/page-header";
import { getOrganizerContext } from "@/lib/auth/organizer";

export default async function SettingsPage() {
  const { email } = await getOrganizerContext();
  return <><PageHeader eyebrow="Cuenta" title="Ajustes" description="Administrá tu acceso y tus datos personales." /><div className="grid max-w-3xl gap-3"><section className="rounded-2xl border border-white/[.07] bg-white/[.04] p-5"><div className="flex items-center gap-3 text-white/40"><span className="grid size-10 place-items-center rounded-full bg-white/[.07]"><Mail className="size-4" strokeWidth={1.7} aria-hidden /></span><p className="text-xs font-semibold">Email de acceso</p></div><p className="mt-5 break-all font-display text-xl font-semibold">{email}</p></section><section className="rounded-2xl border border-accent/20 bg-accent/[.06] p-5"><div className="flex items-center gap-3 text-[#ff8a98]"><span className="grid size-10 place-items-center rounded-full bg-accent/10"><Trash2 className="size-4" strokeWidth={1.7} aria-hidden /></span><h2 className="font-display text-xl font-semibold">Eliminar cuenta</h2></div><p className="my-4 max-w-xl text-sm leading-6 text-white/40">La eliminación borra la identidad y sus datos personales. Si sos owner, primero necesitás transferir la organización.</p><AccountSettings social /></section></div></>;
}
