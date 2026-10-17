import { PageHeader } from "@/components/dashboard/page-header";
import { RoomForm } from "@/components/dashboard/room-form";
import { getOrganizerContext } from "@/lib/auth/organizer";
import { createClient } from "@/lib/supabase/server";

export default async function NewRoomPage() {
  const { organization } = await getOrganizerContext({ requireOrganization: true });
  const supabase = await createClient();
  const { data } = await supabase.from("venues").select("*").eq("organization_id", organization!.id).order("name");
  return (
    <>
      <PageHeader eyebrow="Crear sala" title="Tu lugar, siempre conectado." description="Creá una sala permanente y compartí el mismo QR todos los días, sin definir fechas ni horarios." />
      <div className="max-w-4xl"><RoomForm organizationId={organization!.id} venues={data ?? []} /></div>
    </>
  );
}
