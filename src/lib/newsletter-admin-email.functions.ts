import { createServerFn } from "@tanstack/react-start";
import type { NewsletterAdminEmailInput } from "./newsletter-admin-email.server";

/**
 * Notifica al admin de una nueva suscripción en /suscribete.
 * Wrapper delgado: la lógica vive en ./newsletter-admin-email.server.
 */
export const notifyNewsletterAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: NewsletterAdminEmailInput) => input)
  .handler(async ({ data }) => {
    const { newsletterAdminEmailSchema, sendNewsletterAdminNotification } = await import(
      "./newsletter-admin-email.server"
    );
    return sendNewsletterAdminNotification(newsletterAdminEmailSchema.parse(data));
  });
