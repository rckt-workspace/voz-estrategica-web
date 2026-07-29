import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Página no encontrada · Voz Estratégica" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "La página que buscas no existe o cambió de dirección.",
      },
    ],
  }),
  component: NotFound,
});

function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl uppercase">Página no encontrada</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          El enlace que buscas no existe o cambió de dirección.
        </p>
        <Link to="/" className="bubble bubble-black mt-6 inline-block">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
