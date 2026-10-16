"use client";

import { Bell, Compass, Heart, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

export function BottomNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [avatar, setAvatar] = useState<{ src: string; name: string }>();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const loadAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.is_anonymous) return;
      const { data: profile } = await supabase.from("profiles").select("display_name, avatar_path").eq("id", user.id).maybeSingle();
      if (!profile?.avatar_path) { if (!cancelled) setAvatar(undefined); return; }
      const { data } = await supabase.storage.from("avatars").createSignedUrl(profile.avatar_path, 60 * 10);
      if (!cancelled && data?.signedUrl) setAvatar({ src: data.signedUrl, name: profile.display_name });
    };

    const refreshAvatar = () => { void loadAvatar(); };
    void loadAvatar();
    window.addEventListener("truly:profile-updated", refreshAvatar);
    return () => { cancelled = true; window.removeEventListener("truly:profile-updated", refreshAvatar); };
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled || !user || user.is_anonymous) return;

      const load = async () => {
        const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null);
        if (!cancelled) setUnread(count ?? 0);
      };

      await load();
      if (cancelled) return;

      channel = supabase
        .channel(`nav-notifications-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => setUnread((count) => count + 1))
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => void load())
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  if (pathname === `/r/${slug}` || pathname.endsWith("/auth") || pathname.endsWith("/onboarding")) return null;

  const items = [
    { href: "discover", label: "Descubrir", icon: Compass },
    { href: "likes", label: "Likes", icon: Heart },
    { href: "notifications", label: "Avisos", icon: Bell },
    { href: "profile", label: "Perfil", icon: UserRound },
  ];

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto grid max-w-[480px] grid-cols-4 border-t border-white/[.08] bg-[#0d0d0e] px-5 pt-2" aria-label="Navegación de la sala">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.endsWith(`/${href}`);
        return (
          <Link
            key={href}
            href={`/r/${slug}/${href}`}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-14 items-center justify-center ${active ? "text-white" : "text-white/40 hover:text-white/75"}`}
          >
            {href === "profile" && avatar ? <Avatar src={avatar.src} name={avatar.name} className={`size-7 rounded-full ${active ? "ring-2 ring-white ring-offset-2 ring-offset-[#0d0d0e]" : "opacity-70"}`} /> : <Icon className="size-[1.45rem]" strokeWidth={active ? 2.35 : 1.7} fill={active && href === "likes" ? "currentColor" : "none"} aria-hidden />}
            {active && <span className="absolute bottom-1 size-1 rounded-full bg-accent" aria-hidden />}
            {href === "notifications" && unread > 0 && (
              <span className="absolute left-1/2 top-1 ml-1 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
