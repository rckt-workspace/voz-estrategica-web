// Client helper: open Bold Embedded Checkout
import { createBoldOrder } from "./bold.functions";

const BOLD_SCRIPT_SRC = "https://checkout.bold.co/library/boldPaymentButton.js";

export async function openBoldEmbeddedCheckout(opts: {
  amount: number;
  currency: "USD" | "COP";
  description: string;
  redirectionUrl: string;
}) {
  const order = await createBoldOrder({
    data: {
      amount: opts.amount,
      currency: opts.currency,
      description: opts.description,
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

  // Bold's script tag replaces itself with a button. Mount hidden, then click it.
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  const script = document.createElement("script");
  script.src = BOLD_SCRIPT_SRC;
  script.async = true;
  script.setAttribute("data-bold-button", "");
  script.setAttribute("data-api-key", order.apiKey);
  script.setAttribute("data-amount", order.amount);
  script.setAttribute("data-currency", order.currency);
  script.setAttribute("data-order-id", order.orderId);
  script.setAttribute("data-integrity-signature", order.integritySignature);
  script.setAttribute("data-description", order.description);
  script.setAttribute("data-render-mode", "embedded");
  script.setAttribute("data-redirection-url", opts.redirectionUrl);
  script.setAttribute("data-origin-url", window.location.href);
  container.appendChild(script);

  // Poll for the injected Bold button and click it
  const start = Date.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const btn = container.querySelector("button");
      if (btn) {
        btn.click();
        resolve();
        return;
      }
      if (Date.now() - start > 10000) {
        resolve();
        return;
      }
      setTimeout(tick, 80);
    };
    tick();
  });

  // Clean up after the modal closes (delayed)
  setTimeout(() => {
    container.remove();
  }, 60_000);
}
