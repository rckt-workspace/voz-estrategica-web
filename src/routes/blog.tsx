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

    // Update a meta tag by property name
    const updateMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

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

    // Sync Open Graph tags based on view (article or list)
    const syncOpenGraph = () => {
      const soroCanonical = document.querySelector('link[rel="canonical"][data-soro]');

      if (soroCanonical) {
        // Article view: extract data from DOM and update og: tags
        const title = document.title || "Article";
        const description =
          document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
        const url = soroCanonical.href;

        // Extract image from Soro's JSON-LD (#soro-blog-jsonld)
        let image = "";
        const jsonld = document.querySelector("#soro-blog-jsonld");
        if (jsonld?.textContent) {
          try {
            const parsed = JSON.parse(jsonld.textContent);
            if (parsed.image) {
              image =
                typeof parsed.image === "string"
                  ? parsed.image
                  : Array.isArray(parsed.image)
                    ? parsed.image[0]
                    : "";
            }
          } catch (e) {
            // Silently ignore JSON parse errors
          }
        }

        // Fallback: try to find image from article element
        if (!image) {
          const imgElement = document.querySelector(".soro-blog-article-image");
          if (imgElement instanceof HTMLImageElement) {
            image = imgElement.src;
          }
        }

        // Update og: tags for article
        updateMetaTag("og:title", title);
        updateMetaTag("og:description", description);
        updateMetaTag("og:url", url);
        updateMetaTag("og:type", "article");
        if (image) {
          updateMetaTag("og:image", image);
        }
      } else {
        // List view: restore original og: tags
        updateMetaTag("og:title", "Blog · Voz Estratégica");
        updateMetaTag("og:description", "Aprendizaje corporativo en artículos de alto impacto.");
        updateMetaTag("og:url", "https://vozestrategica.com/blog");
        updateMetaTag("og:type", "website");
        // Remove og:image in list view
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          ogImage.remove();
        }
      }
    };

    // Initial sync
    syncCanonicals();
    syncOpenGraph();

    // Watch for changes in <head> when Soro adds/removes canonicals and updates title/description
    const observer = new MutationObserver(() => {
      syncCanonicals();
      syncOpenGraph();
    });
    observer.observe(document.head, {
      childList: true,
      subtree: false,
      attributes: true,
      attributeFilter: ["content"],
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
