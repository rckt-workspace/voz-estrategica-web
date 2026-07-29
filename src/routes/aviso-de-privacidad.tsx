import { createFileRoute } from "@tanstack/react-router";

const CANONICAL = "https://vozestrategica.com/aviso-de-privacidad";

export const Route = createFileRoute("/aviso-de-privacidad")({
  head: () => ({
    meta: [
      { title: "Aviso de Privacidad — Voz Estratégica" },
      {
        name: "description",
        content:
          "Aviso de Privacidad de Voz Estratégica: cómo tratamos los datos personales que compartes a través de nuestros formularios de contacto.",
      },
      { property: "og:title", content: "Aviso de Privacidad — Voz Estratégica" },
      {
        property: "og:description",
        content:
          "Cómo tratamos los datos personales que compartes a través de nuestros formularios de contacto.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: AvisoPrivacidad,
});

function AvisoPrivacidad() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-display text-4xl uppercase md:text-5xl">Aviso de Privacidad</h1>
      <p className="mt-6 text-muted-foreground">
        Este es un texto temporal. El contenido legal definitivo será publicado próximamente.
      </p>
      <div className="mt-8 space-y-5 text-muted-foreground">
        <p>
          Voz Estratégica es responsable del tratamiento de los datos personales que nos compartes
          a través de los formularios de este sitio (nombre, empresa, cargo, correo, teléfono o
          WhatsApp y detalles de tu evento).
        </p>
        <p>
          Usamos esos datos únicamente para contactarte, elaborar una propuesta y darte
          seguimiento comercial. No los vendemos ni los compartimos con terceros ajenos a esta
          finalidad.
        </p>
        <p>
          Puedes solicitar el acceso, la rectificación, la cancelación o la eliminación de tus
          datos escribiendo a{" "}
          <a className="underline" href="mailto:contacto@vozestrategica.com">
            contacto@vozestrategica.com
          </a>
          .
        </p>
      </div>
    </section>
  );
}
