import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Ear,
  Stethoscope,
  HandCoins,
  Users,
  TrendingDown,
  ChevronDown,
  ShieldCheck,
  Calendar,
  Clock,
  Video,
  Download,
  Globe,
  Smartphone,
  Languages,
  Award,
} from "lucide-react";
import carlosImg from "@/assets/speaker-carlos-laguna.jpg";
import logoVozEstrategica from "@/assets/logo-voz-estrategica-masterclass.png";
import { trackEvent } from "@/lib/meta-pixel";
import { trackGA4Event } from "@/lib/ga4";

const trackMasterclassCheckout = () =>
  trackEvent("InitiateCheckout", {
    content_name: "Masterclass: De clientes a fans",
    value: 20,
    currency: "USD",
  });

const FECHA = "Jueves 18 de junio";
const CHECKOUT_URL = "https://checkout.bold.co/payment/LNK_34GGH7QEO0";
const BURGUNDY = "#40ed51"; // brand green
const BURGUNDY_LIGHT = "rgba(64, 237, 81, 0.12)"; // dim green tint for dark bg
const CREAM = "rgba(64, 237, 81, 0.07)"; // very subtle highlight for dark bg
const BLACK = "#0e0f0c";

export const Route = createFileRoute("/masterclass-de-clientes-a-fans")({
  head: () => ({
    meta: [
      { title: `Masterclass: De Clientes a Fans · Carlos Laguna · ${FECHA}` },
      {
        name: "description",
        content:
          "2 horas en vivo con Carlos Laguna. El sistema que aplica con Mercedes Benz, Nespresso y Bancolombia para vender sin perseguir clientes. $20 USD.",
      },
      { property: "og:title", content: "Masterclass: De Clientes a Fans · Carlos Laguna" },
      {
        property: "og:description",
        content: "Aprende a vender sin perseguir clientes. 2 horas en vivo. $20 USD.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  component: MasterclassPage,
});

function CTA({
  children = "Reservar mi cupo · $20 USD",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={CHECKOUT_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackMasterclassCheckout}
      className={`inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[6px] px-8 py-4 text-base font-bold uppercase tracking-wide text-[#0e0f0c] shadow-[0_8px_24px_-12px_rgba(64,237,81,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(64,237,81,0.85)] active:translate-y-0 ${className}`}
      style={{ backgroundColor: BURGUNDY, fontFamily: "'Montserrat', sans-serif" }}
    >
      {children}
    </a>
  );
}

function MasterclassPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Smooth fade on mount
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const pageStyle = {
    fontFamily: "'Montserrat', sans-serif",
    color: "#ffffff",
    backgroundColor: BLACK,
  } as const;
  const serif = { fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.01em" } as const;

  const problemas = [
    { icon: TrendingDown, text: "Tienes un equipo comercial pero los resultados dependen del ánimo del día" },
    { icon: Stethoscope, text: "Sientes que improvisas cada negociación y cada cliente es una sorpresa" },
    { icon: Users, text: "Tu base de datos crece pero no sabes cómo trabajarla con sistema" },
    { icon: HandCoins, text: "Te cuesta sostener tu precio cuando el cliente empieza a regatear" },
    { icon: Ear, text: "Eres el mejor vendedor de tu propia empresa · y eso te tiene saturado" },
  ];

  const promesas = [
    "Un sistema claro para entrar a cada negociación con plan · no con esperanza",
    "El framework que aplica Carlos para que los clientes paguen más sin pelear precio",
    "Cinco prompts de IA listos para usar el lunes con tu equipo comercial",
    "El caso real de Mercedes Benz Colombia explicado paso a paso por su autor",
    "Las dos matrices (Canvas + seguimiento) que cambian la conversación de descuento a experiencia",
  ];

  const modulos = [
    {
      n: "01",
      titulo: "Mindset comercial",
      desc: "La diferencia entre el vendedor que persigue y el profesional que cierra. El cambio mental que viene antes de la técnica.",
    },
    {
      n: "02",
      titulo: "Los 4 tipos de cliente",
      desc: "Cómo identificar al cliente analítico, expresivo, amigable o conductor en los primeros 60 segundos. Y cómo adaptar tu estilo a cada uno.",
    },
    {
      n: "03",
      titulo: "Tu perfil negociador",
      desc: "Quiz auto-aplicado en vivo. Sales sabiendo cuál es tu estilo natural · y dónde lo tienes que ajustar.",
    },
    {
      n: "04",
      titulo: "Tipos de preguntas que cierran ventas",
      desc: "Las 5 categorías de preguntas (apertura, calificación, dolor, validación, compromiso) con ejemplos aplicables esta semana. Más 5 prompts de IA usando LIAgu en vivo.",
    },
    {
      n: "05",
      titulo: "ADD On Factor + caso Mercedes Benz Colombia",
      desc: "El sistema completo para convertir clientes que pelean precio en clientes que pagan más sin descuento.",
      destacado: true,
    },
  ];

  const paraQuien = [
    { rol: "Emprendedores", desc: "que necesitan escalar sin que todo dependa de ellos" },
    { rol: "Líderes comerciales", desc: "que quieren un equipo que cierre con sistema · no con suerte" },
    { rol: "Gerentes de experiencia al cliente", desc: "que necesitan cumplir objetivos comerciales · no solo de satisfacción" },
    { rol: "Vendedores B2B y consultivos", desc: "que están listos para subir un nivel" },
  ];

  const logistica = [
    { icon: Calendar, label: "Fecha", value: FECHA },
    { icon: Clock, label: "Hora", value: "7:00 PM hora Colombia (UTC-5)" },
    { icon: Video, label: "Duración", value: "2 horas en vivo + 30 min de Q&A abierto" },
    { icon: Globe, label: "Modalidad", value: "100% virtual en Zoom · enlace tras compra" },
    { icon: Download, label: "Grabación", value: "Incluida · acceso por 48 horas posteriores" },
    { icon: Smartphone, label: "Compatibilidad", value: "Celular · tablet · laptop" },
    { icon: Languages, label: "Idioma", value: "Español" },
  ];

  const incluye = [
    "Acceso a la masterclass en vivo (2 horas)",
    "Q&A en vivo de 30 minutos con Carlos",
    "Grabación completa por 48 horas",
    "Ejercicio práctico descargable de seguimiento",
    "Bonus: invitación prioritaria al workshop completo (precio reservado solo para asistentes)",
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
      q: "¿Habrá grabación si no puedo asistir en vivo?",
      a: "Sí. Tendrás acceso a la grabación por 48 horas después del evento. Si quieres acceso permanente, en la masterclass te abrimos el workshop completo que incluye la grabación vitalicia y 40 horas más de contenido.",
    },
    {
      q: "¿Necesito tener equipo comercial para que me sirva?",
      a: "No. La masterclass funciona igual de bien si vendes solo, lideras un equipo o eres consultor. Los principios y herramientas se adaptan a cualquier estructura.",
    },
    { q: "¿En qué idioma es?", a: "100% en español. Los ejemplos y casos son de marcas que operan en LATAM." },
    {
      q: "¿Puedo participar desde el celular?",
      a: "Sí. Zoom funciona desde cualquier dispositivo. Te recomendamos auriculares para mejor experiencia.",
    },
    {
      q: "¿Y si quiero llevar a mi equipo?",
      a: "Para grupos de 5 o más personas escríbenos a contacto@vozestrategica.com — tenemos tarifa corporativa.",
    },
    {
      q: "¿Cómo funciona la garantía?",
      a: "Si en los primeros 30 minutos sientes que la masterclass no te aporta, escribe a contacto@vozestrategica.com y te devolvemos los $20 USD. Sin trámites.",
    },
  ];

  const logos = ["Mercedes Benz", "Nespresso", "Bancolombia", "Kimberly Clark", "Pepsi", "Pernod Ricard"];

  return (
    <div style={pageStyle} className="min-h-screen">
      {/* Minimal top bar — sin menú */}
      <div className="border-b border-white/15 bg-[#0e0f0c]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:py-4">
          <img
            src={logoVozEstrategica}
            alt="Voz Estratégica"
            className="h-8 w-auto md:h-10"
            loading="eager"
            decoding="async"
          />
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackMasterclassCheckout}
            className="hidden rounded-[4px] px-4 py-2 text-sm font-bold uppercase tracking-wide text-[#0e0f0c] sm:inline-flex"
            style={{ backgroundColor: BURGUNDY }}
          >
            Reservar · $20 USD
          </a>
        </div>
      </div>

      {/* ─────────── BLOQUE 01 · HERO ─────────── */}
      <section className="relative overflow-hidden bg-[#16181a]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_1fr] md:gap-16 md:py-24">
          <div className="animate-fade-up">
            <span
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ borderColor: BURGUNDY, color: BURGUNDY }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-rec-led"
                style={{ backgroundColor: "#ff1a1a", boxShadow: "0 0 6px rgba(255,26,26,0.9)" }}
              />
              Masterclass en vivo · {FECHA}
            </span>
            <h1
              style={serif}
              className="text-[40px] font-bold leading-[1.05] tracking-tight text-white md:text-[64px] lg:text-[72px]"
            >
              Aprende a vender{" "}
              <em className="italic" style={{ color: BURGUNDY }}>
                sin perseguir
              </em>{" "}
              clientes.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl">
              En 2 horas. Con el sistema que aplica <strong>Carlos Laguna</strong> con Mercedes Benz, Nespresso y Bancolombia.
            </p>
            <p className="mt-4 text-sm text-white/60">
              Masterclass virtual en vivo · {FECHA} · 7:00 PM hora Colombia · <strong>$20 USD</strong>
            </p>
            <div className="mt-8 flex flex-col items-start gap-3">
              <CTA />
              <p className="text-xs text-white/60">Cupos limitados · garantía de devolución</p>
            </div>
          </div>
          <div className="relative">
            <div
              className="absolute -inset-6 -z-10 rounded-[3px]"
              style={{ backgroundColor: BURGUNDY_LIGHT }}
            />
            <img
              src={carlosImg}
              alt="Carlos Laguna, autor de De clientes a fans"
              className="aspect-[4/5] w-full rounded-[3px] object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ─────────── BLOQUE 02 · AUTORIDAD ─────────── */}
      <section className="border-y border-white/15 bg-[#0e0f0c]">
        <div className="mx-auto max-w-6xl px-5 py-10 md:py-12">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Carlos ha entrenado a los equipos comerciales de
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-14">
            {logos.map((l) => (
              <span
                key={l}
                className="text-base font-semibold tracking-wide text-white/80 opacity-70 md:text-lg"
                style={serif}
              >
                {l}
              </span>
            ))}
          </div>
          <p className="mt-8 text-center text-sm italic text-white/60" style={serif}>
            Su libro <em>De clientes a fans</em> fue reseñado por <strong className="not-italic text-white">Forbes Colombia</strong>.
          </p>
        </div>
      </section>

      {/* ─────────── BLOQUE 03 · PROBLEMA ─────────── */}
      <section className="bg-[#16181a]">
        <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
          <h2 style={serif} className="text-3xl font-bold leading-tight md:text-5xl">
            Si te suena conocido alguno de estos,{" "}
            <span style={{ color: BURGUNDY }}>esta masterclass es para ti</span>:
          </h2>
          <ul className="mt-10 space-y-6">
            {problemas.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-start gap-4">
                <span
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: BURGUNDY_LIGHT, color: BURGUNDY }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="text-lg leading-relaxed text-white md:text-xl">{text}</span>
              </li>
            ))}
          </ul>
          <p
            style={serif}
            className="mt-12 text-center text-2xl italic md:text-3xl"
          >
            No son problemas de habilidad.{" "}
            <span style={{ color: BURGUNDY }}>Son problemas de sistema.</span>
          </p>
        </div>
      </section>

      {/* ─────────── BLOQUE 04 · PROMESA ─────────── */}
      <section className="bg-[#0e0f0c]">
        <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
          <h2 style={serif} className="text-4xl font-bold leading-tight md:text-6xl">
            En 2 horas vas a tener:
          </h2>
          <ul className="mt-10 space-y-5">
            {promesas.map((p, i) => (
              <li key={i} className="flex items-start gap-4 border-b border-white/15 pb-5">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0" style={{ color: BURGUNDY }} strokeWidth={2} />
                <span className="text-lg leading-relaxed md:text-xl">{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <CTA>Quiero esto · $20 USD</CTA>
          </div>
        </div>
      </section>

      {/* ─────────── BLOQUE 05 · AGENDA ─────────── */}
      <section className="bg-[#16181a]">
        <div className="mx-auto max-w-5xl px-5 py-20 md:py-28">
          <div className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: BURGUNDY }}>
              El programa
            </p>
            <h2 style={serif} className="text-3xl font-bold leading-tight md:text-5xl">
              El programa de la masterclass
            </h2>
            <p className="mt-4 text-base text-white/60 md:text-lg">
              2 horas en vivo con Carlos · 5 módulos concentrados · una sola sesión
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {modulos.map((m) => (
              <article
                key={m.n}
                className={`rounded-[3px] border p-6 transition-all md:p-8 ${
                  m.destacado ? "md:col-span-2" : ""
                }`}
                style={{
                  borderColor: m.destacado ? BURGUNDY : "rgba(255,255,255,0.15)",
                  backgroundColor: m.destacado ? CREAM : "#16181a",
                }}
              >
                <div className="flex items-start gap-5">
                  <span
                    style={{ ...serif, color: BURGUNDY }}
                    className="text-4xl font-bold leading-none md:text-5xl"
                  >
                    {m.n}
                  </span>
                  <div>
                    <h3 style={serif} className="text-xl font-bold md:text-2xl">
                      {m.titulo}
                    </h3>
                    <p className="mt-2 leading-relaxed text-white/80">{m.desc}</p>
                    {m.destacado && (
                      <span
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{ backgroundColor: BLACK, color: BURGUNDY }}
                      >
                        <Award className="h-3 w-3" /> Clímax de la sesión
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── BLOQUE 06 · BIO ─────────── */}
      <section className="bg-[#0e0f0c]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1fr_1.3fr] md:items-center md:py-28">
          <div>
            <img
              src={carlosImg}
              alt="Carlos Laguna"
              className="aspect-[4/5] w-full rounded-[3px] object-cover grayscale"
            />
          </div>
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: BURGUNDY }}>
              Quién te va a enseñar
            </p>
            <h2 style={serif} className="text-3xl font-bold leading-tight md:text-5xl">
              Carlos Laguna
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-white/80 md:text-lg">
              <p>
                Carlos Laguna lleva 20 años entrenando equipos comerciales en algunas de las marcas más exigentes
                de LATAM: Mercedes Benz, Nespresso, Bancolombia, Kimberly Clark Professional, Pepsi y Pernod
                Ricard, entre otras.
              </p>
              <p>
                Es autor del libro <em>De clientes a fans</em>, reseñado por Forbes Colombia como{" "}
                <em>"el libro que propone reemplazar la guerra de precios con experiencia de cliente"</em>.
              </p>
              <p>
                Su metodología propia · el <strong>ADD On Factor</strong> · ha sido aplicada en casos reales de
                marcas tier-1 para cambiar la conversación comercial de descuento a valor percibido.
              </p>
              <p>Es speaker oficial de Crehana y especialista en negociación de la Universidad de Los Andes.</p>
            </div>
            <blockquote
              className="mt-8 border-l-4 p-6"
              style={{ borderColor: BURGUNDY, backgroundColor: CREAM }}
            >
              <p style={serif} className="text-xl italic leading-snug md:text-2xl">
                "El libro que propone reemplazar la guerra de precios con experiencia de cliente."
              </p>
              <footer className="mt-3 text-sm font-bold uppercase tracking-wider" style={{ color: BURGUNDY }}>
                — Forbes Colombia
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ─────────── BLOQUE 07 · PARA QUIÉN ─────────── */}
      <section className="bg-[#16181a]">
        <div className="mx-auto max-w-4xl px-5 py-20 md:py-28">
          <div className="text-center">
            <h2 style={serif} className="text-4xl font-bold md:text-6xl">
              ¿Es para ti?
            </h2>
            <p className="mt-4 text-base text-white/60 md:text-lg">
              Esta masterclass es para profesionales que vivan al menos una de estas situaciones:
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {paraQuien.map((p) => (
              <div
                key={p.rol}
                className="rounded-[3px] border border-white/15 bg-[#0e0f0c] p-6 transition-colors hover:border-[#40ed51]"
              >
                <h3 className="text-lg font-bold text-white">{p.rol}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60 md:text-base">{p.desc}</p>
              </div>
            ))}
          </div>
          <p style={serif} className="mt-12 text-center text-xl italic text-white/80 md:text-2xl">
            Si vas a vender algo en los próximos 6 meses · y quieres hacerlo mejor · esta masterclass está
            diseñada para ti.
          </p>
        </div>
      </section>

      {/* ─────────── BLOQUE 08 · LOGÍSTICA ─────────── */}
      <section className="bg-[#0e0f0c]">
        <div className="mx-auto max-w-4xl px-5 py-20 md:py-28">
          <h2 style={serif} className="text-center text-3xl font-bold md:text-5xl">
            Logística de la masterclass
          </h2>
          <div className="mt-12 grid gap-x-8 gap-y-5 md:grid-cols-2">
            {logistica.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 border-b border-white/15 pb-5">
                <span
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: BURGUNDY_LIGHT, color: BURGUNDY }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    {label}
                  </p>
                  <p className="mt-0.5 text-base font-medium text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <CTA />
          </div>
        </div>
      </section>

      {/* ─────────── BLOQUE 09 · OFERTA ─────────── */}
      <section id="reservar" className="bg-[#16181a]">
        <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
          <div
            className="rounded-[4px] border-2 p-8 md:p-12"
            style={{ borderColor: BURGUNDY, backgroundColor: CREAM }}
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: BURGUNDY }}>
              La inversión
            </p>
            <div className="flex items-baseline gap-3">
              <span style={serif} className="text-7xl font-bold md:text-8xl" >
                $20
              </span>
              <span className="text-2xl font-bold text-white/60">USD</span>
            </div>
            <p className="text-sm text-white/60">Una sola entrega · acceso completo</p>

            <div className="my-8 h-px bg-white/15" />

            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white">
              Qué incluye tu inversión
            </p>
            <ul className="space-y-3">
              {incluye.map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: BURGUNDY }} />
                  <span className="text-base leading-relaxed">{i}</span>
                </li>
              ))}
            </ul>

            <div
              className="mt-8 flex items-start gap-4 rounded-[3px] border-2 border-dashed p-5"
              style={{ borderColor: BURGUNDY }}
            >
              <ShieldCheck className="h-10 w-10 shrink-0" style={{ color: BURGUNDY }} strokeWidth={1.5} />
              <div>
                <p className="font-bold text-white">Garantía de devolución total</p>
                <p className="mt-1 text-sm leading-relaxed text-white/80">
                  Si en los primeros 30 minutos consideras que la masterclass no te aporta valor real, te
                  devolvemos el dinero. Sin preguntas. Sin trámites.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <CTA className="w-full !min-h-[64px] !text-lg">Reservar mi cupo ahora · $20 USD</CTA>
              <p className="mt-3 text-center text-xs text-white/60">
                Pago seguro · tarjeta internacional · PSE Colombia · 2 cuotas sin interés disponibles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── BLOQUE 10 · TESTIMONIOS ─────────── */}
      <section className="bg-[#0e0f0c]">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <h2 style={serif} className="text-center text-3xl font-bold leading-tight md:text-5xl">
            Lo que dicen quienes han trabajado con Carlos
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonios.map((t, i) => (
              <figure
                key={i}
                className="flex flex-col rounded-[3px] border border-white/15 bg-[#16181a] p-7"
              >
                <span
                  style={{ ...serif, color: BURGUNDY }}
                  className="text-5xl font-bold leading-none"
                >
                  "
                </span>
                <blockquote style={serif} className="mt-2 flex-1 text-base italic leading-relaxed text-white md:text-lg">
                  {t.cita}
                </blockquote>
                <figcaption className="mt-6 border-t border-white/15 pt-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: BURGUNDY_LIGHT, color: BURGUNDY }}
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
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── BLOQUE 11 · FAQ ─────────── */}
      <section className="bg-[#16181a]">
        <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
          <h2 style={serif} className="text-center text-3xl font-bold md:text-5xl">
            Preguntas que recibimos seguido
          </h2>
          <div className="mt-12 divide-y divide-white/15 border-y border-white/15">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-start justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-bold text-white md:text-lg">{f.q}</span>
                    <ChevronDown
                      className={`mt-1 h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                      style={{ color: BURGUNDY }}
                    />
                  </button>
                  {open && (
                    <p className="pb-5 pr-9 text-base leading-relaxed text-white/80">{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── BLOQUE 12 · CIERRE ─────────── */}
      <section style={{ backgroundColor: BLACK }}>
        <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: BURGUNDY }}>
            Te lo recuerdo en una sola frase
          </p>
          <h2 style={serif} className="text-3xl font-extrabold leading-tight text-white md:text-5xl">
            Dos horas en vivo con Carlos Laguna. El sistema que aplica con Mercedes Benz, Nespresso y
            Bancolombia. <em className="not-italic" style={{ color: BURGUNDY }}>Por $20 USD.</em>
          </h2>
          <p className="mt-6 text-lg text-white/90">
            {FECHA} a las 7:00 PM hora Colombia.
          </p>
          <p className="mt-2 text-sm text-white/60">
            Cupos limitados · garantía de devolución · grabación incluida.
          </p>
          <div className="mt-10 flex justify-center">
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackMasterclassCheckout}
              className="inline-flex min-h-[64px] items-center justify-center rounded-[6px] px-10 py-5 text-lg font-bold uppercase tracking-wide text-[#0e0f0c] shadow-2xl transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: BURGUNDY }}
            >
              Reservar mi cupo · $20 USD
            </a>
          </div>
        </div>
      </section>

      {/* ─────────── BLOQUE 13 · P.D. ─────────── */}
      <section className="bg-[#0e0f0c]">
        <div className="mx-auto max-w-2xl px-5 py-20 md:py-28">
          <div className="flex items-start gap-5">
            <img
              src={carlosImg}
              alt="Carlos Laguna"
              className="h-16 w-16 shrink-0 rounded-full object-cover md:h-20 md:w-20"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: BURGUNDY }}>
                P.D. de Carlos
              </p>
              <p className="mt-1 text-sm text-white/60">Un mensaje personal antes de cerrar</p>
            </div>
          </div>
          <div className="mt-8 space-y-5 pl-0 text-lg leading-relaxed text-white md:pl-[84px] md:text-xl" style={serif}>
            <p>Si llegaste hasta acá es porque algo te resonó.</p>
            <p>
              Voy a serte directo: estas dos horas no te van a convertir en otra persona. Pero te van a dar
              herramientas concretas que puedes usar el lunes y un cambio de perspectiva sobre cómo ves la
              venta.
            </p>
            <p>
              Si los $20 USD te detienen, probablemente esta masterclass no es para ti. Si los $20 USD te
              parecen poco para 2 horas con alguien que entrena a marcas tier-1, entonces te espero adentro.
            </p>
            <p>Nos vemos el {FECHA.toLowerCase()}.</p>
          </div>
          <div className="mt-10 pl-0 md:pl-[84px]">
            <p style={{ ...serif, color: BURGUNDY }} className="text-3xl italic md:text-4xl">
              Carlos Laguna
            </p>
            <p className="mt-1 text-sm text-white/60">Autor de <em>De clientes a fans</em></p>
          </div>
        </div>
      </section>

      {/* ─────────── BLOQUE 14 · FOOTER ─────────── */}
      <footer className="bg-[#1a1a1a] text-white/80">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex flex-col items-center gap-4 text-center text-xs md:flex-row md:justify-between md:text-left">
            <p>
              <strong className="text-white">Voz Estratégica</strong> · +57 310 6598108 ·
              contacto@vozestrategica.com
            </p>
            <p className="space-x-3 text-white/60">
              <a href="#" className="hover:text-white">Términos y condiciones</a>
              <span>·</span>
              <a href="#" className="hover:text-white">Política de privacidad</a>
              <span>·</span>
              <a href="#" className="hover:text-white">Política de devoluciones</a>
            </p>
          </div>
          <p className="mt-6 text-center text-[11px] text-white/50">
            © 2026 Voz Estratégica · Todos los derechos reservados ·{" "}
            <Link to="/" className="underline hover:text-white">
              Ir al sitio principal
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
