import { createFileRoute } from "@tanstack/react-router";

const CANONICAL = "https://vozestrategica.com/terminos-y-condiciones";

export const Route = createFileRoute("/terminos-y-condiciones")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones — Voz Estratégica" },
      {
        name: "description",
        content:
          "Términos y condiciones de compra de los productos digitales y servicios de Voz Estratégica.",
      },
      { property: "og:title", content: "Términos y Condiciones — Voz Estratégica" },
      {
        property: "og:description",
        content: "Condiciones de compra de los productos digitales y servicios de Voz Estratégica.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: TerminosYCondiciones,
});

function TerminosYCondiciones() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-display text-4xl uppercase md:text-5xl">Términos y Condiciones</h1>
      <p className="mt-6 text-muted-foreground">
        Este es un texto temporal. El contenido legal definitivo será publicado próximamente.
      </p>
      <div className="mt-8 space-y-5 text-muted-foreground">
        <p>
          Los productos digitales de Voz Estratégica se entregan por acceso en línea inmediatamente
          después de confirmarse el pago. El acceso es personal e intransferible.
        </p>
        <p>
          El contenido está protegido por derechos de autor. No está permitida su reproducción,
          descarga no autorizada, redistribución ni uso comercial sin autorización escrita.
        </p>
        <p>
          Puedes solicitar la devolución dentro de los 7 días siguientes a la compra escribiendo a{" "}
          <a className="underline" href="mailto:contacto@vozestrategica.com">
            contacto@vozestrategica.com
          </a>
          .
        </p>
      </div>
    </section>
  );
}
