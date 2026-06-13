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

  // Mount a visible container that Bold can render its button/modal into.
  // We auto-click the injected button so the checkout opens immediately.
  const container = document.createElement("div");
  container.setAttribute("data-bold-container", "");
  // Keep it in the layout but visually hidden — Bold needs it attached to the DOM.
  container.style.position = "fixed";
  container.style.bottom = "0";
  container.style.right = "0";
  container.style.width = "1px";
  container.style.height = "1px";
  container.style.overflow = "hidden";
  container.style.opacity = "0";
  document.body.appendChild(container);

  const script = document.createElement("script");
  script.src = BOLD_SCRIPT_SRC;
  script.async = false;
  script.setAttribute("data-bold-button", "");
  script.setAttribute("data-api-key", order.apiKey);
  script.setAttribute("data-amount", order.amount);
  script.setAttribute("data-currency", order.currency);
  script.setAttribute("data-order-id", order.orderId);
  script.setAttribute("data-integrity-signature", order.integritySignature);
  script.setAttribute("data-description", order.description);
  script.setAttribute("data-redirection-url", opts.redirectionUrl);
  script.setAttribute("data-origin-url", window.location.href);
  container.appendChild(script);

  // Poll for the injected Bold button and click it to open the hosted checkout.
  const start = Date.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const btn = container.querySelector<HTMLButtonElement>(
        "#boldPaymentButton, button",
      );
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
}
