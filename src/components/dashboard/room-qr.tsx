"use client";

import { Check, Copy, Download, Printer } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
function isLocalUrl(value: string) { try { return LOCAL_HOSTS.has(new URL(value).hostname); } catch { return false; } }

export function RoomQr({ url, roomName }: { url: string; roomName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roomUrl, setRoomUrl] = useState(url);
  const [qrPreview, setQrPreview] = useState<string>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    void QRCode.toCanvas(canvas, roomUrl, { width: 520, margin: 2, color: { dark: "#070707", light: "#ffffff" }, errorCorrectionLevel: "H" })
      .then(() => { if (!cancelled) setQrPreview(canvas.toDataURL("image/png")); });
    return () => { cancelled = true; };
  }, [roomUrl]);
  async function copy() { await navigator.clipboard.writeText(roomUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  function png() { const link = document.createElement("a"); link.download = `${roomName.toLowerCase().replace(/\s+/g, "-")}-truly-qr.png`; link.href = canvasRef.current?.toDataURL("image/png") ?? ""; link.click(); }
  async function svg() { const content = await QRCode.toString(roomUrl, { type: "svg", margin: 2, errorCorrectionLevel: "H" }); const blob = new Blob([content], { type: "image/svg+xml" }); const link = document.createElement("a"); link.download = `${roomName.toLowerCase().replace(/\s+/g, "-")}-truly-qr.svg`; link.href = URL.createObjectURL(blob); link.click(); window.setTimeout(() => URL.revokeObjectURL(link.href), 1000); }
  function print() { const image = canvasRef.current?.toDataURL("image/png"); if (!image) return; const popup = window.open("", "truly-qr", "width=700,height=850"); if (!popup) return; const brand = new URL("/assets/logo-truly-sin-fondo.png", window.location.origin).toString(); popup.document.write(`<html><head><title>QR ${escapeHtml(roomName)}</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:48px;color:#070707}.brand{display:block;width:52px;height:38px;object-fit:cover;object-position:center;margin:0 auto}h1{font-size:48px;margin:18px 0}.qr{width:480px;max-width:90%}p{font-size:12px}</style></head><body><img class="brand" src="${escapeHtml(brand)}" alt="Truly"/><h1>${escapeHtml(roomName)}</h1><img class="qr" src="${image}"/><p>${escapeHtml(roomUrl)}</p></body></html>`); popup.document.close(); popup.focus(); popup.print(); }

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.04] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-semibold text-white">QR de acceso</p><p className="mt-1 text-[12px] leading-5 text-white/40">Escaneá para abrir la sala sin instalar nada.</p></div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#35d65d]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#70ef8c]"><span className="size-1.5 rounded-full bg-[#35d65d]" />Listo para compartir</span>
      </div>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-center">
        <div className="order-2 min-w-0 lg:order-1">
          <label className="block" htmlFor="room-share-url"><span className="mb-2 block text-xs font-semibold text-white/45">Link de acceso</span><input id="room-share-url" className="control font-mono text-xs" type="url" value={roomUrl} onChange={(event) => setRoomUrl(event.target.value)} /></label>
          {isLocalUrl(roomUrl) && <div className="mt-3 rounded-xl bg-[#f7b955]/10 px-4 py-3 text-xs leading-5 text-[#f7c875]"><strong>Este link usa localhost.</strong> Reemplazalo por la IP local de tu PC o configurá NEXT_PUBLIC_SITE_URL con el dominio HTTPS.</div>}
          <div className="mt-4 grid grid-cols-2 gap-2"><QrAction icon={copied ? Check : Copy} onClick={copy}>{copied ? "Copiado" : "Copiar"}</QrAction><QrAction icon={Download} onClick={png}>PNG</QrAction><QrAction icon={Download} onClick={svg}>SVG</QrAction><QrAction icon={Printer} onClick={print}>Imprimir</QrAction></div>
        </div>
        <div className="order-1 mx-auto aspect-square w-full max-w-[20rem] overflow-hidden rounded-xl bg-white p-3 lg:order-2">
          {qrPreview ? <Image unoptimized src={qrPreview} width={520} height={520} alt={`Código QR para ${roomName}`} className="block aspect-square size-full object-contain" /> : <div className="aspect-square size-full animate-pulse bg-black/[.06]" aria-label="Generando código QR" />}
          <canvas ref={canvasRef} width={520} height={520} className="hidden" aria-hidden />
        </div>
      </div>
    </div>
  );
}

function QrAction({ children, icon: Icon, onClick }: { children: React.ReactNode; icon: typeof Copy; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/[.07] px-3 text-sm font-semibold text-white/65 hover:bg-white/[.11] hover:text-white"><Icon className="size-4" strokeWidth={1.8} aria-hidden />{children}</button>; }
function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character); }
