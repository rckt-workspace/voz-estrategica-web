import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { speakers } from "@/data/content";

const BASE_URL = "https://vozestrategica.com";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/nosotros", changefreq: "monthly", priority: "0.7" },
          { path: "/speakers", changefreq: "weekly", priority: "0.9" },
          { path: "/conferencistas", changefreq: "weekly", priority: "0.8" },
          { path: "/eventos", changefreq: "weekly", priority: "0.8" },
          { path: "/libros", changefreq: "monthly", priority: "0.7" },
          { path: "/casos", changefreq: "monthly", priority: "0.7" },
          { path: "/soluciones", changefreq: "monthly", priority: "0.8" },
          { path: "/programas", changefreq: "monthly", priority: "0.8" },
          { path: "/recursos", changefreq: "weekly", priority: "0.7" },
          { path: "/contratar", changefreq: "monthly", priority: "0.8" },
          { path: "/masterclass-de-clientes-a-fans", changefreq: "weekly", priority: "0.8" },
          { path: "/mx/diego-camacho", changefreq: "monthly", priority: "0.8" },
          { path: "/aviso-de-privacidad", changefreq: "yearly", priority: "0.3" },
          { path: "/terminos-y-condiciones", changefreq: "yearly", priority: "0.3" },
          { path: "/speakers/diego-camacho/mexico", changefreq: "monthly", priority: "0.9" },
          ...speakers.map<SitemapEntry>((s) => ({
            path: `/speakers/${s.slug}`,
            changefreq: "monthly",
            priority: "0.8",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
