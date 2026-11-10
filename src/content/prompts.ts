/**
 * Creative prompts. Without an AI model Paladin cannot judge the quality of an idea,
 * so feedback is limited to rules that can be checked honestly (word counts, required words,
 * number of ideas) plus other possible approaches to compare with.
 */
export type PromptKind = 'asociacion' | 'usos' | 'ysi' | 'micro' | 'inventar' | 'replantear';

export const PROMPT_KIND_LABEL: Record<PromptKind, string> = {
  asociacion: 'Asociación',
  usos: 'Usos inesperados',
  ysi: '¿Y si…?',
  micro: 'Microrrelato',
  inventar: 'Invención',
  replantear: 'Replantear',
};

export interface Rule {
  /** Exact word count for the whole answer. */
  words?: number;
  /** Words that must appear (accent-insensitive). */
  mustInclude?: string[];
  /** Minimum separate ideas (one per line). */
  minIdeas?: number;
  /** Letter every idea must start with. */
  startsWith?: string;
}

export interface CreativePrompt {
  id: string;
  kind: PromptKind;
  title: string;
  prompt: string;
  rule?: Rule;
  /** Different directions others might take. Not "the" answer. */
  approaches: Array<{ name: string; example: string }>;
  /** Questions to look at your own idea. */
  reflect: string[];
}

export const PROMPTS: CreativePrompt[] = [
  {
    id: 'e01', kind: 'asociacion', title: 'Faro y cuchara',
    prompt: 'Encuentra una conexión entre un faro y una cuchara. Cuanto menos obvia, mejor.',
    rule: { mustInclude: ['faro', 'cuchara'] },
    approaches: [
      { name: 'Por la forma', example: 'Una cuchara puesta boca abajo sobre la mesa parece una cúpula de faro.' },
      { name: 'Por la función', example: 'Ambos guían algo hacia un lugar seguro: el faro, barcos al puerto; la cuchara, la sopa a la boca.' },
      { name: 'Por una historia', example: 'El farero solo tenía una cuchara, y con ella golpeaba la lámpara del faro para avisar a los barcos cuando fallaba la luz.' },
    ],
    reflect: ['¿Tu conexión es por forma, función, historia o algo distinto?', '¿Se te ocurre una segunda conexión de otro tipo?'],
  },
  {
    id: 'e02', kind: 'usos', title: 'Una pinza de la ropa',
    prompt: 'Escribe al menos cinco usos para una pinza de la ropa que no sean colgar ropa. Una idea por línea.',
    rule: { minIdeas: 5 },
    approaches: [
      { name: 'Sujetar', example: 'Cerrar una bolsa de patatas abierta.' },
      { name: 'Marcar', example: 'Señalar la página de un libro o un cable concreto entre muchos.' },
      { name: 'Transformar', example: 'Convertirla en un pequeño muñeco o en un soporte para el móvil.' },
    ],
    reflect: ['¿Cuántas de tus ideas usan la pinza para sujetar? ¿Alguna rompe esa idea?', '¿Qué idea te sorprendió más a ti?'],
  },
  {
    id: 'e03', kind: 'ysi', title: 'Sin noche',
    prompt: '¿Qué cambiaría en tu ciudad si nunca se hiciera de noche? Piensa en consecuencias pequeñas, no solo en las grandes.',
    approaches: [
      { name: 'Lo cotidiano', example: 'Las cortinas opacas serían un objeto imprescindible en cada casa.' },
      { name: 'Lo social', example: 'Desaparecería «quedar por la noche»; quizá aparecería un «quedar en la hora tranquila».' },
      { name: 'Lo natural', example: 'Los animales nocturnos tendrían que adaptarse o desaparecer de la ciudad.' },
    ],
    reflect: ['¿Tus ideas se quedan en lo práctico o llegan a costumbres y emociones?', '¿Qué consecuencia de otra consecuencia se te ocurre?'],
  },
  {
    id: 'e04', kind: 'micro', title: 'Historia de seis palabras',
    prompt: 'Cuenta una historia completa en exactamente seis palabras.',
    rule: { words: 6 },
    approaches: [
      { name: 'Giro final', example: 'Encontré el mapa. Era mi casa.' },
      { name: 'Lo que falta', example: 'Dos tazas en la mesa. Una.' },
      { name: 'Tiempo comprimido', example: 'Sembró la semilla. Sus nietos descansan.' },
    ],
    reflect: ['¿Hay un antes y un después en tus seis palabras?', '¿Qué palabra podrías cambiar para que diga más?'],
  },
  {
    id: 'e05', kind: 'inventar', title: 'Un objeto para lo que olvidas',
    prompt: 'Inventa un objeto que te ayude con algo que sueles olvidar. Dale un nombre y explica cómo funciona.',
    approaches: [
      { name: 'Recordatorio físico', example: 'Un llavero que pesa más cuando tienes algo pendiente.' },
      { name: 'Cambiar el entorno', example: 'Una puerta que no se abre del todo si no llevas la cartera.' },
      { name: 'Hacerlo innecesario', example: 'Unas llaves que no existen: la casa reconoce tu forma de llamar.' },
    ],
    reflect: ['¿Tu invento recuerda, obliga o elimina el problema?', '¿Qué haría falta para fabricar una versión simple hoy?'],
  },
  {
    id: 'e06', kind: 'replantear', title: 'Una cola larga',
    prompt: 'Una tienda tiene colas muy largas. En lugar de «hacer la cola más rápida», escribe tres formas distintas de plantear el problema.',
    rule: { minIdeas: 3 },
    approaches: [
      { name: 'Cambiar la espera', example: '¿Cómo hacer que esperar sea agradable o útil?' },
      { name: 'Cambiar la llegada', example: '¿Cómo repartir a la gente para que no llegue a la vez?' },
      { name: 'Quitar la necesidad', example: '¿Qué compras podrían hacerse sin pasar por caja?' },
    ],
    reflect: ['¿Tus planteamientos llevan a soluciones distintas entre sí?', '¿Cuál descarta una suposición que dabas por hecha?'],
  },
  {
    id: 'e07', kind: 'asociacion', title: 'Tres palabras, un lugar',
    prompt: 'Describe un lugar que no existe usando estas tres palabras: niebla, cobre, campanas.',
    rule: { mustInclude: ['niebla', 'cobre', 'campanas'] },
    approaches: [
      { name: 'Ambiente', example: 'Un puerto donde la niebla huele a cobre y las campanas marcan el rumbo.' },
      { name: 'Regla del lugar', example: 'Una ciudad donde está prohibido hablar cuando hay niebla; solo hablan las campanas de cobre.' },
      { name: 'Personaje', example: 'El último fundidor de campanas de cobre vive donde la niebla no se levanta nunca.' },
    ],
    reflect: ['¿Las tres palabras están integradas o solo mencionadas?', '¿Qué detalle haría que alguien quisiera visitar ese lugar?'],
  },
  {
    id: 'e08', kind: 'usos', title: 'Un ladrillo',
    prompt: 'Escribe al menos cinco usos para un ladrillo que no sean construir. Una idea por línea.',
    rule: { minIdeas: 5 },
    approaches: [
      { name: 'Peso', example: 'Sujetar papeles al aire libre.' },
      { name: 'Calor', example: 'Calentarlo y usarlo para mantener caliente un plato.' },
      { name: 'Arte', example: 'Tallar en él un relieve o usarlo como lienzo.' },
    ],
    reflect: ['¿Qué propiedad del ladrillo usaste en cada idea: peso, forma, dureza, textura?', '¿Hay alguna propiedad que no hayas usado?'],
  },
  {
    id: 'e09', kind: 'ysi', title: 'Animales que votan',
    prompt: '¿Y si los animales de tu barrio pudieran votar una sola norma? ¿Cuál propondrían y quién se opondría?',
    approaches: [
      { name: 'Desde un animal concreto', example: 'Las palomas propondrían prohibir los pinchos en las cornisas.' },
      { name: 'Conflicto', example: 'Los gatos querrían más cajas de cartón; los perros, menos gatos.' },
      { name: 'Humor', example: 'Los mosquitos pedirían que se prohibieran las mosquiteras… y nadie les haría caso.' },
    ],
    reflect: ['¿Tu norma revela algo cierto sobre ese animal?', '¿Cómo reaccionarían los humanos?'],
  },
  {
    id: 'e10', kind: 'micro', title: 'Empieza por la misma letra',
    prompt: 'Escribe una frase de al menos cuatro palabras en la que todas empiecen por la letra P.',
    rule: { startsWith: 'p' },
    approaches: [
      { name: 'Escena', example: 'Pedro pinta pájaros pequeños por placer.' },
      { name: 'Trabalenguas', example: 'Pocas pulgas pican por pura pereza.' },
      { name: 'Poético', example: 'Pasos perdidos, puertas, plazas pálidas.' },
    ],
    reflect: ['¿La frase tiene sentido además de cumplir la regla?', '¿Podrías hacer una más larga?'],
  },
  {
    id: 'e11', kind: 'inventar', title: 'Un deporte nuevo',
    prompt: 'Inventa un deporte que se pueda jugar en un pasillo. Explica el objetivo y una regla rara.',
    approaches: [
      { name: 'Precisión', example: 'Hacer rodar una moneda lo más cerca posible de la pared sin tocarla.' },
      { name: 'Silencio', example: 'Cruzar el pasillo sin que nadie te oiga; quien escucha un paso, gana el turno.' },
      { name: 'Equipo', example: 'Pasar un globo de un extremo a otro sin usar las manos.' },
    ],
    reflect: ['¿La regla rara hace el juego más interesante o solo más difícil?', '¿Cómo se gana?'],
  },
  {
    id: 'e12', kind: 'replantear', title: 'Odio fregar',
    prompt: 'A alguien le aburre fregar los platos. Escribe tres maneras distintas de replantear la situación.',
    rule: { minIdeas: 3 },
    approaches: [
      { name: 'Hacerlo de otra forma', example: '¿Cómo podría ser fregar un momento para escuchar algo que me gusta?' },
      { name: 'Ensuciar menos', example: '¿Qué platos podría dejar de usar?' },
      { name: 'Repartirlo', example: '¿Cómo convertirlo en una tarea compartida o en un turno justo?' },
    ],
    reflect: ['¿Alguno de tus planteamientos cambia el problema en vez de soportarlo?', '¿Cuál probarías mañana?'],
  },
  {
    id: 'e13', kind: 'asociacion', title: 'El color de un sonido',
    prompt: '¿De qué color es el sonido de la lluvia? Justifica tu elección.',
    approaches: [
      { name: 'Sensorial', example: 'Gris plata, porque suena como muchas monedas pequeñas.' },
      { name: 'Emocional', example: 'Azul oscuro, porque me da calma y ganas de quedarme en casa.' },
      { name: 'Contexto', example: 'Depende: en un tejado de chapa es naranja; en un bosque, verde.' },
    ],
    reflect: ['¿Tu justificación es por parecido, emoción o recuerdo?', '¿Cambiaría el color según dónde llueva?'],
  },
  {
    id: 'e14', kind: 'ysi', title: 'Objetos con memoria',
    prompt: '¿Y si los objetos recordaran a las personas que los usaron? Escribe lo que contaría uno de los tuyos.',
    approaches: [
      { name: 'Primera persona', example: 'Soy tu taza. Sé cuándo estás cansado: me agarras con las dos manos.' },
      { name: 'Historia larga', example: 'Esta mesa recuerda tres familias y una mudanza.' },
      { name: 'Humor', example: 'El mando a distancia guarda rencor a quien siempre lo pierde.' },
    ],
    reflect: ['¿Qué revela el objeto sobre ti que no dirías directamente?', '¿Qué objeto tendría la historia más rara?'],
  },
  {
    id: 'e15', kind: 'inventar', title: 'Una palabra que falta',
    prompt: 'Inventa una palabra para algo que todo el mundo vive pero que no tiene nombre. Escribe la palabra y su definición.',
    approaches: [
      { name: 'Situación', example: '«Retrapeo»: volver a una habitación y olvidar a qué ibas.' },
      { name: 'Sensación', example: '«Calmeta»: la tranquilidad de oír llover desde la cama.' },
      { name: 'Objeto', example: '«Tapalí»: la tapa de táper que nunca encaja con ningún táper.' },
    ],
    reflect: ['¿Tu palabra suena a lo que significa?', '¿Podrías usarla en una frase hoy?'],
  },
  {
    id: 'e16', kind: 'micro', title: 'Una carta en diez palabras',
    prompt: 'Escribe una carta a tu yo de hace diez años en exactamente diez palabras.',
    rule: { words: 10 },
    approaches: [
      { name: 'Consejo', example: 'No te preocupes tanto: casi nada de aquello acabó importando.' },
      { name: 'Noticia', example: 'Adivina: sigues odiando el café, pero ahora te encanta madrugar.' },
      { name: 'Agradecimiento', example: 'Gracias por no rendirte aquel invierno. Mira dónde estamos ahora.' },
    ],
    reflect: ['¿Qué tono elegiste: consejo, noticia, agradecimiento u otro?', '¿Qué te diría tu yo de hace diez años a ti?'],
  },
];

export interface RuleCheck {
  label: string;
  ok: boolean;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const words = (s: string) => s.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));

/** Only mechanical rules are checked; the idea itself is never scored. */
export function checkRules(p: CreativePrompt, text: string): RuleCheck[] {
  const r = p.rule;
  if (!r) return [];
  const out: RuleCheck[] = [];
  if (r.words !== undefined) {
    const n = words(text).length;
    out.push({ label: `Exactamente ${r.words} palabras (tienes ${n})`, ok: n === r.words });
  }
  if (r.mustInclude) {
    const t = norm(text);
    for (const w of r.mustInclude) out.push({ label: `Incluye «${w}»`, ok: new RegExp(`\\b${norm(w)}`).test(t) });
  }
  if (r.minIdeas !== undefined) {
    const n = text.split('\n').map((l) => l.trim()).filter(Boolean).length;
    out.push({ label: `Al menos ${r.minIdeas} ideas, una por línea (tienes ${n})`, ok: n >= r.minIdeas });
  }
  if (r.startsWith) {
    const ws = words(text);
    const bad = ws.filter((w) => !norm(w).replace(/[^\p{L}]/gu, '').startsWith(r.startsWith as string));
    out.push({ label: `Todas las palabras empiezan por «${r.startsWith.toUpperCase()}» (${ws.length - bad.length} de ${ws.length})`, ok: ws.length >= 4 && bad.length === 0 });
  }
  return out;
}
