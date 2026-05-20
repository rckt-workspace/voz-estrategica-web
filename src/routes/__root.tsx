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
    </>
  );
}
