import julianImg from "@/assets/speaker-julian-giraldo.png";
import carlosImg from "@/assets/speaker-carlos-laguna.jpg";
import elaineImg from "@/assets/speaker-elaine-miranda.png";
import paolaImg from "@/assets/speaker-paola-aldaz.jpg";
import williamImg from "@/assets/speaker-william-vinasco.webp";

import bookMilagrosamente from "@/assets/book-milagrosamente.webp";
import bookClientesFans from "@/assets/book-clientes-fans.webp";
import bookMujeresFinanzas from "@/assets/book-mujeres-finanzas-new.jpg";
import bookBrandExponential from "@/assets/book-brand-exponential-new.jpg";

export interface Speaker {
  slug: string;
  nombre: string;
  especialidad: string;
  foto: string;
  bio: string[];
  tematicas: string[];
  charlas: string[];
  destacado: boolean;
  quote?: string;
  fuente?: string;
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
    slug: "carlos-laguna",
    nombre: "Carlos Laguna",
    especialidad: "Marketing, creatividad & experiencia de cliente",
    foto: carlosImg,
    bio: [
      "CEO de CPC Group y autor de De clientes a fans. Su trabajo se enfoca en transformar la relación entre marcas y clientes, con una mirada provocadora sobre ventas, posicionamiento, creatividad y construcción de experiencias memorables.",
      "Como speaker de Voz Estratégica, aparece asociado a un estilo directo, provocador y de cero tolerancia a los discursos vacíos. También es creador de Toolkit Talks, evento de marketing y creatividad en Colombia.",
    ],
    tematicas: ["Marketing", "Creatividad", "Ventas", "Experiencia de cliente", "Marca"],
    charlas: [
      "De clientes a fans: cómo construir lealtad real",
      "Marketing sin discursos vacíos",
      "Toolkit Talks: creatividad aplicada a negocios",
    ],
    destacado: true,
    quote: "El cliente perdona un error, pero jamás perdona tu actitud frente al error.",
    fuente: "https://vozestrategica.com/carlos-laguna/",
  },
  {
    slug: "elaine-miranda",
    nombre: "Elaine Miranda",
    especialidad: "Bienestar financiero corporativo",
    foto: elaineImg,
    bio: [
      "Conferencista internacional, autora y experta en bienestar financiero corporativo. Elaine Miranda es la autora del best-seller Mujeres y Finanzas y fundadora de Plata con Plática; ha transformado la vida financiera de más de 500.000 personas a través de conferencias, talleres, contenido digital y programas corporativos en la región.",
      "Con más de 1.500 conferencias impartidas en 10 países y una comunidad digital de más de 200.000 seguidores, combina claridad, empatía y estrategia para hablar de dinero con un enfoque humano, práctico y transformador. Su estilo mezcla storytelling, neurofinanzas, psicología del comportamiento y acción sin excusas.",
    ],
    tematicas: ["Bienestar financiero", "Finanzas personales", "Neurofinanzas", "Psicología del comportamiento", "Storytelling"],
    charlas: [
      "Mujeres y finanzas: hablar de dinero sin miedo",
      "Neurofinanzas aplicadas a equipos de alto desempeño",
      "Plata con plática: bienestar financiero corporativo",
    ],
    destacado: true,
    quote: "Hablar de dinero con claridad, empatía y acción sin excusas.",
    fuente: "https://vozestrategica.com/elaine-miranda/",
  },
  {
    slug: "paola-aldaz",
    nombre: "Paola Aldaz",
    especialidad: "Marketing exponencial, innovación & transformación digital",
    foto: paolaImg,
    bio: [
      "Reconocida como una de las speakers internacionales más influyentes en innovación, liderazgo y transformación digital en Latinoamérica. Es experta en marketing exponencial y escritora del libro Brand Exponential.",
      "También aparece asociada a cargos senior de marketing y marca, incluyendo Head de Marketing & Brand en Keralty y experiencia previa como VP de Marketing de Mastercard en Colombia y Ecuador.",
    ],
    tematicas: ["Marketing exponencial", "Innovación", "Liderazgo", "Transformación digital", "Marca"],
    charlas: [
      "Brand Exponential: marcas que crecen sin pedir permiso",
      "Liderazgo en la era de la transformación digital",
      "Innovación con propósito en organizaciones globales",
    ],
    destacado: true,
    quote: "Las marcas exponenciales no se construyen: se desencadenan.",
    fuente: "https://vozestrategica.com/paola-aldaz/",
  },
  {
    slug: "julian-giraldo",
    nombre: "Julián Giraldo",
    especialidad: "Inspiración, inclusión & propósito",
    foto: julianImg,
    bio: [
      "Ingeniero industrial, especialista en Finanzas Corporativas del CESA y mágister en Marketing de la Universidad Católica. Cofundador y VP Estratégico de CPC Group.",
      "Tras sobrevivir a un accidente cerebrovascular que afectó el 70% de su hemisferio cerebral izquierdo, transformó su historia en propósito: impulsar conversaciones sobre resiliencia, inclusión, consciencia y segundas oportunidades. Es autor de Milagrosa mente bien y fundador de una iniciativa enfocada en discapacidad física e inclusión.",
    ],
    tematicas: ["Resiliencia", "Inclusión", "Propósito", "Liderazgo personal", "Transformación"],
    charlas: [
      "milagrosaMENTE bien",
      "ABC de la inclusión",
      "Segundas oportunidades: liderar desde el propósito",
    ],
    destacado: false,
    quote: "Cuando te concentras en lo que tienes y no en lo que te hace falta, tienes el poder de hacer milagros.",
    fuente: "https://vozestrategica.com/julian-giraldo/",
  },
  {
    slug: "william-vinasco",
    nombre: "William Vinasco",
    especialidad: "Comunicación, narración & liderazgo desde la voz",
    foto: williamImg,
    bio: [
      "Narrador oficial de la Selección Colombia, empresario, fundador de Radiopolis y figura con más de 50 años de trayectoria. Su perfil está construido alrededor del poder de la voz, la comunicación y la conexión emocional con las audiencias.",
      "Como speaker de Voz Estratégica, su propuesta se asocia con experiencia, comunicación auténtica, motivación y reflexiones sobre éxito, felicidad y propósito.",
    ],
    tematicas: ["Comunicación", "Narración", "Liderazgo", "Motivación", "Propósito"],
    charlas: [
      "El poder de la voz en el liderazgo",
      "Narrar para conectar: comunicación auténtica",
      "Éxito, felicidad y propósito: 50 años en el micrófono",
    ],
    destacado: false,
    quote: "La voz no se impone: se afina hasta que se vuelve verdad.",
    fuente: "https://vozestrategica.com/william_vinasco/",
  },
];

export const events: EventItem[] = [
  {
    id: "ev-1",
    titulo: "Toolkit Talks 2026",
    fecha: "2026-08-14",
    ciudad: "Bogotá",
    descripcion: "Encuentro de marketing y creatividad creado por Carlos Laguna.",
    speakerSlug: "carlos-laguna",
  },
  {
    id: "ev-2",
    titulo: "Cumbre de Bienestar Financiero Corporativo",
    fecha: "2026-09-22",
    ciudad: "Ciudad de México",
    descripcion: "Elaine Miranda abre la cumbre con su keynote sobre neurofinanzas aplicadas a equipos.",
    speakerSlug: "elaine-miranda",
  },
  {
    id: "ev-3",
    titulo: "Brand Exponential Summit",
    fecha: "2026-10-05",
    ciudad: "Madrid",
    descripcion: "Paola Aldaz lidera una conversación internacional sobre marcas exponenciales.",
    speakerSlug: "paola-aldaz",
  },
  {
    id: "ev-4",
    titulo: "MilagrosaMENTE bien — Conferencia Anual",
    fecha: "2026-11-18",
    ciudad: "Lima",
    descripcion: "Julián Giraldo presenta su charla insignia sobre resiliencia, inclusión y propósito.",
    speakerSlug: "julian-giraldo",
  },
];

export const books: Book[] = [
  {
    id: "b-1",
    titulo: "De Clientes a Fans",
    autorSlug: "carlos-laguna",
    portada: bookClientesFans,
    descripcion: "El método para construir lealtad real en la era del ruido.",
    anio: 2023,
  },
  {
    id: "b-2",
    titulo: "Mujeres y Finanzas",
    autorSlug: "elaine-miranda",
    portada: bookMujeresFinanzas,
    descripcion: "Bestseller sobre bienestar financiero con enfoque humano y práctico.",
    anio: 2022,
  },
  {
    id: "b-3",
    titulo: "Brand Exponential",
    autorSlug: "paola-aldaz",
    portada: bookBrandExponential,
    descripcion: "Marketing exponencial para marcas que quieren crecer sin pedir permiso.",
    anio: 2024,
  },
  {
    id: "b-4",
    titulo: "Milagrosa mente bien",
    autorSlug: "julian-giraldo",
    portada: bookMilagrosamente,
    descripcion: "Un manifiesto sobre la resiliencia desde la gratitud y el propósito.",
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
