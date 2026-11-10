import type { OptionItem, SlotKey, Understanding } from './types';
import { isStockLabel } from './extract';

/** Helpers to refer to what the user said. */
export const subjectRef = (u: Understanding): string => u.subject?.ref ?? (u.domain === 'study' ? 'lo que estudias' : 'tu proyecto');
export const focusRef = (u: Understanding): string => u.detail?.label ?? u.focus?.label ?? 'esa parte';

export interface Question {
  id: string;
  slot: SlotKey;
  text: string;
  chips: string[];
}

/** Core questions, in order. Each only applies when its slot is still unknown. */
export function gatherQuestion(u: Understanding, asked: string[]): Question | null {
  const has = (id: string) => asked.includes(id);
  const s = subjectRef(u);

  if (u.domain === 'decision') {
    if (!u.options && !has('d_options'))
      return { id: 'd_options', slot: 'subject', text: '¿Entre qué opciones estás dudando? Cuéntamelas con tus palabras.', chips: [] };
    if (u.options && !u.blocker && !u.criterion && !has('d_block'))
      return {
        id: 'd_block',
        slot: 'blocker',
        text: `¿Qué es lo que hace difícil elegir entre «${u.options[0]}» y «${u.options[1]}»?`,
        chips: ['Las dos me gustan', 'Me da miedo equivocarme', 'Me falta información'],
      };
    if (u.options && !u.criterion && !has('d_criterion'))
      return {
        id: 'd_criterion',
        slot: 'criterion',
        text: 'Si solo pudieras usar un criterio para decidir, ¿cuál sería el más importante para ti?',
        chips: ['El dinero', 'El tiempo', 'Lo que me ilusiona', 'La seguridad'],
      };
    return null;
  }

  if ((!u.subject || u.subject.generic) && !u.focus && !has('which')) {
    if (u.subject?.generic || /proyecto/.test(u.goal ?? ''))
      return { id: 'which', slot: 'subject', text: '¿Qué proyecto es y qué parte te está costando más?', chips: [] };
    return {
      id: 'which',
      slot: 'subject',
      text: '¿Sobre qué es? Por ejemplo, un proyecto, algo que estudias, tu trabajo o una decisión.',
      chips: ['Un proyecto', 'Algo que estudio', 'Mi trabajo', 'Una decisión'],
    };
  }

  if (!u.focus && !has('focus')) {
    const byDomain: Record<string, Question> = {
      study: {
        id: 'focus',
        slot: 'focus',
        text: `¿Qué es lo que más te cuesta de ${s}: entender la materia, memorizar u organizar el tiempo?`,
        chips: ['Entender la materia', 'Memorizar', 'Organizar el tiempo'],
      },
      creative: {
        id: 'focus',
        slot: 'focus',
        text: `¿En qué punto está ${s} y qué parte se te resiste más?`,
        chips: ['El contenido', 'Por dónde empezar', 'Las ganas de ponerme'],
      },
      work: {
        id: 'focus',
        slot: 'focus',
        text: `¿Qué parte de ${s} te preocupa más ahora mismo?`,
        chips: ['El contenido', 'El tiempo', 'Otras personas'],
      },
      organization: {
        id: 'focus',
        slot: 'focus',
        text: `¿Qué es lo que más te pesa de ${s}?`,
        chips: ['Por dónde empezar', 'El tiempo', 'Son demasiadas cosas'],
      },
    };
    return (
      byDomain[u.domain ?? ''] ?? {
        id: 'focus',
        slot: 'focus',
        text: `¿Qué parte de ${s} te está costando más?`,
        chips: ['El diseño', 'La parte técnica', 'El contenido', 'Por dónde empezar'],
      }
    );
  }

  if (u.focus && !u.detail && !has('detail')) {
    if (u.focus.id === 'design')
      return {
        id: 'detail',
        slot: 'detail',
        text: '¿Qué te gustaría cambiar primero: los colores, la distribución o el estilo de los iconos?',
        chips: ['Los colores', 'La distribución', 'Los iconos', 'La tipografía'],
      };
    if (u.focus.id === 'content')
      return {
        id: 'detail',
        slot: 'detail',
        text: '¿Dónde se atasca más el contenido: en la estructura, en el comienzo o en el tono?',
        chips: ['La estructura', 'El comienzo', 'El tono'],
      };
    if (u.focus.id === 'code')
      return {
        id: 'detail',
        slot: 'detail',
        text: '¿Es un error concreto, cómo organizar el código o aprender una tecnología nueva?',
        chips: ['Un error concreto', 'Organizar el código', 'Aprender la tecnología'],
      };
  }

  if (!u.blocker && !has('blocker')) {
    const target = focusRef(u);
    const text =
      u.detail?.id === 'colors'
        ? '¿Qué es lo que no te convence de los colores ahora mismo: que son demasiados, que no combinan o que no transmiten lo que quieres?'
        : u.focus?.id === 'start'
          ? `Cuando piensas en empezar ${s}, ¿qué es lo que te frena: que hay demasiadas piezas, que no sabes cuál va primero o que quieres hacerlo perfecto?`
          : `¿Qué es exactamente lo que se complica con ${target}?`;
    return {
      id: 'blocker',
      slot: 'blocker',
      text,
      chips: u.detail?.id === 'colors' ? ['Son demasiados', 'No combinan', 'No transmiten lo que quiero'] : ['No me convence', 'Me atasco', 'Me agobia', 'No tengo tiempo'],
    };
  }

  if (!u.success && !has('success')) {
    const text =
      u.focus?.id === 'design'
        ? `¿Qué sensación te gustaría que transmitiera ${s}? Por ejemplo calma, energía, seriedad o algo más tuyo.`
        : `Si ${focusRef(u)} estuviera resuelto, ¿cómo lo notarías?`;
    return { id: 'success', slot: 'success', text, chips: u.focus?.id === 'design' ? ['Calma', 'Energía', 'Seriedad', 'Cercanía'] : [] };
  }

  if (!u.tried && !has('tried'))
    return { id: 'tried', slot: 'tried', text: '¿Has probado ya algo para resolverlo? Así no te propongo lo mismo.', chips: ['Todavía nada'] };

  return null;
}

/** Extra angles for "seguir explorando". Each is used once. */
export function exploreQuestion(u: Understanding, asked: string[]): Question | null {
  const s = subjectRef(u);
  const all: Question[] = [
    ...(u.focus?.id === 'design' || u.domain === 'creative'
      ? [{ id: 'x_reference', slot: 'reference' as const, text: `¿Hay algo —una app, una web, una obra— cuyo estilo te guste y que pueda servir de referencia para ${s}?`, chips: [] }]
      : []),
    { id: 'x_why', slot: 'whyNow', text: `¿Por qué te importa resolver esto ahora? ¿Qué cambiaría si ${s} saliera bien?`, chips: [] },
    { id: 'x_smallest', slot: 'smallest', text: `Si tuvieras que mirar solo una parte pequeña de ${focusRef(u)}, ¿cuál elegirías?`, chips: [] },
    { id: 'x_worry', slot: 'worry', text: '¿Qué es lo que más te preocupa que salga mal?', chips: [] },
    ...(u.constraints.length === 0
      ? [{ id: 'x_limits', slot: 'constraints' as const, text: '¿Hay algún límite que deba tener en cuenta: tiempo, herramientas o alguien más que decida?', chips: ['Poco tiempo', 'Ninguno especial'] }]
      : []),
    { id: 'x_others', slot: 'others', text: `¿Hay alguien más que opine o decida sobre ${s}?`, chips: ['No, solo yo'] },
  ];
  return all.find((q) => !asked.includes(q.id)) ?? null;
}

/** Tentative readings for "entender por qué pasa". Keyed so each is used once. */
export function insight(u: Understanding, used: string[]): { id: string; text: string } | null {
  const s = subjectRef(u);
  const f = focusRef(u);
  const candidates: Array<{ id: string; when: boolean; text: string }> = [
    {
      id: 'unconvinced-success',
      when: u.blocker?.id === 'unconvinced' && Boolean(u.success),
      text: `Dijiste que para ${s} buscas «${u.success}». Puede que lo que no te convence de ${f} sea que ahora mismo no apunta hacia eso, más que que esté «mal» en sí.`,
    },
    {
      id: 'unconvinced',
      when: u.blocker?.id === 'unconvinced',
      text: `Que algo no te convenza suele indicar que ya tienes un criterio, aunque todavía no esté escrito. Mientras no lo nombres, cualquier cambio en ${f} se siente arbitrario.`,
    },
    {
      id: 'noStart',
      when: u.blocker?.id === 'noStart' || u.focus?.id === 'start',
      text: `Cuando no sabes por dónde empezar, a menudo es porque todas las partes de ${s} parecen igual de importantes. Elegir una entrada pequeña suele desbloquear más que planificarlo todo.`,
    },
    {
      id: 'overwhelm',
      when: u.blocker?.id === 'overwhelm' || u.feeling?.id === 'overwhelmed',
      text: `Por lo que cuentas, pesa más el volumen que la dificultad: hay muchas piezas abiertas a la vez, y eso hace que ninguna parezca abordable.`,
    },
    {
      id: 'perfection',
      when: u.blocker?.id === 'perfection',
      text: `Si la referencia es que quede perfecto, cualquier primer intento parece insuficiente. Separar «probar» de «decidir» puede quitar presión.`,
    },
    {
      id: 'time',
      when: u.blocker?.id === 'noTime' || u.focus?.id === 'time' || u.constraints.length > 0,
      text: `Con ${u.constraints[0] ?? 'poco tiempo'}, la pregunta útil quizá no sea cómo hacerlo todo, sino qué parte de ${s} merece ese tiempo primero.`,
    },
    {
      id: 'motivation',
      when: u.focus?.id === 'motivation' || u.blocker?.id === 'boring',
      text: `Cuando cuesta ponerse, a veces la tarea está definida de forma demasiado grande o poco concreta. No es necesariamente falta de ganas de ${s}.`,
    },
    {
      id: 'decision',
      when: u.domain === 'decision' && Boolean(u.options),
      text: `Cuando dos opciones se sienten parecidas, suele faltar un criterio explícito.${u.criterion ? ` Mencionaste «${u.criterion}»: mirar ambas solo con ese criterio puede aclarar bastante.` : ''}`,
    },
    {
      id: 'study',
      when: u.domain === 'study',
      text: `Con ${s}, ${u.focus?.id === 'memory' ? 'memorizar suele costar menos cuando ya entiendes la idea' : 'entender y memorizar son dos trabajos distintos'}; tratarlos por separado puede ayudarte a ver dónde está el atasco real.`,
    },
    {
      id: 'generic',
      when: true,
      text: `Lo que veo hasta ahora: ${f} es el punto que más pesa${u.blocker ? (!isStockLabel(u.blocker.label) ? `, y lo complica «${u.blocker.label}»` : `, y lo complica que ${u.blocker.label}`) : ''}. Es una lectura provisional con lo poco que sé.`,
    },
  ];
  const c = candidates.find((x) => x.when && !used.includes(x.id));
  return c ? { id: c.id, text: c.text } : null;
}

/** Options for "ver opciones", built from what the user said. */
export function optionSet(u: Understanding, used: string[]): { id: string; options: OptionItem[] } | null {
  const s = subjectRef(u);
  const ref = u.reference ? `«${u.reference}»` : null;
  const feel = u.success ? ` (dijiste «${u.success}»)` : '';
  const sets: Array<{ id: string; when: boolean; options: OptionItem[] }> = [
    {
      id: 'colors',
      when: u.detail?.id === 'colors',
      options: [
        { title: 'Reducir la paleta', detail: `Quedarte con un fondo, un color de texto y un único acento, y ver si ${s} gana claridad.` },
        { title: 'Partir de una referencia', detail: ref ? `Tomar los colores de ${ref} como punto de partida y ajustarlos.` : 'Elegir una app que te guste y anotar sus tres colores principales.' },
        { title: 'Definir la sensación primero', detail: `Escribir en tres palabras lo que debe transmitir${feel} y descartar colores que no encajen.` },
      ],
    },
    {
      id: 'layout',
      when: u.detail?.id === 'layout',
      options: [
        { title: 'Jerarquía primero', detail: 'Decidir qué es lo más importante de cada pantalla y darle más espacio que al resto.' },
        { title: 'Simplificar a una columna', detail: `Probar una versión de ${s} en una sola columna para ver qué sobra.` },
        { title: 'Comparar con una referencia', detail: ref ? `Mirar cómo reparte el espacio ${ref}.` : 'Comparar tu pantalla principal con una app que te parezca ordenada.' },
      ],
    },
    {
      id: 'icons',
      when: u.detail?.id === 'icons',
      options: [
        { title: 'Una sola familia', detail: 'Usar iconos del mismo grosor y estilo en todas las pantallas.' },
        { title: 'Menos iconos', detail: 'Quitar los que no aportan y dejar texto donde baste.' },
        { title: 'Unificar tamaños', detail: 'Igualar tamaño y alineación antes de cambiar el dibujo.' },
      ],
    },
    {
      id: 'typography',
      when: u.detail?.id === 'typography',
      options: [
        { title: 'Una sola familia tipográfica', detail: 'Usar una fuente con dos o tres pesos en lugar de varias fuentes.' },
        { title: 'Escala clara', detail: 'Definir solo tres tamaños: título, texto y detalle.' },
        { title: 'Probar legibilidad', detail: 'Ver el texto en el móvil a distancia normal y ajustar tamaño o contraste.' },
      ],
    },
    {
      id: 'content',
      when: u.focus?.id === 'content',
      options: [
        { title: 'Esquema antes que texto', detail: `Escribir solo los títulos de las partes de ${s} y ordenarlos.` },
        { title: 'Borrador feo', detail: 'Escribir una versión rápida sin corregir, para tener algo que mejorar.' },
        { title: 'Empezar por el medio', detail: 'Escribir primero la parte que te resulte más clara, no la primera.' },
      ],
    },
    {
      id: 'start',
      when: u.focus?.id === 'start' || u.blocker?.id === 'noStart' || u.blocker?.id === 'overwhelm',
      options: [
        { title: 'Listar sin ordenar', detail: `Escribir todo lo que implica ${s}, sin prioridades, para sacarlo de la cabeza.` },
        { title: 'Elegir la pieza más pequeña', detail: 'Empezar por lo que se pueda terminar hoy, aunque no sea lo más importante.' },
        { title: 'Definir qué sería «suficiente»', detail: 'Decidir qué versión mínima te dejaría tranquilo antes de empezar.' },
      ],
    },
    {
      id: 'study',
      when: u.domain === 'study',
      options: [
        { title: 'Explicarlo con tus palabras', detail: 'Intentar explicar un tema en voz alta y anotar dónde te trabas.' },
        { title: 'Preguntas de repaso', detail: 'Escribir cinco preguntas sobre el tema y responderlas al día siguiente.' },
        { title: 'Bloques cortos', detail: `Dividir ${s} en sesiones de 25 minutos con un objetivo concreto cada una.` },
      ],
    },
    {
      id: 'decision',
      when: u.domain === 'decision' && Boolean(u.options),
      options: [
        { title: 'Comparar con un criterio', detail: `Puntuar «${u.options?.[0] ?? 'A'}» y «${u.options?.[1] ?? 'B'}» solo según ${u.criterion ? `«${u.criterion}»` : 'lo que más te importa'}.` },
        { title: 'Prueba de una semana', detail: 'Imaginar o probar una semana con cada opción y anotar qué sientes.' },
        { title: 'Pedir un dato que falta', detail: 'Identificar la información que te falta y conseguirla antes de decidir.' },
      ],
    },
    {
      id: 'generic',
      when: true,
      options: [
        { title: 'Acotar el problema', detail: `Escribir en una frase qué parte de ${s} quieres resolver primero.` },
        { title: 'Buscar un ejemplo', detail: 'Encontrar a alguien o algo que ya haya resuelto algo parecido y ver cómo lo hizo.' },
        { title: 'Pedir otra mirada', detail: 'Enseñárselo a una persona de confianza y preguntarle qué ve.' },
      ],
    },
  ];
  const set = sets.find((x) => x.when && !used.includes(x.id));
  return set ? { id: set.id, options: set.options } : null;
}

/** One small, editable step tied to what the user said. */
export function stepFor(u: Understanding, chosen: string | null): { id: string; text: string; why: string } {
  const s = subjectRef(u);
  const bits = [
    u.subject ? u.subject.ref : null,
    u.detail ? u.detail.label : u.focus ? u.focus.label : null,
    u.blocker ? (!isStockLabel(u.blocker.label) ? `«${u.blocker.label}»` : `que ${u.blocker.label}`) : null,
  ].filter((b): b is string => Boolean(b));
  const why = bits.length ? `Sale de lo que contaste: ${bits.join(', ')}` : '';
  const base = why || 'Sale de lo que hablamos';
  if (chosen) return { id: `chosen:${chosen}`, text: `Probar «${chosen}» durante 15 minutos en ${s} y anotar qué cambia.`, why: base };
  if (u.detail?.id === 'colors')
    return { id: 'colors', text: `Elegir 3 apps cuyos colores te gusten y anotar qué tienen en común${u.success ? `, pensando en «${u.success}»` : ''}.`, why: base };
  if (u.detail?.id === 'layout') return { id: 'layout', text: 'Hacer una captura de tu pantalla principal y marcar qué es lo más importante en ella.', why: base };
  if (u.detail?.id === 'icons') return { id: 'icons', text: 'Hacer una lista de los iconos que usas y marcar los que no siguen el mismo estilo.', why: base };
  if (u.focus?.id === 'content') return { id: 'content', text: `Escribir solo los títulos de las partes de ${s}, sin desarrollar ninguna.`, why: base };
  if (u.domain === 'decision' && u.options)
    return { id: 'decision', text: `Escribir dos columnas, «${u.options[0]}» y «${u.options[1]}», y anotar qué ganas y qué pierdes con cada una.`, why: base };
  if (u.domain === 'study') return { id: 'study', text: `Explicar en voz alta un tema de ${s} durante 5 minutos y anotar dónde te trabas.`, why: base };
  if (u.focus?.id === 'start' || u.blocker?.id === 'noStart' || u.blocker?.id === 'overwhelm')
    return { id: 'start', text: `Escribir en una lista todo lo que implica ${s} y rodear la tarea más pequeña.`, why: base };
  return { id: 'generic', text: `Escribir en una frase qué parte de ${s} quieres resolver primero.`, why: base };
}
