import { createServerFn } from "@tanstack/react-start";
import { createHash, randomBytes } from "crypto";
import { BOLD_IDENTITY_KEY } from "./bold.functions";
import {
  KIT_PRICE_COP,
  MASTERCLASS_PRICE_COP,
  PRODUCT_BASE,
  PRODUCT_WITH_KIT,
} from "./masterclass-checkout";

export type MasterclassCheckout = {
  orderId: string;
  integritySignature: string;
  apiKey: string;
  amount: string;
  currency: "COP";
  description: string;
  kit: boolean;
};

type Input = {
  nombre: string;
  email: string;
  kit: boolean;
};

export const createMasterclassCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: Input) => {
    const nombre = (input?.nombre ?? "").trim();
    const email = (input?.email ?? "").trim().toLowerCase();
    if (nombre.length < 2 || nombre.length > 120) throw new Error("Nombre no válido");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
      throw new Error("Correo electrónico no válido");
    }
    return { nombre, email, kit: !!input?.kit };
  })
  .handler(async ({ data }): Promise<MasterclassCheckout> => {
    const secret = process.env["BOLD_SECRET_KEY"];
    if (!secret) throw new Error("BOLD_SECRET_KEY no está configurada");

    const amount = MASTERCLASS_PRICE_COP + (data.kit ? KIT_PRICE_COP : 0);
    const currency = "COP" as const;
    const orderId = `MC-${Date.now()}-${randomBytes(4).toString("hex")}`;
    const amountStr = String(amount);
    const integritySignature = createHash("sha256")
      .update(`${orderId}${amountStr}${currency}${secret}`, "utf8")
      .digest("hex");
    const description = data.kit ? PRODUCT_WITH_KIT : PRODUCT_BASE;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("orders").insert({
      order_id: orderId,
      status: "pending",
      amount,
      currency,
      product: description,
      customer_name: data.nombre,
      customer_email: data.email,
      raw_payload: { order_bump_kit: data.kit, source: "masterclass-checkout" },
    });
    if (error) throw new Error(error.message);

    return {
      orderId,
      integritySignature,
      apiKey: BOLD_IDENTITY_KEY,
      amount: amountStr,
      currency,
      description,
      kit: data.kit,
    };
  });
