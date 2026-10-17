import { cn } from "@/utils/cn";

function Block({ className }: { className: string }) {
  return <span className={cn("skeleton block", className)} aria-hidden />;
}

function LoadingFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return <div role="status" aria-label={label}>{children}<span className="sr-only">{label}</span></div>;
}

export function RoomEntrySkeleton() {
  return (
    <LoadingFrame label="Cargando sala">
      <section className="flex min-h-[calc(100dvh-5.25rem)] flex-col pb-3 pt-1">
        <div className="social-panel flex flex-1 flex-col p-6">
          <div className="flex justify-between"><Block className="h-8 w-24 rounded-full" /><Block className="h-3 w-20 rounded-full" /></div>
          <div className="my-auto py-12"><Block className="h-4 w-36 rounded-full" /><Block className="mt-5 h-12 w-4/5 rounded-xl" /><Block className="mt-3 h-12 w-3/5 rounded-xl" /><Block className="mt-6 h-3 w-full rounded-full" /><Block className="mt-2 h-3 w-2/3 rounded-full" /></div>
          <Block className="h-4 w-40 rounded-full" />
        </div>
        <Block className="mt-3 h-16 w-full rounded-2xl" />
      </section>
    </LoadingFrame>
  );
}

export function RoomAuthSkeleton() {
  return (
    <LoadingFrame label="Cargando acceso">
      <section className="mx-auto min-h-[calc(100dvh-5rem)] w-full max-w-sm py-2">
        <Block className="size-12 rounded-full" /><Block className="mt-6 h-10 w-3/4 rounded-xl" /><Block className="mt-4 h-3 w-full rounded-full" /><Block className="mt-2 h-3 w-4/5 rounded-full" />
        <Block className="mt-8 h-12 w-full rounded-2xl" />
        <div className="mt-7 grid gap-5"><FieldSkeleton /><FieldSkeleton /><Block className="h-14 w-full rounded-2xl" /></div>
      </section>
    </LoadingFrame>
  );
}

export function OnboardingSkeleton() {
  return (
    <LoadingFrame label="Cargando perfil">
      <section className="py-3">
        <div className="grid grid-cols-4 gap-1.5">{Array.from({ length: 4 }).map((_, index) => <Block key={index} className="h-1 rounded-full" />)}</div>
        <Block className="mt-6 h-3 w-24 rounded-full" /><Block className="mt-3 h-10 w-4/5 rounded-xl" /><Block className="mt-3 h-3 w-3/4 rounded-full" />
        <div className="mt-8 grid gap-5"><FieldSkeleton /><FieldSkeleton /><Block className="h-28 w-full rounded-xl" /></div>
        <Block className="mt-10 h-14 w-full rounded-2xl" />
      </section>
    </LoadingFrame>
  );
}

export function DiscoverySkeleton() {
  return (
    <LoadingFrame label="Cargando personas">
      <div>
        <div className="mb-3 flex items-center justify-between px-1"><Block className="h-3 w-32 rounded-full" /><Block className="h-3 w-10 rounded-full" /></div>
        <Block className="h-[calc(100dvh-13.5rem)] min-h-[29rem] rounded-[1.75rem]" />
        <div className="mt-3 flex items-center justify-center gap-5"><Block className="size-12 rounded-full" /><Block className="size-16 rounded-full" /><Block className="size-12 rounded-full" /></div>
      </div>
    </LoadingFrame>
  );
}

export function LikesSkeleton() {
  return (
    <LoadingFrame label="Cargando likes">
      <header className="flex items-end justify-between gap-4 px-1 pb-6 pt-2">
        <div className="flex-1"><Block className="h-9 w-24 rounded-xl" /><Block className="mt-3 h-3 w-52 max-w-full rounded-full" /></div>
        <Block className="size-11 shrink-0 rounded-full" />
      </header>
      <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, index) => <article key={index} className="overflow-hidden rounded-[1.35rem] bg-white/[.06]"><Block className="aspect-[4/5] w-full rounded-none" /><div className="p-3"><div className="flex items-center justify-between gap-2"><Block className={cn("h-5 rounded-full", index % 2 === 0 ? "w-3/5" : "w-4/5")} /><Block className="size-4 shrink-0 rounded-full" /></div><Block className="mt-2 h-2.5 w-20 max-w-1/2 rounded-full" /></div></article>)}</div>
    </LoadingFrame>
  );
}

export function NotificationsSkeleton() {
  return (
    <LoadingFrame label="Cargando actividad">
      <ScreenHeadingSkeleton />
      <div className="grid gap-2">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="flex items-center gap-3 rounded-2xl bg-white/[.04] p-3"><Block className="size-14 shrink-0 rounded-full" /><div className="flex-1"><Block className="h-3 w-4/5 rounded-full" /><Block className="mt-2 h-2.5 w-2/5 rounded-full" /></div><Block className="size-9 rounded-full" /></div>)}</div>
    </LoadingFrame>
  );
}

export function ProfileSkeleton() {
  return (
    <LoadingFrame label="Cargando tu perfil">
      <ScreenHeadingSkeleton action />
      <div className="grid gap-4"><FormSectionSkeleton fields={3} /><FormSectionSkeleton fields={1} tall /><FormSectionSkeleton fields={2} /></div>
    </LoadingFrame>
  );
}

export function SettingsSkeleton() {
  return (
    <LoadingFrame label="Cargando ajustes">
      <div className="flex items-center gap-3 px-1 pb-6 pt-2"><Block className="size-12 rounded-full" /><div className="flex-1"><Block className="h-9 w-36 rounded-xl" /><Block className="mt-2 h-3 w-48 rounded-full" /></div></div>
      <div className="grid gap-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="social-panel p-4"><div className="flex items-center gap-3"><Block className="size-9 rounded-full" /><Block className="h-6 w-36 rounded-lg" /></div><Block className="mt-5 h-3 w-4/5 rounded-full" /><Block className="mt-2 h-3 w-3/5 rounded-full" /></div>)}</div>
    </LoadingFrame>
  );
}

function ScreenHeadingSkeleton({ action = false }: { action?: boolean }) {
  return <header className="flex items-end justify-between gap-4 px-1 pb-6 pt-2"><div className="flex-1"><Block className="h-10 w-36 rounded-xl" /><Block className="mt-3 h-3 w-56 max-w-full rounded-full" /></div>{action && <Block className="size-11 shrink-0 rounded-full" />}</header>;
}

function FieldSkeleton() {
  return <div><Block className="h-2.5 w-16 rounded-full" /><Block className="mt-3 h-12 w-full rounded-xl" /></div>;
}

function FormSectionSkeleton({ fields, tall = false }: { fields: number; tall?: boolean }) {
  return <section className="social-panel p-4"><Block className="h-6 w-32 rounded-lg" /><div className="mt-6 grid gap-5">{Array.from({ length: fields }).map((_, index) => tall ? <Block key={index} className="aspect-[4/3] w-full rounded-2xl" /> : <FieldSkeleton key={index} />)}</div></section>;
}
