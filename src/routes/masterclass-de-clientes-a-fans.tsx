import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, X, ChevronDown, Play, Loader2 } from "lucide-react";
import logoVozEstrategica from "@/assets/logo-voz-estrategica-masterclass.png";
import gallerySpeaker from "@/assets/carlos-gallery/speaker.jpg.asset.json";
import galleryCrehana from "@/assets/carlos-gallery/crehana.jpg.asset.json";
import galleryExma from "@/assets/carlos-gallery/exma.jpg.asset.json";
import { trackEvent } from "@/lib/meta-pixel";
import { trackGA4Event } from "@/lib/ga4";
import { openBoldEmbeddedCheckout } from "@/lib/bold-checkout";
import { toast } from "sonner";

const PRICE_USD = 19;
const PRODUCT_NAME = "Grabación Masterclass: De clientes a fans";
const PRIMARY_LABEL = "Quiero acceso ahora · USD 19";
const SECONDARY_LABEL = "Quiero la sesión completa · USD 19";

const GREEN = "#40ed51";
const GREEN_DIM = "rgba(64, 237, 81, 0.12)";
const BLACK = "#0e0f0c";
const PANEL = "#16181a";

const PAGE_URL = "https://vozestrategica.com/masterclass-de-clientes-a-fans";

const serif: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

export const Route = createFileRoute("/masterclass-de-clientes-a-fans")({
  head: () => ({
    meta: [
      { title: "Vender sin perseguir clientes · Grabación de Carlos Laguna" },
      {
        name: "description",
        content:
          "La grabación completa de 2 horas con Carlos Laguna: el sistema que aplica con Mercedes Benz, Nespresso y Bancolombia. Acceso inmediato y permanente por USD 19.",
      },
      { property: "og:title", content: "Vender sin perseguir clientes · Carlos Laguna" },
      {
        property: "og:description",
        content: "Sesión completa de 2 horas + recursos. Acceso inmediato y permanente por USD 19.",
      },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "product" },
      { property: "og:locale", content: "es_CO" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Vender sin perseguir clientes · Carlos Laguna" },
      {
        name: "twitter:description",
        content: "Grabación completa de 2 horas. Acceso permanente por USD 19.",
      },
    ],
    links: [
      { rel: "canonical", href: PAGE_URL },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Vender sin perseguir clientes — grabación completa",
          description:
            "Grabación de 2 horas del sistema comercial de Carlos Laguna, con matrices de negociación, prompts de IA y guía de preguntas.",
          brand: { "@type": "Brand", name: "Voz Estratégica" },
          image: gallerySpeaker.url,
          offers: {
            "@type": "Offer",
            price: String(PRICE_USD),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: PAGE_URL,
          },
        }),
      },
    ],
  }),
  component: MasterclassRecordingPage,
});

/* ───────────────────────── Checkout ───────────────────────── */

function goToCheckout() {
  trackEvent("InitiateCheckout", {
    content_name: PRODUCT_NAME,
    value: PRICE_USD,
    currency: "USD",
  });
  trackGA4Event("begin_checkout", {
    content_name: PRODUCT_NAME,
    value: PRICE_USD,
    currency: "USD",
  });
}

function BuyButton({
  variant = "primary",
  className = "",
  label,
}: {
  variant?: "primary" | "secondary";
  className?: string;
  label?: string;
}) {
  const text = label ?? (variant === "secondary" ? SECONDARY_LABEL : PRIMARY_LABEL);

  const base =
    "inline-flex min-h-[56px] w-full max-w-md cursor-pointer items-center justify-center gap-2 rounded-[6px] px-6 py-4 text-center text-[15px] font-extrabold uppercase leading-tight tracking-wide transition-all duration-150 active:scale-[0.97] sm:text-base md:px-8";

  const style: React.CSSProperties =
    variant === "secondary"
      ? { borderColor: GREEN, color: GREEN, ...serif }
      : { backgroundColor: GREEN, color: BLACK, ...serif };

  return (
    <Link
      to="/masterclass/checkout"
      onClick={goToCheckout}
      className={`${base} ${
        variant === "secondary"
          ? "border-2 bg-transparent hover:bg-[rgba(64,237,81,0.1)]"
          : "shadow-[0_8px_24px_-12px_rgba(64,237,81,0.55)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(64,237,81,0.85)]"
      } ${className}`}
      style={style}
    >
      {text}
    </Link>
  );
}

/* ───────────────────────── Sticky mobile bar ───────────────────────── */

function StickyBuyBar({ showAfter }: { showAfter: React.RefObject<HTMLDivElement | null> }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = showAfter.current;
      if (!el) return;
      setVisible(el.getBoundingClientRect().top < 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);


  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/15 bg-[#0e0f0c]/95 px-4 py-3 backdrop-blur transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/50">Acceso permanente</p>
          <p className="text-xl font-extrabold text-white" style={serif}>
            USD 19
          </p>
        </div>
        <BuyButton className="!min-h-[52px] !max-w-none !px-3 !text-[13px]" label="Quiero acceso ahora" />
      </div>
    </div>
  );
}

/* ───────────────────────── Shared pieces ───────────────────────── */

const BRAND_LOGOS = [
  "Mercedes Benz",
  "Nespresso",
  "Bancolombia",
  "Kimberly Clark",
  "Pepsi",
  "Pernod Ricard",
];

function BrandLogosRow({ label }: { label?: string }) {
  return (
    <div>
      {label && (
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 md:text-[11px]">
          {label}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 opacity-60 md:gap-x-12">
        {BRAND_LOGOS.map((l) => (
          <span
            key={l}
            className="text-xs font-semibold uppercase tracking-wide text-white grayscale md:text-sm"
            style={serif}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function PressRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
      <span className="text-lg font-bold tracking-tight text-white md:text-2xl" style={serif}>
        Forbes Colombia
      </span>
      <span className="h-5 w-px bg-white/20" aria-hidden />
      <span className="text-lg font-bold tracking-tight text-white md:text-2xl" style={serif}>
        Semana
      </span>
    </div>
  );
}

function VideoPlaceholder({
  image,
  overlayText,
  note,
  aspect = "aspect-video",
}: {
  image: string;
  overlayText?: string;
  note?: string;
  aspect?: string;
}) {
  return (
    <figure className="relative overflow-hidden rounded-[6px] border border-white/15 bg-black">
      <img
        src={image}
        alt="Carlos Laguna en escenario"
        className={`${aspect} w-full object-cover opacity-70`}
        loading="lazy"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full shadow-xl md:h-20 md:w-20"
          style={{ backgroundColor: GREEN }}
        >
          <Play className="ml-1 h-7 w-7 md:h-9 md:w-9" style={{ color: BLACK }} fill={BLACK} />
        </span>
        {overlayText && (
          <p
            className="px-4 text-center text-2xl font-extrabold uppercase tracking-[0.12em] text-white md:text-4xl"
            style={serif}
          >
            {overlayText}
          </p>
        )}
      </div>
      {note && (
        <figcaption className="border-t border-white/10 bg-[#0e0f0c] px-4 py-2 text-center text-[11px] uppercase tracking-[0.15em] text-white/40">
          {note}
        </figcaption>
      )}
    </figure>
  );
}

/* ───────────────────────── Page ───────────────────────── */

function MasterclassRecordingPage() {
  const afterBlock2 = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    trackEvent("ViewContent", { content_name: PRODUCT_NAME, value: PRICE_USD, currency: "USD" });
  }, []);

  const temas = [
    {
      n: "01",
      t: "Mindset comercial",
      d: "La diferencia entre el vendedor que persigue y el profesional que cierra. El cambio mental que viene antes de la técnica.",
    },
    {
      n: "02",
      t: "Los 4 tipos de cliente",
      d: "Cómo identificar al cliente analítico, expresivo, amigable o conductor en los primeros 60 segundos, y cómo adaptar tu estilo a cada uno.",
    },
    {
      n: "03",
      t: "Tu perfil negociador",
      d: "Un quiz auto-aplicado para identificar tu estilo natural de negociación y dónde ajustarlo.",
    },
    {
      n: "04",
      t: "Tipos de preguntas que cierran ventas",
      d: "Las 5 categorías de preguntas (apertura, calificación, dolor, validación, compromiso) con ejemplos aplicables esta semana, más 5 prompts de IA.",
    },
    {
      n: "05",
      t: "ADD On Factor + caso Mercedes Benz Colombia",
      d: "El sistema completo para convertir clientes que pelean precio en clientes que pagan más sin descuento.",
    },
  ];

  const incluido = [
    "Las 2 matrices de negociación",
    "Prompts de IA",
    "Guía de las 5 categorías de preguntas",
    "Acceso permanente desde cualquier dispositivo",
  ];

  const valorItems = [
    { item: "Sesión completa de 2 horas", valor: "USD 197" },
    { item: "Caso Mercedes Benz Colombia paso a paso", valor: "USD 97" },
    { item: "Las 2 matrices de negociación", valor: "USD 67" },
    { item: "Prompts de IA", valor: "USD 47" },
    { item: "Guía de las 5 categorías de preguntas", valor: "USD 47" },
    { item: "Quiz de perfil negociador", valor: "USD 37" },
  ];

  const testimonios = [
    {
      cita: "En 2 horas con Carlos vi más sobre cómo cerrar ventas que en cinco cursos juntos. El día siguiente apliqué lo de la pregunta antes del precio y cerré una venta que llevaba tres meses parada.",
      nombre: "Andrea M.",
      cargo: "Gerente Comercial · Sector salud",
    },
    {
      cita: "Carlos no enseña teoría. Enseña lo que aplica con marcas que conoces. Eso cambia todo. Salgo de cada sesión con cosas que puedo usar el lunes en la mañana.",
      nombre: "Juan C.",
      cargo: "Director de Ventas · Industria B2B",
    },
    {
      cita: "Lideré equipos comerciales durante 15 años y siempre faltaba el método. Carlos lo trae con números, con casos reales y con una claridad que pocos especialistas tienen.",
      nombre: "María F.",
      cargo: "Consultora Senior · LATAM",
    },
  ];

  const faqs = [
    {
      q: "¿Cuánto dura y cómo lo veo?",
      a: "Es una sesión completa de cerca de 2 horas, con capítulos para que puedas ir directo al tema que te interesa y retomar donde lo dejaste. Lo ves desde el celular o el computador, cuando quieras, cuantas veces quieras.",
    },
    { q: "¿Por cuánto tiempo tengo acceso?", a: "Para siempre. Compras una vez y queda en tu cuenta." },
    { q: "¿Es en vivo?", a: "No. Es la grabación completa de la sesión, con todos los recursos incluidos." },
    {
      q: "¿Tengo que verlo de una sola vez?",
      a: "No. El reproductor recuerda dónde te quedaste y puedes navegar por capítulos.",
    },
    { q: "¿Sirve si no tengo equipo?", a: "Sí. Si vendes tú, aplica igual." },
    {
      q: "¿Sirve para mi industria?",
      a: "El método es de conversación comercial, no de producto. Funciona en servicios, B2B, retail y ticket alto.",
    },
    {
      q: "¿Puedo ver algo antes de comprar?",
      a: "Sí. Hay un fragmento disponible gratis, sin registrarte.",
    },
    {
      q: "¿Cómo puedo pagar?",
      a: "Tarjeta de crédito o débito, PSE, Nequi y transferencia.",
    },
    {
      q: "¿Puedo pedir devolución?",
      a: "Sí. Tienes 7 días desde la compra para solicitarla escribiéndonos a contacto@vozestrategica.com.",
    },
    { q: "¿Necesito saber de IA?", a: "Cero. Los prompts están listos para copiar y pegar." },
  ];

  return (
    <div className="min-h-screen bg-[#0e0f0c] pb-24 text-white md:pb-0" style={serif}>
      {/* Barra superior mínima — sin menú */}
      <div className="border-b border-white/10 bg-[#0e0f0c]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <img src={logoVozEstrategica} alt="Voz Estratégica" className="h-7 w-auto md:h-9" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/50">USD 19</span>
        </div>
      </div>

      {/* ══ BLOQUE 1 · PORTADA ══ */}
      <section className="bg-[#16181a]">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-[55fr_45fr] md:gap-14">
            <div>
              <span
                className="inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] md:text-[11px]"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                Acceso inmediato · 2 horas · Para equipos comerciales
              </span>
              <h1 className="mt-6 text-[42px] font-extrabold leading-[1.02] tracking-tight text-white md:text-[68px] lg:text-[76px]">
                Vender sin{" "}
                <span style={{ color: GREEN }}>perseguir</span> clientes.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-xl">
                El sistema completo de Carlos Laguna —el mismo que aplica con Mercedes Benz, Nespresso y
                Bancolombia— en 2 horas que puedes ver hoy y aplicar mañana.
              </p>

              {/* Video primero en móvil */}
              <div className="mt-8 md:hidden">
                <VideoPlaceholder image={galleryCrehana.url} overlayText="VENDER SIN PERSEGUIR" />
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  "Un método para entrar a cada negociación con plan, no con esperanza",
                  "El framework para que te paguen más sin pelear precio",
                  "Prompts de IA listos para tu equipo el lunes",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GREEN }} />
                    <span className="text-base leading-relaxed text-white/90">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <BuyButton />
                <p className="mt-3 text-sm text-white/60">
                  Acceso inmediato y permanente · Mira un fragmento gratis antes de comprar
                </p>
              </div>
            </div>

            <div className="hidden md:block">
              <VideoPlaceholder image={galleryCrehana.url} overlayText="VENDER SIN PERSEGUIR" />
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <BrandLogosRow label="Carlos ha entrenado a los equipos comerciales de" />
          </div>
        </div>
      </section>

      {/* ══ BLOQUE 2 · VIDEO DE VENTAS ══ */}
      <section className="bg-[#0e0f0c]">
        <div className="mx-auto max-w-4xl px-5 py-14 md:py-20">
          <VideoPlaceholder
            image={gallerySpeaker.url}
            overlayText="VENDER SIN PERSEGUIR"
            note="Pendiente: video de ventas de 6–9 min"
          />
          <div className="mt-8 flex flex-col items-center">
            <BuyButton />
          </div>
        </div>
        <div ref={afterBlock2} />
      </section>

      <StickyBuyBar showAfter={afterBlock2} />

      {/* ══ BLOQUE 3 · EL PROBLEMA ══ */}
      <section className="bg-[#16181a]">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
          <h2 className="text-3xl font-extrabold leading-tight text-white md:text-5xl">
            Tu equipo no tiene un problema de talento.{" "}
            <span style={{ color: GREEN }}>Tiene un problema de sistema.</span>
          </h2>
          <p className="mt-6 text-lg text-white/70">Lo reconoces cuando:</p>
          <ul className="mt-6 space-y-4 border-l-2 pl-5" style={{ borderColor: GREEN_DIM }}>
            {[
              "Los resultados dependen del ánimo del día",
              "Cada negociación se improvisa desde cero",
              "La base de datos crece, pero nadie la trabaja",
              "El precio se cae en cuanto el cliente regatea",
              "Tú eres el mejor vendedor de la empresa… y eso te tiene saturado",
            ].map((p) => (
              <li key={p} className="text-base leading-relaxed text-white/85 md:text-lg">
                <span style={{ color: GREEN }} className="mr-2">
                  →
                </span>
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-xl font-bold leading-snug text-white md:text-3xl">
            Ninguno de esos es un problema de habilidad. Todos son un problema de método.{" "}
            <span style={{ color: GREEN }}>Y un método se aprende.</span>
          </p>
        </div>
      </section>

      {/* ══ BLOQUE 4 · LO QUE VAS A APRENDER ══ */}
      <section className="bg-[#0e0f0c]">
        <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
          <h2 className="text-3xl font-extrabold text-white md:text-5xl">Lo que vas a aprender</h2>
          <p className="mt-4 max-w-2xl text-base text-white/70 md:text-lg">
            Dos horas de sesión completa. Estos son los temas que Carlos desarrolla:
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {temas.map((t) => (
              <div
                key={t.n}
                className="flex gap-4 rounded-[6px] border border-white/12 bg-[#16181a] p-5"
              >
                <span className="text-2xl font-extrabold leading-none" style={{ color: GREEN }}>
                  {t.n}
                </span>
                <div>
                  <p className="text-base font-bold text-white md:text-lg">{t.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{t.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-10 rounded-[6px] border-2 border-dashed p-6"
            style={{ borderColor: GREEN, backgroundColor: GREEN_DIM }}
          >
            <p className="text-sm font-extrabold uppercase tracking-[0.18em]" style={{ color: GREEN }}>
              Y además, incluido
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {incluido.map((i) => (
                <li key={i} className="flex items-start gap-2 text-base text-white/90">
                  <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GREEN }} />
                  {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex justify-center">
            <BuyButton />
          </div>
        </div>
      </section>

      {/* ══ BLOQUE 5 · QUIÉN TE VA A ENSEÑAR ══ */}
      <section className="bg-[#16181a]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[45fr_55fr] md:py-24">
          <img
            src={gallerySpeaker.url}
            alt="Carlos Laguna en conferencia frente a auditorio lleno"
            className="aspect-[4/5] w-full rounded-[6px] object-cover shadow-2xl"
            loading="lazy"
          />
          <div>
            <h2 className="text-3xl font-extrabold text-white md:text-5xl">Quién te va a enseñar</h2>
            <p className="mt-6 text-base leading-relaxed text-white/80 md:text-lg">
              20 años entrenando equipos comerciales de marcas que no se pueden dar el lujo de improvisar:
              Mercedes Benz, Nespresso, Bancolombia, Kimberly Clark Professional, Pepsi y Pernod Ricard. Autor
              de <em>De Clientes a Fans</em>, reseñado por Forbes Colombia y Semana. Esto no es teoría de aula.
              Es el sistema que aplica con marcas tier-1, condensado para que lo apliques en tu negocio.
            </p>
            <div className="mt-8 border-t border-white/10 pt-6">
              <PressRow />
            </div>
          </div>
        </div>
      </section>

      {/* ══ BLOQUE 6 · ¿ES PARA TI? ══ */}
      <section className="bg-[#0e0f0c]">
        <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
          <h2 className="text-center text-3xl font-extrabold text-white md:text-5xl">¿Es para ti?</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div
              className="rounded-[6px] border-2 p-6 md:p-8"
              style={{ borderColor: GREEN, backgroundColor: GREEN_DIM }}
            >
              <p className="text-xl font-extrabold md:text-2xl" style={{ color: GREEN }}>
                SÍ, si…
              </p>
              <ul className="mt-5 space-y-4">
                {[
                  "Lideras o formas parte de un equipo comercial",
                  "Vendes servicios o productos de ticket medio o alto",
                  "Estás cansado de competir por precio",
                  "Eres emprendedor y vender depende de ti",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-3 text-base leading-relaxed text-white md:text-lg">
                    <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GREEN }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[6px] border border-white/12 bg-[#16181a] p-6 opacity-70 md:p-8">
              <p className="text-xl font-bold text-white/60 md:text-2xl">NO, si…</p>
              <ul className="mt-5 space-y-4">
                {[
                  "Buscas motivación y frases inspiracionales",
                  "Esperas resultados sin aplicar nada",
                  "Vendes exclusivamente por impulso y volumen bajo",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-3 text-base leading-relaxed text-white/60">
                    <X className="mt-0.5 h-5 w-5 shrink-0 text-white/40" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BLOQUE 7 · CUÁNTO VALE Y CUÁNTO CUESTA ══ */}
      <section className="bg-[#16181a]">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
          <h2 className="text-3xl font-extrabold text-white md:text-5xl">Cuánto vale y cuánto cuesta</h2>

          <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {valorItems.map((v) => (
              <li key={v.item} className="flex items-start justify-between gap-4 py-4">
                <span className="text-base text-white/85 md:text-lg">{v.item}</span>
                <span className="shrink-0 text-base font-bold text-white/70 md:text-lg">{v.valor}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-baseline justify-between gap-4">
            <span className="text-lg font-bold uppercase tracking-wide text-white/60">Valor total</span>
            <span className="text-3xl font-extrabold text-white/45 line-through md:text-4xl">USD 492</span>
          </div>

          <div className="mt-8 rounded-[6px] border-2 p-6 text-center" style={{ borderColor: GREEN }}>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">Precio hoy</p>
            <p className="mt-2 text-6xl font-extrabold leading-none md:text-8xl" style={{ color: GREEN }}>
              USD 19
            </p>
          </div>

          <p className="mt-6 text-center text-base text-white/70 md:text-lg">
            Menos de lo que cuesta una comida de negocios. Y a diferencia de la comida, esto te queda para
            siempre.
          </p>

          <div className="mt-8 flex justify-center">
            <BuyButton />
          </div>
        </div>
      </section>

      {/* ══ BLOQUE 8 · MÍRALO ANTES DE DECIDIR ══ */}
      <section className="bg-[#0e0f0c]">
        <div className="mx-auto max-w-4xl px-5 py-16 md:py-24">
          <div
            className="rounded-[8px] border-2 bg-[#1c1f1b] p-6 md:p-10"
            style={{ borderColor: GREEN }}
          >
            <h2 className="text-3xl font-extrabold text-white md:text-5xl">Míralo antes de decidir.</h2>
            <p className="mt-4 text-base leading-relaxed text-white/80 md:text-lg">
              No tienes que creerle a esta página. Mira un fragmento real de la sesión, comprueba cómo explica
              Carlos y decide con criterio propio.
            </p>
            <div className="mt-8">
              <VideoPlaceholder
                image={galleryExma.url}
                note="Pendiente de fragmento de 10–15 min"
              />
            </div>
            <p className="mt-4 text-center text-sm text-white/60">Sin correo, sin formularios. Dale play.</p>
            <div className="mt-8 flex justify-center">
              <BuyButton variant="secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ BLOQUE 9 · PRUEBA SOCIAL ══ */}
      <section className="bg-[#16181a]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <h2 className="text-center text-3xl font-extrabold text-white md:text-5xl">
            Lo que dicen quienes han trabajado con Carlos
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonios.map((t) => (
              <figure
                key={t.nombre}
                className="flex flex-col rounded-[6px] border border-white/12 bg-[#0e0f0c] p-6"
              >
                <span className="text-5xl font-extrabold leading-none" style={{ color: GREEN }}>
                  "
                </span>
                <blockquote className="mt-2 flex-1 text-base italic leading-relaxed text-white/90">
                  {t.cita}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                    style={{ backgroundColor: GREEN_DIM, color: GREEN }}
                  >
                    {t.nombre
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{t.nombre}</p>
                    <p className="text-xs text-white/60">{t.cargo}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-14 border-t border-white/10 pt-10">
            <BrandLogosRow label="Marcas que confían en su método" />
          </div>
          <div className="mt-10">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 md:text-[11px]">
              Su libro <em className="not-italic">De clientes a fans</em> ha sido reseñado en
            </p>
            <div className="mt-4">
              <PressRow />
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <BuyButton />
          </div>
        </div>
      </section>

      {/* ══ BLOQUE 10 · FAQ ══ */}
      <section className="bg-[#0e0f0c]">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
          <h2 className="text-center text-3xl font-extrabold text-white md:text-5xl">
            Preguntas frecuentes
          </h2>
          <div className="mt-10 divide-y divide-white/12 border-y border-white/12">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-start justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-bold text-white md:text-lg">{f.q}</span>
                    <ChevronDown
                      className={`mt-1 h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                      style={{ color: GREEN }}
                    />
                  </button>
                  {open && (
                    <p className="pb-5 pr-8 text-base leading-relaxed text-white/75">{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ BLOQUE 11 · CIERRE ══ */}
      <section style={{ backgroundColor: GREEN }}>
        <div className="mx-auto max-w-3xl px-5 py-16 text-center md:py-24">
          <h2
            className="text-3xl font-extrabold leading-tight md:text-5xl"
            style={{ color: BLACK }}
          >
            Dos horas hoy, o seguir improvisando el próximo trimestre.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "rgba(14,15,12,0.8)" }}>
            El precio de no tener un sistema no se ve en una factura: se ve en las negociaciones que se caen,
            en los descuentos que regalas y en el tiempo que tu equipo pierde persiguiendo a quien nunca iba a
            comprar.
          </p>
          <div className="mt-10 flex flex-col items-center">
            <BuyButton className="!bg-[#0e0f0c] !text-[#40ed51] !shadow-none hover:!shadow-none" />
            <p className="mt-3 text-sm font-semibold" style={{ color: "rgba(14,15,12,0.75)" }}>
              Acceso inmediato · Acceso permanente · Pago seguro
            </p>
          </div>
        </div>
      </section>

      {/* Pie mínimo */}
      <footer className="bg-[#0e0f0c]">
        <div className="mx-auto max-w-4xl px-5 py-10 text-center text-xs text-white/50">
          <p>Un producto de Carlos Laguna · Operado por Voz Estratégica</p>
          <p className="mt-3 space-x-3">
            <a href="/terminos-y-condiciones" className="underline underline-offset-2 hover:text-white">
              Términos y condiciones
            </a>
            <span>·</span>
            <a href="/aviso-de-privacidad" className="underline underline-offset-2 hover:text-white">
              Política de privacidad
            </a>
            <span>·</span>
            <a href="mailto:contacto@vozestrategica.com" className="underline underline-offset-2 hover:text-white">
              contacto@vozestrategica.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
