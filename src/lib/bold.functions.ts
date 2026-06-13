import { createServerFn } from "@tanstack/react-start";
import { createHash, randomBytes } from "crypto";

export const BOLD_IDENTITY_KEY = "W8kaIYyKJxwgjUg094TWycTBTEDFhNf9zBWElV3aukI";

export type BoldOrder = {
  orderId: string;
  integritySignature: string;
  apiKey: string;
  amount: string;
  currency: "USD" | "COP";
  description: string;
};

export const createBoldOrder = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { amount: number; currency: "USD" | "COP"; description: string }) => input,
  )
  .handler(async ({ data }): Promise<BoldOrder> => {
    const secret = process.env.BOLD_SECRET_KEY;
    if (!secret) throw new Error("BOLD_SECRET_KEY not configured");

    const orderId = `MC-${Date.now()}-${randomBytes(4).toString("hex")}`;
    const amountStr = String(data.amount);
    const concat = `${orderId}${amountStr}${data.currency}${secret}`;
    const integritySignature = createHash("sha256").update(concat, "utf8").digest("hex");

    return {
      orderId,
      integritySignature,
      apiKey: BOLD_IDENTITY_KEY,
      amount: amountStr,
      currency: data.currency,
      description: data.description,
    };
  });
