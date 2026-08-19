import { createServerFn } from "@tanstack/react-start";
import { createHash, randomBytes } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BOLD_IDENTITY_KEY } from "./bold.functions";

// Server-side catálogo — precio y formato NUNCA vienen del cliente
const CATALOG = {
  "clientes-fans": {
    titulo: "De Clientes a Fans",
    precio: 65000,
    formato: "fisico" as const,
  },
  "milagrosamente-bien": {
    titulo: "MilagrosaMENTE bien",
    precio: 62000,
    formato: "fisico" as const,
  },
  "ebook-paola": {
    titulo: "Ebook Paola Aldaz",
    precio: 30000,
    formato: "digital" as const,
  },
};
type Sku = keyof typeof CATALOG;

const ORDER_ID_RE = /^LIBRO-[a-z-]+-\d{10,16}-[a-f0-9]{8}$/;

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}
function trimStr(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

// Cliente público del servidor (anon key). No requiere SUPABASE_SERVICE_ROLE_KEY,
// por lo que funciona en Hostinger donde esa clave secreta no está disponible.
// El acceso queda controlado por las políticas RLS de cada tabla.
async function publicServerClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["SUPABASE_ANON_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend no configurado (SUPABASE_URL / PUBLISHABLE_KEY)");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getConfiguracion = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await publicServerClient();
  const { data } = await supabase
    .from("configuracion")
    .select("flete_nacional")
    .limit(1)
    .maybeSingle();
  return { flete_nacional: data?.flete_nacional ?? 12000 };
});


type CreateInput = {
  sku: string;
  cantidad: number;
  nombre_completo: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
};

export const createBookOrder = createServerFn({ method: "POST" })
  .inputValidator((data: CreateInput) => {
    const sku = trimStr(data.sku) as Sku;
    if (!(sku in CATALOG)) throw new Error("Producto no válido");
    const cantidad = Math.round(Number(data.cantidad));
    if (!Number.isFinite(cantidad) || cantidad < 1 || cantidad > 20) {
      throw new Error("Cantidad no válida");
    }
    const nombre = trimStr(data.nombre_completo, 120);
    if (nombre.length < 2) throw new Error("Nombre requerido");
    const email = trimStr(data.email, 200).toLowerCase();
    if (!isEmail(email)) throw new Error("Email no válido");
    const telefono = trimStr(data.telefono, 40);
    if (telefono.length < 7) throw new Error("Teléfono no válido");

    const meta = CATALOG[sku];
    let direccion: string | null = null;
    let ciudad: string | null = null;
    let departamento: string | null = null;
    if (meta.formato === "fisico") {
      direccion = trimStr(data.direccion, 300);
      ciudad = trimStr(data.ciudad, 100);
      departamento = trimStr(data.departamento, 100);
      if (!direccion || !ciudad || !departamento) {
        throw new Error("Dirección, ciudad y departamento son requeridos");
      }
    }
    return { sku, cantidad, nombre, email, telefono, direccion, ciudad, departamento };
  })
  .handler(async ({ data }) => {
    const secret = process.env.BOLD_SECRET_KEY;
    if (!secret) throw new Error("BOLD_SECRET_KEY no configurado");

    const meta = CATALOG[data.sku as Sku];
    const supabase = await publicServerClient();

    // Flete desde configuracion (lectura pública permitida por RLS)
    const { data: cfg } = await supabase
      .from("configuracion")
      .select("flete_nacional")
      .limit(1)
      .maybeSingle();
    const flete = meta.formato === "fisico" ? (cfg?.flete_nacional ?? 12000) : 0;


    const subtotal = meta.precio * data.cantidad;
    const total = subtotal + flete;

    const orderId = `LIBRO-${data.sku}-${Date.now()}-${randomBytes(4).toString("hex")}`;
    const amountStr = String(total);
    const currency = "COP" as const;
    const description = `${data.cantidad}x ${meta.titulo}`;
    const integritySignature = createHash("sha256")
      .update(`${orderId}${amountStr}${currency}${secret}`, "utf8")
      .digest("hex");

    const { error } = await supabase.from("pedidos_libros").insert({
      libro: meta.titulo,
      formato: meta.formato,
      nombre_completo: data.nombre,
      email: data.email,
      telefono: data.telefono,
      direccion: data.direccion,
      ciudad: data.ciudad,
      departamento: data.departamento,
      cantidad: data.cantidad,
      precio_unitario: meta.precio,
      flete,
      subtotal,
      total,
      bold_order_id: orderId,
      estado_pago: "pendiente",
    });
    if (error) throw new Error(error.message);

    return {
      orderId,
      integritySignature,
      apiKey: BOLD_IDENTITY_KEY,
      amount: amountStr,
      currency,
      description,
    };
  });

export const recordBookOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { orderId?: string; status?: string }) => {
    const orderId = trimStr(data.orderId, 120);
    if (!ORDER_ID_RE.test(orderId)) throw new Error("orderId inválido");
    const raw = (data.status ?? "").toLowerCase();
    let estado: "aprobado" | "rechazado" | "pendiente";
    if (raw.includes("approv")) estado = "aprobado";
    else if (raw.includes("reject") || raw.includes("fail")) estado = "rechazado";
    else estado = "pendiente";
    return { orderId, estado };
  })
  .handler(async ({ data }) => {
    // Se usa una operación segura de la base de datos (SECURITY DEFINER) para no
    // depender de SUPABASE_SERVICE_ROLE_KEY, que no existe en producción (Hostinger).
    const supabase = await publicServerClient();
    const { data: row, error } = await supabase.rpc("confirm_book_order", {
      p_order_id: data.orderId,
      p_estado: data.estado,
    });
    if (error) throw new Error(error.message);

    type Pedido = {
      id: string;
      estado_pago: string;
      libro: string;
      formato: string;
      nombre_completo: string;
      email: string;
      telefono: string;
      direccion: string | null;
      ciudad: string | null;
      departamento: string | null;
      cantidad: number;
      total: number;
    };
    const pedido = (row as Pedido | null) ?? null;
    if (!pedido) return { ok: false, pedido: null as Pedido | null };

    if (data.estado === "aprobado" && pedido.estado_pago === "aprobado") {
      // Envío de correo (opcional; no rompe el flujo si falla)
      try {
        await sendNotificationEmail(pedido);
      } catch (e) {
        console.error("[book-order] email fail:", e);
      }
    }
    return { ok: true, pedido };
  });


async function sendNotificationEmail(p: {
  libro: string;
  formato: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  direccion: string | null;
  ciudad: string | null;
  departamento: string | null;
  cantidad: number;
  total: number;
}) {
  const RESEND = process.env.RESEND_API_KEY;
  if (!RESEND) return;
  const html = `<h2>Nuevo pedido de libro</h2>
<p><strong>${p.libro}</strong> — ${p.formato}</p>
<p>Cantidad: ${p.cantidad} · Total: $${p.total.toLocaleString("es-CO")} COP</p>
<h3>Comprador</h3>
<p>${p.nombre_completo}<br>${p.email}<br>${p.telefono}</p>
${p.formato === "fisico" ? `<h3>Envío</h3><p>${p.direccion}<br>${p.ciudad}, ${p.departamento}</p>` : ""}`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env["RESEND_FROM_EMAIL"] || "Voz Estratégica <onboarding@resend.dev>",
      to: ["contacto@vozestrategica.com"],
      subject: `Pedido aprobado: ${p.libro}`,
      html,
    }),
  });
}

export const listPedidosLibros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { estado?: string } | undefined) => ({
    estado:
      data?.estado && ["pendiente", "aprobado", "rechazado", "cancelado"].includes(data.estado)
        ? (data.estado as "pendiente" | "aprobado" | "rechazado" | "cancelado")
        : undefined,
  }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    let query = context.supabase
      .from("pedidos_libros")
      .select("*")
      .order("fecha_creacion", { ascending: false });
    if (data.estado) query = query.eq("estado_pago", data.estado);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { pedidos: rows ?? [] };
  });

export const cancelBookOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id?: string }) => {
    const id = typeof data?.id === "string" ? data.id.trim() : "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("id inválido");
    return { id };
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { data: existing, error: readErr } = await context.supabase
      .from("pedidos_libros")
      .select("id, estado_pago")
      .eq("id", data.id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!existing) throw new Error("Pedido no encontrado");
    if (existing.estado_pago === "aprobado") {
      throw new Error("No se puede cancelar un pedido aprobado");
    }
    if (existing.estado_pago === "cancelado") return { ok: true };

    const { error } = await context.supabase
      .from("pedidos_libros")
      .update({ estado_pago: "cancelado" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
