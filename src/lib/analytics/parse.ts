import type { Json } from "@/types/database";
import type { DistributionItem, RoomAnalytics } from "@/types/analytics";

const number = (value: unknown) => typeof value === "number" ? value : Number(value) || 0;
const distribution = (value: unknown): DistributionItem[] => Array.isArray(value) ? value.flatMap((item) => typeof item === "object" && item !== null ? [{ label: String((item as Record<string, unknown>).label ?? "Sin especificar"), value: number((item as Record<string, unknown>).value) }] : []) : [];
export function parseAnalytics(value: Json | null): RoomAnalytics { const item = (value && typeof value === "object" && !Array.isArray(value) ? value : {}) as Record<string, unknown>; return { total_attendees: number(item.total_attendees), active_now: number(item.active_now), max_concurrent: number(item.max_concurrent), age_distribution: distribution(item.age_distribution), top_interests: distribution(item.top_interests), intent_distribution: distribution(item.intent_distribution), peak_hour: typeof item.peak_hour === "string" ? item.peak_hour : null }; }
