import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const schema = z.object({
  email: z.string().email().max(200),
  source: z.string().max(60).optional(),
});

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const email = data.email.toLowerCase().trim();
    // Nombre es obligatorio en la tabla principal; el formulario rápido solo
    // captura el correo, así que usamos la parte local del email.
    const nombre = email.split("@")[0]?.slice(0, 200) || "Suscriptor";

    const { error } = await supabase.rpc("subscribe_newsletter", {
      p_nombre: nombre,
      p_email: email,
      p_empresa: null,
      p_rol: null,
      p_telefono: null,
      p_intereses: [],
      p_source: data.source ?? "recursos",
    });
    if (error) {
      throw new Error("No pudimos registrar tu suscripción");
    }
    return { ok: true, duplicate: false } as const;
  });
