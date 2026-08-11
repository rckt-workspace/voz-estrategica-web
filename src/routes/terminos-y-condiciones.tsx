import { createFileRoute } from "@tanstack/react-router";

const CANONICAL = "https://vozestrategica.com/terminos-y-condiciones";

export const Route = createFileRoute("/terminos-y-condiciones")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones — Voz Estratégica" },
      {
        name: "description",
        content:
          "Términos y condiciones de compra de los productos digitales y físicos de Voz Estratégica: entrega, envíos, precios, devoluciones y propiedad intelectual.",
      },
      { property: "og:title", content: "Términos y Condiciones — Voz Estratégica" },
      {
        property: "og:description",
        content:
          "Condiciones de compra de los productos digitales y físicos de Voz Estratégica.",
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

const MAIL = "contacto@vozestrategica.com";

function Mail() {
  return (
    <a className="underline underline-offset-4 hover:text-foreground" href={`mailto:${MAIL}`}>
      {MAIL}
    </a>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-xl uppercase md:text-2xl">
        {n}. {title}
      </h2>
      <div className="mt-4 space-y-4 text-muted-foreground">{children}</div>
    </section>
  );
}

function TerminosYCondiciones() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-display text-4xl uppercase md:text-5xl">Términos y Condiciones</h1>
      <p className="mt-3 text-sm uppercase tracking-widest text-muted-foreground">
        Aplica a la compra de productos digitales y físicos de Voz Estratégica, incluyendo cursos y
        grabaciones digitales, y libros físicos publicados por nuestros conferencistas
      </p>

      <p className="mt-8 text-muted-foreground">
        Estos Términos y Condiciones regulan la compra y el uso de los productos que Voz Estratégica
        SAS ofrece a través de vozestrategica.com. Al completar una compra, aceptas estos términos.
      </p>

      <Section n={1} title="Quién vende">
        <p>
          Voz Estratégica SAS, con domicilio en Colombia y NIT 901.817.872-1, es quien vende y
          entrega los productos de este sitio. Puedes contactarnos en <Mail />.
        </p>
      </Section>

      <Section n={2} title="Qué estás comprando">
        <p>
          Ofrecemos dos tipos de productos: (a) productos digitales, como acceso a grabaciones de
          video, recursos descargables (guías, plantillas, prompts) y materiales relacionados; y (b)
          productos físicos, como libros impresos publicados por nuestros conferencistas. Cada
          producto indica claramente en la página de compra si es digital o físico.
        </p>
      </Section>

      <Section n={3} title="Envío de productos físicos">
        <p>
          Los libros físicos se envían a la dirección que nos proporciones al momento de la compra.
          Es tu responsabilidad verificar que la dirección sea correcta. El tiempo estimado de
          entrega y el costo de envío se muestran antes de completar la compra y pueden variar según
          tu ubicación. No nos hacemos responsables por retrasos causados por la empresa
          transportadora o por datos de envío incorrectos proporcionados por el comprador.
        </p>
      </Section>

      <Section n={4} title="Entrega y acceso a productos digitales">
        <p>
          El acceso a tu compra digital se entrega en línea, normalmente de forma inmediata después
          de confirmarse el pago. El acceso es personal e intransferible: no está permitido compartir
          tus credenciales ni el contenido con terceros. Si compraste un producto adicional (como un
          "order bump"), este se entrega junto con el producto principal.
        </p>
      </Section>

      <Section n={5} title="Precios y pagos">
        <p>
          Los precios pueden mostrarse en pesos colombianos (COP) o en dólares estadounidenses (USD)
          según el producto, y pueden cambiar sin previo aviso; el precio que pagarás es el que se
          muestra al momento de completar la compra. Los pagos se procesan a través de nuestra
          pasarela de pagos (Bold), mediante tarjeta de crédito o débito, PSE, Nequi o transferencia,
          según los métodos disponibles en cada momento. No almacenamos los datos completos de tu
          tarjeta.
        </p>
      </Section>

      <Section n={6} title="Devoluciones">
        <p>
          <strong>Productos digitales:</strong> puedes solicitar la devolución dentro de los 7 días
          calendario siguientes a la fecha de pago, escribiendo a <Mail />.
        </p>
        <p>
          <strong>Productos físicos (libros):</strong> puedes solicitar la devolución dentro de los 7
          días calendario siguientes a recibir el producto, siempre que esté en las mismas
          condiciones en que se entregó (sin uso, sin daños). Los costos de envío de la devolución
          corren por cuenta del comprador, salvo que el producto haya llegado defectuoso o erróneo,
          caso en el cual asumimos ese costo.
        </p>
        <p>
          Pasado el plazo correspondiente, no se procesarán devoluciones, salvo que la ley aplicable
          indique lo contrario.
        </p>
      </Section>

      <Section n={7} title="Propiedad intelectual">
        <p>
          Todo el contenido digital (videos, guías, plantillas, prompts) y el contenido de los libros
          físicos está protegido por derechos de autor y pertenece a Voz Estratégica y/o al
          conferencista correspondiente. No está permitida su reproducción, descarga no autorizada,
          redistribución, reventa ni uso comercial sin autorización escrita previa.
        </p>
      </Section>

      <Section n={8} title="Resultados y expectativas">
        <p>
          Los resultados que puedas obtener al aplicar lo aprendido dependen de múltiples factores
          propios de tu negocio o contexto. No garantizamos resultados específicos de ventas,
          ingresos o desempeño como consecuencia de haber adquirido o consumido cualquiera de
          nuestros productos.
        </p>
      </Section>

      <Section n={9} title="Disponibilidad del servicio">
        <p>
          Hacemos lo posible por mantener el acceso a productos digitales disponible de forma
          continua, pero puede haber interrupciones temporales por mantenimiento, actualizaciones o
          causas fuera de nuestro control. En caso de una interrupción prolongada que afecte tu
          acceso, contáctanos para buscar una solución.
        </p>
      </Section>

      <Section n={10} title="Modificaciones">
        <p>
          Podemos actualizar estos Términos y Condiciones en cualquier momento. Los cambios aplican a
          compras realizadas después de la fecha de actualización.
        </p>
      </Section>

      <Section n={11} title="Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de Colombia. Cualquier controversia se resolverá
          conforme a la normativa colombiana vigente.
        </p>
      </Section>

      <Section n={12} title="Contacto">
        <p>
          Si tienes preguntas sobre estos Términos y Condiciones, escríbenos a <Mail />.
        </p>
      </Section>
    </section>
  );
}
