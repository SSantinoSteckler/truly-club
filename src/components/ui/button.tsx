import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg"; loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-small)] border font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" && "border-brand bg-brand text-background hover:-translate-y-0.5 hover:bg-brand-strong",
        variant === "secondary" && "border-line bg-transparent text-foreground hover:border-foreground",
        variant === "ghost" && "border-transparent border-b-line bg-transparent px-0 text-foreground hover:border-b-foreground",
        variant === "danger" && "border-danger bg-danger text-white hover:-translate-y-0.5 hover:bg-[#a92b23]",
        size === "sm" && "min-h-9 px-3 text-xs",
        size === "md" && "min-h-11 px-4 text-sm",
        size === "lg" && "min-h-14 px-6 text-base",
        className,
      )}
      {...props}
    >
      {loading && <span className="size-3.5 animate-spin rounded-full border border-current border-r-transparent" aria-hidden />}
      {children}
    </button>
  );
});
