"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AccountSettings({ social = false }: { social?: boolean }) { const router = useRouter(); const [loading, setLoading] = useState(false); const [error, setError] = useState<string>(); async function remove() { if (!window.confirm("¿Eliminar tu cuenta y sus datos personales? Esta acción no se puede deshacer.")) return; setLoading(true); const response = await fetch("/api/account", { method: "DELETE" }); if (!response.ok) { setError(await response.text()); setLoading(false); return; } router.push("/"); router.refresh(); } return <div><Button className={social ? "rounded-xl normal-case tracking-normal" : undefined} variant="danger" loading={loading} onClick={remove}>Eliminar mi cuenta</Button>{error && <p className="mt-2 text-xs text-danger">{error}</p>}<p className={social ? "mt-3 text-xs leading-5 text-white/30" : "mt-3 text-xs text-muted"}>Requiere la service role únicamente en el servidor para borrar también la identidad de Supabase Auth.</p></div>; }
