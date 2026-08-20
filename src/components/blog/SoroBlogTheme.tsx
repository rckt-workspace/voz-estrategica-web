/**
 * Estilos visuales para el contenido inyectado por Soro.
 * Solo presentación: consume los tokens de src/styles.css (nada de hex nuevos).
 * No altera la lógica del embed, canonicals ni JSON-LD.
 */
const css = `
#soro-blog .soro-blog,
#soro-blog .soro-blog-content {
  background: transparent;
  max-width: 100%;
  color: var(--foreground);
  font-family: var(--font-sans);
}

/* ---------- Listado ---------- */
#soro-blog .soro-blog-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 640px) {
  #soro-blog .soro-blog-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  #soro-blog .soro-blog-list { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

#soro-blog .soro-blog-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background-color: var(--card);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) + 8px);
  box-shadow: 0 1px 2px color-mix(in oklab, var(--foreground) 6%, transparent);
  padding: 0;
  gap: 0;
  text-decoration: none;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}
#soro-blog .soro-blog-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in oklab, var(--foreground) 28%, transparent);
  box-shadow: 0 22px 46px -26px color-mix(in oklab, var(--foreground) 50%, transparent);
}
#soro-blog .soro-blog-card:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

/* Micro-CTA en hover */
#soro-blog .soro-blog-card-content::after {
  content: "Leer artículo →";
  align-self: flex-start;
  margin-top: 0.35rem;
  padding: 0.3rem 0.85rem;
  border-radius: 9999px;
  background-color: var(--brand);
  color: var(--brand-foreground);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}
#soro-blog .soro-blog-card:hover .soro-blog-card-content::after,
#soro-blog .soro-blog-card:focus-visible .soro-blog-card-content::after {
  opacity: 1;
  transform: translateY(0);
}

/* La primera tarjeta se muestra como featured en el hero */
#soro-blog[data-featured-lifted] .soro-blog-card:first-child {
  display: none;
}


#soro-blog .soro-blog-card-image {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  flex-shrink: 1;
  object-fit: cover;
  margin: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--border);
}

#soro-blog .soro-blog-card-content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1.25rem 1.35rem 1.4rem;
}

#soro-blog .soro-blog-card-title {
  font-family: var(--font-display);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.02;
  font-size: 1.4rem;
  margin: 0;
  color: var(--foreground);
  position: relative;
  display: inline;
  background-image: linear-gradient(var(--brand), var(--brand));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 0.28em;
  transition: background-size 0.3s ease;
  padding-bottom: 0.05em;
}
#soro-blog .soro-blog-card:hover .soro-blog-card-title { background-size: 100% 0.28em; }

#soro-blog .soro-blog-card-excerpt {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--muted-foreground);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

#soro-blog .soro-blog-card-date,
#soro-blog .soro-blog-article-date {
  margin-top: auto;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in oklab, var(--foreground) 55%, transparent);
}

/* Destacado: primera tarjeta a ancho completo */
@media (min-width: 1024px) {
  #soro-blog .soro-blog-card:first-child {
    grid-column: span 3;
    flex-direction: row;
    align-items: stretch;
    background-color: var(--brand);
    color: var(--brand-foreground);
    border-color: color-mix(in oklab, var(--foreground) 18%, transparent);
  }
  #soro-blog .soro-blog-card:first-child .soro-blog-card-image {
    width: 46%;
    height: auto;
    min-height: 22rem;
    aspect-ratio: auto;
    align-self: stretch;
    border-bottom: 0;
    border-right: 1px solid color-mix(in oklab, var(--foreground) 15%, transparent);
  }
  #soro-blog .soro-blog-card:first-child .soro-blog-card-content {
    justify-content: center;
    gap: 1rem;
    padding: 2.75rem 3rem;
  }
  #soro-blog .soro-blog-card:first-child .soro-blog-card-title {
    font-size: clamp(1.9rem, 3vw, 2.9rem);
    color: var(--brand-foreground);
    background-image: linear-gradient(var(--brand-foreground), var(--brand-foreground));
  }
  #soro-blog .soro-blog-card:first-child .soro-blog-card-excerpt {
    font-size: 1.05rem;
    color: color-mix(in oklab, var(--brand-foreground) 78%, transparent);
    -webkit-line-clamp: 3;
  }
  #soro-blog .soro-blog-card:first-child .soro-blog-card-date {
    margin-top: 0;
    color: color-mix(in oklab, var(--brand-foreground) 70%, transparent);
  }
}

/* ---------- Vista de artículo ---------- */
#soro-blog .soro-blog-header { margin-bottom: 2rem; }
#soro-blog .soro-blog-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in oklab, var(--foreground) 20%, transparent);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--foreground);
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
#soro-blog .soro-blog-back:hover {
  background-color: var(--brand);
  color: var(--brand-foreground);
  border-color: var(--brand);
}

#soro-blog .soro-blog-article {
  max-width: 720px;
  margin: 0 auto;
  color: var(--foreground);
}
#soro-blog .soro-blog-article-image {
  width: 100%;
  max-height: 26rem;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: calc(var(--radius) + 12px);
  border: 1px solid var(--border);
  margin-bottom: 2rem;
}
#soro-blog .soro-blog-article-title {
  font-family: var(--font-display);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 0.98;
  font-size: clamp(2.1rem, 5vw, 3.4rem);
  margin: 0 0 1.25rem;
  color: var(--foreground);
}
#soro-blog .soro-blog-article > .soro-blog-article-date {
  display: inline-flex;
  align-items: center;
  margin: 0 0 2.25rem;
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  background-color: var(--secondary);
  color: var(--secondary-foreground);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: normal;
  text-transform: none;
}

#soro-blog .soro-blog-article-content {
  font-family: var(--font-sans);
  font-size: 1.0625rem;
  line-height: 1.85;
  color: color-mix(in oklab, var(--foreground) 88%, transparent);
}
#soro-blog .soro-blog-article-content > * + * { margin-top: 1.25rem; }
#soro-blog .soro-blog-article-content h2,
#soro-blog .soro-blog-article-content h3 {
  font-family: var(--font-display);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--foreground);
  margin-top: 2.75rem;
}
#soro-blog .soro-blog-article-content h2 { font-size: clamp(1.6rem, 3vw, 2.1rem); }
#soro-blog .soro-blog-article-content h3 { font-size: 1.35rem; }
#soro-blog .soro-blog-article-content a {
  color: var(--foreground);
  text-decoration: none;
  box-shadow: inset 0 -0.35em 0 var(--brand);
}
#soro-blog .soro-blog-article-content strong { color: var(--foreground); }
#soro-blog .soro-blog-article-content ul,
#soro-blog .soro-blog-article-content ol {
  padding-left: 1.35rem;
  display: grid;
  gap: 0.5rem;
}
#soro-blog .soro-blog-article-content ul { list-style: disc; }
#soro-blog .soro-blog-article-content ol { list-style: decimal; }
#soro-blog .soro-blog-article-content img {
  width: 100%;
  border-radius: calc(var(--radius) + 8px);
  border: 1px solid var(--border);
}
#soro-blog .soro-blog-article-content blockquote {
  border-left: 3px solid var(--brand);
  padding-left: 1.25rem;
  font-size: 1.15rem;
  font-style: italic;
  color: var(--foreground);
}

/* ---------- Estados ---------- */
#soro-blog .soro-blog-loading,
#soro-blog .soro-blog-empty,
#soro-blog .soro-blog-error {
  font-family: var(--font-sans);
  color: var(--muted-foreground);
  text-align: center;
  padding: 4rem 0;
}
#soro-blog .soro-blog-spinner {
  border-color: color-mix(in oklab, var(--foreground) 15%, transparent);
  border-top-color: var(--brand);
}

/* En vista de artículo el hero del listado no se repite */
body:has(#soro-blog .soro-blog-article) [data-blog-hero] { display: none; }
`;

export function SoroBlogTheme() {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
