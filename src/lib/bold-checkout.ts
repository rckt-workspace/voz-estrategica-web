import { createBoldOrder } from "./bold.functions";

const BOLD_SCRIPT_SRC = "https://checkout.bold.co/library/boldPaymentButton.js";

type BoldCheckoutInstance = {
  open: () => void;
};

declare global {
  interface Window {
    BoldCheckout?: new (config: Record<string, unknown>) => BoldCheckoutInstance;
  }
}

export type BoldCheckoutCallbacks = {
  /** El pago terminó de forma exitosa. */
  onSuccess?: () => void;
  /** El pago falló o fue rechazado. */
  onFailed?: () => void;
  /** El pago quedó pendiente de confirmación. */
  onPending?: () => void;
  /** El usuario cerró la ventana de pago (con o sin completarla). */
  onClose?: () => void;
};

// Nombres de evento que la librería de Bold ha usado para notificar el cierre
// del checkout embebido. Escuchamos todas las variantes para que el botón de
// pagar se rehabilite aunque Bold cambie el nombre del evento.
const BOLD_CLOSE_EVENTS = [
  "bold-checkout-close",
  "boldCheckoutClose",
  "bold_checkout_close",
  "checkoutClosed",
];

/**
 * Conecta los callbacks del checkout de Bold. Además de pasarlos en la
 * configuración (por si la librería los soporta de forma nativa), registramos
 * listeners globales de cierre para resetear el estado de carga del botón
 * cuando el usuario abandona el pago.
 */
export function attachBoldCloseListeners(onClose: () => void) {

  let done = false;
  const handler = () => {
    if (done) return;
    done = true;
    cleanup();
    onClose();
  };
  const cleanup = () => {
    for (const name of BOLD_CLOSE_EVENTS) {
      window.removeEventListener(name, handler);
      document.removeEventListener(name, handler);
    }
  };
  for (const name of BOLD_CLOSE_EVENTS) {
    window.addEventListener(name, handler);
    document.addEventListener(name, handler);
  }
  return cleanup;
}


function loadBoldLibrary() {
  if (window.BoldCheckout) return Promise.resolve();

  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${BOLD_SCRIPT_SRC}"]`);
  if (existingScript) {
    return new Promise<void>((resolve, reject) => {
      if (window.BoldCheckout) {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Bold checkout failed to load")), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = BOLD_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Bold checkout failed to load"));
    document.head.appendChild(script);
  });
}

export async function openBoldEmbeddedCheckout(opts: {
  amount: number;
  currency: "USD" | "COP";
  description: string;
  redirectionUrl: string;
  discountCode?: string;
} & BoldCheckoutCallbacks) {
  await loadBoldLibrary();


  const order = await createBoldOrder({
    data: {
      amount: opts.amount,
      currency: opts.currency,
      description: opts.description,
      discountCode: opts.discountCode,
    },
  });


  // Persist for the thank-you page
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

  if (!window.BoldCheckout) throw new Error("Bold checkout is not available");

  const checkout = new window.BoldCheckout({
    apiKey: order.apiKey,
    amount: order.amount,
    currency: order.currency,
    orderId: order.orderId,
    integritySignature: order.integritySignature,
    description: order.description,
    redirectionUrl: opts.redirectionUrl,
    originUrl: window.location.href,
    renderMode: "embedded",
  });

  checkout.open();
}
