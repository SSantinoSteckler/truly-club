import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export function LinkButton({ children, className, variant = "primary", ...props }: LinkProps & { children: ReactNode; className?: string; variant?: "primary" | "secondary" | "ghost" }) {
  return <Link className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold", variant === "primary" && "border-brand bg-brand text-white hover:bg-brand-strong", variant === "secondary" && "border-white/10 bg-white/[.04] text-white hover:bg-white/[.08]", variant === "ghost" && "min-h-0 border-transparent px-0 py-1 text-white/50 hover:text-white", className)} {...props}>{children}</Link>;
}
