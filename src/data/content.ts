import julianImg from "@/assets/speaker-julian.jpg";
import carlosImg from "@/assets/speaker-carlos.jpg";
import valentinaImg from "@/assets/speaker-valentina.jpg";
import sofiaImg from "@/assets/speaker-sofia.jpg";
import andresImg from "@/assets/speaker-andres.jpg";

import bookMilagrosamente from "@/assets/book-milagrosamente.jpg";
import bookClientesFans from "@/assets/book-clientes-fans.jpg";
import bookLiderazgo from "@/assets/book-liderazgo.jpg";
import bookFuturoTrabajo from "@/assets/book-futuro-trabajo.jpg";

export interface Speaker {
  slug: string;
  nombre: string;
  especialidad: string;
  foto: string;
  bio: string;
  tematicas: string[];
  destacado: boolean;
  quote?: string;
}

export interface EventItem {
  id: string;
  titulo: string;
  fecha: string;
  ciudad: string;
  descripcion: string;
  speakerSlug?: string;
}

export interface Book {
  id: string;
  titulo: string;
  autorSlug: string;
  portada: string;
  descripcion: string;
  anio: number;
}

export const speakers: Speaker[] = [
  {
    slug: "julian-giraldo",
    nombre: "Julián Giraldo",
    especialidad: "MilagrosaMENTE bien",
    foto: julianImg,
    bio: "Conferencista internacional sobre bienestar mental y resiliencia. Más de 400 conferencias en 14 países, autor del bestseller 'Milagrosamente Bien'. Su charla transforma la manera en que líderes y equipos enfrentan la incertidumbre.",
    tematicas: ["Bienestar", "Resiliencia", "Liderazgo"],
    destacado: true,
    quote:
      "Cuando te concentras en lo que tienes y no en lo que te hace falta, tienes el poder de hacer milagros.",
  },
  {
    slug: "carlos-laguna",
    nombre: "Carlos Laguna",
    especialidad: "De clientes a fans",
    foto: carlosImg,
    bio: "Estratega de experiencia al cliente. 20 años construyendo culturas de servicio en empresas Fortune 500 de LATAM. Su metodología 'Cliente Fan' ha sido adoptada por más de 60 marcas líderes.",
    tematicas: ["Customer Experience", "Cultura", "Ventas"],
    destacado: true,
    quote:
      "El cliente perdona un error, pero jamás perdona tu actitud frente al error.",
  },
  {
    slug: "valentina-rios",
    nombre: "Valentina Ríos",
    especialidad: "Liderazgo radical",
    foto: valentinaImg,
    bio: "CEO, autora y conferencista sobre liderazgo femenino y transformación organizacional. Reconocida por Forbes 40 under 40. Sus ponencias combinan datos duros con narrativa íntima.",
    tematicas: ["Liderazgo", "Diversidad", "Transformación"],
    destacado: true,
    quote: "Liderar no es ocupar el espacio. Es crearlo para que otros crezcan.",
  },
  {
    slug: "sofia-mendoza",
    nombre: "Sofía Mendoza",
    especialidad: "El futuro del trabajo",
    foto: sofiaImg,
    bio: "Investigadora del futuro del trabajo y cultura digital. Ex-McKinsey, profesora invitada en IE Business School. Especialista en IA aplicada a equipos humanos.",
    tematicas: ["Futuro del trabajo", "IA", "Cultura digital"],
    destacado: false,
    quote: "La pregunta no es qué reemplazará la IA, sino qué nos hace irremplazables.",
  },
  {
    slug: "andres-villalobos",
    nombre: "Andrés Villalobos",
    especialidad: "Pensamiento crítico en la era del ruido",
    foto: andresImg,
    bio: "Filósofo, columnista y autor de seis libros sobre ética contemporánea. Sus conferencias son un espacio para repensar las preguntas que dejamos de hacernos.",
    tematicas: ["Filosofía", "Ética", "Pensamiento crítico"],
    destacado: false,
    quote: "La velocidad nos confunde. Pensar bien sigue siendo el verdadero lujo.",
  },
];

export const events: EventItem[] = [
  {
    id: "ev-1",
    titulo: "Cumbre Latam de Liderazgo Consciente",
    fecha: "2026-08-14",
    ciudad: "Bogotá",
    descripcion: "Tres días con los referentes regionales en liderazgo y bienestar.",
    speakerSlug: "julian-giraldo",
  },
  {
    id: "ev-2",
    titulo: "Foro Customer Experience 2026",
    fecha: "2026-09-22",
    ciudad: "Ciudad de México",
    descripcion: "Carlos Laguna abre el foro con su keynote 'De clientes a fans'.",
    speakerSlug: "carlos-laguna",
  },
  {
    id: "ev-3",
    titulo: "Women Leadership Summit",
    fecha: "2026-10-05",
    ciudad: "Madrid",
    descripcion: "Valentina Ríos junto a un panel internacional de CEOs.",
    speakerSlug: "valentina-rios",
  },
  {
    id: "ev-4",
    titulo: "AI & Future Work — Conferencia Anual",
    fecha: "2026-11-18",
    ciudad: "Lima",
    descripcion: "Sofía Mendoza presenta su nueva investigación sobre IA aplicada.",
    speakerSlug: "sofia-mendoza",
  },
];

export const books: Book[] = [
  {
    id: "b-1",
    titulo: "Milagrosamente Bien",
    autorSlug: "julian-giraldo",
    portada: bookMilagrosamente,
    descripcion: "Un manifiesto sobre la resiliencia desde la gratitud.",
    anio: 2024,
  },
  {
    id: "b-2",
    titulo: "De Clientes a Fans",
    autorSlug: "carlos-laguna",
    portada: bookClientesFans,
    descripcion: "El método para construir lealtad real en la era del ruido.",
    anio: 2023,
  },
  {
    id: "b-3",
    titulo: "Liderazgo Radical",
    autorSlug: "valentina-rios",
    portada: bookLiderazgo,
    descripcion: "Cómo liderar abriendo espacio en vez de ocuparlo.",
    anio: 2025,
  },
  {
    id: "b-4",
    titulo: "El Futuro del Trabajo",
    autorSlug: "sofia-mendoza",
    portada: bookFuturoTrabajo,
    descripcion: "Una guía pragmática para equipos en transformación.",
    anio: 2024,
  },
];

export const tematicas = Array.from(
  new Set(speakers.flatMap((s) => s.tematicas)),
).sort();

export function getSpeaker(slug: string) {
  return speakers.find((s) => s.slug === slug);
}

export function eventsForSpeaker(slug: string) {
  return events.filter((e) => e.speakerSlug === slug);
}

export function booksForSpeaker(slug: string) {
  return books.filter((b) => b.autorSlug === slug);
}
