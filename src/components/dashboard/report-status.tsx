"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import type { ReportStatus } from "@/types/database";

export function ReportStatusSelect({ reportId, status, userId }: { reportId: string; status: ReportStatus; userId: string }) { const router = useRouter(); async function change(value: ReportStatus) { await createClient().from("reports").update({ status: value, reviewed_at: new Date().toISOString(), reviewed_by: userId }).eq("id", reportId); router.refresh(); } return <Select className="w-full min-w-44 text-sm sm:w-48" value={status} onChange={(event) => change(event.target.value as ReportStatus)}><option value="pending">Pendiente</option><option value="reviewed">Revisado</option><option value="dismissed">Descartado</option><option value="action_taken">Acción tomada</option></Select>; }
