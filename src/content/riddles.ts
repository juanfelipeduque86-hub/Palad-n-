import { matchesAny, normalize, parseNumber } from '../lib/answers';

export type ChallengeKind = 'logica' | 'deduccion' | 'patrones' | 'palabras' | 'numerico' | 'lateral';
export type Level = 1 | 2 | 3;

export const KIND_LABEL: Record<ChallengeKind, string> = {
  logica: 'Lógica',
  deduccion: 'Deducción',
  patrones: 'Patrones',
  palabras: 'Palabras',
  numerico: 'Números',
  lateral: 'Pensamiento lateral',
};

export const LEVEL_LABEL: Record<Level, string> = { 1: 'Fácil', 2: 'Media', 3: 'Difícil' };

type Answer =
  | { type: 'text'; accept: string[] }
  | { type: 'number'; value: number; tolerance?: number }
  | { type: 'choice'; options: string[]; correct: number };

export interface Challenge {
  id: string;
  kind: ChallengeKind;
  level: Level;
  title: string;
  prompt: string;
  answer: Answer;
  /** Shown once the answer is revealed or found. */
  solution: string;
  hints: string[];
  explanation: string;
  /** Other answers that are also valid, with why. */
  alternatives?: Array<{ accept: string[]; note: string }>;
  /** Common wrong answers and the specific thing they miss. */
  traps?: Array<{ accept: string[]; note: string }>;
  /** Shown only when the wording is deliberately ambiguous. */
  ambiguity?: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'r01', kind: 'logica', level: 1, title: 'Bloops y lazzies',
    prompt: 'Todos los bloops son razzies. Todos los razzies son lazzies. ¿Todos los bloops son lazzies?',
    answer: { type: 'choice', options: ['Sí', 'No', 'No se puede saber'], correct: 0 },
    solution: 'Sí.',
    hints: ['Imagina tres círculos, uno dentro de otro.', 'Si los bloops están dentro de los razzies, ¿dónde están los razzies?'],
    explanation: 'Los bloops están dentro de los razzies, y los razzies dentro de los lazzies. Por tanto, los bloops también están dentro de los lazzies. Es un razonamiento transitivo: no hace falta saber qué son esas palabras.',
    traps: [{ accept: ['No se puede saber'], note: 'Las palabras son inventadas, pero la estructura basta: no necesitas saber qué es un bloop para deducirlo.' }],
  },
  {
    id: 'r02', kind: 'lateral', level: 1, title: 'Hierro y plumas',
    prompt: '¿Qué pesa más: un kilo de hierro o un kilo de plumas?',
    answer: { type: 'text', accept: ['igual', 'lo mismo', 'pesan igual', 'ninguno', 'mismo', 'iguales'] },
    solution: 'Pesan lo mismo: un kilo.',
    hints: ['Fíjate en la cantidad, no en el material.'],
    explanation: 'Ambos son un kilo. El hierro ocupa mucho menos volumen, por eso la intuición empuja a decir «hierro».',
    traps: [{ accept: ['hierro', 'el hierro'], note: 'El hierro es más denso, pero aquí hay un kilo de cada cosa.' }],
  },
  {
    id: 'r03', kind: 'deduccion', level: 2, title: 'Las tres cajas mal etiquetadas',
    prompt: 'Hay tres cajas: «Manzanas», «Naranjas» y «Mixta». Todas las etiquetas están mal. Puedes sacar una sola fruta de una sola caja, sin mirar dentro. ¿De qué caja la sacas para poder corregir todas las etiquetas?',
    answer: { type: 'text', accept: ['mixta', 'la mixta', 'caja mixta', 'la que dice mixta'] },
    solution: 'De la caja etiquetada «Mixta».',
    hints: ['Todas las etiquetas mienten. ¿Qué no puede contener la caja «Mixta»?', 'La caja «Mixta» solo tiene un tipo de fruta. Una fruta te dice cuál.'],
    explanation: 'La caja «Mixta» no puede ser mixta, así que contiene un solo tipo. Si sacas una manzana, esa caja es la de manzanas. La caja «Naranjas» no puede tener naranjas ni (ya) manzanas: es la mixta. La que queda es la de naranjas.',
    traps: [{ accept: ['manzanas', 'naranjas'], note: 'De esas cajas, una fruta no siempre basta: la caja «Manzanas» podría ser mixta o de naranjas, y una naranja no distingue entre ambas.' }],
  },
  {
    id: 'r04', kind: 'numerico', level: 2, title: 'Bate y pelota',
    prompt: 'Un bate y una pelota cuestan 1,10 € en total. El bate cuesta 1 € más que la pelota. ¿Cuánto cuesta la pelota?',
    answer: { type: 'number', value: 0.05, tolerance: 0.001 },
    alternatives: [{ accept: ['5 centimos', 'cinco centimos', '5 cent'], note: 'Cinco céntimos: correcto.' }],
    solution: '0,05 € (cinco céntimos).',
    hints: ['Comprueba tu respuesta: suma el precio de la pelota y el del bate.', 'Si la pelota cuesta x, el bate cuesta x + 1. La suma es 1,10.'],
    explanation: 'x + (x + 1) = 1,10, así que 2x = 0,10 y x = 0,05. El bate cuesta 1,05 y el total es 1,10.',
    traps: [{ accept: ['0,10', '0.10', '0.1', '10 centimos', 'diez centimos'], note: 'Es la respuesta intuitiva. Pero si la pelota costara 0,10, el bate costaría 1,10 y el total sería 1,20.' }],
  },
  {
    id: 'r05', kind: 'numerico', level: 2, title: 'Las máquinas',
    prompt: 'Si 5 máquinas hacen 5 piezas en 5 minutos, ¿cuántos minutos tardan 100 máquinas en hacer 100 piezas?',
    answer: { type: 'number', value: 5 },
    solution: '5 minutos.',
    hints: ['¿Cuánto tarda una máquina en hacer una pieza?'],
    explanation: 'Cada máquina hace una pieza en 5 minutos. 100 máquinas trabajando a la vez hacen 100 piezas en esos mismos 5 minutos.',
    traps: [{ accept: ['100'], note: 'Más máquinas no alargan el tiempo: trabajan en paralelo.' }],
  },
  {
    id: 'r06', kind: 'numerico', level: 2, title: 'El nenúfar',
    prompt: 'Un nenúfar duplica su tamaño cada día. Tarda 48 días en cubrir todo el lago. ¿Cuántos días tarda en cubrir la mitad?',
    answer: { type: 'number', value: 47 },
    solution: '47 días.',
    hints: ['Piensa hacia atrás desde el día 48.', 'Si el día 48 cubre todo y cada día se duplica, ¿cuánto cubría el día anterior?'],
    explanation: 'Como se duplica cada día, el día anterior a cubrirlo todo cubría justo la mitad: el día 47.',
    traps: [{ accept: ['24'], note: 'Dividir entre dos funciona con crecimientos lineales; este crecimiento se duplica cada día.' }],
  },
  {
    id: 'r07', kind: 'patrones', level: 1, title: 'Duplicar',
    prompt: '2, 4, 8, 16, … ¿Qué número sigue?',
    answer: { type: 'number', value: 32 },
    solution: '32.',
    hints: ['Compara cada número con el anterior.'],
    explanation: 'Cada número es el doble del anterior: 16 × 2 = 32.',
  },
  {
    id: 'r08', kind: 'patrones', level: 2, title: 'Sumar los dos anteriores',
    prompt: '1, 1, 2, 3, 5, 8, … ¿Qué número sigue?',
    answer: { type: 'number', value: 13 },
    solution: '13.',
    hints: ['Mira los dos números anteriores a cada término.'],
    explanation: 'Cada número es la suma de los dos anteriores (5 + 8 = 13). Es la sucesión de Fibonacci.',
  },
  {
    id: 'r09', kind: 'patrones', level: 1, title: 'Cuadrados',
    prompt: '1, 4, 9, 16, 25, … ¿Qué número sigue?',
    answer: { type: 'number', value: 36 },
    solution: '36.',
    hints: ['1 = 1 × 1, 4 = 2 × 2…'],
    explanation: 'Son los cuadrados de 1, 2, 3, 4 y 5. El siguiente es 6 × 6 = 36.',
  },
  {
    id: 'r10', kind: 'patrones', level: 2, title: 'Letras que cuentan',
    prompt: 'U, D, T, C, C, S, S, … ¿Qué letra sigue?',
    answer: { type: 'text', accept: ['o', 'ocho', 'la o'] },
    solution: 'O, de «ocho».',
    hints: ['No son letras al azar: son iniciales.', 'Uno, dos, tres…'],
    explanation: 'Son las iniciales de uno, dos, tres, cuatro, cinco, seis, siete. Después viene ocho: O.',
  },
  {
    id: 'r11', kind: 'patrones', level: 2, title: 'Números indivisibles',
    prompt: '2, 3, 5, 7, 11, … ¿Qué número sigue?',
    answer: { type: 'number', value: 13 },
    solution: '13.',
    hints: ['Ninguno de estos números se puede dividir exactamente salvo entre 1 y sí mismo.'],
    explanation: 'Son números primos. Después de 11, el siguiente primo es 13 (12 es divisible entre 2, 3, 4 y 6).',
  },
  {
    id: 'r12', kind: 'palabras', level: 1, title: 'Agujas sin pinchar',
    prompt: 'Tiene agujas pero no pincha, y aunque no camina, avanza. ¿Qué es?',
    answer: { type: 'text', accept: ['reloj', 'un reloj'] },
    solution: 'Un reloj.',
    hints: ['Las agujas giran.', 'Avanza… el tiempo.'],
    explanation: 'Las manecillas de un reloj también se llaman agujas, y marcan el paso del tiempo sin moverse de sitio.',
    alternatives: [{ accept: ['brujula'], note: 'Una brújula también tiene aguja y no pincha, aunque no «avanza». Buena idea; la respuesta clásica es el reloj.' }],
  },
  {
    id: 'r13', kind: 'palabras', level: 1, title: 'Adivinanza tradicional',
    prompt: 'Blanco por dentro, verde por fuera. Si quieres que te lo diga, espera. ¿Qué es?',
    answer: { type: 'text', accept: ['pera', 'la pera'] },
    solution: 'La pera.',
    hints: ['Es una fruta.', 'La respuesta está escondida en la propia adivinanza.'],
    explanation: '«Es-pera»: la respuesta aparece dentro de la última palabra. Muchas adivinanzas tradicionales esconden así la solución.',
  },
  {
    id: 'r14', kind: 'palabras', level: 1, title: 'Crece al quitar',
    prompt: 'Cuanto más le quitas, más grande se hace. ¿Qué es?',
    answer: { type: 'text', accept: ['agujero', 'hoyo', 'un agujero', 'un hoyo', 'pozo'] },
    solution: 'Un agujero.',
    hints: ['Piensa en algo que no está hecho de material, sino de su ausencia.'],
    explanation: 'Al quitar tierra de un agujero, el agujero crece.',
  },
  {
    id: 'r15', kind: 'lateral', level: 2, title: 'Romper sin tocar',
    prompt: '¿Qué se puede romper sin tocarlo?',
    answer: { type: 'text', accept: ['promesa', 'una promesa'] },
    alternatives: [
      { accept: ['silencio', 'el silencio'], note: 'El silencio también se rompe sin tocarlo. Respuesta válida.' },
      { accept: ['record', 'un record'], note: 'Un récord se bate o se rompe sin tocarlo. Válida.' },
      { accept: ['corazon', 'el corazon'], note: 'En sentido figurado, sí. Válida.' },
      { accept: ['hielo', 'el hielo'], note: '«Romper el hielo» en sentido figurado: válida.' },
    ],
    solution: 'Una promesa (también valen el silencio, un récord o «el hielo», en sentido figurado).',
    hints: ['No es un objeto físico.', 'Piensa en expresiones: «romper una…».'],
    explanation: 'Es un juego con el sentido figurado de «romper». Hay varias respuestas válidas; la clásica es una promesa.',
  },
  {
    id: 'r16', kind: 'deduccion', level: 1, title: 'Alturas',
    prompt: 'Ana es más alta que Bea. Bea es más alta que Carla. ¿Quién es la más baja?',
    answer: { type: 'text', accept: ['carla'] },
    solution: 'Carla.',
    hints: ['Ordénalas de más alta a más baja.'],
    explanation: 'El orden es Ana > Bea > Carla. Carla queda la última.',
  },
  {
    id: 'r17', kind: 'deduccion', level: 3, title: 'Caballeros y bribones',
    prompt: 'En una isla, los caballeros siempre dicen la verdad y los bribones siempre mienten. A dice: «B es un bribón». B dice: «A y yo somos del mismo tipo». ¿Qué es A?',
    answer: { type: 'choice', options: ['Caballero', 'Bribón', 'No se puede saber'], correct: 0 },
    solution: 'A es caballero (y B es bribón).',
    hints: ['Supón que A es caballero y comprueba si todo encaja.', 'Ahora supón que A es bribón: ¿qué sería B y podría decir lo que dice?'],
    explanation: 'Si A es caballero, B es bribón; entonces la frase de B («somos del mismo tipo») es falsa, como debe ser. Todo encaja. Si A fuera bribón, B sería caballero y diría la verdad, pero «somos del mismo tipo» sería falso: contradicción. Por eso A es caballero.',
  },
  {
    id: 'r18', kind: 'lateral', level: 1, title: 'La carrera',
    prompt: 'En una carrera adelantas a quien va segundo. ¿En qué posición vas ahora?',
    answer: { type: 'text', accept: ['segundo', 'segunda', '2', 'segundo lugar', 'en segunda posicion', 'segunda posicion'] },
    solution: 'Segundo.',
    hints: ['Si adelantas a alguien, ocupas su lugar.'],
    explanation: 'Al adelantar al segundo, pasas a su posición: segundo. El primero sigue delante.',
    traps: [{ accept: ['primero', 'primera', '1'], note: 'Para ir primero tendrías que adelantar a quien va primero.' }],
  },
  {
    id: 'r19', kind: 'lateral', level: 2, title: 'Restar cinco',
    prompt: '¿Cuántas veces puedes restar 5 de 25?',
    answer: { type: 'text', accept: ['una', 'una vez', '1', '1 vez'] },
    solution: 'Una vez: después ya no restas de 25, sino de 20.',
    hints: ['Lee la pregunta al pie de la letra.'],
    explanation: 'Es un juego de lenguaje. Tras la primera resta, el número ya no es 25. Si la pregunta fuera «cuántos cincos caben en 25», la respuesta sería 5.',
    alternatives: [{ accept: ['5', 'cinco', '5 veces', 'cinco veces'], note: 'Si lo entiendes como «cuántos cincos caben en 25», 5 es correcto. La gracia del acertijo es leerlo literalmente: solo puedes restar de 25 una vez.' }],
    ambiguity: 'Este acertijo juega con la ambigüedad de la pregunta a propósito.',
  },
  {
    id: 'r20', kind: 'logica', level: 1, title: 'Las ovejas',
    prompt: 'Un granjero tiene 17 ovejas. Todas menos 9 se escapan. ¿Cuántas le quedan?',
    answer: { type: 'number', value: 9 },
    solution: '9.',
    hints: ['«Todas menos 9» se escapan: ¿cuántas no se escapan?'],
    explanation: 'Si todas menos 9 se escapan, las 9 restantes se quedan.',
    traps: [{ accept: ['8'], note: '17 − 9 = 8 sería si se escaparan 9. La frase dice que se escapan todas excepto 9.' }],
  },
  {
    id: 'r21', kind: 'patrones', level: 2, title: 'Diferencias impares',
    prompt: '3, 6, 11, 18, 27, … ¿Qué número sigue?',
    answer: { type: 'number', value: 38 },
    solution: '38.',
    hints: ['Calcula la diferencia entre cada par de números seguidos.', 'Las diferencias son 3, 5, 7, 9…'],
    explanation: 'Las diferencias crecen de dos en dos: +3, +5, +7, +9. La siguiente es +11: 27 + 11 = 38.',
  },
  {
    id: 'r22', kind: 'patrones', level: 3, title: 'Mira y di',
    prompt: '1, 11, 21, 1211, 111221, … ¿Qué sigue?',
    answer: { type: 'number', value: 312211 },
    solution: '312211.',
    hints: ['No es aritmética: lee cada término en voz alta.', '«11» se lee «dos unos» → 21.'],
    explanation: 'Cada término describe el anterior. 111221 son «tres unos, dos doses, un uno»: 31 22 11 → 312211.',
  },
  {
    id: 'r23', kind: 'numerico', level: 2, title: 'El caracol',
    prompt: 'Un caracol está en el fondo de un pozo de 10 metros. De día sube 3 metros y de noche resbala 2. ¿Cuántos días tarda en salir?',
    answer: { type: 'number', value: 8 },
    solution: '8 días.',
    hints: ['Cada día completo avanza 1 metro neto, pero ojo con el último día.', '¿Dónde está al empezar el día en que sale?'],
    explanation: 'Tras 7 días y 7 noches ha subido 7 metros. El octavo día sube 3 metros y llega a 10: sale antes de resbalar.',
    traps: [{ accept: ['10'], note: 'Contar 1 metro por día olvida que el último día sube 3 metros y ya no resbala.' }],
  },
  {
    id: 'r24', kind: 'palabras', level: 1, title: 'Mal escrita',
    prompt: '¿Qué palabra se escribe mal en todos los diccionarios?',
    answer: { type: 'text', accept: ['mal'] },
    solution: '«Mal».',
    hints: ['Lee la pregunta otra vez, palabra por palabra.'],
    explanation: 'La palabra «mal» se escribe así, «mal», en todos los diccionarios.',
  },
  {
    id: 'r25', kind: 'logica', level: 1, title: 'Meses de 28 días',
    prompt: '¿Cuántos meses del año tienen 28 días?',
    answer: { type: 'text', accept: ['todos', '12', 'doce', 'todos los meses'] },
    solution: 'Todos: los doce tienen al menos 28 días.',
    hints: ['La pregunta no dice «solo» 28 días.'],
    explanation: 'Febrero tiene 28 (o 29), pero todos los meses tienen un día 28.',
    traps: [{ accept: ['uno', '1', 'febrero'], note: 'Febrero es el único con exactamente 28 (en años no bisiestos), pero la pregunta es cuántos «tienen» 28 días.' }],
  },
  {
    id: 'r26', kind: 'patrones', level: 2, title: 'Iniciales del calendario',
    prompt: 'E, F, M, A, M, J, J, … ¿Qué letra sigue?',
    answer: { type: 'text', accept: ['a', 'agosto', 'la a'] },
    solution: 'A, de agosto.',
    hints: ['Piensa en el calendario.'],
    explanation: 'Son las iniciales de los meses: enero, febrero, marzo, abril, mayo, junio, julio… agosto.',
  },
  {
    id: 'r27', kind: 'lateral', level: 2, title: 'El cirujano',
    prompt: 'Un padre y su hijo tienen un accidente. Al hijo lo llevan al hospital y quien va a operarlo dice: «No puedo operarle, es mi hijo». ¿Cómo es posible?',
    answer: { type: 'text', accept: ['madre', 'su madre', 'la madre', 'es su madre'] },
    alternatives: [{ accept: ['otro padre', 'dos padres', 'tiene dos padres', 'su otro padre'], note: 'También es posible: el niño puede tener dos padres. Respuesta válida.' }],
    solution: 'Quien opera es su madre (o su otro padre).',
    hints: ['Revisa qué has supuesto sobre quién opera.'],
    explanation: 'El acertijo funciona porque mucha gente imagina por defecto a un cirujano hombre. Quien opera es la madre del niño, o su otro padre.',
  },
  {
    id: 'r28', kind: 'numerico', level: 2, title: 'Padre e hijo',
    prompt: 'Entre un padre y su hijo suman 36 años. El padre tiene 30 años más que el hijo. ¿Cuántos años tiene el hijo?',
    answer: { type: 'number', value: 3 },
    solution: '3 años.',
    hints: ['Si el hijo tiene x años, el padre tiene x + 30.'],
    explanation: 'x + (x + 30) = 36, así que 2x = 6 y x = 3. El padre tiene 33.',
    traps: [{ accept: ['6'], note: 'Con 6, el padre tendría 36 y la suma sería 42.' }],
  },
  {
    id: 'r29', kind: 'patrones', level: 3, title: 'Multiplicar cada vez más',
    prompt: '1, 2, 6, 24, 120, … ¿Qué número sigue?',
    answer: { type: 'number', value: 720 },
    solution: '720.',
    hints: ['Divide cada número entre el anterior.', 'Los multiplicadores son 2, 3, 4, 5…'],
    explanation: 'Cada número se multiplica por el siguiente entero: ×2, ×3, ×4, ×5 y ahora ×6. 120 × 6 = 720 (son los factoriales).',
  },
  {
    id: 'r30', kind: 'deduccion', level: 3, title: 'Calcetines a oscuras',
    prompt: 'En un cajón a oscuras hay 10 calcetines negros y 10 blancos, mezclados. ¿Cuántos tienes que sacar, como mínimo, para estar seguro de tener un par del mismo color?',
    answer: { type: 'number', value: 3 },
    solution: '3.',
    hints: ['Piensa en el peor caso posible.', 'Con dos podrías tener uno de cada color. ¿Y con el tercero?'],
    explanation: 'Con dos, en el peor caso tienes uno negro y uno blanco. El tercero coincide con uno de ellos, seguro.',
    traps: [{ accept: ['11', '2'], note: '11 serviría para asegurar dos de un color concreto. Para un par de cualquier color bastan 3.' }],
  },
];

export type Verdict =
  | { kind: 'correct'; note?: string }
  | { kind: 'trap'; note: string }
  | { kind: 'wrong' }
  | { kind: 'empty' };

export function check(c: Challenge, input: string): Verdict {
  if (!normalize(input) && c.answer.type !== 'choice') return { kind: 'empty' };
  const alt = c.alternatives?.find((a) => matchesAny(input, a.accept));
  const trap = c.traps?.find((t) => matchesAny(input, t.accept) || t.accept.some((a) => parseNumber(a) !== null && parseNumber(a) === parseNumber(input) && /\d/.test(a)));
  switch (c.answer.type) {
    case 'choice': {
      const idx = c.answer.options.findIndex((o) => normalize(o) === normalize(input));
      if (idx === c.answer.correct) return { kind: 'correct' };
      return trap ? { kind: 'trap', note: trap.note } : { kind: 'wrong' };
    }
    case 'number': {
      const n = parseNumber(input);
      if (n !== null && Math.abs(n - c.answer.value) <= (c.answer.tolerance ?? 0)) return { kind: 'correct' };
      if (alt) return { kind: 'correct', note: alt.note };
      return trap ? { kind: 'trap', note: trap.note } : { kind: 'wrong' };
    }
    case 'text': {
      if (matchesAny(input, c.answer.accept)) return { kind: 'correct' };
      if (alt) return { kind: 'correct', note: alt.note };
      return trap ? { kind: 'trap', note: trap.note } : { kind: 'wrong' };
    }
  }
}
