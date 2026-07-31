import { useEffect, useState } from "react";
import { readStoredConsent, setConsent } from "@/lib/consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readStoredConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (choice: "granted" | "denied") => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      className="fixed left-4 right-4 z-[70] rounded-2xl border border-foreground/15 bg-background p-4 shadow-xl sm:left-6 sm:max-w-md"
      style={{ bottom: "calc(1.5rem + var(--bottombar-h, 0px))" }}
    >
      <p className="text-sm text-muted-foreground">
        Usamos cookies para mejorar tu experiencia y medir nuestras campañas.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => choose("granted")}
          className="bubble bubble-black flex-1 justify-center"
        >
          Aceptar
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="bubble bubble-outline flex-1 justify-center"
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}
