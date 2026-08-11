import { createFileRoute } from "@tanstack/react-router";

const CANONICAL = "https://vozestrategica.com/aviso-de-privacidad";

export const Route = createFileRoute("/aviso-de-privacidad")({
  head: () => ({
    meta: [
      { title: "Aviso de Privacidad — Voz Estratégica" },
      {
        name: "description",
        content:
          "Aviso de Privacidad de Voz Estratégica: qué datos personales recolectamos, para qué los usamos, con quién los compartimos y cómo ejercer tus derechos.",
      },
      { property: "og:title", content: "Aviso de Privacidad — Voz Estratégica" },
      {
        property: "og:description",
        content:
          "Qué datos personales recolectamos, para qué los usamos y cómo ejercer tus derechos.",
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

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

function AvisoPrivacidad() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-display text-4xl uppercase md:text-5xl">Aviso de Privacidad</h1>
      <p className="mt-3 text-sm uppercase tracking-widest text-muted-foreground">
        Aplica a vozestrategica.com y todas sus páginas asociadas
      </p>

      <p className="mt-8 text-muted-foreground">
        Voz Estratégica respeta la privacidad de las personas que visitan nuestro sitio
        web, se registran a nuestros contenidos, solicitan información sobre nuestros servicios o
        adquieren productos a través de él. Este Aviso de Privacidad describe qué datos personales
        recolectamos, para qué los usamos, con quién los compartimos y cómo puedes ejercer tus
        derechos sobre ellos.
      </p>

      <Section n={1} title="Responsable del tratamiento">
        <p>
          Voz Estratégica SAS, con domicilio en Colombia y NIT 901.817.872-1, es responsable del
          tratamiento de los datos personales recolectados a través de vozestrategica.com y sus
          páginas asociadas (incluyendo landings de campañas y páginas de venta de productos
          específicos). Puedes contactarnos en <Mail /> para cualquier duda relacionada con este
          aviso.
        </p>
      </Section>

      <Section n={2} title="Datos que recolectamos">
        <p>Dependiendo de cómo interactúes con nuestro sitio, podemos recolectar:</p>
        <List
          items={[
            <>
              <strong>Datos de contacto:</strong> nombre, correo electrónico, número de WhatsApp o
              teléfono.
            </>,
            <>
              <strong>Datos de la solicitud:</strong> empresa, cargo o área, tipo de evento o
              servicio de interés, ciudad, fecha tentativa, rango de presupuesto, número de
              asistentes.
            </>,
            <>
              <strong>Datos de compra,</strong> cuando adquieres un producto o servicio: los pagos
              se procesan directamente a través de nuestra pasarela de pagos (Bold); nosotros no
              almacenamos números completos de tarjetas.
            </>,
            <>
              <strong>Datos de navegación:</strong> dirección IP, tipo de dispositivo, páginas
              visitadas, y parámetros de campañas publicitarias (como gclid y UTMs), recolectados
              mediante Google Analytics y el píxel de Meta.
            </>,
          ]}
        />
      </Section>

      <Section n={3} title="Para qué usamos tus datos">
        <List
          items={[
            "Responder tu solicitud de información, cotización o compra.",
            "Contactarte por WhatsApp o correo electrónico en relación con tu solicitud.",
            "Procesar el pago de productos o servicios que adquieras.",
            "Medir el desempeño de nuestras páginas y de las campañas publicitarias que te trajeron a ellas.",
            "Enviarte comunicaciones comerciales, solo si nos autorizas expresamente para ello.",
          ]}
        />
      </Section>

      <Section n={4} title="Qué pasa con tus datos al enviar un formulario">
        <p>
          Al enviar un formulario de contacto o cotización en nuestro sitio, tus datos se guardan en
          nuestra base de datos y, según la página, puede abrirse WhatsApp con un mensaje ya
          redactado para que puedas enviarlo directamente a nuestro número de contacto. No
          compartimos estos datos con terceros distintos a los mencionados en la sección 5, y no los
          usamos para fines distintos a los descritos en este aviso.
        </p>
      </Section>

      <Section n={5} title="Con quién compartimos tus datos">
        <p>
          No vendemos tus datos personales. Los compartimos únicamente con proveedores que nos
          ayudan a operar nuestro sitio, entre ellos:
        </p>
        <List
          items={[
            "Bold — procesamiento de pagos, cuando realizas una compra.",
            "Google Analytics y Google Ads — medición de tráfico y campañas publicitarias.",
            "Meta (Facebook/Instagram) — medición de campañas publicitarias.",
            "WhatsApp Business — comunicación directa contigo.",
            "Proveedores de hosting e infraestructura (Lovable/Supabase) — alojamiento técnico del sitio y almacenamiento de formularios.",
          ]}
        />
        <p>
          Estos proveedores solo acceden a los datos necesarios para prestar su servicio y están
          sujetos a sus propias políticas de privacidad.
        </p>
      </Section>

      <Section n={6} title="Tus derechos">
        <p>
          Como titular de tus datos personales, y de acuerdo con la Ley 1581 de 2012 de Colombia (y
          normativas equivalentes en otros países desde donde nos visites), tienes derecho a:
        </p>
        <List
          items={[
            "Conocer, actualizar y rectificar tus datos personales.",
            "Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.",
            "Ser informado sobre el uso que se le ha dado a tus datos.",
            "Presentar quejas ante la autoridad de protección de datos competente.",
            "Revocar la autorización o solicitar la supresión de tus datos, cuando no exista un deber legal o contractual que impida hacerlo.",
          ]}
        />
        <p>
          Para ejercer cualquiera de estos derechos, escríbenos a <Mail />.
        </p>
      </Section>

      <Section n={7} title="Cookies y tecnologías similares">
        <p>
          Nuestro sitio utiliza cookies y tecnologías similares (como el píxel de Meta y Google
          Analytics) para entender cómo se usa y medir el resultado de nuestras campañas
          publicitarias. Puedes configurar tu navegador para rechazar cookies, aunque esto podría
          afectar algunas funciones del sitio.
        </p>
      </Section>

      <Section n={8} title="Cambios a este aviso">
        <p>
          Podemos actualizar este Aviso de Privacidad en cualquier momento. Te recomendamos
          revisarlo periódicamente.
        </p>
      </Section>

      <Section n={9} title="Contacto">
        <p>
          Si tienes preguntas sobre este Aviso de Privacidad o sobre el tratamiento de tus datos
          personales, escríbenos a <Mail />.
        </p>
      </Section>
    </section>
  );
}
