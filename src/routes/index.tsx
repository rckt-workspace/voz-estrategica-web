import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { speakers, events, books } from "@/data/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voz Estratégica — Las voces que cambian la conversación" },
      {
        name: "description",
        content:
          "Agencia de speakers que representa conferencistas, autores y pensadores. Encontrá la voz perfecta para tu evento.",
      },
      {
        property: "og:title",
        content: "Voz Estratégica — Las voces que cambian la conversación",
      },
      {
        property: "og:description",
        content:
          "Agencia de speakers que representa conferencistas, autores y pensadores.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const destacados = speakers.filter((s) => s.destacado);
  const marqueeNames = [...speakers, ...speakers].map((s) => s.nombre);

  return (
    <>
      {/* 1. HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-10 h-[36rem] w-[36rem] rounded-full bg-brand/45 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-foreground/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-28 md:pt-28 md:pb-36">
          <Reveal>
            <span className="bubble bubble-outline inline-flex items-center gap-2">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-brand" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              Agencia de Speakers · 2026
            </span>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-10 font-display text-6xl uppercase leading-[0.85] md:text-8xl lg:text-[10rem]">
              Las voces que{" "}
              <span className="highlight-yellow">
                <span>cambian</span>
                <span />
              </span>{" "}
              la conversación.
            </h1>
          </Reveal>

          <Reveal delay={260}>
            <p className="mt-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Representamos a los conferencistas, autores y pensadores que dejan
              marca. Curamos cada propuesta para que tu evento se recuerde mucho
              después del aplauso final.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link
                to="/speakers"
                className="bubble bubble-black group inline-flex items-center gap-2 px-6 py-3 text-base transition-transform hover:scale-105"
              >
                Ver catálogo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contratar"
                className="bubble bubble-yellow group inline-flex items-center gap-2 px-6 py-3 text-base transition-transform hover:scale-105"
              >
                Contratar speaker
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={600}>
            <div className="mt-24 grid grid-cols-2 gap-px overflow-hidden border-y border-foreground/15 bg-foreground/15 md:grid-cols-4">
              {[
                ["+1.500", "Conferencias dictadas"],
                ["14", "Países"],
                ["+500K", "Vidas impactadas"],
                ["5", "Voces curadas"],
              ].map(([n, l]) => (
                <div key={l} className="bg-background px-2 py-6">
                  <div className="font-display text-4xl md:text-5xl">{n}</div>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. MARQUEE — multi-treatment editorial */}
      <section className="relative -mt-4 overflow-hidden border-y border-foreground/15 bg-background py-10">
        <div className="flex w-[200%] animate-marquee items-center whitespace-nowrap">
          {marqueeNames.map((name, i) => {
            const treatment = i % 4;
            const cls =
              treatment === 0
                ? "text-foreground"
                : treatment === 1
                ? "text-brand"
                : treatment === 2
                ? "text-transparent [-webkit-text-stroke:1.5px_var(--foreground)]"
                : "text-foreground/25";
            return (
              <span key={`${name}-${i}`} className="flex items-center">
                <span className={`mx-8 font-display text-5xl uppercase md:text-8xl ${cls}`}>{name}</span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-7 w-7 md:h-10 md:w-10 shrink-0 ${
                    treatment % 2 === 0 ? "text-foreground" : "text-brand"
                  } ${treatment === 3 ? "opacity-20" : ""}`}
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 2 L13.2 10.8 L22 12 L13.2 13.2 L12 22 L10.8 13.2 L2 12 L10.8 10.8 Z" />
                </svg>
              </span>
            );
          })}
        </div>
      </section>

      {/* 3. SPEAKERS DESTACADOS — editorial offset grid */}
      <section className="relative mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="section-badge">01 · Talento</span>
            <div className="h-px flex-1 bg-foreground/15" />
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal delay={100}>
            <h2 className="font-display text-5xl uppercase leading-[0.85] md:text-7xl">
              Speakers<br />destacados
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="max-w-sm text-muted-foreground md:text-lg">
              Una selección curada de las voces que mejor representan lo que
              hacemos. Cada perfil incluye charlas, libros y agenda.
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-3">
          {destacados.map((s, i) => (
            <Reveal key={s.slug} delay={i * 80}>
              <Link
                to="/speakers/$slug"
                params={{ slug: s.slug }}
                className={`group block ${i === 1 ? "md:mt-24" : ""}`}
              >
                <div className="relative mb-6 aspect-[3/4] overflow-hidden bg-foreground/5">
                  <img
                    src={s.foto}
                    alt={`Retrato de ${s.nombre}`}
                    loading="lazy"
                    width={768}
                    height={1024}
                    className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <div className="absolute right-4 top-4 rounded-full bg-background/90 px-3 py-1 font-mono text-[10px] font-bold tracking-widest backdrop-blur">
                    0{i + 1} / 0{destacados.length}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                      {s.especialidad}
                    </div>
                    <div className="mt-2 font-display text-3xl uppercase leading-none md:text-4xl">
                      {s.nombre}
                    </div>
                    <div className="mt-3 h-px w-0 bg-foreground transition-all duration-500 group-hover:w-full" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <div className="mt-20 text-center">
            <Link to="/speakers" className="bubble bubble-outline">
              Ver todos los speakers →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* 4. PRÓXIMOS EVENTOS (dark) */}
      <section className="relative overflow-hidden bg-foreground py-28 text-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-20 h-[28rem] w-[28rem] rounded-full bg-brand/20 blur-3xl"
        />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="section-badge section-badge-dark">02 · Agenda</span>
              <div className="h-px flex-1 bg-background/15" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-8 font-display text-5xl uppercase md:text-8xl">
              Próximos eventos
            </h2>
          </Reveal>

          <ul className="mt-16 divide-y divide-background/15">
            {events.map((ev, i) => (
              <Reveal as="li" key={ev.id} delay={i * 80}>
                <Link
                  to="/eventos"
                  className="group flex flex-col gap-4 py-8 transition-all duration-500 hover:bg-background/5 hover:px-6 md:flex-row md:items-center md:gap-10"
                >
                  <div className="font-mono text-sm font-bold uppercase tracking-widest text-brand md:w-40">
                    {formatDate(ev.fecha)}
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-2xl uppercase md:text-3xl">
                      {ev.titulo}
                    </div>
                    <div className="mt-2 text-sm text-background/60">
                      {ev.ciudad} · {ev.descripcion}
                    </div>
                  </div>
                  <ArrowUpRight className="h-6 w-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. LIBROS + VOZ EDITORIAL */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="section-badge">03 · Publicaciones</span>
                <div className="h-px flex-1 bg-foreground/15" />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-8 font-display text-5xl uppercase md:text-6xl">
                Libros publicados
              </h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-4">
              {books.map((b, i) => (
                <Reveal key={b.id} delay={i * 80}>
                  <Link
                    to="/libros"
                    className="group block overflow-hidden rounded-2xl bg-foreground/5"
                  >
                    <img
                      src={b.portada}
                      alt={`Portada de ${b.titulo}`}
                      loading="lazy"
                      width={768}
                      height={1024}
                      className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={200}>
            <div className="flex aspect-square flex-col justify-between rounded-[60px] bg-brand p-10 md:p-14">
              <span className="bubble bubble-black w-fit">Voz Editorial</span>
              <div>
                <h3 className="font-display text-5xl uppercase leading-[0.9] md:text-7xl">
                  Escribir el futuro hoy.
                </h3>
                <p className="mt-6 max-w-md text-foreground/80 md:text-lg">
                  Acompañamos a nuestros speakers a convertir sus ideas en
                  libros, ensayos y manifiestos que extienden la conversación
                  más allá del escenario.
                </p>
                <Link
                  to="/libros"
                  className="mt-8 inline-flex items-center gap-2 font-bold underline underline-offset-4 hover:gap-3 transition-all"
                >
                  Conocer el catálogo <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[60px] bg-brand px-8 py-24 text-center md:px-16 md:py-32">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-foreground/10 blur-3xl"
            />
            <h2 className="relative font-display text-4xl uppercase leading-tight md:text-7xl">
              ¿Tu evento necesita una voz que se recuerde?
            </h2>
            <p className="relative mx-auto mt-6 max-w-xl text-foreground/80 md:text-lg">
              Contános el contexto y te armamos una propuesta a medida en menos
              de 48 horas.
            </p>
            <Link
              to="/contratar"
              className="relative mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-bold text-background transition-transform hover:scale-105"
            >
              Solicitar propuesta <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d
    .toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase()
    .replace(/\./g, "");
}
