import { createFileRoute } from "@tanstack/react-router";
import { SubscribersTable } from "@/components/admin/SubscribersTable";

export const Route = createFileRoute("/admin/suscriptores")({
  component: SuscriptoresPage,
});

function SuscriptoresPage() {
  return (
    <SubscribersTable
      source="suscribete"
      title="Suscriptores"
      csvPrefix="suscriptores"
      emptyTitle="Sin suscriptores todavía"
      emptyHint="Los registros del formulario de /suscribete aparecen acá."
      variant="full"
    />
  );
}
