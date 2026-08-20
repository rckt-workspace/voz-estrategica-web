import { useEffect, useState } from "react";

/**
 * Lee (solo lectura del DOM) la primera tarjeta que Soro ya renderizó
 * para mostrarla como "featured post" en el hero, y cuenta los artículos.
 * No modifica canonicals, head(), JSON-LD ni el observer de SEO.
 */
type Featured = {
  href: string;
  image: string | null;
  title: string;
  date: string;
  total: number;
};

export function BlogHeroFeatured() {
  const [data, setData] = useState<Featured | null>(null);

  useEffect(() => {
    const container = document.getElementById("soro-blog");
    if (!container) return;

    const read = () => {
      // En vista de artículo no hay listado: no mostramos featured.
      if (container.querySelector(".soro-blog-article")) {
        container.removeAttribute("data-featured-lifted");
        setData(null);
        return;
      }
      const cards = container.querySelectorAll<HTMLAnchorElement>(".soro-blog-card");
      const first = cards[0];
      if (!first) {
        container.removeAttribute("data-featured-lifted");
        setData(null);
        return;
      }
      const img = first.querySelector<HTMLImageElement>(".soro-blog-card-image");
      const title = first.querySelector(".soro-blog-card-title")?.textContent?.trim() ?? "";
      const date = first.querySelector(".soro-blog-card-date")?.textContent?.trim() ?? "";
      container.setAttribute("data-featured-lifted", "true");
      setData({
        href: first.getAttribute("href") ?? "/blog",
        image: img?.getAttribute("src") ?? null,
        title,
        date,
        total: cards.length,
      });
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats reales */}
      <div className="flex flex-wrap gap-2">
        <span className="section-badge">{data.total} artículos</span>
        <span className="section-badge">Actualizado semanalmente</span>
      </div>

      <a
        href={data.href}
        className="group block overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-[0_24px_50px_-30px_color-mix(in_oklab,var(--foreground)_50%,transparent)]"
      >
        {data.image ? (
          <img
            src={data.image}
            alt={data.title}
            className="aspect-[16/10] w-full border-b border-border object-cover"
            loading="lazy"
          />
        ) : null}
        <div className="flex flex-col gap-3 p-6">
          <span className="section-badge w-fit bg-brand text-brand-foreground">
            Último artículo
          </span>
          <h2 className="font-display text-2xl uppercase leading-[1.02] md:text-3xl">
            {data.title}
          </h2>
          {data.date ? (
            <p className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {data.date}
            </p>
          ) : null}
          <span className="bubble bubble-yellow w-fit opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Leer artículo →
          </span>
        </div>
      </a>
    </div>
  );
}
