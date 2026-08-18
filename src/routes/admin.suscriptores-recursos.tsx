import { createFileRoute } from "@tanstack/react-router";
import { SubscribersTable } from "@/components/admin/SubscribersTable";

export const Route = createFileRoute("/admin/suscriptores-recursos")({
  component: SuscriptoresRecursosPage,
});

function SuscriptoresRecursosPage() {
  return (
    <SubscribersTable
      source="recursos"
      title="Suscriptores recursos"
      csvPrefix="suscriptores-recursos"
      emptyTitle="Sin suscriptores de recursos"
      emptyHint="Los registros del formulario rápido de /recursos aparecen acá."
      variant="simple"
    />
  );
}
