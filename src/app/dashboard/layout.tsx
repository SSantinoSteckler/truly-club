import { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardLifecycleRefresh } from "@/components/dashboard/dashboard-lifecycle-refresh";
import { getOrganizerContext } from "@/lib/auth/organizer";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = await getOrganizerContext();
  return (
    <div className="business-shell min-h-dvh">
      <DashboardLifecycleRefresh />
      <Suspense fallback={<div className="h-16 bg-[#0d0d0e] lg:fixed lg:inset-y-0 lg:w-64" />}>
        <Sidebar organizationName={context.organization?.name} email={context.email} />
      </Suspense>
      <main className="business-content px-3 pb-28 pt-4 sm:px-5 lg:ml-64 lg:px-8 lg:pb-16 lg:pt-7 xl:px-10">
        <div className="mx-auto max-w-[88rem]">{children}</div>
      </main>
    </div>
  );
}
