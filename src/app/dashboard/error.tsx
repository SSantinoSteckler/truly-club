"use client";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="grid gap-4"><ErrorState message="Ocurrió un error al cargar el dashboard." /><Button className="w-fit" onClick={reset}>Reintentar</Button></div>; }

