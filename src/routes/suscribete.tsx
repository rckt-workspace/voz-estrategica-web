import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { publicBackend } from "@/lib/public-backend-client";
import { notifyNewsletterAdmin } from "@/lib/newsletter-admin-email.functions";
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
      const { error: dbError } = await publicBackend.rpc("subscribe_newsletter", {
        p_nombre: nombre.trim().slice(0, 200),
        p_email: email.trim().toLowerCase().slice(0, 320),
        p_empresa: empresa.trim() ? empresa.trim().slice(0, 200) : undefined,
        p_rol: rol || undefined,
        p_intereses: intereses,
        p_source: "suscribete",
      });

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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Fondo con profundidad sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-gradient-to-b from-background via-background to-foreground/[0.04]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[26rem] w-[26rem] rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/3 h-64 w-64 rounded-[42%_58%_60%_40%/45%_40%_60%_55%] bg-brand/10 blur-2xl"
      />

      <header className="relative border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-8 md:py-10">
          <Link to="/" aria-label="Voz Estratégica — Ir al inicio">
            <Logo className="h-16 w-auto md:h-24" />
          </Link>
        </div>
      </header>

      <main className="relative flex-1 px-6 py-12 md:py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-2 md:gap-16">
          {/* Columna de apoyo — arriba en mobile */}
          <div className="order-2 md:order-1 md:sticky md:top-16">
            <h1 className="font-display text-3xl uppercase leading-tight md:text-5xl">
              Súmate a la conversación
            </h1>
            <p className="mt-3 text-muted-foreground md:text-lg">
              Ideas de liderazgo, comunicación y transformación, directo a tu correo.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-foreground/15 bg-foreground/15">
              {[
                ["+1.500", "Conferencias dictadas"],
                ["+500K", "Vidas impactadas"],
                ["14", "Países"],
                ["8", "Voces curadas"],
              ].map(([n, l]) => (
                <div key={l} className="bg-card px-4 py-6">
                  <div className="font-display text-3xl md:text-4xl">{n}</div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {l}
                  </div>
                </div>
              ))}
            </div>

            <figure className="mt-8 border-l-2 border-brand pl-5">
              <blockquote className="font-display text-lg uppercase leading-snug md:text-xl">
                “La voz correcta, en el momento correcto, mueve organizaciones.”
              </blockquote>
              <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Voz Estratégica
              </figcaption>
            </figure>
          </div>

          {/* Columna del formulario */}
          <div className="order-1 md:order-2">
            {done ? (
              <div className="rounded-3xl border border-foreground/10 bg-card p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] md:p-8">
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
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-3xl border border-foreground/10 bg-card p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] md:p-8"
                noValidate
              >

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
                <legend className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-brand" aria-hidden="true" />
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

              <div className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-brand/[0.07] px-4 py-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
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
              </div>


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
