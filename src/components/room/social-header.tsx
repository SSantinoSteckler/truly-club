import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SocialHeader({ slug, roomName }: { slug: string; roomName: string }) {
  return (
    <header className="safe-top sticky top-0 z-30 bg-[#070707]">
      <div className="flex min-h-[3.75rem] w-full min-w-0 items-center justify-between gap-4 px-4">
        <Link href={`/r/${slug}/discover`} aria-label="Truly, ir a descubrir"><BrandLogo priority className="h-6" /></Link>
        <div className="flex min-w-0 max-w-[68%] items-center gap-2 rounded-full bg-white/[.07] px-3 py-2">
          <span className="size-1.5 shrink-0 rounded-full bg-[#7cff6b]" aria-hidden />
          <p className="min-w-0 truncate text-[11px] font-semibold text-white/75">{roomName}</p>
        </div>
      </div>
    </header>
  );
}
