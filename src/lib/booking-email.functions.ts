import { createServerFn } from "@tanstack/react-start";
import type { BookingEmailInput } from "./booking-email.server";

/**
 * Notificación por correo de solicitudes de propuesta (/contratar).
 * Wrapper delgado: la lógica vive en ./booking-email.server.
 */
export const notifyBookingRequest = createServerFn({ method: "POST" })
  .inputValidator((input: BookingEmailInput) => input)
  .handler(async ({ data }) => {
    const { bookingEmailSchema, sendBookingNotification } = await import("./booking-email.server");
    return sendBookingNotification(bookingEmailSchema.parse(data));
  });
