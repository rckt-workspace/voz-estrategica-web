import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/blog")({
  head: () => {
    // During SSR, we always include the list view canonical
    // Client-side, if viewing a post (?post=), Soro will add its own canonical
    return {
      meta: [
        { title: "Blog · Voz Estratégica" },
        {
          name: "description",
          content:
            "Artículos, insights y recursos sobre liderazgo, comunicación, cultura y transformación organizacional.",
        },
        { property: "og:title", content: "Blog · Voz Estratégica" },
        {
          property: "og:description",
          content: "Aprendizaje corporativo en artículos de alto impacto.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://vozestrategica.com/blog" },
      ],
      links: [{ rel: "canonical", href: "https://vozestrategica.com/blog" }],
    };
  },
  component: Blog,
});

function Blog() {
  useEffect(() => {
    // Soro official embed script URL
    const SORO_SCRIPT_URL =
      "https://app.trysoro.com/api/embed/7e9befdb-eb37-40d0-8b6a-6043898f81d9";
    const BASE_CANONICAL = "https://vozestrategica.com/blog";

    // Prevent duplicate script injection
    const existingScript = document.querySelector(`script[src="${SORO_SCRIPT_URL}"]`);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = SORO_SCRIPT_URL;
      script.defer = true;
      script.async = false;
      document.body.appendChild(script);
    }

    // Manage canonicals: ensure only one exists at a time
    // When Soro adds its canonical (data-soro), remove ours
    // When back at list view, ensure ours is present
    const syncCanonicals = () => {
      const soroCanonical = document.querySelector('link[rel="canonical"][data-soro]');
      const allCanonicals = Array.from(
        document.querySelectorAll('link[rel="canonical"]')
      );

      if (soroCanonical) {
        // Article view: keep only Soro's canonical
        allCanonicals.forEach((canonical) => {
          if (!canonical.hasAttribute("data-soro")) {
            canonical.remove();
          }
        });
      } else {
        // List view: ensure we have our base canonical
        const hasBaseCanonical = allCanonicals.some(
          (c) => c.href === BASE_CANONICAL
        );
        if (!hasBaseCanonical && allCanonicals.length > 0) {
          // Remove any non-Soro canonicals
          allCanonicals.forEach((c) => c.remove());
        }
        // Add our canonical if missing
        if (
          !document.querySelector(`link[rel="canonical"][href="${BASE_CANONICAL}"]`)
        ) {
          const canonical = document.createElement("link");
          canonical.rel = "canonical";
          canonical.href = BASE_CANONICAL;
          document.head.appendChild(canonical);
        }
      }
    };

    // Initial sync
    syncCanonicals();

    // Watch for changes in <head> when Soro adds/removes canonicals
    const observer = new MutationObserver(syncCanonicals);
    observer.observe(document.head, {
      childList: true,
      subtree: false,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="font-display text-4xl sm:text-5xl uppercase leading-tight">
            Blog
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl">
            Artículos, insights y recursos sobre liderazgo, comunicación, cultura y
            transformación organizacional.
          </p>
        </div>
      </header>

      {/* Soro Widget Container - Official HTML from Soro */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div id="soro-blog" className="min-h-[600px]">
          {/* Soro script will render content here */}
        </div>
      </main>
    </div>
  );
}
