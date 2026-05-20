import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { speakers, tematicas } from "@/data/content";

export const Route = createFileRoute("/speakers/")({
  head: () => ({
    meta: [
      { title: "Speakers — Voz Estratégica" },
      {
        name: "description",
        content:
          "Conocé a los conferencistas, autores y pensadores que representamos. Filtrá por temática.",
      },
      { property: "og:title", content: "Speakers — Voz Estratégica" },
      {
        property: "og:description",
        content: "Catálogo curado de speakers de Voz Estratégica.",
      },
    ],
  }),
  component: SpeakersPage,
});

function SpeakersPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const list = filter ? speakers.filter((s) => s.tematicas.includes(filter)) : speakers;

  return (
    <>
      <PageHero
        badge="Catálogo · Speakers"
        titulo={
          <>
            Voces que{" "}
            <span className="highlight-yellow">
              <span>importan</span>
              <span />
            </span>
            .
          </>
        }
        descripcion="Cada speaker es seleccionado por su trayectoria, su capacidad de comunicar y su impacto medible en eventos corporativos y públicos."
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`bubble ${filter === null ? "bubble-black" : "bubble-outline"}`}
          >
            Todas
          </button>
          {tematicas.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`bubble ${filter === t ? "bubble-black" : "bubble-outline"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Reveal key={s.slug} delay={i * 60}>
              <Link
                to="/speakers/$slug"
                params={{ slug: s.slug }}
                className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-foreground/5"
              >
                <img
                  src={s.foto}
                  alt={`Retrato de ${s.nombre}`}
                  loading="lazy"
                  width={768}
                  height={1024}
                  className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-background">
                  <div className="text-xs font-bold uppercase tracking-widest text-brand">
                    {s.especialidad}
                  </div>
                  <div className="mt-2 font-display text-3xl uppercase">
                    {s.nombre}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.tematicas.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-background/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                    Ver perfil <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">
            No hay speakers en esa temática todavía.
          </p>
        ) : null}
      </section>
    </>
  );
}
