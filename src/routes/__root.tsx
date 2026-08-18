import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
// Anuncios masterclass Carlos Laguna desactivados temporalmente (reactivar junto con el JSX de abajo)
// import { TopBar } from "@/components/TopBar";
// import { BottomBar } from "@/components/BottomBar";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/CookieConsent";
import { initConsentMode } from "@/lib/consent";
import {
  initMetaPixel,
  trackEvent,
  META_PIXEL_ID,
  trackPageView as trackMetaPageView,
} from "@/lib/meta-pixel";
import { initGA4 } from "@/lib/ga4";
import { trackPageView, trackWhatsAppContact } from "@/lib/analytics";
import { getConsentBootstrapScript, getGTMScripts } from "@/lib/gtm";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl uppercase">Página no encontrada</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          El enlace que buscas no existe o cambió de dirección.
        </p>
        <a href="/" className="bubble bubble-black mt-6 inline-block">
          Ir al inicio
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl uppercase">Algo salió mal</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="bubble bubble-black mt-6"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const gtmScripts = getGTMScripts();
    const consentBootstrap = getConsentBootstrapScript();

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "google-site-verification",
          content: "Ydnk16YEN2evp2xf3wVyZyT3mLVSlv7iT5QLo6fhMYY",
        },
        { title: "Voz Estratégica — Aprendizaje corporativo, liderazgo y transformación" },
        {
          name: "description",
          content:
            "Firma de aprendizaje corporativo en Colombia, México y España. Conferencias, talleres, programas y escuelas que desarrollan personas, fortalecen equipos y generan resultados de negocio.",
        },
        { name: "author", content: "Voz Estratégica" },
        { property: "og:site_name", content: "Voz Estratégica" },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "es_CO" },
        {
          property: "og:title",
          content: "Voz Estratégica — Aprendizaje corporativo, liderazgo y transformación",
        },
        {
          property: "og:description",
          content:
            "Conferencias, talleres, programas y escuelas que transforman organizaciones. Colombia · México · España.",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Voz Estratégica — Aprendizaje corporativo" },
        {
          name: "twitter:description",
          content: "Desarrollamos capacidades que transforman organizaciones.",
        },
      ],
      links: [{ rel: "stylesheet", href: appCss }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Voz Estratégica",
            url: "https://vozestrategica.com",
            description:
              "Firma de aprendizaje corporativo, liderazgo y transformación. Conferencias, talleres, programas y escuelas en Colombia, México y España.",
            areaServed: [
              { "@type": "Country", name: "Colombia" },
              { "@type": "Country", name: "México" },
              { "@type": "Place", name: "Latinoamérica" },
            ],
          }),
        },
        // Consent Mode v2 and dataLayer bootstrap (must load BEFORE GTM)
        {
          children: consentBootstrap,
        },
        // Google Tag Manager (only loads if VITE_GTM_ID is configured)
        ...(gtmScripts.head
          ? [
              {
                children: gtmScripts.head,
              },
            ]
          : []),
      ],
    };
  },

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const gtmScripts = getGTMScripts();

  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* GTM noscript fallback (must be right after opening body) */}
        {gtmScripts.body && (
          <div dangerouslySetInnerHTML={{ __html: gtmScripts.body }} suppressHydrationWarning />
        )}
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
    </QueryClientProvider>
  );
}

function Shell() {
  const location = useLocation();
  const normalizedPathname = (location.pathname.replace(/\/+$/, "") || "/").toLowerCase();

  // Init Consent Mode v2 (denied by default) before any tag loads
  useEffect(() => {
    initConsentMode();
    initMetaPixel();
    initGA4();
  }, []);

  // Track PageView on route change (SPA)
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  const isAdmin = normalizedPathname.startsWith("/admin");
  const isSalesLanding = normalizedPathname.startsWith("/masterclass");
  const isCampaignLanding = normalizedPathname.startsWith("/mx/");
  const hideChrome = isAdmin || isSalesLanding || isCampaignLanding;

  // Todo el embudo de la masterclass (venta, checkout, gracias) va sin barras promocionales.
  const hidePromoBars = isSalesLanding || isCampaignLanding;

  return (
    <>
      {/* Anuncio masterclass Carlos Laguna (desactivado temporalmente) */}
      {/* {!hidePromoBars && <TopBar />} */}
      {!hideChrome && <Header />}
      <main
        style={{
          paddingTop: hideChrome ? "var(--topbar-h, 0px)" : "calc(5rem + var(--topbar-h, 0px))",
          paddingBottom: "var(--bottombar-h, 0px)",
        }}
      >
        <Outlet />
      </main>
      {!hideChrome && <Footer />}
      {/* Anuncio masterclass Carlos Laguna (desactivado temporalmente) */}
      {/* {!hidePromoBars && <BottomBar />} */}
      <Toaster />
      <CookieConsent />
      {/* WhatsApp floating button — hidden on masterclass landing */}
      {!isSalesLanding && (
        <a
          href={
            isCampaignLanding
              ? `https://wa.me/573106598108?text=${encodeURIComponent("Hola, quiero disponibilidad y tarifa de Diego Camacho para un evento en CDMX.")}`
              : "https://wa.me/573106598108?text=%C2%A1Hola!%20Quiero%20una%20propuesta%20de%20aprendizaje%20para%20mi%20equipo%20%28conferencia%2C%20taller%20o%20programa%29."
          }
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          onClick={() => {
            trackEvent("Contact", { method: "whatsapp", placement: "floating" });
            trackWhatsAppContact({ placement: "floating" });
          }}
          className="fixed right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
          style={{ bottom: "calc(1.5rem + var(--bottombar-h, 0px))" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}
      {/* Meta Pixel noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      {/* Editorial grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply opacity-[0.035]"
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>
    </>
  );
}
