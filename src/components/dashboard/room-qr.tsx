"use client";

import { Check, Copy, Download } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
function isLocalUrl(value: string) { try { return LOCAL_HOSTS.has(new URL(value).hostname); } catch { return false; } }
function subscribeToOrigin() { return () => {}; }
function getBrowserOrigin() { return window.location.origin; }
function getServerOrigin() { return ""; }

export function RoomQr({ slug, roomName }: { slug: string; roomName: string }) {
  const origin = useSyncExternalStore(subscribeToOrigin, getBrowserOrigin, getServerOrigin);
  const [customUrl, setCustomUrl] = useState<string>();
  const roomUrl = customUrl ?? (origin ? `${origin}/r/${encodeURIComponent(slug)}` : "");
  const [qrResult, setQrResult] = useState<{ url: string; markup?: string; failed?: boolean }>({ url: "" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomUrl) return;
    let cancelled = false;
    void QRCode.toString(roomUrl, { type: "svg", width: 1024, margin: 4, color: { dark: "#070707", light: "#ffffff" }, errorCorrectionLevel: "M" })
      .then((markup) => { if (!cancelled) setQrResult({ url: roomUrl, markup }); })
      .catch(() => { if (!cancelled) setQrResult({ url: roomUrl, failed: true }); });
    return () => { cancelled = true; };
  }, [roomUrl]);
  async function copy() { await navigator.clipboard.writeText(roomUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  async function png() { const image = await QRCode.toDataURL(roomUrl, { width: 1024, margin: 4, color: { dark: "#070707", light: "#ffffff" }, errorCorrectionLevel: "M" }); download(image, `${fileName(roomName)}-truly-qr.png`); }
  async function svg() { const content = await QRCode.toString(roomUrl, { type: "svg", width: 1024, margin: 4, color: { dark: "#070707", light: "#ffffff" }, errorCorrectionLevel: "M" }); const blobUrl = URL.createObjectURL(new Blob([content], { type: "image/svg+xml" })); download(blobUrl, `${fileName(roomName)}-truly-qr.svg`); window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000); }

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.04] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-semibold text-white">QR de acceso</p><p className="mt-1 text-[12px] leading-5 text-white/40">Escaneá para abrir la sala sin instalar nada.</p></div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#35d65d]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#70ef8c]"><span className="size-1.5 rounded-full bg-[#35d65d]" />Listo para compartir</span>
      </div>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-center">
        <div className="order-2 min-w-0 lg:order-1">
          <label className="block" htmlFor="room-share-url"><span className="mb-2 block text-xs font-semibold text-white/45">Link de acceso</span><input id="room-share-url" className="control font-mono text-xs" type="url" value={roomUrl} placeholder="Generando link…" disabled={!origin} onChange={(event) => setCustomUrl(event.target.value)} /></label>
          {isLocalUrl(roomUrl) && <div className="mt-3 rounded-xl bg-[#f7b955]/10 px-4 py-3 text-xs leading-5 text-[#f7c875]"><strong>Este link usa localhost.</strong> Reemplazalo por la IP local de tu PC o configurá NEXT_PUBLIC_SITE_URL con el dominio HTTPS.</div>}
          <div className="mt-4 grid grid-cols-3 gap-2"><QrAction disabled={!roomUrl} icon={copied ? Check : Copy} onClick={copy}>{copied ? "Copiado" : "Copiar"}</QrAction><QrAction disabled={!roomUrl} icon={Download} onClick={png}>PNG</QrAction><QrAction disabled={!roomUrl} icon={Download} onClick={svg}>SVG</QrAction></div>
        </div>
        <div className="order-1 mx-auto aspect-square w-full max-w-[20rem] overflow-hidden rounded-xl bg-white p-3 lg:order-2">
          {qrResult.url === roomUrl && qrResult.markup ? <div role="img" aria-label={`Código QR para ${roomName}`} className="aspect-square size-full [&_svg]:block [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: qrResult.markup }} /> : qrResult.url === roomUrl && qrResult.failed ? <div className="grid aspect-square size-full place-items-center px-6 text-center text-xs leading-5 text-black/55">No pudimos generar el QR. Revisá el link de acceso.</div> : <div className="aspect-square size-full animate-pulse bg-black/[.06]" aria-label="Generando código QR" />}
        </div>
      </div>
    </div>
  );
}

function QrAction({ children, icon: Icon, onClick, disabled }: { children: React.ReactNode; icon: typeof Copy; onClick: () => void | Promise<void>; disabled?: boolean }) { return <button type="button" onClick={onClick} disabled={disabled} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/[.07] px-3 text-sm font-semibold text-white/65 hover:bg-white/[.11] hover:text-white disabled:opacity-40"><Icon className="size-4" strokeWidth={1.8} aria-hidden />{children}</button>; }
function download(href: string, name: string) { const link = document.createElement("a"); link.download = name; link.href = href; link.click(); }
function fileName(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "sala"; }
