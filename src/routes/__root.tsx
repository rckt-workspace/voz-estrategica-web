import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <span className="bubble bubble-yellow mb-6">404</span>
        <h1 className="font-display text-6xl uppercase">Página no encontrada</h1>
        <p className="mt-4 text-muted-foreground">
          Lo que buscás se mudó o nunca existió. Volvé al inicio y seguimos.
        </p>
        <Link to="/" className="bubble bubble-black mt-8 inline-flex">
          Volver al inicio →
        </Link>
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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Voz Estratégica — Agencia de Speakers" },
      {
        name: "description",
        content:
          "Voz Estratégica representa a las voces que cambian la conversación. Speakers, autores y pensadores para eventos memorables.",
      },
      { name: "author", content: "Voz Estratégica" },
      { property: "og:title", content: "Voz Estratégica — Agencia de Speakers" },
      {
        property: "og:description",
        content: "Las voces que cambian la conversación.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Voz Estratégica — Agencia de Speakers" },
      { name: "description", content: "Builds custom websites from provided documents and user specifications." },
      { property: "og:description", content: "Builds custom websites from provided documents and user specifications." },
      { name: "twitter:description", content: "Builds custom websites from provided documents and user specifications." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e68159af-e2d5-44ba-bec4-b63780d2c172/id-preview-45c8318d--ddd88a09-a827-4674-9d07-9b436ebe02b4.lovable.app-1779297343150.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e68159af-e2d5-44ba-bec4-b63780d2c172/id-preview-45c8318d--ddd88a09-a827-4674-9d07-9b436ebe02b4.lovable.app-1779297343150.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const location = useLocation();

  // Cache invalidation on auth state change
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <Header />
      <main className={isAdmin ? "" : "pt-20"}>
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      {/* Editorial grain overlay */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply opacity-[0.035]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>
    </>
  );
}
