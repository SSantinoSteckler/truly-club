import Image from "next/image";
import { cn } from "@/utils/cn";

export function Avatar({ src, name, className }: { src?: string | null; name: string; className?: string }) {
  return <div className={cn("relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-image)] bg-foreground text-background", className)}>{src ? <Image unoptimized fill sizes="128px" src={src} alt={name} className="object-cover" /> : <span className="font-display text-lg font-semibold uppercase">{name.slice(0, 1)}</span>}</div>;
}
