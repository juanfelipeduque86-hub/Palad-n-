import type { Direction, Domain, Facet, Subject } from './types';
import { clause, lowerFirst, norm, toSecondPerson } from './text';

interface FacetDef extends Facet {
  re: RegExp;
}

/** Nouns that name the thing the user is working on, and the situation they imply. */
const SUBJECT_NOUNS: Array<[RegExp, Domain, boolean]> = [
  [/app|aplicacion|web|pagina web|tienda online|juego|videojuego|startup|negocio|empresa|emprendimiento|marca|logo|portfolio|portafolio|blog/, 'project', false],
  [/proyecto/, 'project', true],
  [/libro|novela|cuento|cancion|disco|album|podcast|canal|comic|ilustracion|cortometraje|guion|poema/, 'creative', false],
  [/tesis|tfg|tfm|examen|examenes|oposiciones|asignatura|curso|idioma|ingles|carrera|apuntes/, 'study', false],
  [/trabajo|cv|curriculum|entrevista|presentacion|charla|informe|reunion/, 'work', false],
  [/mudanza|viaje|casa|piso|papeles|tramites|agenda|armario/, 'organization', false],
];

const SUBJECT_RE =
  /\b(mi|mis|una|un|el|la|los|las|este|esta|nuestro|nuestra)\s+((?:pagina web|tienda online|app|aplicacion|web|juego|videojuego|startup|negocio|empresa|emprendimiento|marca|logo|portfolio|portafolio|blog|proyecto|libro|novela|cuento|cancion|disco|album|podcast|canal|comic|ilustracion|cortometraje|guion|poema|tesis|tfg|tfm|examen|examenes|oposiciones|asignatura|curso|idioma|ingles|carrera|apuntes|trabajo|cv|curriculum|entrevista|presentacion|charla|informe|reunion|mudanza|viaje|casa|piso|papeles|tramites|agenda|armario))\b((?:\s+(?:de|sobre|para)\s+[a-z0-9ñ]+){0,2})/;

const FACETS: FacetDef[] = [
  { id: 'design', label: 'el diseño', re: /disen|visual|aspecto|estetic|como se ve|interfaz|\bui\b/ },
  { id: 'code', label: 'la parte técnica', re: /codigo|programa|bug|errores? de|backend|tecnic|base de datos/ },
  { id: 'content', label: 'el contenido', re: /contenido|textos?\b|escribir|redact|capitulo|guion|letra de/ },
  { id: 'start', label: 'por dónde empezar', re: /arrancar|primer paso/ },
  { id: 'planning', label: 'organizarlo todo', re: /organiz|planific|prioriz|ordenar las|demasiadas cosas/ },
  { id: 'time', label: 'el tiempo', re: /tiempo|plazo|fecha limite|deadline|entrega|prisa/ },
  { id: 'motivation', label: 'las ganas de ponerte', re: /ganas|motivacion|procrastin|me cuesta ponerme|pereza|lo dejo para/ },
  { id: 'people', label: 'otras personas implicadas', re: /cliente|jefe|jefa|equipo|socio|socia|profesor|profesora|companer/ },
  { id: 'money', label: 'el dinero', re: /dinero|presupuesto|precio|cobrar|pagar|caro/ },
  { id: 'memory', label: 'memorizar', re: /memoriz|recordar|me olvido|se me olvida/ },
  { id: 'understanding', label: 'entender la materia', re: /no entiendo|entender|comprender|me cuesta pillar/ },
  { id: 'audience', label: 'llegar a la gente', re: /difusion|redes|seguidores|vender|marketing|que lo conozcan/ },
];

const DETAILS: Record<string, FacetDef[]> = {
  design: [
    { id: 'colors', label: 'los colores', re: /color|paleta|tono/ },
    { id: 'layout', label: 'la distribución', re: /distribu|layout|maquetac|composicion|orden de los|espaciado/ },
    { id: 'icons', label: 'los iconos', re: /icono/ },
    { id: 'typography', label: 'la tipografía', re: /tipograf|fuentes?\b/ },
  ],
  content: [
    { id: 'structure', label: 'la estructura', re: /estructura|orden|indice|esquema/ },
    { id: 'opening', label: 'el comienzo', re: /inicio|principio|comienzo|empezar/ },
    { id: 'voice', label: 'el tono', re: /\btono|\bvoz\b|estilo/ },
    { id: 'ending', label: 'el final', re: /final|cierre|conclusion/ },
  ],
  code: [
    { id: 'bug', label: 'un error concreto', re: /bug|error|falla|no funciona/ },
    { id: 'architecture', label: 'cómo organizar el código', re: /arquitectura|estructura|organizar el codigo/ },
    { id: 'learning', label: 'aprender la tecnología', re: /aprender|no se usar|nuevo para mi/ },
  ],
};

const BLOCKERS: FacetDef[] = [
  { id: 'unconvinced', label: 'no te convence', re: /no me convence|no me gusta|no me acaba|feo|no me encaja/ },
  { id: 'noStart', label: 'no sabes por dónde empezar', re: /no se por donde|no se como empezar|no se ni por donde/ },
  { id: 'perfection', label: 'quieres que quede perfecto', re: /perfect/ },
  { id: 'overwhelm', label: 'te abruma la cantidad', re: /agobi|abrum|demasiad|muchas cosas/ },
  { id: 'stuck', label: 'te atascas', re: /atasc|bloque|estanc|no avanzo|no avanza|esta parad|no me entra/ },
  { id: 'noTime', label: 'no tienes tiempo', re: /no tengo tiempo|sin tiempo|no me da la vida/ },
  { id: 'doubt', label: 'dudas entre opciones', re: /no se si|dudo|indecis/ },
  { id: 'boring', label: 'se te hace aburrido', re: /aburr|tedioso|pesado/ },
  { id: 'fear', label: 'te da miedo cómo salga', re: /miedo|me da cosa|inseguridad|insegur/ },
];

const FEELINGS: FacetDef[] = [
  { id: 'overwhelmed', label: 'agobio', re: /agobiad|abrumad/ },
  { id: 'frustrated', label: 'frustración', re: /frustrad|harto|harta/ },
  { id: 'tired', label: 'cansancio', re: /cansad|agotad/ },
  { id: 'excited', label: 'ilusión', re: /ilusionad|emocionad|con ganas/ },
  { id: 'nervous', label: 'nervios', re: /nervios|ansios/ },
];

const STOCK_LABELS = new Set([...FACETS, ...BLOCKERS, ...FEELINGS, ...Object.values(DETAILS).flat()].map((f) => f.label));

/** True for Paladin's own wording; false when the label holds the user's words. */
export const isStockLabel = (label: string): boolean => STOCK_LABELS.has(label);

export interface Extraction {
  domain: Domain | null;
  subject: Subject | null;
  goal: string | null;
  focus: Facet | null;
  detail: Facet | null;
  blocker: Facet | null;
  feeling: Facet | null;
  success: string | null;
  tried: string | null;
  constraints: string[];
  options: [string, string] | null;
  direction: Direction | null;
  dontKnow: boolean;
  correction: boolean;
  topicChange: boolean;
  stop: boolean;
  yes: boolean;
  no: boolean;
  question: boolean;
  /** True when anything about the situation was recognised. */
  informative: boolean;
}

const match = (defs: FacetDef[], n: string): Facet | null => {
  const d = defs.find((f) => f.re.test(n));
  return d ? { id: d.id, label: d.label } : null;
};

/** Details that only make sense once the focus is known ("el comienzo" of a text). */
export function matchDetail(text: string, focusId: string | undefined): Facet | null {
  if (!focusId) return null;
  return match(DETAILS[focusId] ?? [], lastSegment(norm(text)));
}

/** Used when answering "which part is hardest": any known detail also reveals its focus. */
export function matchAnyDetail(text: string): { focus: string; detail: Facet } | null {
  const n = lastSegment(norm(text));
  for (const [focus, defs] of Object.entries(DETAILS)) {
    const d = match(defs, n);
    if (d) return { focus, detail: d };
  }
  return null;
}

/** Rough guard against keyboard mashing before storing words verbatim. */
export function looksLikeWords(text: string): boolean {
  const letters = norm(text).replace(/[^a-zñ]/g, '');
  if (letters.length < 2) return false;
  const vowels = letters.replace(/[^aeiou]/g, '').length;
  return vowels / letters.length >= 0.34;
}

/** In "no es X, en realidad es Y", the part that matters is Y. */
export function lastSegment(n: string): string {
  const m = /(?:en realidad|mas bien|sino|lo que pasa es que|me referia a)\s+(.*)$/.exec(n);
  return m?.[1] ?? n;
}

/** Finds the original-case substring for a match found on the normalised text. */
function original(text: string, n: string, idx: number, len: number): string {
  // NFD normalisation keeps character positions for Spanish text after stripping marks.
  return n.length === text.length ? text.slice(idx, idx + len) : n.slice(idx, idx + len);
}

function extractSubject(text: string, n: string): { subject: Subject; domain: Domain } | null {
  const m = SUBJECT_RE.exec(n);
  if (!m || m.index === undefined) return null;
  const said = original(text, n, m.index, m[0].length).trim();
  const article = (m[1] ?? '').toLowerCase();
  const noun = original(text, n, m.index + m[0].indexOf(m[2] ?? ''), (m[2] ?? '').length);
  const tail = (m[3] ?? '').trim() ? ` ${original(text, n, m.index + m[0].indexOf(m[3] ?? ''), (m[3] ?? '').length).trim()}` : '';
  const plural = article === 'mis' || article === 'los' || article === 'las' || /s$/.test(m[2] ?? '');
  const possessive = ['mi', 'mis', 'una', 'un', 'este', 'esta', 'nuestro', 'nuestra'].includes(article);
  const ref = possessive ? `${plural ? 'tus' : 'tu'} ${noun}${tail}` : `${article} ${noun}${tail}`;
  const nounNorm = m[2] ?? '';
  const def = SUBJECT_NOUNS.find(([re]) => re.test(nounNorm));
  return {
    subject: { said: lowerFirst(said), ref: lowerFirst(ref), generic: def?.[2] ?? false },
    domain: def?.[1] ?? 'general',
  };
}

const CONSTRAINT_RES: RegExp[] = [
  /\b(?:\d+|un[ao]?|dos|tres|cuatro|cinco|seis|diez)\s+(?:minutos?|horas?|dias?|semanas?|meses?)(?:\s+(?:al dia|a la semana|libres?))?/,
  /\bpara (?:el |la |este |esta )?(?:lunes|martes|miercoles|jueves|viernes|sabado|domingo|fin de semana|mes que viene|semana que viene|manana|final de mes)\b/,
  /\b(?:antes del?|hasta el)\s+[a-z0-9 ]{2,20}/,
  /\b(?:sin|no tengo)\s+(?:dinero|presupuesto|ordenador|ayuda)\b/,
  /\bsolo tengo\s+[a-z0-9 ]{2,30}/,
];

export function extract(raw: string): Extraction {
  const text = raw.trim().normalize('NFC');
  const n = norm(text);
  const subj = extractSubject(text, n);
  const decision = /\b(decidir|elegir|decision|no se si|dudo entre|no se que elegir)\b/.test(n);

  let options: [string, string] | null = null;
  const between =
    /entre\s+(.+?)\s+(?:y|o)\s+(.+?)(?:[.,;?!]|$)/i.exec(text) ?? (decision ? /\bsi\s+(.+?)\s+o\s+(.+?)(?:[.,;?!]|$)/i.exec(text) : null);
  if (between?.[1] && between[2]) options = [toSecondPerson(clause(between[1], 40)), toSecondPerson(clause(between[2], 40))];

  const goalM = /\b(?:quiero|quisiera|me gustaria|necesito|tengo que|intento)\s+(?!que\b)(.+?)(?:,|\.|;|\s+pero\s|\s+y no\s|$)/.exec(n);
  const successM = /\b(?:quiero|me gustaria|busco)\s+que\s+(.+?)(?:[.,;]|$)/.exec(n) ?? /^que\s+(.+?)(?:[.;]|$)/.exec(n);
  const triedM = /\b(?:he probado|probe|intente|he intentado|ya hice|ya he)\s+(.+?)(?:[.,;]|$)/.exec(n);

  const focus = match(FACETS, n);
  // Design details are unambiguous on their own; others depend on the focus (see matchDetail).
  const detail = match(DETAILS.design ?? [], n);

  let direction: Direction | null = null;
  if (/\b(seguir explorando|explorar|seguir hablando|hablar mas|contarte mas|profundizar)\b/.test(n)) direction = 'explore';
  else if (/\b(entender|por que me pasa|por que pasa|comprender por que)\b/.test(n)) direction = 'understand';
  else if (/\b(opciones|ideas|alternativas|posibilidades)\b/.test(n)) direction = 'options';
  else if (/\b(decidir|decision|elegir ya)\b/.test(n)) direction = 'decide';
  else if (/\b(paso pequeno|un paso|accion|que hago|hacer algo|empezar ya|ponerme)\b/.test(n)) direction = 'act';
  else if (/\b(lo dejo aqui|dejarlo aqui|parar|terminar por hoy)\b/.test(n)) direction = 'stop';

  const constraints = CONSTRAINT_RES.map((re) => re.exec(n)?.[0]).filter((s): s is string => Boolean(s)).map((s) => s.trim());

  const out: Extraction = {
    domain: decision ? 'decision' : (subj?.domain ?? null),
    subject: subj?.subject ?? null,
    goal: goalM?.[1] ? toSecondPerson(clause(original(text, n, n.indexOf(goalM[1]), goalM[1].length), 60)) : null,
    focus: match(FACETS, lastSegment(n)) ?? focus,
    detail: match(DETAILS.design ?? [], lastSegment(n)) ?? detail,
    // "No sé si A o B" is the decision itself, not a blocker.
    blocker: ((b) => (decision && b?.id === 'doubt' ? null : b))(match(BLOCKERS, lastSegment(n))),
    feeling: match(FEELINGS, n),
    success: successM?.[1] ? toSecondPerson(clause(original(text, n, n.indexOf(successM[1]), successM[1].length), 60)) : null,
    tried: triedM?.[1] ? toSecondPerson(clause(original(text, n, n.indexOf(triedM[1]), triedM[1].length), 60)) : null,
    constraints,
    options,
    direction,
    dontKnow: /^(no se|ni idea|no estoy segur|no lo se|ni lo se|no tengo ni idea|pues no se)\b/.test(n) && n.length < 40,
    correction: /^(no[,.!]|no,?\s+(?:es|era|eso|exactamente|me refiero)|en realidad|mas bien|me referia|corrijo|perdona,|eso no|no del todo)/.test(n),
    topicChange: /\b(otra cosa|cambiar de tema|cambiemos de tema|otro tema|hablemos de)\b/.test(n),
    stop: /^(gracias|muchas gracias|ya esta|lo dejo|lo dejamos|eso es todo|nada mas|hasta luego|adios)\b/.test(n),
    yes: /^(si|sip|exacto|correcto|eso es|vale|ok|claro|asi es|perfecto|tal cual|bien)\b/.test(n),
    no: /^no\b/.test(n),
    question: /\?\s*$/.test(text.trim()) || /^(que es|cual es|quien|cuando fue|cuanto|como se llama|donde esta)\b/.test(n),
    informative: false,
  };
  out.informative = Boolean(
    out.subject || out.goal || out.focus || out.detail || out.blocker || out.success || out.tried || out.constraints.length || out.options || out.domain,
  );
  return out;
}
