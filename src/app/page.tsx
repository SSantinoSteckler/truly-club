import { ArrowRight, BarChart3, Bell, Heart, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const steps = [
  ["Creás una sala", "Un espacio permanente para tu lugar."],
  ["Compartís el QR", "Lo imprimís, proyectás o enviás."],
  ["Las personas entran", "Desde el navegador, sin instalar nada."],
  ["Crean su perfil", "Una foto, intereses y qué buscan."],
  ["Descubren quién está", "Sólo gente presente en esa sala."],
  ["Conectan", "Likes privados y avisos en tiempo real."],
];

export default function LandingPage() {
  return (
    <main className="landing-page min-h-dvh w-full min-w-0 overflow-x-clip bg-[#070707] text-white">
      <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#070707]/95">
        <div className="mx-auto flex h-16 w-full min-w-0 max-w-[86rem] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Truly, inicio"><BrandLogo priority className="h-6" /></Link>
          <nav className="hidden items-center gap-6 text-xs font-semibold text-white/45 md:flex">
            <a href="#como-funciona" className="hover:text-white">Cómo funciona</a>
            <a href="#producto" className="hover:text-white">Producto</a>
            <a href="#business" className="hover:text-white">Business</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2"><Link href="/login" className="hidden min-h-10 items-center px-3 text-xs font-semibold text-white/55 hover:text-white sm:flex">Ingresar</Link><Link href="/signup" className="flex min-h-10 items-center rounded-xl bg-violet px-4 text-xs font-bold text-white hover:bg-[#8d55f4]">Crear sala</Link></div>
        </div>
      </header>

      <section className="mx-auto grid w-full min-w-0 max-w-[86rem] items-center gap-10 px-4 py-12 sm:px-6 md:py-16 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:py-10">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[.07] px-3 py-2 text-[11px] font-semibold text-white/55"><span className="size-2 rounded-full bg-[#35d65d]" aria-hidden />Personas reales, en el mismo lugar</div>
          <h1 className="mt-6 max-w-[11ch] font-display text-[clamp(3.35rem,7.2vw,6.5rem)] font-bold leading-[.94]">Conectá con quien está ahí mismo.</h1>
          <p className="mt-6 max-w-lg text-[15px] leading-7 text-white/45 [overflow-wrap:anywhere]">Truly le da a tu lugar una sala permanente para conectar a las personas que están ahí. Un mismo QR, todos los días: escanean, entran y descubren quién comparte ese momento.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/signup" className="flex min-h-13 items-center gap-3 rounded-xl bg-violet px-5 text-sm font-bold hover:bg-[#8d55f4]">Crear una sala <ArrowRight className="size-4" strokeWidth={2} aria-hidden /></Link><a href="#como-funciona" className="flex min-h-13 items-center rounded-xl border border-white/10 bg-white/[.04] px-5 text-sm font-semibold text-white/65 hover:bg-white/[.08] hover:text-white">Ver cómo funciona</a></div>
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-[30rem] lg:justify-self-end">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#151515] p-2 shadow-2xl shadow-black">
            <div className="relative h-[min(68dvh,42rem)] min-h-[34rem] overflow-hidden rounded-[1.55rem]">
              <Image src="/assets/truly-nightlife-portrait.png" alt="Persona usando Truly en un evento nocturno" fill priority className="object-cover" sizes="(max-width: 1024px) 92vw, 430px" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.9)_0%,rgba(0,0,0,.08)_55%,rgba(0,0,0,.18)_100%)]" />
              <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-2 text-[11px] font-semibold">Conocer gente</div>
              <button type="button" aria-label="Avisos de ejemplo" className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-black/55"><Bell className="size-4" strokeWidth={1.7} aria-hidden /></button>
              <div className="absolute inset-x-0 bottom-0 p-5"><div className="flex items-baseline gap-2"><p className="font-display text-4xl font-semibold tracking-[-.055em]">Luna</p><span className="text-xl text-white/75">27</span></div><p className="mt-2 text-sm text-white/65">Vine por la música. Me quedo por las historias.</p><div className="mt-3 flex gap-1.5"><Tag>Música</Tag><Tag>Arte</Tag><Tag>Viajes</Tag></div></div>
            </div>
          </div>
          <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-[#151515] p-2 shadow-xl shadow-black"><span className="grid size-11 place-items-center rounded-full bg-white/[.07] text-white/35">‹</span><span className="grid size-14 place-items-center rounded-full bg-violet text-white"><Heart className="size-6" fill="currentColor" strokeWidth={0} aria-hidden /></span><span className="grid size-11 place-items-center rounded-full bg-white/[.07] text-white/35">›</span></div>
        </div>
      </section>

      <section id="como-funciona" className="border-t border-white/[.07]">
        <div className="mx-auto grid max-w-[86rem] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[.7fr_1.3fr] lg:py-24">
          <div><p className="text-xs font-semibold text-violet">Cómo funciona</p><h2 className="mt-3 max-w-[10ch] font-display text-[clamp(2.6rem,5vw,4.5rem)] font-semibold leading-[.9] tracking-[-.06em]">Del QR a una conexión real.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-white/40">Una capa social que acompaña el evento sin sacar a nadie del momento.</p></div>
          <ol className="border-t border-white/[.08]">{steps.map(([title, description], index) => <li key={title} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-white/[.08] py-4 sm:grid-cols-[2rem_1fr_1fr] sm:items-center"><span className="text-[10px] tabular-nums text-white/25">0{index + 1}</span><strong className="font-display text-lg font-semibold">{title}</strong><p className="col-start-2 text-[13px] text-white/35 sm:col-start-auto">{description}</p></li>)}</ol>
        </div>
      </section>

      <section id="producto" className="border-y border-white/[.07] bg-[#0d0d0e]">
        <div className="mx-auto max-w-[86rem] px-4 py-20 sm:px-6 lg:py-24">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold text-violet">Truly para asistentes</p><h2 className="mt-3 max-w-[12ch] font-display text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[.9] tracking-[-.06em]">La gente es la interfaz.</h2></div><p className="max-w-md text-sm leading-6 text-white/40">Fotos protagonistas, pocas acciones y personas visibles únicamente mientras comparten la misma sala.</p></div>
          <div className="mt-10 grid border-t border-white/[.08] md:grid-cols-3"><Feature icon={UsersRound} title="Presencia real" text="Sólo aparecen personas activas en ese evento." /><Feature icon={Heart} title="Interés privado" text="Un like simple, sin presión y con aviso inmediato." /><Feature icon={Bell} title="Actividad en vivo" text="Ingresos, likes y avisos sin refrescar la pantalla." /></div>
          <div className="mt-12 grid gap-8 border-t border-white/[.08] pt-8 lg:grid-cols-3"><Audience title="Bares y boliches" text="Una experiencia social para la noche que no compite con el lugar." /><Audience title="Eventos y festivales" text="Descubrimiento entre personas que ya comparten un contexto." /><Audience title="Networking" text="Intereses e intención visibles para iniciar conversaciones mejores." /></div>
        </div>
      </section>

      <section id="business" className="mx-auto grid max-w-[86rem] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[.75fr_1.25fr] lg:items-center lg:py-24">
        <div><p className="text-xs font-semibold text-violet">Truly Business</p><h2 className="mt-3 max-w-[11ch] font-display text-[clamp(2.7rem,5vw,4.7rem)] font-semibold leading-[.9] tracking-[-.06em]">Operá el encuentro. Leé lo que pasó.</h2><p className="mt-5 max-w-md text-sm leading-6 text-white/40">Creá salas, controlá su estado, proyectá el QR y consultá métricas sin exponer identidades individuales.</p><Link href="/signup" className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 text-sm font-bold text-black">Abrir mi workspace <ArrowRight className="size-4" aria-hidden /></Link></div>
        <div className="rounded-[1.75rem] border border-white/[.08] bg-[#111] p-4 sm:p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-violet">Friday Night</p><p className="mt-1 font-display text-2xl font-semibold">Resumen de hoy</p></div><span className="flex items-center gap-2 rounded-full bg-[#35d65d]/10 px-3 py-2 text-[11px] font-semibold text-[#70ef8c]"><span className="size-1.5 rounded-full bg-[#35d65d]" />En vivo</span></div><div className="mt-5 grid gap-3 sm:grid-cols-[1.25fr_.75fr]"><div className="flex min-h-48 flex-col justify-between rounded-2xl bg-white p-4 text-black"><span className="flex items-center gap-2 text-xs font-semibold text-black/45"><UsersRound className="size-4" strokeWidth={1.7} />Asistentes</span><strong className="font-display text-7xl font-semibold tracking-[-.08em] tabular-nums">342</strong><span className="text-xs font-semibold">47 activas ahora</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-1"><BusinessDatum icon={Heart} value="816" label="Likes" /><BusinessDatum icon={BarChart3} value="02:10" label="Hora pico" /></div></div></div>
      </section>

      <section id="faq" className="border-t border-white/[.07]"><div className="mx-auto grid max-w-[86rem] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[.6fr_1.4fr] lg:py-24"><div><p className="text-xs font-semibold text-violet">FAQ</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.05em]">Lo esencial.</h2></div><div className="border-t border-white/[.08]"><Faq question="¿Hay que descargar una app?" answer="No. Truly funciona directamente desde el navegador del celular." /><Faq question="¿Los perfiles quedan públicos?" answer="No. Se muestran sólo a asistentes activos de la misma sala durante el evento." /><Faq question="¿Los organizadores ven datos personales?" answer="No. El dashboard trabaja con métricas agregadas y permisos controlados por Supabase RLS." /><Faq question="¿Cómo entran mis clientes a la sala?" answer="Al crear una sala obtenés un QR y un link de acceso. Podés imprimir el QR, mostrarlo en las pantallas del local o compartir el link para que tus clientes entren desde su celular." /></div></div></section>

      <section className="px-4 pb-20 sm:px-6"><div className="mx-auto flex max-w-[86rem] flex-col gap-6 rounded-[1.75rem] bg-violet p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8"><div><p className="text-xs font-semibold text-white/65">Tu próximo evento</p><h2 className="mt-2 max-w-[14ch] font-display text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[.9] tracking-[-.06em]">Ya puede tener su propia comunidad.</h2></div><Link href="/signup" className="flex min-h-12 shrink-0 items-center gap-3 rounded-xl bg-white px-5 text-sm font-bold text-black">Crear una sala <ArrowRight className="size-4" aria-hidden /></Link></div></section>

      <footer className="border-t border-white/[.07]"><div className="mx-auto flex max-w-[86rem] flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6"><Link href="/" aria-label="Truly, inicio"><BrandLogo className="h-6" /></Link><div className="flex flex-wrap gap-5 text-xs font-semibold text-white/40"><Link href="/privacy">Privacidad</Link><Link href="/terms">Términos</Link><Link href="/login">Business</Link></div><span className="text-[11px] text-white/25">© 2026 · Buenos Aires</span></div></footer>
    </main>
  );
}

function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-white/15 px-2.5 py-1.5 text-[10px] font-semibold">{children}</span>; }
function Feature({ icon: Icon, title, text }: { icon: typeof Heart; title: string; text: string }) { return <article className="border-b border-white/[.08] py-6 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"><Icon className="size-5 text-violet" strokeWidth={1.7} aria-hidden /><h3 className="mt-5 font-display text-xl font-semibold">{title}</h3><p className="mt-2 max-w-sm text-[13px] leading-5 text-white/40">{text}</p></article>; }
function Audience({ title, text }: { title: string; text: string }) { return <article><p className="font-display text-2xl font-semibold">{title}</p><p className="mt-2 max-w-sm text-sm leading-6 text-white/40">{text}</p></article>; }
function BusinessDatum({ icon: Icon, value, label }: { icon: typeof Heart; value: string; label: string }) { return <div className="flex min-h-24 flex-col justify-between rounded-xl border border-white/[.08] bg-white/[.04] p-3"><Icon className="size-4 text-white/35" strokeWidth={1.7} aria-hidden /><div><p className="font-display text-2xl font-semibold tabular-nums">{value}</p><p className="text-[10px] text-white/35">{label}</p></div></div>; }
function Faq({ question, answer }: { question: string; answer: string }) { return <details className="group border-b border-white/[.08] py-5"><summary className="cursor-pointer list-none font-display text-xl font-semibold">{question}<span className="float-right font-sans text-lg font-normal text-white/35 transition-transform group-open:rotate-45">+</span></summary><p className="mt-3 max-w-xl text-sm leading-6 text-white/40">{answer}</p></details>; }
