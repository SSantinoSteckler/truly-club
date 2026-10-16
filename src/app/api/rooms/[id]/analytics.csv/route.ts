import { NextResponse } from "next/server";
import { parseAnalytics } from "@/lib/analytics/parse";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return new NextResponse("No autorizado", { status: 401 });
  const [roomResult, result] = await Promise.all([supabase.from("rooms").select("name").eq("id", id).single(), supabase.rpc("room_analytics", { target_room_id: id })]);
  if (result.error || !roomResult.data) return new NextResponse("No autorizado o sala inexistente", { status: 403 });
  const analytics = parseAnalytics(result.data); const rows: string[][] = [["Métrica", "Valor"], ["Asistentes totales", String(analytics.total_attendees)], ["Activos ahora", String(analytics.active_now)], ["Máximo concurrente", String(analytics.max_concurrent)], ["Horario de mayor actividad", analytics.peak_hour ?? ""]];
  for (const item of analytics.age_distribution) rows.push([`Edad: ${item.label}`, String(item.value)]);
  for (const item of analytics.top_interests) rows.push([`Interés: ${item.label}`, String(item.value)]);
  for (const item of analytics.intent_distribution) rows.push([`Estado: ${item.label}`, String(item.value)]);
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${safeFile(roomResult.data.name)}-analytics.csv"`, "Cache-Control": "private, no-store" } });
}
function csvCell(value: string) { return `"${value.replace(/"/g, '""')}"`; }
function safeFile(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "truly-room"; }
