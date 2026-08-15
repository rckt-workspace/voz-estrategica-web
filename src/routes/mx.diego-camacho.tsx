import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sparkles,
  Bot,
  Users,
  Zap,
  Target,
  Rocket,
  Mic2,
  GraduationCap,
  Building2,
  MessageSquare,
  ChevronDown,
  Globe2,
  Award,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Logo } from "@/components/Logo";
import { GoogleLogo, MicrosoftLogo } from "@/components/BrandLogos";
import { trackEvent } from "@/lib/meta-pixel";
import { trackWhatsAppContact, trackGenerateLead } from "@/lib/analytics";
import { setEnhancedConversionUserData } from "@/lib/consent";
import { publicBackend } from "@/lib/public-backend-client";
import { notifyDiegoLead } from "@/lib/leads-email.functions";
import diegoHeroUrl from "@/assets/diego-mx/diego-hero-ai.webp";
import diegoPortraitCleanUrl from "@/assets/diego-mx/diego-portrait-clean.png";
import diegoBookingUrl from "@/assets/diego-mx/diego-booking.jpg";

const CANONICAL = "https://vozestrategica.com/mx/diego-camacho";
// TODO: reemplazar por el número real de México (formato internacional sin signos)
const WHATSAPP_NUMBER = "573106598108";
const WHATSAPP_DISPLAY = "+52 XXX XXX XXXX";
const WA_DEFAULT_MSG =
  "Hola, quiero disponibilidad y tarifa de Diego Camacho para un evento en CDMX.";

function waLink(msg: string = WA_DEFAULT_MSG) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function trackWhatsAppClick(placement: string) {
  trackEvent("Contact", { method: "whatsapp", placement });
  trackWhatsAppContact({ placement, source: "mx-diego-camacho" });
}

const schema = z.object({
  nombre: z.string().trim().min(2, "Tu nombre y apellido"),
  empresa: z.string().trim().min(2, "Nombre de la empresa"),
  cargo: z.string().trim().min(2, "Tu cargo o área"),
  tipo_evento: z.enum(["Convención", "Congreso", "In-company", "Otro"], {
    errorMap: () => ({ message: "Selecciona un tipo de evento" }),
  }),
  presupuesto: z.enum(
    ["Hasta $150,000 MXN", "$150,000 – $300,000 MXN", "Más de $300,000 MXN", "Aún por definir"],
    { errorMap: () => ({ message: "Selecciona un rango de presupuesto" }) },
  ),
  asistentes: z.enum(["Menos de 100", "100 – 300", "300 – 800", "Más de 800"], {
    errorMap: () => ({ message: "Selecciona el número de asistentes" }),
  }),
  ciudad_fecha: z.string().trim().min(2, "Ciudad y fecha tentativa"),
  whatsapp: z.string().trim().min(6, "Tu WhatsApp"),
});
type FormData = z.infer<typeof schema>;

const FAQS = [
  {
    q: "¿Diego da conferencias presenciales en CDMX?",
    a: "Sí, presenciales en Ciudad de México y toda la república, y también en formato virtual.",
  },
  { q: "¿En qué idioma?", a: "Español." },
  {
    q: "¿Adapta el contenido a mi industria?",
    a: "Sí. Cada conferencia se ajusta al sector, al objetivo del evento y al perfil de la audiencia.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Depende del formato, la fecha y la ciudad. Escríbenos por WhatsApp y te damos una propuesta a la medida.",
  },
  {
    q: "¿Qué formatos ofrece?",
    a: "Keynote, masterclass/taller, programa in-company y participación en paneles.",
  },
  {
    q: "¿Puedo contratar más de una voz?",
    a: "Sí. Voz Estratégica puede armar el lineup completo de tu agenda.",
  },
];

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const PERSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Diego Camacho",
  jobTitle: "Head of New Business Sales en Google · Conferencista de IA y Ventas",
  url: CANONICAL,
  image: "https://vozestrategica.com/og-diego-camacho.jpg",
  nationality: "CO",
  knowsAbout: [
    "Inteligencia artificial aplicada a ventas",
    "Marketing digital",
    "Transformación comercial",
  ],
  worksFor: { "@type": "Organization", name: "Google" },
  affiliation: {
    "@type": "Organization",
    name: "Voz Estratégica",
    url: "https://vozestrategica.com",
  },
};

const SERVICE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Conferencia de inteligencia artificial y ventas",
  name: "Conferencia de IA y ventas con Diego Camacho",
  description:
    "Conferencia magistral sobre inteligencia artificial aplicada a ventas y marketing para convenciones, congresos y eventos in-company en Ciudad de México.",
  provider: { "@type": "Organization", name: "Voz Estratégica", url: "https://vozestrategica.com" },
  areaServed: { "@type": "Country", name: "México" },
  audience: { "@type": "BusinessAudience", audienceType: "Empresas y equipos comerciales" },
  offers: {
    "@type": "Offer",
    url: CANONICAL,
    priceCurrency: "MXN",
    availability: "https://schema.org/InStock",
    category: "Conferencia corporativa",
  },
};

export const Route = createFileRoute("/mx/diego-camacho")({
  head: () => ({
    meta: [
      { title: "Diego Camacho | Conferencista de IA y Ventas para tu evento en CDMX" },
      {
        name: "description",
        content:
          "Lleva a Diego Camacho, Head of New Business Sales en Google y referente en IA aplicada a ventas, a tu convención en CDMX. Escríbenos por WhatsApp y recibe disponibilidad y tarifa.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "profile" },
      { property: "og:title", content: "Diego Camacho · Conferencista IA y Ventas · CDMX" },
      {
        property: "og:description",
        content:
          "Head of New Business Sales en Google. IA aplicada a ventas y marketing. Disponible para tu convención en CDMX.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:locale", content: "es_MX" },
      { property: "og:site_name", content: "Voz Estratégica" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Diego Camacho · Conferencista IA y Ventas · CDMX" },
      {
        name: "twitter:description",
        content:
          "Head of New Business Sales en Google. IA aplicada a ventas y marketing. Disponible para tu convención en CDMX.",
      },
      {
        property: "og:image",
        content: "https://vozestrategica.com/og/diego-camacho.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Diego Camacho · Conferencista de IA y Ventas · CDMX",
      },
      {
        name: "twitter:image",
        content: "https://vozestrategica.com/og/diego-camacho.jpg",
      },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
      { rel: "preload", as: "image", href: diegoHeroUrl, fetchPriority: "high" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(PERSON_JSONLD) },
      { type: "application/ld+json", children: JSON.stringify(SERVICE_JSONLD) },
      { type: "application/ld+json", children: JSON.stringify(FAQ_JSONLD) },
    ],
  }),
  component: Page,
});

function Page() {
  const [submitted, setSubmitted] = useState(false);
  const [campaign, setCampaign] = useState({ gclid: "", utm_source: "", utm_campaign: "" });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // En esta landing de campaña ocultamos TopBar y BottomBar (ver Shell en __root),
  // pero sus efectos pueden dejar --topbar-h / --bottombar-h con valores viejos si
  // el usuario llega vía navegación SPA desde otra ruta. Los forzamos a 0 aquí
  // para evitar franjas del color de fondo asomando arriba o abajo del contenido.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--topbar-h", "0px");
    root.style.setProperty("--bottombar-h", "0px");
  }, []);

  // Captura de parámetros de campaña desde la URL (campos ocultos del formulario)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setCampaign({
      gclid: p.get("gclid") ?? "",
      utm_source: p.get("utm_source") ?? "",
      utm_campaign: p.get("utm_campaign") ?? "",
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    // 1. Guardar el lead antes de abrir WhatsApp
    const { error } = await publicBackend.from("leads_mx").insert({
      nombre: data.nombre,
      empresa: data.empresa,
      cargo: data.cargo,
      tipo_evento: data.tipo_evento,
      ciudad_fecha: data.ciudad_fecha,
      whatsapp: data.whatsapp,
      presupuesto: data.presupuesto,
      asistentes: data.asistentes,
      gclid: campaign.gclid || null,
      utm_source: campaign.utm_source || null,
      utm_campaign: campaign.utm_campaign || null,
      landing: "/mx/diego-camacho",
    });
    if (error) {
      throw new Error("No pudimos guardar tus datos. Inténtalo de nuevo.");
    }

    // 2. Notificación por correo (no bloquea la apertura de WhatsApp)
    void notifyDiegoLead({
      data: {
        nombre: data.nombre,
        empresa: data.empresa,
        cargo: data.cargo,
        tipo_evento: data.tipo_evento,
        presupuesto: data.presupuesto,
        asistentes: data.asistentes,
        ciudad_fecha: data.ciudad_fecha,
        whatsapp: data.whatsapp,
        gclid: campaign.gclid || undefined,
        utm_source: campaign.utm_source || undefined,
        utm_campaign: campaign.utm_campaign || undefined,
      },
    }).catch((e: unknown) => console.error("[leads-email] no se pudo notificar", e));

    // 3. Enhanced Conversions: teléfono hasheado (SHA-256), nunca en claro
    try {
      await setEnhancedConversionUserData(data.whatsapp);
    } catch (e) {
      console.error("[enhanced-conversions] fallo no bloqueante", e);
    }

    // 3. Evento de conversión
    trackEvent("Lead", { content_name: "diego-camacho-mx", source: "landing-form" });
    trackGenerateLead({
      form_name: "Diego Camacho MX Formulario",
      source: "mx-diego-camacho",
      placement: "form-cta",
    });

    // 3. Confirmación visual (independiente de WhatsApp)
    setSubmitted(true);

    // 4. Abrir WhatsApp con el mensaje prellenado
    const msg = `Hola, soy ${data.nombre} de ${data.empresa} (${data.cargo}). Quiero información sobre la conferencia de Diego Camacho para un ${data.tipo_evento} en ${data.ciudad_fecha}. Asistentes: ${data.asistentes}. Presupuesto: ${data.presupuesto}. Mi WhatsApp: ${data.whatsapp}`;
    trackWhatsAppClick("form-cta");
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-[#0F0F0F] text-[#F5F2E3]">
      {/* Header minimal — solo logo + anclas de esta landing */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F0F0F]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-6 xl:px-12 py-4 md:py-5">
          <div className="flex items-center">
            <Logo className="h-12 w-auto md:h-14" />
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            {[
              ["#temas", "Temas"],
              ["#formatos", "Formatos"],
              ["#cotizar", "Cotizar"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white/75 transition hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("header")}
            className="inline-flex items-center gap-2 rounded-full bg-[#EAC945] px-5 py-2.5 text-sm font-bold text-[#0F0F0F] transition hover:brightness-110 md:text-base"
          >
            WhatsApp →
          </a>
        </div>
      </header>

      {/* ============ BLOQUE 1 — HERO ============ */}
      <section className="relative flex items-start overflow-hidden border-b border-white/10">
        {/* fondo decorativo */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full bg-[#EAC945]/10 blur-3xl" />
          <div className="absolute bottom-0 -left-24 h-[420px] w-[420px] rounded-full bg-[#EAC945]/[0.06] blur-3xl" />
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.06]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#EAC945" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative mx-auto w-full max-w-[1600px] px-6 xl:px-12 pt-4 pb-16 lg:pt-6 lg:pb-20">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <Reveal>
                <div className="section-badge section-badge-dark inline-flex">
                  <Sparkles className="h-3 w-3" />
                  Conferencista · IA aplicada al negocio · CDMX
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight md:text-5xl lg:text-[3.25rem] 2xl:text-[5.75rem] 2xl:leading-[1.05]">
                  La IA no reemplaza a tu equipo.{" "}
                  <span className="text-[#EAC945]">Lo libera para vender más.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-4 max-w-2xl text-lg font-semibold text-white/85 md:text-xl 2xl:text-3xl">
                  Conferencista de inteligencia artificial y ventas en Ciudad de México.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 max-w-xl text-base text-white/75 lg:text-[1.05rem] xl:max-w-2xl 2xl:leading-snug 2xl:text-3xl">
                  Lleva a <strong className="text-white">Diego Camacho</strong> —Head of New
                  Business Sales en Google y referente en IA aplicada a ventas— al escenario de tu
                  próxima convención en CDMX. Una conferencia que tu equipo comercial entiende y
                  aplica el lunes siguiente.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href="#cotizar"
                    className="inline-flex items-center gap-2 rounded-full bg-[#EAC945] px-5 py-2.5 text-sm font-bold text-[#0F0F0F] transition hover:brightness-110"
                  >
                    Solicita disponibilidad y tarifa
                  </a>
                  <a
                    href="#temas"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:border-white/50"
                  >
                    Ver temas
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60">
                  <li className="inline-flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-[#EAC945]" /> Trayectoria en Google
                  </li>
                  <li className="inline-flex items-center gap-2">
                    <Mic2 className="h-3.5 w-3.5 text-[#EAC945]" /> +150 conferencias · 4
                    continentes
                  </li>
                  <li className="inline-flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#EAC945]" /> Curaduría Voz Estratégica
                  </li>
                </ul>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] uppercase tracking-widest text-white/80 md:text-xs">
                  <span className="inline-flex items-center justify-center gap-2">
                    <Bot className="h-4 w-4 shrink-0 text-[#EAC945]" /> IA
                  </span>
                  <span className="inline-flex items-center justify-center gap-2 border-x border-white/10">
                    <TrendingUp className="h-4 w-4 shrink-0 text-[#EAC945]" /> Ventas
                  </span>
                  <span className="inline-flex items-center justify-center gap-2">
                    <Globe2 className="h-4 w-4 shrink-0 text-[#EAC945]" /> Global
                  </span>
                </div>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm sm:grid-cols-4">
                  <StatCard num="+150" label="conferencias" compact />
                  <StatCard num="+2000" label="clientes" compact />
                  <StatCard num="4" label="continentes" compact />
                  <StatCard num="+20" label="países" compact />
                </div>
              </Reveal>
            </div>

            {/* Slot visual: foto real de Diego en escenario (IA) */}
            <Reveal delay={0.2}>
              <div className="relative flex items-center justify-center">
                <div className="relative aspect-square w-full max-w-[520px] overflow-hidden rounded-full">
                  <img
                    src={diegoHeroUrl}
                    alt="Diego Camacho en escenario junto a un holograma con el texto AI e íconos tecnológicos"
                    width={1804}
                    height={1804}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full scale-[1.04] object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ BLOQUE 2 — PROBLEMA ============ */}
      <section className="bg-[#F5F2E3] text-[#0F0F0F]">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-20 lg:py-28">
          <Reveal>
            <span className="section-badge">01 · El problema</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 max-w-3xl font-display text-4xl uppercase md:text-5xl 2xl:text-8xl 2xl:leading-[1.05]">
              Tu empresa ya invirtió en inteligencia artificial.{" "}
              <span className="highlight-yellow">
                <span>¿Tu equipo ya vende más con ella?</span>
                <span aria-hidden />
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-3xl text-lg text-black/70">
              La mayoría de las empresas en México ya compró herramientas de IA. El problema no es
              la tecnología: es que nadie la tradujo en resultados comerciales. Y en una convención,
              un conferencista genérico deja aplausos, no acción.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[
              {
                icon: Bot,
                t: "Herramientas que nadie usa",
                d: "Licencias de IA pagadas que el equipo abrió una vez y olvidó.",
              },
              {
                icon: Users,
                t: "La IA como amenaza",
                d: "Equipos comerciales que la ven como su reemplazo, no como su aliada.",
              },
              {
                icon: Target,
                t: "Marketing que gasta sin sistema",
                d: "Inversión en anuncios y tecnología sin una máquina que genere oportunidades.",
              },
              {
                icon: Mic2,
                t: "Eventos que no dejan huella",
                d: "Speakers que inspiran 40 minutos y no cambian nada el lunes.",
              },
            ].map((b, i) => (
              <Reveal key={b.t} delay={0.05 * i}>
                <div className="flex gap-4 rounded-2xl border border-black/10 bg-white p-6">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EAC945] text-[#0F0F0F]">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg uppercase 2xl:text-2xl 2xl:leading-snug">
                      {b.t}
                    </h3>
                    <p className="mt-1 text-sm text-black/65">{b.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BLOQUE 3 — PROPUESTA DE VALOR ============ */}
      <section className="bg-[#0F0F0F] text-[#F5F2E3]">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-20 lg:py-28">
          <Reveal>
            <span className="section-badge section-badge-dark">02 · Propuesta de valor</span>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-5 max-w-3xl text-xl leading-relaxed text-white/85 md:text-2xl 2xl:text-4xl 2xl:leading-relaxed">
              Diego Camacho traduce la inteligencia artificial a un idioma que el área comercial y
              de marketing <span className="text-[#EAC945]">entiende y aplica</span>: menos tareas
              repetitivas, más tiempo frente al cliente y mejores conversiones. No es teoría ni humo
              tecnológico: es negocio con factor humano, con casos, herramientas concretas y una
              acción para ejecutar de inmediato.
            </p>
          </Reveal>

          {/* Comparativa: una sola versión responsive */}
          {(() => {
            const rows: [string, string][] = [
              [
                "Miedo a que la IA reemplace",
                "Un equipo que usa la IA para liberar tiempo y vender mejor",
              ],
              ["Teoría abstracta", "Herramientas y ejemplos aplicables a su día a día"],
              [
                "Un discurso que se olvida",
                "Una acción concreta para implementar esa misma semana",
              ],
            ];
            return (
              <div className="mt-12 space-y-4 md:space-y-0 md:overflow-hidden md:rounded-3xl md:border md:border-white/10">
                {rows.map(([a, b]) => (
                  <div
                    key={a}
                    className="grid overflow-hidden rounded-2xl border border-white/10 md:grid-cols-2 md:rounded-none md:border-0 md:border-t md:border-white/10 md:first:border-t-0"
                  >
                    <div className="bg-white/[0.03] p-5 md:border-r md:border-white/10 md:p-6">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 md:text-xs">
                        En vez de...
                      </div>
                      <div className="mt-2 text-white/80">{a}</div>
                    </div>
                    <div className="bg-[#EAC945] p-5 text-[#0F0F0F] md:bg-white/[0.02] md:p-6 md:text-white">
                      <div className="text-[10px] font-bold uppercase tracking-widest md:text-xs md:text-[#EAC945]">
                        Tu equipo se lleva...
                      </div>
                      <div className="mt-2 font-medium">{b}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Evidencia visual real: caso Booking.com */}
          <Reveal delay={0.05}>
            <figure className="mt-16 lg:mr-24 xl:mr-32">
              <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
                <div className="flex items-center justify-center">
                  <img
                    src={diegoBookingUrl}
                    alt="Diego Camacho en escenario presentando el caso real de Booking.com sobre implementación de IA de Google y aumento del 15% en valor promedio de transacción"
                    loading="lazy"
                    width={1080}
                    height={1080}
                    className="block h-auto w-full max-w-[420px] object-contain [mask-image:radial-gradient(circle_at_center,black_49.5%,transparent_50%)] [-webkit-mask-image:radial-gradient(circle_at_center,black_49.5%,transparent_50%)]"
                  />
                </div>
                <figcaption className="flex flex-col justify-center gap-3 p-6 lg:p-10">
                  <span className="section-badge section-badge-dark inline-flex w-fit border-[#EAC945]/40 text-[#EAC945]">
                    Caso real · Booking.com
                  </span>
                  <p className="font-display text-2xl uppercase leading-tight md:text-3xl 2xl:text-4xl">
                    Booking.com implementó IA de Google para personalizar anuncios,{" "}
                    <span className="text-[#EAC945]">
                      con un aumento del 15% en el valor promedio de transacción
                    </span>
                    .
                  </p>
                  <p className="text-sm text-white/65 2xl:text-base">
                    Uno de los casos con los que Diego demuestra, en escenario, cómo la IA se
                    traduce en resultados de negocio medibles para marcas globales.
                  </p>
                </figcaption>
              </div>
            </figure>
          </Reveal>

          {/* Metodología 6 P's */}
          <div className="mt-16 rounded-3xl border border-[#EAC945]/30 bg-[#EAC945]/[0.06] p-8 lg:p-10">
            <div className="section-badge section-badge-dark inline-flex border-[#EAC945]/40 text-[#EAC945]">
              Metodología propia
            </div>
            <h3 className="mt-4 max-w-3xl font-display text-3xl uppercase md:text-4xl 2xl:text-7xl 2xl:leading-[1.05]">
              Las 6 P&apos;s: así se implementa la IA{" "}
              <span className="text-[#EAC945]">en cada etapa de la venta</span>.
            </h3>
            <p className="mt-3 max-w-2xl text-white/70">
              Una estructura simple que el equipo comercial puede aplicar desde el primer día.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {[
                "Planear",
                "Prospectar",
                "Preparar",
                "Ponerse en contacto",
                "Propuesta",
                "Progreso",
              ].map((p, i) => (
                <div
                  key={p}
                  className="group rounded-2xl border border-white/10 bg-[#0F0F0F] p-4 transition hover:border-[#EAC945]/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#EAC945] text-xs font-bold text-[#0F0F0F]">
                      {i + 1}
                    </span>
                  </div>
                  <div className="mt-3 font-display text-lg uppercase 2xl:text-2xl 2xl:leading-snug">
                    {p}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ BLOQUE 4 — AUTORIDAD ============ */}
      <section className="bg-[#F5F2E3] text-[#0F0F0F]">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-20 lg:py-28">
          <Reveal>
            <span className="section-badge">03 · Quién es Diego Camacho</span>
          </Reveal>
          <div className="mt-8 grid gap-10 lg:grid-cols-[340px_1fr] lg:items-stretch xl:grid-cols-[380px_1fr]">
            <Reveal delay={0.05} className="flex h-full">
              <div className="relative mx-auto flex h-full w-full max-w-[340px] flex-col overflow-hidden rounded-xl border border-black/10 bg-[#0F0F0F] shadow-sm xl:max-w-[380px]">
                <div className="relative min-h-0 flex-1 overflow-hidden">
                  <img
                    src={diegoPortraitCleanUrl}
                    alt="Retrato de Diego Camacho en traje negro"
                    loading="lazy"
                    width={800}
                    height={820}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                </div>

                <div className="mt-auto border-t border-black/10 bg-white p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-black/50">
                    Diego Camacho
                  </div>
                  <div className="mt-1 font-display text-sm uppercase leading-tight">
                    Head of New Business Sales · Google LATAM
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="flex">
              <div className="flex w-full flex-col justify-between gap-6">
                <p className="text-lg leading-loose text-black/80 md:text-xl md:leading-loose 2xl:text-3xl 2xl:leading-loose">
                  Head of New Business Sales para <strong>LATAM en Google</strong> y especialista en
                  inteligencia artificial aplicada a ventas y marketing. Con más de 150 conferencias
                  impartidas, ha liderado equipos comerciales en 4 continentes y más de 20 países,
                  gestionando el éxito de más de 2000 clientes en mercados como Latinoamérica, el
                  Sudeste Asiático, Estados Unidos y Australia. Su trayectoria incluye roles
                  directivos en <strong>Microsoft y Google</strong>.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Award, t: "Respaldo", d: "Google" },
                    { icon: Bot, t: "Especialidad", d: "IA + Ventas + Marketing" },
                    { icon: Mic2, t: "Trayectoria", d: "+150 conferencias · +2000 clientes" },
                    { icon: Globe2, t: "Alcance", d: "4 continentes · +20 países" },
                  ].map((c) => (
                    <div key={c.t} className="rounded-xl border border-black/10 bg-white p-4">
                      <c.icon className="h-4 w-4 text-[#0F0F0F]" />
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-black/50">
                        {c.t}
                      </div>
                      <div className="mt-1 font-display text-sm uppercase leading-snug 2xl:text-base 2xl:leading-snug">
                        {c.d}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ BLOQUE 5 — TEMAS ============ */}
      <section id="temas" className="bg-[#0F0F0F] text-[#F5F2E3]">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-20 lg:py-28">
          <Reveal>
            <span className="section-badge section-badge-dark">04 · Temas de conferencia</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 max-w-3xl font-display text-4xl uppercase md:text-5xl 2xl:text-8xl 2xl:leading-[1.05]">
              Cuatro conferencias, un mismo hilo:{" "}
              <span className="text-[#EAC945]">IA que vende</span>.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[
              {
                icon: Zap,
                t: "La IA no reemplaza a tu equipo, lo libera",
                d: "Del miedo a la adopción: la IA que quita tareas repetitivas y devuelve tiempo para vender y cuidar al cliente.",
                p: "Dirección comercial y de ventas",
              },
              {
                icon: Target,
                t: "Marketing con IA: del gasto en anuncios a la máquina de oportunidades",
                d: "Con su trayectoria en Google Ads: convertir la inversión en medios en un sistema que genera leads de forma predecible.",
                p: "Marketing, growth y transformación digital",
              },
              {
                icon: TrendingUp,
                t: "Vender en la era de la IA",
                d: "Prospección, seguimiento y cierre potenciados con nuevas herramientas, sin perder el factor humano.",
                p: "Fuerzas de ventas B2B y consultivas",
              },
              {
                icon: Rocket,
                t: "Escalar con IA",
                d: "Cómo las startups y empresas en crecimiento usan la IA para crecer más rápido con menos recursos.",
                p: "Founders, scaleups y áreas de innovación",
              },
            ].map((c, i) => (
              <Reveal key={c.t} delay={0.05 * i}>
                <article className="group h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-[#EAC945]/50">
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EAC945] text-[#0F0F0F]">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-white/45">
                        Tema 0{i + 1}
                      </div>
                      <h3 className="mt-1 font-display text-2xl uppercase leading-tight 2xl:text-5xl 2xl:leading-tight">
                        {c.t}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-white/70">{c.d}</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-white/60">
                    <Users className="h-3 w-3 text-[#EAC945]" /> {c.p}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BLOQUE 6 — FORMATOS ============ */}
      <section id="formatos" className="bg-[#F5F2E3] text-[#0F0F0F]">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-20 lg:py-28">
          <Reveal>
            <span className="section-badge">05 · Formatos disponibles</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 max-w-3xl font-display text-4xl uppercase md:text-5xl 2xl:text-8xl 2xl:leading-[1.05]">
              Elige el formato que mejor le sirve a tu equipo.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Mic2,
                t: "Keynote",
                meta: "45–60 min",
                d: "Convenciones, kickoffs de ventas, congresos y aperturas o cierres de evento.",
              },
              {
                icon: GraduationCap,
                t: "Masterclass / taller",
                meta: "2–3 h",
                d: "Sesiones prácticas donde el equipo sale con herramientas aplicadas.",
              },
              {
                icon: Building2,
                t: "Programa in-company",
                meta: "Varias sesiones",
                d: "Acompañamiento a un equipo comercial o de marketing en varias sesiones.",
              },
              {
                icon: Users,
                t: "Panel / moderación",
                meta: "Congresos y foros",
                d: "Donde Diego aporta la mirada tech y de negocio.",
              },
            ].map((f, i) => (
              <Reveal key={f.t} delay={0.05 * i}>
                <div className="h-full rounded-2xl border border-black/10 bg-white p-6">
                  <f.icon className="h-6 w-6" />
                  <div className="mt-4 text-xs font-bold uppercase tracking-widest text-black/50">
                    {f.meta}
                  </div>
                  <h3 className="mt-1 font-display text-xl uppercase 2xl:text-3xl 2xl:leading-snug">
                    {f.t}
                  </h3>
                  <p className="mt-2 text-sm text-black/65">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BLOQUE 7 — PÚBLICO OBJETIVO ============ */}
      <section className="bg-[#0F0F0F] text-[#F5F2E3]">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-20 lg:py-28">
          <Reveal>
            <span className="section-badge section-badge-dark">06 · Ideal para</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 max-w-3xl font-display text-4xl uppercase md:text-5xl 2xl:text-8xl 2xl:leading-[1.05]">
              ¿Para quién funciona esta conferencia?
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-3 md:grid-cols-2">
            {[
              "Convenciones anuales y kickoffs de ventas — empresas que reúnen a su fuerza comercial.",
              "Áreas de marketing y transformación digital — buscan actualidad y aplicabilidad.",
              "Retail, ecommerce y consumo masivo — alto volumen y presión por conversión.",
              "Banca, fintech y seguros — fuerte inversión en IA y equipos comerciales grandes.",
              "Startups y scaleups.",
              "Congresos, gremios y universidades — programación de agendas y paneles.",
            ].map((li) => (
              <li
                key={li}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/80"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#EAC945]" />
                <span>{li}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ BLOQUE 8 — RESPALDO ============ */}
      <section className="bg-[#F5F2E3] text-[#0F0F0F]">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-20 lg:py-28">
          <Reveal>
            <span className="section-badge">07 · Respaldo Voz Estratégica</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 max-w-3xl font-display text-4xl uppercase md:text-5xl 2xl:text-8xl 2xl:leading-[1.05]">
              Diego no llega solo:{" "}
              <span className="highlight-yellow">
                <span>llega respaldado por una curaduría.</span>
                <span aria-hidden />
              </span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[
              {
                t: "No es un directorio, es curaduría",
                d: "Ocho voces que conectan negocio y factor humano.",
              },
              {
                t: "Nivel global",
                d: "Presencia en Colombia, México y España, con voces que han estado en escenarios de más de 12 países.",
              },
              { t: "Respuesta rápida", d: "Disponibilidad, tarifa y recomendación a medida." },
              {
                t: "Más allá de la conferencia",
                d: "Si el reto necesita continuidad, extendemos la charla en talleres y programas.",
              },
            ].map((b) => (
              <div key={b.t} className="rounded-2xl border border-black/10 bg-white p-6">
                <h3 className="font-display text-xl uppercase 2xl:text-3xl 2xl:leading-snug">
                  {b.t}
                </h3>
                <p className="mt-2 text-black/65">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BLOQUE 9 — PRUEBA SOCIAL ============ */}
      <section className="bg-[#0F0F0F] text-[#F5F2E3]">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-20 lg:py-24">
          <Reveal>
            <span className="section-badge section-badge-dark">08 · Prueba social</span>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
              <StatCard num="+150" label="conferencias" />
              <StatCard num="+2000" label="clientes atendidos" />
              <StatCard num="4" label="continentes" />
              <StatCard num="+20" label="países" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <figure className="mt-14 border-l-4 border-[#EAC945] pl-6">
              <blockquote className="font-display text-3xl uppercase leading-tight md:text-4xl 2xl:text-7xl 2xl:leading-[1.05]">
                &ldquo;Vender es ayudar a las personas a progresar.&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-sm uppercase tracking-widest text-white/60">
                — Diego Camacho
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-14 grid grid-cols-2 gap-6">
              <LogoStatCard label="Ha trabajado con">
                <GoogleLogo className="h-8 w-auto md:h-10 2xl:h-14" />
              </LogoStatCard>
              <LogoStatCard label="Ha trabajado con">
                <MicrosoftLogo className="h-7 w-auto md:h-9 2xl:h-12" textFill="#FFFFFF" />
              </LogoStatCard>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-14">
              <div className="font-display text-sm uppercase tracking-widest text-white/60 2xl:text-base">
                Conferencias recientes
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  {
                    brand: "SC Johnson",
                    topic: "Ventas & Motivación de equipo",
                    place: "CDMX · Julio 2024",
                  },
                  {
                    brand: "The North Face",
                    topic: "Liderazgo & Ventas de equipo",
                    place: "CDMX · Julio 2024",
                  },
                  {
                    brand: "EXMA Panamá",
                    topic: "IA aplicada a las ventas",
                    place: "Panamá · Junio 2024",
                  },
                ].map((c) => (
                  <div key={c.brand} className="rounded-xl border border-white/15 bg-white/5 p-5">
                    <div className="font-display text-xl uppercase leading-tight text-[#EAC945] 2xl:text-3xl">
                      {c.brand}
                    </div>
                    <div className="mt-2 text-base text-white/85 2xl:text-xl">{c.topic}</div>
                    <div className="mt-3 text-xs uppercase tracking-widest text-white/50">
                      {c.place}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ BLOQUE 10 — CTA FINAL / FORMULARIO ============ */}
      <section id="cotizar" className="bg-[#F5F2E3] text-[#0F0F0F]">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <Reveal>
                <span className="section-badge">09 · Cotiza tu evento</span>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-5 font-display text-4xl uppercase md:text-5xl 2xl:text-8xl 2xl:leading-[1.05]">
                  Cotiza a Diego Camacho{" "}
                  <span className="highlight-yellow">
                    <span>para tu evento en CDMX.</span>
                    <span aria-hidden />
                  </span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-5 max-w-lg text-lg text-black/70">
                  Cuéntanos sobre tu evento y te respondemos por WhatsApp con disponibilidad, tarifa
                  y una propuesta a la medida.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-sm text-black/70">
                  <MapPin className="h-4 w-4 text-[#0F0F0F]" /> Ciudad de México · toda la república
                  · virtual
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm lg:p-8"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nombre y apellido" error={errors.nombre?.message}>
                    <input
                      {...register("nombre")}
                      className="input-base"
                      placeholder="Tu nombre completo"
                    />
                  </Field>
                  <Field label="Empresa" error={errors.empresa?.message}>
                    <input
                      {...register("empresa")}
                      className="input-base"
                      placeholder="Nombre de tu empresa"
                    />
                  </Field>
                  <Field label="Cargo / área" error={errors.cargo?.message}>
                    <input
                      {...register("cargo")}
                      className="input-base"
                      placeholder="Ej: Dir. Comercial, RR.HH."
                    />
                  </Field>
                  <Field label="Tipo de evento" error={errors.tipo_evento?.message}>
                    <select {...register("tipo_evento")} className="input-base" defaultValue="">
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      <option>Convención</option>
                      <option>Congreso</option>
                      <option>In-company</option>
                      <option>Otro</option>
                    </select>
                  </Field>
                  <Field label="Rango de presupuesto" error={errors.presupuesto?.message}>
                    <select {...register("presupuesto")} className="input-base" defaultValue="">
                      <option value="" disabled>
                        Selecciona un rango
                      </option>
                      <option>Hasta $150,000 MXN</option>
                      <option>$150,000 – $300,000 MXN</option>
                      <option>Más de $300,000 MXN</option>
                      <option>Aún por definir</option>
                    </select>
                  </Field>
                  <Field label="Asistentes aproximados" error={errors.asistentes?.message}>
                    <select {...register("asistentes")} className="input-base" defaultValue="">
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      <option>Menos de 100</option>
                      <option>100 – 300</option>
                      <option>300 – 800</option>
                      <option>Más de 800</option>
                    </select>
                  </Field>
                  <Field label="Ciudad y fecha tentativa" error={errors.ciudad_fecha?.message}>
                    <input
                      {...register("ciudad_fecha")}
                      className="input-base"
                      placeholder="Ej: CDMX, marzo 2026"
                    />
                  </Field>
                  <Field label="WhatsApp" error={errors.whatsapp?.message}>
                    <input
                      {...register("whatsapp")}
                      type="tel"
                      className="input-base"
                      placeholder={WHATSAPP_DISPLAY}
                    />
                  </Field>
                </div>

                {/* Campos ocultos de campaña */}
                <input type="hidden" name="gclid" value={campaign.gclid} readOnly />
                <input type="hidden" name="utm_source" value={campaign.utm_source} readOnly />
                <input type="hidden" name="utm_campaign" value={campaign.utm_campaign} readOnly />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0F0F0F] px-6 py-4 text-sm font-bold text-[#F5F2E3] transition hover:bg-black disabled:opacity-60"
                >
                  <MessageSquare className="h-4 w-4" />
                  {isSubmitting ? "Enviando..." : "Escríbenos por WhatsApp"}
                </button>
                {submitted && (
                  <p className="mt-3 rounded-xl bg-[#EAC945]/25 px-4 py-3 text-center text-sm font-semibold text-[#0F0F0F]">
                    ¡Listo! Te escribimos por WhatsApp en breve.
                  </p>
                )}
                <p className="mt-3 text-center text-xs text-black/50">
                  Al enviar, aceptas nuestro{" "}
                  <a href="/aviso-de-privacidad" className="underline hover:text-black">
                    Aviso de Privacidad
                  </a>
                  .
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ BLOQUE 11 — FAQ ============ */}
      <section className="bg-[#0F0F0F] text-[#F5F2E3]">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-20 lg:py-28">
          <Reveal>
            <span className="section-badge section-badge-dark">10 · Preguntas frecuentes</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-4xl uppercase md:text-5xl 2xl:text-8xl 2xl:leading-[1.05]">
              Lo que suelen preguntarnos.
            </h2>
          </Reveal>
          <div className="mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {FAQS.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
                  <span className="font-display text-lg uppercase 2xl:text-2xl 2xl:leading-snug">
                    {f.q}
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#EAC945] transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-white/70">{f.a}</p>
              </details>
            ))}
          </div>

          {/* Closing CTA */}
          <div className="mt-14 rounded-3xl border border-[#EAC945]/30 bg-[#EAC945]/[0.06] p-8 text-center lg:p-10">
            <h3 className="font-display text-3xl uppercase md:text-4xl 2xl:text-7xl 2xl:leading-[1.05]">
              ¿Listo para llevar a Diego a tu convención?
            </h3>
            <a
              href="#cotizar"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#EAC945] px-6 py-3 text-sm font-bold text-[#0F0F0F] transition hover:brightness-110"
            >
              Solicita disponibilidad y tarifa
            </a>
          </div>
        </div>
      </section>

      {/* Footer minimal de campaña — sin nav a otras páginas */}
      <footer className="bg-[#0F0F0F] text-white/70 border-t border-white/10">
        <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Logo className="h-9 w-auto" />
            <span className="text-xs text-white/50">
              © {new Date().getFullYear()} Voz Estratégica
            </span>
          </div>
          <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:gap-6">
            <a href="mailto:contacto@vozestrategica.com" className="hover:text-white transition">
              contacto@vozestrategica.com
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        .input-base {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(15,15,15,0.15);
          background: #fff;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          color: #0F0F0F;
          outline: none;
          transition: border-color .15s;
        }
        .input-base:focus { border-color: #0F0F0F; }
      `}</style>
    </div>
  );
}

function StatCard({
  num,
  label,
  compact = false,
  word = false,
}: {
  num: string;
  label: string;
  compact?: boolean;
  word?: boolean;
}) {
  if (compact) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0F0F0F]/60 p-2.5 text-center">
        <div className="font-display text-xl text-[#EAC945] md:text-2xl 2xl:text-3xl leading-none">
          {num}
        </div>
        <div className="mt-1 text-[9px] uppercase tracking-widest text-white/55 md:text-[10px]">
          {label}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F0F0F]/60 p-5 text-center">
      <div
        className={
          word
            ? "font-display text-3xl uppercase leading-tight text-[#EAC945] md:text-4xl 2xl:text-6xl"
            : "font-display text-4xl text-[#EAC945] md:text-5xl 2xl:text-8xl 2xl:leading-[1.05]"
        }
      >
        {num}
      </div>
      <div className="mt-1 text-xs uppercase tracking-widest text-white/60">{label}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/60">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function LogoStatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F0F0F]/60 p-5 text-center">
      <div className="flex min-h-[72px] items-center justify-center px-2 py-2 md:min-h-[88px] 2xl:min-h-[112px]">
        {children}
      </div>
      <div className="mt-3 text-xs uppercase tracking-widest text-white/60">{label}</div>
    </div>
  );
}
