import { createServerFn } from "@tanstack/react-start";
import type { LeadEmailInput } from "./leads-email.server";

/**
 * Notificación por correo de leads de la landing /mx/diego-camacho.
 *
 * Wrapper delgado: toda la lógica vive en ./leads-email.server para no dejar
 * código de runtime en el ámbito del módulo (requisito de TanStack Start).
 */
export const notifyDiegoLead = createServerFn({ method: "POST" })
  .inputValidator((input: LeadEmailInput) => input)
  .handler(async ({ data }) => {
    const { leadEmailSchema, sendLeadNotification } = await import("./leads-email.server");
    return sendLeadNotification(leadEmailSchema.parse(data));
  });
