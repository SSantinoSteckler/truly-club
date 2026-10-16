import Image from "next/image";
import { cn } from "@/utils/cn";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ compact = false, className, priority = false }: BrandLogoProps) {
  return (
    <span role="img" aria-label="Truly" className={cn("inline-flex h-6 shrink-0 items-center gap-1", className)}>
      <span className="relative aspect-[289/272] h-full shrink-0 overflow-hidden" aria-hidden>
        <Image
          src="/assets/logo-truly-sin-fondo.png"
          alt=""
          width={842}
          height={596}
          priority={priority}
          className="absolute max-w-none"
          style={{ width: "291.35%", height: "219.12%", left: "-93.08%", top: "-68.75%" }}
        />
      </span>
      {!compact && (
        <span className="relative aspect-[343/136] h-full shrink-0 overflow-hidden" aria-hidden>
          <Image
            src="/assets/logo-truly-sin-fondo-palabra.png"
            alt=""
            width={378}
            height={173}
            priority={priority}
            className="absolute max-w-none"
            style={{ width: "110.2%", height: "127.2%", left: "-5.54%", top: "-14.7%" }}
          />
        </span>
      )}
    </span>
  );
}
