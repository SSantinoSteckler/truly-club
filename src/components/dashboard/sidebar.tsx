"use client";

import { BarChart3, Building2, CalendarDays, CirclePlus, LayoutDashboard, LogOut, MapPin, Menu, Settings, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/utils/cn";
import { BrandLogo } from "@/components/brand-logo";

const navigation = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/rooms", label: "Salas", icon: CalendarDays },
  { href: "/dashboard/rooms/new", label: "Crear sala", icon: CirclePlus, primary: true },
  { href: "/dashboard/venues", label: "Lugares", icon: MapPin },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/moderation", label: "Moderación", icon: ShieldAlert },
  { href: "/dashboard/organization", label: "Organización", icon: Building2 },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
];

const mobilePrimary = navigation.filter((item) => ["/dashboard", "/dashboard/rooms", "/dashboard/rooms/new", "/dashboard/analytics"].includes(item.href));
const mobileMore = navigation.filter((item) => !mobilePrimary.includes(item));

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  if (href === "/dashboard/rooms") return pathname === href || (pathname.startsWith(`${href}/`) && !pathname.startsWith("/dashboard/rooms/new"));
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ organizationName, email }: { organizationName?: string; email?: string | null }) {
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <>
      <aside className="hidden border-r border-white/[.08] bg-[#0d0d0e] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-24 items-center justify-between px-6">
          <Link href="/dashboard" aria-label="Truly Business, inicio"><BrandLogo priority className="h-6" /></Link>
          <span className="rounded-full bg-white/[.07] px-2.5 py-1.5 text-[9px] font-semibold text-white/45">Business</span>
        </div>
        <nav className="grid gap-1 px-3" aria-label="Navegación Business">
          {navigation.map(({ href, label, icon: Icon, primary }) => {
            const active = isActive(pathname, href);
            return <Link key={href} href={href} className={cn("flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold", active ? "bg-white text-black" : "text-white/45 hover:bg-white/[.07] hover:text-white", primary && !active && "text-accent")}><Icon className="size-[1.15rem]" strokeWidth={active ? 2.2 : 1.7} aria-hidden /><span>{label}</span>{active && <span className="ml-auto size-1.5 rounded-full bg-accent" aria-hidden />}</Link>;
          })}
        </nav>
        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-white/[.055] p-4"><p className="truncate text-sm font-semibold">{organizationName || "Sin organización"}</p><p className="mt-1 truncate text-[11px] text-white/35">{email}</p><form action={signOut}><button className="mt-4 flex min-h-9 items-center gap-2 text-xs font-semibold text-white/50 hover:text-white"><LogOut className="size-4" strokeWidth={1.7} aria-hidden />Cerrar sesión</button></form></div>
        </div>
      </aside>

      <header className="safe-top sticky top-0 z-40 flex min-h-[3.75rem] items-center justify-between bg-[#070707] px-4 lg:hidden">
        <Link href="/dashboard" aria-label="Truly Business, inicio"><BrandLogo className="h-6" /></Link>
        <span className="max-w-[62%] truncate rounded-full bg-white/[.07] px-3 py-2 text-[11px] font-semibold text-white/60">{organizationName || "Truly Business"}</span>
      </header>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/[.08] bg-[#0d0d0e] px-3 pt-2 lg:hidden" aria-label="Navegación Business móvil">
        {mobilePrimary.map(({ href, label, icon: Icon, primary }) => { const active = isActive(pathname, href); return <Link key={href} href={href} aria-label={label} aria-current={active ? "page" : undefined} className={cn("relative flex min-h-14 items-center justify-center", active ? "text-white" : "text-white/40", primary && "text-accent")}><Icon className={cn(primary ? "size-7" : "size-[1.4rem]")} strokeWidth={active ? 2.25 : 1.7} aria-hidden />{active && <span className="absolute bottom-1 size-1 rounded-full bg-accent" aria-hidden />}<span className="sr-only">{label}</span></Link>; })}
        <button type="button" className={cn("relative flex min-h-14 items-center justify-center", mobileMenu || mobileMore.some((item) => isActive(pathname, item.href)) ? "text-white" : "text-white/40")} aria-label="Más opciones" aria-expanded={mobileMenu} onClick={() => setMobileMenu(true)}><Menu className="size-[1.4rem]" strokeWidth={1.8} aria-hidden /></button>
      </nav>

      {mobileMenu && <div className="fixed inset-0 z-[55] flex items-end bg-black/75 lg:hidden" role="dialog" aria-modal="true" aria-label="Más opciones"><div className="safe-bottom w-full rounded-t-[1.75rem] border border-white/10 bg-[#171718] p-4"><div className="mb-4 flex items-center justify-between px-1"><div><p className="font-display text-2xl font-semibold">Más</p><p className="mt-1 text-xs text-white/35">{organizationName}</p></div><button type="button" onClick={() => setMobileMenu(false)} className="grid size-10 place-items-center rounded-full bg-white/[.07]" aria-label="Cerrar"><X className="size-5" aria-hidden /></button></div><div className="grid gap-1">{mobileMore.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileMenu(false)} className="flex min-h-13 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/70 hover:bg-white/[.07] hover:text-white"><Icon className="size-5" strokeWidth={1.7} aria-hidden />{label}</Link>)}</div><form action={signOut}><button className="mt-3 flex min-h-12 w-full items-center gap-3 border-t border-white/[.08] px-3 pt-3 text-sm font-semibold text-[#ff7b89]"><LogOut className="size-5" strokeWidth={1.7} aria-hidden />Cerrar sesión</button></form></div></div>}
    </>
  );
}
