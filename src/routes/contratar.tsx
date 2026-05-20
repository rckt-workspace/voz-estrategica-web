import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { speakers } from "@/data/content";

const schema = z.object({
  organizacion: z.string().min(2, "Indicá tu organización").max(200),
  contacto: z.string().min(2, "Tu nombre, por favor").max(120),
  email: z.string().email("Email inválido").max(200),
  telefono: z.string().max(40).optional().or(z.literal("")),
  fecha_evento: z.string().optional().or(z.literal("")),
  speaker: z.string().optional().or(z.literal("")),
  tipo_evento: z.string().max(120).optional().or(z.literal("")),
  presupuesto: z.string().max(120).optional().or(z.literal("")),
  mensaje: z.string().min(10, "Contanos un poco más (mín. 10 caracteres)").max(2000),
});

type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/contratar")({
  validateSearch: (s: Record<string, unknown>) => ({
    speaker: typeof s.speaker === "string" ? s.speaker : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contratar Speaker — Voz Estratégica" },
      {
        name: "description",
        content:
          "Solicitá una propuesta a medida en menos de 48 horas. Contános el contexto de tu evento.",
      },
      { property: "og:title", content: "Contratar Speaker — Voz Estratégica" },
      {
        property: "og:description",
        content: "Propuestas a medida para eventos memorables.",
      },
    ],
  }),
  component: ContratarPage,
});

function ContratarPage() {
  const { speaker: prefSpeaker } = useSearch({ from: "/contratar" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { speaker: prefSpeaker ?? "" },
  });

  async function onSubmit(values: FormData) {
    const spk = values.speaker
      ? speakers.find((s) => s.slug === values.speaker)
      : null;

    const { error } = await supabase.from("booking_requests").insert({
      organizacion: values.organizacion,
      contacto: values.contacto,
      email: values.email,
      telefono: values.telefono || null,
      fecha_evento: values.fecha_evento || null,
      tipo_evento: values.tipo_evento || null,
      presupuesto: values.presupuesto || null,
      mensaje: values.mensaje,
      speaker_id: null, // ids reales solo desde admin; guardamos referencia en mensaje
      estado: "nuevo",
    });

    if (error) {
      toast.error("No pudimos enviar tu solicitud. Probá de nuevo.");
      return;
    }
    toast.success(
      spk
        ? `¡Recibido! Te contactamos pronto sobre ${spk.nombre}.`
        : "¡Recibido! Te contactamos en menos de 48 horas.",
    );
    reset();
  }

  return (
    <>
      <PageHero
        badge="Contratación"
        titulo={
          <>
            Contános tu{" "}
            <span className="highlight-yellow">
              <span>evento</span>
              <span />
            </span>
            .
          </>
        }
        descripcion="Respondemos en menos de 48 horas con una propuesta a medida: speaker, formato y disponibilidad."
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field label="Organización" error={errors.organizacion?.message}>
              <input className={input} {...register("organizacion")} />
            </Field>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Persona de contacto" error={errors.contacto?.message}>
                <input className={input} {...register("contacto")} />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input type="email" className={input} {...register("email")} />
              </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Teléfono (opcional)" error={errors.telefono?.message}>
                <input className={input} {...register("telefono")} />
              </Field>
              <Field label="Fecha del evento" error={errors.fecha_evento?.message}>
                <input type="date" className={input} {...register("fecha_evento")} />
              </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Speaker preferido" error={errors.speaker?.message}>
                <select className={input} {...register("speaker")} defaultValue={prefSpeaker ?? ""}>
                  <option value="">Sin preferencia</option>
                  {speakers.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo de evento" error={errors.tipo_evento?.message}>
                <input
                  className={input}
                  placeholder="Convención, keynote, foro..."
                  {...register("tipo_evento")}
                />
              </Field>
            </div>

            <Field label="Presupuesto estimado (opcional)" error={errors.presupuesto?.message}>
              <input
                className={input}
                placeholder="Rango USD / EUR"
                {...register("presupuesto")}
              />
            </Field>

            <Field label="Contanos sobre el evento" error={errors.mensaje?.message}>
              <textarea rows={6} className={input} {...register("mensaje")} />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bubble bubble-yellow w-full justify-center py-4 text-base disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar solicitud →"}
            </button>
          </form>
        </Reveal>
      </section>
    </>
  );
}

const input =
  "w-full rounded-2xl border border-foreground/15 bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
