import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createMasterclassCheckout } from "@/lib/masterclass-checkout.functions";
import {
  KIT_PRICE_COP,
  KIT_PRICE_USD,
  MASTERCLASS_PRICE_COP,
  MASTERCLASS_PRICE_LABEL,
  formatCOP,
} from "@/lib/masterclass-checkout";
import { attachBoldCloseListeners } from "@/lib/bold-checkout";
import { trackEvent } from "@/lib/meta-pixel";
import { trackGA4Event } from "@/lib/ga4";

const GREEN = "#40ed51";
const BLACK = "#0e0f0c";
const BOLD_SCRIPT_SRC = "https://checkout.bold.co/library/boldPaymentButton.js";

export const Route = createFileRoute("/masterclass/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout · Vender sin perseguir clientes | USD 19" },
      {
        name: "description",
        content:
          "Completa tu compra de la grabación completa 'Vender sin perseguir clientes' por USD 19. Pago seguro con Bold: tarjeta, PSE, Nequi o transferencia.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Checkout · Vender sin perseguir clientes" },
      {
        property: "og:description",
        content: "Grabación completa por USD 19. Acceso inmediato y permanente.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Checkout · Vender sin perseguir clientes" },
      {
        name: "twitter:description",
        content: "Grabación completa por USD 19. Acceso inmediato y permanente.",
      },
    ],
  }),
  component: CheckoutPage,
});

function loadBoldLibrary(): Promise<void> {
  if (window.BoldCheckout) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${BOLD_SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.BoldCheckout) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Bold no cargó")), { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = BOLD_SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Bold no cargó"));
    document.head.appendChild(s);
  });
}

function CheckoutPage() {
  const create = useServerFn(createMasterclassCheckout);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [kit, setKit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Reutiliza la orden si el usuario cierra el checkout y reintenta con los mismos datos.
  const lastOrderRef = useRef<{
    key: string;
    order: Awaited<ReturnType<typeof createMasterclassCheckout>>;
  } | null>(null);

  // Bold cobra una sola moneda por transacción: el total real se procesa en COP.
  const totalCOP = useMemo(() => MASTERCLASS_PRICE_COP + (kit ? KIT_PRICE_COP : 0), [kit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (nombre.trim().length < 2) {
      setError("Escribe tu nombre completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Escribe un correo electrónico válido: ahí enviamos tu acceso y el recibo.");
      return;
    }

    setLoading(true);
    const key = JSON.stringify({ nombre: nombre.trim(), email: email.trim().toLowerCase(), kit });
    try {
      await loadBoldLibrary();
      const cached = lastOrderRef.current;
      const order =
        cached && cached.key === key
          ? cached.order
          : await create({ data: { nombre: nombre.trim(), email: email.trim(), kit } });
      lastOrderRef.current = { key, order };

      trackEvent("InitiateCheckout", {
        content_name: order.description,
        value: totalCOP,
        currency: "COP",
      });
      trackGA4Event("begin_checkout", {
        content_name: order.description,
        value: totalCOP,
        currency: "COP",
      });

      try {
        sessionStorage.setItem(
          "bold:last-order",
          JSON.stringify({
            orderId: order.orderId,
            amount: order.amount,
            currency: order.currency,
            description: order.description,
          }),
        );
      } catch {
        /* ignore */
      }

      if (!window.BoldCheckout) throw new Error("Bold no está disponible");

      let cleanup = () => {};
      const finish = () => {
        cleanup();
        setLoading(false);
      };
      const checkout = new window.BoldCheckout({
        apiKey: order.apiKey,
        amount: order.amount,
        currency: order.currency,
        orderId: order.orderId,
        integritySignature: order.integritySignature,
        description: order.description,
        redirectionUrl: `${window.location.origin}/masterclass/gracias`,
        originUrl: window.location.href,
        renderMode: "embedded",
        onSuccess: finish,
        onFailed: () => {
          finish();
          setError("El pago no se completó. Puedes intentarlo de nuevo con otro método de pago.");
        },
        onPending: finish,
        onClose: finish,
        onDismiss: finish,
      });
      cleanup = attachBoldCloseListeners(finish);
      checkout.open();
      setLoading(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen px-5 py-10"
      style={{ backgroundColor: BLACK, color: "#fff", fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="mx-auto w-full max-w-xl">
        <Link
          to="/masterclass-de-clientes-a-fans"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold leading-tight md:text-4xl">
          Completa tu compra
        </h1>

        {/* 1. Resumen */}
        <section className="mt-6 rounded-lg border border-white/15 bg-white/[0.04] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            Tu pedido
          </p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <p className="font-bold">Vender sin perseguir clientes — Grabación completa</p>
              <p className="mt-1 text-sm text-white/60">Acceso inmediato y permanente</p>
            </div>
            <p className="shrink-0 font-extrabold">{MASTERCLASS_PRICE_LABEL}</p>
          </div>

          {kit && (
            <div className="mt-4 flex items-start justify-between gap-4 border-t border-white/10 pt-4">
              <p className="text-sm font-bold">Kit de Ejecución (imprimible)</p>
              <p className="shrink-0 font-extrabold">USD {KIT_PRICE_USD}</p>
            </div>
          )}

          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-white/15 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
              Total
            </span>
            <span className="text-right">
              <span className="block text-3xl font-extrabold leading-none" style={{ color: GREEN }}>
                {MASTERCLASS_PRICE_LABEL}
              </span>
              {kit && (
                <span className="mt-1 block text-lg font-extrabold" style={{ color: GREEN }}>
                  + USD {KIT_PRICE_USD}
                </span>
              )}
            </span>
          </div>

          {kit && (
            <p className="mt-3 text-xs text-white/50">
              El cobro se procesa en una sola transacción en pesos colombianos:{" "}
              {formatCOP(totalCOP)}.
            </p>
          )}
        </section>

        {/* 2. Order bump */}
        <button
          type="button"
          onClick={() => setKit((v) => !v)}
          aria-pressed={kit}
          className="mt-5 flex w-full items-start gap-3 rounded-lg border-2 border-dashed p-5 text-left transition-colors"
          style={{
            borderColor: kit ? GREEN : "rgba(64,237,81,0.45)",
            backgroundColor: "rgba(64,237,81,0.07)",
          }}
        >
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2"
            style={{ borderColor: GREEN, backgroundColor: kit ? GREEN : "transparent" }}
          >
            {kit && <Check className="h-3.5 w-3.5" style={{ color: BLACK }} strokeWidth={3} />}
          </span>
          <span>
            <span
              className="block text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: GREEN }}
            >
              Añade y ahorra tiempo
            </span>
            <span className="mt-1 block text-sm font-bold">
              Añade el Kit de Ejecución por solo USD {KIT_PRICE_USD} más
            </span>
            <span className="mt-1 block text-sm text-white/70">
              Las 2 matrices, los prompts y la guía de preguntas en versión imprimible.
            </span>
          </span>
        </button>

        {/* 5. Datos mínimos */}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
              Nombre completo
            </span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-md border border-white/20 bg-white/[0.06] px-4 py-3 text-base text-white outline-none focus:border-[#40ed51]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
              Correo electrónico
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-md border border-white/20 bg-white/[0.06] px-4 py-3 text-base text-white outline-none focus:border-[#40ed51]"
            />
            <span className="mt-1.5 block text-xs text-white/50">
              Ahí te enviamos el acceso y el recibo.
            </span>
          </label>

          {/* 7. Error + reintento (los datos se conservan) */}
          {error && (
            <div className="rounded-md border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
              <p>{error}</p>
              <button
                type="submit"
                className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-[6px] px-5 text-sm font-bold uppercase tracking-wide"
                style={{ backgroundColor: GREEN, color: BLACK }}
              >
                Reintentar el pago
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[6px] px-6 text-[15px] font-extrabold uppercase tracking-wide disabled:opacity-70"
            style={{ backgroundColor: GREEN, color: BLACK }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>Pagar {formatCOP(totalCOP)} →</>
            )}
          </button>
        </form>

        {/* 4. Métodos de pago */}
        <div className="mt-5 flex flex-col items-center gap-2 text-center">
          <p className="inline-flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="h-4 w-4" style={{ color: GREEN }} /> Pago seguro con Bold
          </p>
          <p className="text-xs text-white/50">
            Tarjeta de crédito y débito · PSE · Nequi · Transferencia bancaria
          </p>
        </div>
      </div>
    </main>
  );
}
