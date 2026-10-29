import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { speakers } from "@/data/content";
import camiloImg from "@/assets/speaker-camilo-gomez-ortiz.jpg";
import camiloImg2 from "@/assets/speaker-camilo-gomez-ortiz-2.jpg";

const SLUG = "camilo-gomez-ortiz";
const CANONICAL = `https://vozestrategica.com/speakers/${SLUG}`;
const TITLE =
  "Camilo Gómez Ortiz — Venta consultiva con IA para equipos comerciales | Voz Estratégica";
const DESCRIPTION =
  "Capacitación en venta consultiva con IA para equipos comerciales y de publicidad en México. Facilitada por Camilo Gómez Ortiz, más de 10 años en Google.";
const OG_IMAGE = `https://vozestrategica.com${camiloImg}`;
// Mismo número y formato que el botón flotante de WhatsApp del sitio.
const WHATSAPP_URL =
  "https://wa.me/573106598108?text=%C2%A1Hola!%20Quiero%20una%20propuesta%20de%20aprendizaje%20para%20mi%20equipo%20%28conferencia%2C%20taller%20o%20programa%29.";

export const Route = createFileRoute("/speakers/camilo-gomez-ortiz")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "profile" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": `${CANONICAL}#person`,
              name: "Camilo Gómez Ortiz",
              jobTitle: "Venta consultiva & IA aplicada a equipos comerciales",
              description: DESCRIPTION,
              image: OG_IMAGE,
              url: CANONICAL,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Inicio", item: "https://vozestrategica.com/" },
                { "@type": "ListItem", position: 2, name: "Speakers", item: "https://vozestrategica.com/speakers" },
                { "@type": "ListItem", position: 3, name: "Camilo Gómez Ortiz", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: CamiloPage,
});

const cifras = [
  { n: "10+", t: "años en Google en alianzas, nuevos negocios y ventas B2B" },
  { n: "US$300M+", t: "en portafolio gestionado como líder de nuevos negocios para Latinoamérica" },
  { n: "5 países", t: "liderando un equipo regional de 12 a 15 personas" },
  { n: "8 países", t: "donde lanzó productos tecnológicos" },
];
const clientes = ["Google", "Meta", "Walmart Advertising", "AllianceBernstein", "Uber Advertising", "Grupo Fórmula"];

const retos = [
  ["El pitch llega antes que el descubrimiento", "Las reuniones arrancan presentando producto y tarifas antes de entender qué le preocupa al cliente."],
  ["Propuestas que podrían ser para cualquiera", "Presentaciones estándar y media kits frente a compradores cada vez más preparados."],
  ["La IA usada como buscador", "El equipo le pide respuestas sueltas, pero no la usa para investigar cuentas, preparar reuniones ni ensayar objeciones."],
  ["Capacitaciones que no llegan al lunes", "Mucho contenido y poca práctica; a la semana, el equipo vuelve a vender igual."],
];

const pasos = [
  ["Conectar", "Generar confianza desde el primer minuto.", "Investigación de la cuenta y del interlocutor en minutos, no en horas."],
  ["Aprender", "Hacer preguntas estratégicas que descubren el problema de fondo y su impacto en el negocio del cliente.", "Preparar y afinar las preguntas de descubrimiento."],
  ["Resolver", "Presentar una propuesta a la medida de los objetivos del cliente.", "Borradores de propuestas y seguimientos personalizados."],
  ["Cerrar", "Abordar las objeciones y acordar próximos pasos claros.", "Ensayar objeciones en simulaciones antes de la reunión real."],
];

const programas = [
  {
    t: "Bootcamp de venta consultiva con IA",
    d: "4 sesiones de 90 minutos",
    para: "Llevar el proceso completo de venta consultiva a las cuentas reales del equipo, con práctica y seguimiento entre sesiones.",
    queda: "Prompts listos para investigar, preparar y dar seguimiento; un lenguaje común de venta; simulaciones de clientes y compromisos individuales.",
  },
  {
    t: "Trusted Advisor AI Edition",
    d: "Cohortes con sesiones de 60 a 90 minutos",
    para: "Formar asesores de confianza que trabajan apoyados en IA.",
    queda: "Habilidades de asesor de confianza y rutinas de trabajo con IA para el día a día.",
  },
  {
    t: "Pitch Clinic",
    d: "Sesiones de 45 minutos",
    para: "Preparar una presentación clave, como un plan de negocios conjunto con un cliente.",
    queda: "Un pitch ensayado, retroalimentación directa y una versión final más clara.",
  },
  {
    t: "Conferencia",
    d: "45 a 60 minutos",
    para: "Abrir un programa, un kickoff o una convención comercial.",
    queda: "Una visión compartida de qué cambia la IA en la venta y qué sigue siendo humano.",
  },
];

const resParticipante = [
  ["Preparación en minutos", "Prompts listos para investigar una cuenta y llegar a la reunión con contexto."],
  ["Mejores preguntas", "Descubrimiento que llega al problema de fondo antes de hablar de tarifas o métricas."],
  ["Objeciones ensayadas", "Práctica con IA y con colegas antes de enfrentarlas con el cliente."],
  ["Un plan para el lunes", "Un compromiso concreto para aplicar en sus propias cuentas esa misma semana."],
];
const resOrg = [
  ["Un lenguaje común de venta", "Que líderes y vendedores usan para revisar oportunidades."],
  ["Adopción de IA ligada al proceso comercial", "No a una herramienta suelta."],
  ["Líderes que pueden reforzarlo", "Con un marco claro para acompañar a su equipo después de la capacitación."],
];

const experiencia = [
  ["Uber Advertising", "Pitch Clinic para planes de negocio conjuntos con clientes"],
  ["Grupo Fórmula", "Bootcamp de venta consultiva con IA"],
  ["Google", "Programa Trusted Advisor para agencias de marketing de habla hispana"],
];
const testimonios = [
  "Gracias por este cierre y por toda tu ayuda para llevar a cabo esta segunda parte de la capacitación. Valoramos mucho tu tiempo y tu cercanía durante todo el proceso. El equipo se siente mucho mejor preparado y con más confianza para las conversaciones con clientes que tiene por delante. Personalmente, te agradezco tu tiempo y tu dedicación.",
  "Gracias de nuevo por la energía y el tiempo que dedicaste a esta capacitación. Confío en que va a desbloquear nuevas capacidades en todo el equipo. Nuestro siguiente paso es traer casos reales y sólidos, organizados por vertical, para poner en práctica lo aprendido.",
];

const ficha = [
  ["Trayectoria", "10+ años en Google"],
  ["Especialidad", "Venta consultiva e IA aplicada al trabajo comercial"],
  ["Formatos", "Bootcamp, programa por cohortes, Pitch Clinic, conferencia"],
  ["Idiomas", "Español e inglés"],
];
const disenados = [
  "Trusted Advisor",
  "Trusted Advisor AI Edition",
  "Bootcamps de venta consultiva",
  "Pitch Clinics",
  "Pensamiento estratégico",
  "Bootcamp para gerentes",
  "Creatividad en el liderazgo",
  "Innovación intencional",
  "Hacking Failure",
];

const ideal = [
  ["Equipos de venta de publicidad y medios", "Plataformas digitales, medios y retail media que venden a compradores sofisticados y necesitan propuestas a la medida."],
  ["Equipos comerciales B2B de tecnología y software", "Ciclos de venta largos, varios decisores y negociaciones complejas."],
  ["Servicios financieros", "Relaciones de confianza de largo plazo con clientes institucionales y corporativos."],
  ["Agencias y equipos de cuentas", "Equipos que quieren pasar de proveedor a asesor de sus clientes."],
  ["Líderes comerciales", "Que quieren un marco común para entrenar y acompañar a su propio equipo."],
];

const comoTrabajamos = [
  ["Cuéntanos el reto", "Qué equipo, qué tipo de venta y qué quieres que cambie."],
  ["Recibe una propuesta en menos de 48 horas", "Formato, duración e inversión, a la medida de tu objetivo."],
  ["Diseño a la medida", "Camilo adapta casos, ejercicios y simulaciones a tu industria y a tus cuentas."],
  ["Sesión y seguimiento", "El equipo practica en vivo y sale con compromisos concretos para la semana siguiente."],
];

const faqs = [
  ["¿Las sesiones son presenciales o virtuales?", "Ambas. Camilo facilita presencialmente en Ciudad de México y en toda la república, y también en formato virtual."],
  ["¿Se puede hacer en formato híbrido?", "Sólo si la sesión se diseña como híbrida desde el inicio. Mezclar participantes en sala y a distancia sin ese diseño reduce la práctica, que es el centro del trabajo."],
  ["¿En qué idioma?", "En español o en inglés, según el equipo."],
  ["¿Mi equipo necesita saber de IA?", "No. Las sesiones parten de donde está el equipo y se enfocan en usos concretos del trabajo comercial: investigar, preparar, proponer y dar seguimiento."],
  ["¿Qué herramientas de IA se usan?", "Las que tu equipo ya tiene disponibles."],
  ["¿Se adapta a mi industria?", "Sí. Los casos, ejercicios y simulaciones se diseñan con base en tu tipo de venta y, cuando es posible, sobre las cuentas reales del equipo."],
  ["¿Cuál es el tamaño ideal del grupo?", "Para grupos más grandes se recomienda una conferencia seguida de talleres por equipo."],
  ["¿Cuánto cuesta?", "Depende del formato, la duración, la ciudad y el tamaño del equipo. Escríbenos y te enviamos una propuesta a la medida en menos de 48 horas."],
];

function SectionHead({ badge, title, intro }: { badge: string; title: string; intro?: string }) {
  return (
    <>
      <div className="flex items-center gap-4">
        <span className="section-badge">{badge}</span>
        <div className="h-px flex-1 bg-foreground/15" />
      </div>
      <h2 className="mt-8 max-w-4xl font-display text-4xl uppercase leading-[0.95] md:text-6xl">
        {title}
      </h2>
      {intro ? <p className="mt-6 max-w-3xl text-lg text-muted-foreground">{intro}</p> : null}
    </>
  );
}

function ProposalLink({ label = "Solicita una propuesta", variant = "bubble-black" }: { label?: string; variant?: string }) {
  return (
    <Link
      to="/contratar"
      search={{ speaker: SLUG }}
      className={`bubble ${variant} inline-flex items-center gap-2`}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function WhatsAppLink() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="bubble bubble-outline inline-flex items-center gap-2"
    >
      <MessageCircle className="h-4 w-4" />
      Escríbenos por WhatsApp
    </a>
  );
}

function CamiloPage() {
  const others = speakers.filter((s) => s.slug !== SLUG).slice(0, 3);

  return (
    <>
      {/* 1. HERO */}
      <section className="relative overflow-hidden border-b border-foreground/10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-brand/40 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pt-24 pb-20 md:grid-cols-[1fr_1.1fr] md:pt-32">
          <Reveal>
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-foreground/5">
              <img
                src={camiloImg}
                alt="Retrato editorial de Camilo Gómez Ortiz"
                width={900}
                height={1350}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div>
              <span className="bubble bubble-outline">Facilitador · Venta consultiva con IA · México</span>
              <p className="mt-6 font-display text-2xl uppercase text-muted-foreground">Camilo Gómez Ortiz</p>
              <h1 className="mt-2 font-display text-5xl uppercase leading-[0.95] md:text-6xl">
                La IA prepara la reunión. Tu equipo gana la confianza.
              </h1>
              <p className="mt-6 text-xl font-semibold">
                Capacitación en venta consultiva con IA para equipos comerciales y de publicidad en México.
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                Talleres y programas prácticos donde tu equipo aplica la IA a sus propias cuentas: investiga y prepara en minutos, descubre lo que de verdad le preocupa al cliente y presenta propuestas a la medida. Los facilita Camilo Gómez Ortiz, quien lideró nuevos negocios y ventas B2B para Latinoamérica en Google durante más de una década.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ProposalLink />
                <a href="#programas" className="bubble bubble-outline inline-flex items-center gap-2">
                  Ver programas
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {["10+ años en Google", "Co-líder de la Google Partnerships Sales Academy", "Talleres en español e inglés"].map((c) => (
                  <span key={c} className="bubble bubble-yellow">{c}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. CIFRAS */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {cifras.map((c, i) => (
              <Reveal key={c.n} delay={i * 80}>
                <div className="border-l-2 border-brand pl-5">
                  <div className="font-display text-5xl uppercase text-brand md:text-6xl">{c.n}</div>
                  <p className="mt-2 text-sm text-background/75">{c.t}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 border-t border-background/15 pt-8">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background/60">
              Ha trabajado con equipos de
            </p>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 font-display text-2xl uppercase">
              {clientes.map((c) => <span key={c}>{c}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* 3. EL RETO */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead
          badge="01 · El reto"
          title="Tu equipo ya tiene IA. ¿Ya tiene mejores conversaciones con sus clientes?"
          intro="Casi todos los equipos comerciales ya probaron la inteligencia artificial. Lo que mueve los resultados no es la herramienta, sino la calidad de cada conversación con el cliente. Ahí es donde suelen atorarse:"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {retos.map(([t, d], i) => (
            <Reveal key={t} delay={i * 80}>
              <div className="h-full rounded-3xl border border-foreground/10 bg-background p-7">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">0{i + 1}</div>
                <h3 className="mt-3 font-display text-2xl uppercase leading-tight">{t}</h3>
                <p className="mt-3 text-muted-foreground">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4. EL ENFOQUE */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHead
            badge="02 · El enfoque"
            title="Venta consultiva, potenciada con IA."
            intro="La IA prepara y ayuda a practicar. Las personas generan la confianza que cierra negocios. Por eso cada sesión sigue el marco de cuatro pasos que Camilo utiliza con equipos comerciales, y en cada paso el equipo aprende qué delegar en la IA y qué sigue siendo suyo."
          />
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-foreground" />Lo que hace la persona</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-brand" />Lo que se apoya en IA</span>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pasos.map(([t, h, ia], i) => (
              <Reveal key={t} delay={i * 80}>
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-background">
                  <div className="flex-1 p-6">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Paso {i + 1}</div>
                    <h3 className="mt-2 font-display text-3xl uppercase">{t}</h3>
                    <p className="mt-3 text-muted-foreground">{h}</p>
                  </div>
                  <div className="bg-brand p-6 text-brand-foreground">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Con IA</div>
                    <p className="mt-2 font-semibold">{ia}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 font-display text-2xl uppercase">
            Todo se practica en vivo, en parejas y sobre cuentas reales del equipo.
          </p>
        </div>
      </section>

      {/* 5. PROGRAMAS */}
      <section id="programas" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20">
        <SectionHead
          badge="03 · Programas"
          title="Elige cómo quieres trabajar con tu equipo."
          intro="Todos los formatos se adaptan a tu industria, a tu proceso comercial y al perfil del equipo. Pueden ser presenciales o virtuales, en español o en inglés."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {programas.map((p, i) => (
            <Reveal key={p.t} delay={i * 80}>
              <div className="flex h-full flex-col rounded-3xl border border-foreground/10 bg-background p-7">
                <span className="bubble bubble-yellow self-start">{p.d}</span>
                <h3 className="mt-4 font-display text-3xl uppercase leading-tight">{p.t}</h3>
                <div className="mt-5 space-y-4 flex-1">
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Para qué sirve</div>
                    <p className="mt-1">{p.para}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Con qué se queda el equipo</div>
                    <p className="mt-1">{p.queda}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <ProposalLink label="Cotiza este formato" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 space-y-2 border-l-4 border-brand pl-6 text-lg">
          <p>Acompañamiento posterior a líderes comerciales, para que refuercen lo aprendido con su equipo.</p>
          <p className="text-muted-foreground">Todas las sesiones se ajustan a la medida de las necesidades de tu equipo: número de sesiones, duración, casos e industria.</p>
        </div>
      </section>

      {/* 6. RESULTADOS */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHead badge="04 · Resultados" title="Lo que cambia después de la sesión." />
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {[["Para cada participante", resParticipante], ["Para la organización", resOrg]].map(([h, items]) => (
              <div key={h as string}>
                <h3 className="font-display text-2xl uppercase">{h as string}</h3>
                <ul className="mt-6 space-y-5">
                  {(items as string[][]).map(([t, d]) => (
                    <li key={t} className="border-l-2 border-brand pl-5">
                      <div className="font-semibold">{t}</div>
                      <p className="text-muted-foreground">{d}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. EXPERIENCIA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead badge="05 · Experiencia" title="Sesiones recientes con equipos comerciales." />
        <div className="mt-12 overflow-hidden rounded-3xl border border-foreground/10">
          <div className="grid grid-cols-[1fr_2fr] bg-foreground px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background">
            <span>Cliente</span><span>Sesión</span>
          </div>
          {experiencia.map(([c, s]) => (
            <div key={c} className="grid grid-cols-[1fr_2fr] gap-4 border-t border-foreground/10 px-6 py-5">
              <span className="font-display text-xl uppercase">{c}</span>
              <span className="text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonios.map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <blockquote className="h-full rounded-3xl bg-brand/25 p-7 text-lg leading-relaxed">“{t}”</blockquote>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <p className="font-display text-2xl uppercase">¿Tu equipo enfrenta un reto parecido?</p>
          <ProposalLink />
        </div>
      </section>

      {/* 8. QUIÉN ES CAMILO */}
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-foreground/5">
              <img
                src={camiloImg2}
                alt="Camilo Gómez Ortiz facilitando una sesión"
                loading="lazy"
                width={900}
                height={1350}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <div>
            <SectionHead badge="06 · Quién es Camilo" title="De la operación comercial de Google a la sala con tu equipo." />
            <div className="mt-6 space-y-5 text-lg text-muted-foreground">
              <p>Camilo Gómez Ortiz trabajó más de diez años en Google. Como Head de Desarrollo de Nuevos Negocios y Gestión de Cuentas B2B para Latinoamérica, lideró un equipo de 12 a 15 personas en cinco países y gestionó un portafolio de más de US$300 millones. Co-lideró la Google Partnerships Sales Academy y su programa e-learning Fundamentals, y fue uno de los Trusted Advisors de Google en español.</p>
              <p>Desde 2023 diseña y facilita programas de ventas, liderazgo e IA para equipos comerciales en Latinoamérica. Es creador de Trusted Advisor AI Edition, cohortes que combinan la venta como asesor de confianza con el trabajo apoyado en IA. Usa la IA a diario para investigar, preparar propuestas y dar seguimiento, y lleva esa misma práctica a sus sesiones. Radica en México y facilita en español e inglés.</p>
            </div>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {ficha.map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-background p-5">
                  <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-10 font-display text-xl uppercase">Programas que ha diseñado y facilitado</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {disenados.map((d) => <span key={d} className="bubble bubble-outline">{d}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* 9. IDEAL PARA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead badge="07 · Ideal para" title="¿Para qué equipos funciona mejor?" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideal.map(([t, d], i) => (
            <Reveal key={t} delay={i * 60}>
              <div className="h-full rounded-3xl border border-foreground/10 p-7 transition-colors hover:border-brand">
                <h3 className="font-display text-2xl uppercase leading-tight">{t}</h3>
                <p className="mt-3 text-muted-foreground">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-lg text-muted-foreground">
          ¿Buscas una conferencia para una audiencia masiva o un tema distinto? El equipo de Voz Estratégica te recomienda la voz adecuada de{" "}
          <Link to="/speakers" className="font-semibold text-foreground underline decoration-brand decoration-2 underline-offset-4">su catálogo</Link>.
        </p>
      </section>

      {/* 10. CÓMO TRABAJAMOS */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHead badge="08 · Cómo trabajamos" title="De tu reto a la sesión, en cuatro pasos." />
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {comoTrabajamos.map(([t, d], i) => (
              <li key={t} className="rounded-3xl bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand font-display text-2xl text-brand-foreground">{i + 1}</div>
                <h3 className="mt-4 font-display text-xl uppercase leading-tight">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-3xl bg-foreground p-8 text-background md:p-10">
            <h3 className="font-display text-3xl uppercase text-brand">Respaldo Voz Estratégica.</h3>
            <p className="mt-3 max-w-3xl text-lg text-background/80">
              Camilo llega respaldado por Voz Estratégica, firma de aprendizaje corporativo con presencia en Bogotá, Ciudad de México y Madrid. Si tu reto necesita más de una voz, armamos el programa o la agenda completa.
            </p>
          </div>
        </div>
      </section>

      {/* 11. COTIZA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead
          badge="09 · Cotiza"
          title="Solicita una propuesta para tu equipo."
          intro="Cuéntanos sobre tu equipo y tu reto. Te respondemos con disponibilidad y una propuesta a la medida en menos de 48 horas."
        />
        <p className="mt-4 font-semibold">Ciudad de México, toda la república y virtual. Español e inglés.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ProposalLink label="Solicitar propuesta" />
          <WhatsAppLink />
        </div>
      </section>

      {/* 12. FAQ */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <SectionHead badge="10 · Preguntas frecuentes" title="Preguntas frecuentes" />
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map(([q, a], i) => (
              <AccordionItem key={q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-lg font-semibold">{q}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 13. CIERRE */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-32 top-0 h-[24rem] w-[24rem] rounded-full bg-brand/40 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
          <h2 className="font-display text-4xl uppercase leading-[0.95] md:text-6xl">
            Lleva la venta consultiva con IA a tu equipo comercial.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Un taller o un programa diseñado para tus cuentas, tu industria y tu forma de vender.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ProposalLink />
            <WhatsAppLink />
          </div>
        </div>
      </section>

      {/* 14. OTRAS VOCES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-3xl uppercase md:text-4xl">Otras voces</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {others.map((s) => (
            <Link
              key={s.slug}
              to="/speakers/$slug"
              params={{ slug: s.slug }}
              className="group relative block aspect-[3/4] overflow-hidden rounded-3xl"
            >
              <img
                src={s.foto}
                alt={s.nombre}
                loading="lazy"
                width={768}
                height={1024}
                className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-background">
                <div className="text-xs uppercase tracking-widest text-brand">{s.especialidad}</div>
                <div className="font-display text-2xl uppercase">{s.nombre}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
