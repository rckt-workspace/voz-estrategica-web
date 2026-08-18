import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { publicBackend } from "@/lib/public-backend-client";
import { trackGA4Event } from "@/lib/ga4";

const CANONICAL = "https://vozestrategica.com/suscribete";

export const Route = createFileRoute("/suscribete")({
  head: () => ({
    meta: [
      { title: "Súmate a la conversación — Newsletter Voz Estratégica" },
      {
        name: "description",
        content:
          "Ideas de liderazgo, comunicación y transformación, directo a tu correo. Suscríbete al newsletter de Voz Estratégica.",
      },
      { property: "og:title", content: "Súmate a la conversación — Voz Estratégica" },
      {
        property: "og:description",
        content:
          "Ideas de liderazgo, comunicación y transformación, directo a tu correo.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: SuscribetePage,
});

const ROLES = [
  "RRHH / Talento",
  "Comercial / Ventas",
  "Dirección General",
  "Otro",
] as const;

const INTERESES = [
  "Liderazgo",
  "Comunicación",
  "Cultura",
  "Transformación / IA",
  "Ventas y cliente",
] as const;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const inputClass =
  "w-full rounded-2xl border border-foreground/15 bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30";

function SuscribetePage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [rol, setRol] = useState("");
  const [intereses, setIntereses] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggleInteres(value: string) {
    setIntereses((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) return setError("Escribe tu nombre.");
    if (!EMAIL_RE.test(email.trim())) return setError("Escribe un correo electrónico válido.");
    if (!consent) return setError("Debes aceptar la Política de Tratamiento de Datos.");

    setLoading(true);
    try {
      const { error: dbError } = await publicBackend
        .from("suscriptores_newsletter")
        .upsert(
          {
            nombre: nombre.trim().slice(0, 200),
            email: email.trim().toLowerCase().slice(0, 320),
            empresa: empresa.trim() ? empresa.trim().slice(0, 200) : null,
            rol: rol || null,
            intereses,
            consentimiento: true,
            source: "suscribete",
          },
          { onConflict: "email" },
        );

      if (dbError) throw dbError;

      trackGA4Event("newsletter_signup", {
        method: "pagina_suscribete",
        rol: rol || "no_especificado",
        intereses: intereses.join(","),
      });

      setDone(true);
    } catch {
      setError(
        "No pudimos guardar tu suscripción en este momento. Verifica tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-5">
          <Link to="/" aria-label="Voz Estratégica — Ir al inicio">
            <Logo className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-14 md:py-20">
        <div className="mx-auto max-w-[480px]">
          <h1 className="font-display text-3xl uppercase leading-tight md:text-4xl">
            Súmate a la conversación
          </h1>
          <p className="mt-3 text-muted-foreground">
            Ideas de liderazgo, comunicación y transformación, directo a tu correo.
          </p>

          {done ? (
            <div className="mt-10 rounded-2xl border border-foreground/15 bg-card p-6">
              <p className="font-display text-lg uppercase">¡Listo!</p>
              <p className="mt-2 text-muted-foreground">
                Revisa tu correo para confirmar tu suscripción.
              </p>
              <Link
                to="/"
                className="mt-6 inline-block text-sm underline underline-offset-4 hover:text-foreground"
              >
                Volver al inicio
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
              <div>
                <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-foreground">
                  Nombre <span className="text-brand">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  maxLength={200}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={inputClass}
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                  Correo electrónico <span className="text-brand">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  maxLength={320}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="empresa" className="mb-2 block text-sm font-medium text-foreground">
                  Empresa <span className="text-muted-foreground">(opcional)</span>
                </label>
                <input
                  id="empresa"
                  type="text"
                  maxLength={200}
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className={inputClass}
                  autoComplete="organization"
                />
              </div>

              <div>
                <label htmlFor="rol" className="mb-2 block text-sm font-medium text-foreground">
                  Rol <span className="text-muted-foreground">(opcional)</span>
                </label>
                <select
                  id="rol"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Selecciona una opción</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend className="mb-3 block text-sm font-medium text-foreground">
                  Intereses <span className="text-muted-foreground">(opcional)</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {INTERESES.map((i) => (
                    <label
                      key={i}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-foreground/15 bg-card px-4 py-3 text-sm transition-colors hover:border-brand"
                    >
                      <input
                        type="checkbox"
                        checked={intereses.includes(i)}
                        onChange={() => toggleInteres(i)}
                        className="h-4 w-4 rounded accent-[var(--brand)]"
                      />
                      {i}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded accent-[var(--brand)]"
                  required
                />
                <span>
                  Acepto la{" "}
                  <a
                    href="/aviso-de-privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    Política de Tratamiento de Datos
                  </a>{" "}
                  <span className="text-brand">*</span>
                </span>
              </label>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bubble bubble-black w-full justify-center py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Suscribirme"}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-border/60 px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Voz Estratégica. Todos los derechos reservados.</p>
          <Link to="/aviso-de-privacidad" className="underline underline-offset-4 hover:text-foreground">
            Aviso de Privacidad
          </Link>
        </div>
      </footer>
    </div>
  );
}
