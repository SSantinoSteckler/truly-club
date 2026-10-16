import type { RoomStatus } from "@/types/database";
import { cn } from "@/utils/cn";

const labels: Record<RoomStatus, string> = { draft: "Borrador", scheduled: "Programada", live: "En vivo", ended: "Finalizada", cancelled: "Cancelada" };

export function StatusBadge({ status }: { status: RoomStatus }) {
  return <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold", status === "live" && "bg-[#35d65d]/12 text-[#70ef8c]", status === "scheduled" && "bg-[#f7b955]/12 text-[#f7c875]", status === "draft" && "bg-white/[.07] text-white/45", status === "ended" && "bg-white/[.09] text-white/65", status === "cancelled" && "bg-accent/10 text-[#ff8a98]")}><span className={cn("size-1.5 rounded-full bg-current", status === "live" && "animate-pulse")} />{labels[status]}</span>;
}
