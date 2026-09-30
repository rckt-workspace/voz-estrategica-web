import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface SpeakerRow {
  id: string;
  slug: string;
  nombre: string;
  especialidad: string;
  tematicas: string[];
  destacado: boolean;
}

interface BookRow {
  id: string;
  titulo: string;
  descripcion: string | null;
  anio: number | null;
  link_compra: string | null;
}

interface EventRow {
  id: string;
  titulo: string;
  fecha: string;
  ciudad: string;
  descripcion: string | null;
}

export async function getVozKnowledgeContext(): Promise<string> {
  try {
    const [speakers, books, events] = await Promise.all([
      fetchSpeakers(),
      fetchBooks(),
      fetchEvents(),
    ]);
    return buildKnowledgeContext({ speakers, books, events });
  } catch (err) {
    console.error("[Knowledge] Error building context:", err);
    return getDefaultFallbackContext();
  }
}

async function fetchSpeakers(): Promise<SpeakerRow[]> {
  const { data, error } = await supabaseAdmin
    .from("speakers")
    .select("id,slug,nombre,especialidad,tematicas,destacado")
    .order("orden", { ascending: true });
  if (error) {
    console.error("[Knowledge] Error fetching speakers:", error);
    return [];
  }
  return data ?? [];
}

async function fetchBooks(): Promise<BookRow[]> {
  const { data, error } = await supabaseAdmin
    .from("books")
    .select("id,titulo,descripcion,anio,link_compra")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[Knowledge] Error fetching books:", error);
    return [];
  }
  return data ?? [];
}

async function fetchEvents(): Promise<EventRow[]> {
  const { data, error } = await supabaseAdmin
    .from("events")
    .select("id,titulo,fecha,ciudad,descripcion")
    .order("fecha", { ascending: true });
  if (error) {
    console.error("[Knowledge] Error fetching events:", error);
    return [];
  }
  return data ?? [];
}

function buildKnowledgeContext(data: {
  speakers: SpeakerRow[];
  books: BookRow[];
  events: EventRow[];
}): string {
  const sections: string[] = [];
  sections.push(`
=== VOZ ESTRATÉGICA ===
Firma de aprendizaje corporativo en Colombia, México y España.
Especialidad: conferencias, formación, consultoría y contenidos.
Web: https://vozestrategica.com
WhatsApp: https://wa.me/573106598108
`);

  if (data.speakers.length) {
    sections.push("\n=== CONFERENCISTAS ===");
    for (const s of data.speakers) {
      sections.push(`
- ${s.nombre}
  Especialidad: ${s.especialidad}
  Temáticas: ${s.tematicas?.join(", ") || "Consultar"}
  URL: /speakers/${s.slug}
`);
    }
  }

  if (data.books.length) {
    sections.push("\n=== LIBROS & RECURSOS ===");
    for (const b of data.books) {
      sections.push(`
- ${b.titulo}
  ${b.descripcion || ""}
  ${b.anio ? `Año: ${b.anio}` : ""}
  ${b.link_compra ? `Más información: ${b.link_compra}` : ""}
`);
    }
  }

  if (data.events.length) {
    sections.push("\n=== EVENTOS ===");
    for (const e of data.events) {
      sections.push(`
- ${e.titulo}
  Fecha: ${e.fecha}
  Ciudad: ${e.ciudad}
  ${e.descripcion || ""}
`);
    }
  }

  sections.push(`
=== SERVICIOS ===
- Conferencias
- Talleres y programas de formación
- Consultoría
- Contenidos y recursos

=== CONTRATACIÓN ===
Para tarifas, disponibilidad, propuestas personalizadas o negociación, remite al equipo.
WhatsApp oficial: https://wa.me/573106598108

=== REGLAS ===
No inventar tarifas, descuentos, disponibilidad, inventario, fechas o garantías.
`);
  return sections.join("\n");
}

function getDefaultFallbackContext(): string {
  return `
=== VOZ ESTRATÉGICA ===
Firma de aprendizaje corporativo. Conferencias, formación, consultoría y contenidos.
Web: https://vozestrategica.com
WhatsApp: https://wa.me/573106598108
Si un dato no está disponible, ofrece contactar al equipo.
`;
}

export async function getSpeakerBySlug(slug: string): Promise<SpeakerRow | null> {
  const { data, error } = await supabaseAdmin
    .from("speakers")
    .select("id,slug,nombre,especialidad,tematicas,destacado")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[Knowledge] Error fetching speaker:", error);
    return null;
  }
  return data;
}
