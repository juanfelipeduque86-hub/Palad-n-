import type { Duration, Effort, LibraryQuest, TaskCategory } from '../types';
import { expFor } from '../lib/exp';

type Row = [id: string, title: string, instruction: string, duration: Duration, effort: Effort, tags: string[]];

const COMBAT: Row[] = [
  ['c01', 'Abrir el documento y escribir una frase', 'Abre el archivo en el que estás trabajando y escribe una sola frase, aunque sea imperfecta.', 1, 'low', ['escritura', 'arranque']],
  ['c02', 'Esbozar tres miniaturas', 'Dibuja tres bocetos del tamaño de un sello para la idea que tienes en mente. Sin borrar.', 5, 'low', ['dibujo', 'creatividad']],
  ['c03', 'Escribir 100 palabras sin editar', 'Escribe hasta llegar a 100 palabras. Prohibido corregir mientras avanzas.', 10, 'medium', ['escritura', 'creatividad']],
  ['c04', 'Leer una página y subrayar una idea', 'Lee una sola página del material de estudio y marca la idea más importante.', 5, 'low', ['estudio', 'lectura']],
  ['c05', 'Explicar un concepto en voz alta', 'Elige algo que estés aprendiendo y explícalo en voz alta como si se lo contaras a un amigo.', 5, 'medium', ['estudio', 'memoria']],
  ['c06', 'Resolver un ejercicio completo', 'Haz un único ejercicio o problema de práctica, de principio a fin.', 15, 'high', ['estudio', 'práctica']],
  ['c07', 'Crear cinco tarjetas de repaso', 'Escribe cinco preguntas con su respuesta sobre el tema que estás estudiando.', 10, 'medium', ['estudio', 'memoria']],
  ['c08', 'Bloque de foco de 15 minutos', 'Elige una tarea de tu proyecto principal y trabaja solo en ella durante 15 minutos.', 15, 'high', ['proyecto', 'foco']],
  ['c09', 'Definir el siguiente paso del proyecto', 'Escribe en una línea cuál es la próxima acción concreta de tu proyecto personal.', 2, 'low', ['proyecto', 'planificación']],
  ['c10', 'Pulir un párrafo', 'Relee un párrafo que ya escribiste y mejora la claridad de una sola frase.', 5, 'medium', ['escritura', 'edición']],
  ['c11', 'Dibujar un mapa mental', 'Pon el tema en el centro de una hoja y añade seis ramas con lo que ya sabes.', 10, 'medium', ['estudio', 'ideas']],
  ['c12', 'Lluvia de diez ideas', 'Anota diez ideas rápidas para tu proyecto. Cantidad antes que calidad.', 5, 'low', ['creatividad', 'ideas']],
  ['c13', 'Practicar un fragmento', 'Practica un único fragmento, escala, movimiento o técnica de la habilidad que estés aprendiendo.', 10, 'medium', ['práctica', 'habilidad']],
  ['c14', 'Revisar un borrador con tres notas', 'Lee un borrador propio y deja tres comentarios: algo que funciona, algo que falta y algo que sobra.', 15, 'high', ['edición', 'proyecto']],
  ['c15', 'Resumir un capítulo en cinco líneas', 'Escribe un resumen de cinco líneas del último capítulo, clase o vídeo que viste.', 10, 'high', ['estudio', 'síntesis']],
  ['c16', 'Bocetar una pantalla o página', 'Haz un boceto rápido de una pantalla, portada o página de tu proyecto.', 15, 'high', ['diseño', 'creatividad']],
  ['c17', 'Terminar la pieza más pequeña', 'Elige la parte más pequeña posible de tu código, maqueta o pieza y termínala.', 15, 'high', ['proyecto', 'código']],
  ['c18', 'Capturar una referencia visual', 'Busca a tu alrededor una textura, forma o color interesante y fotografíalo para tu archivo de referencias.', 2, 'low', ['creatividad', 'referencias']],
  ['c19', 'Preparar el material de estudio', 'Deja abierto lo que necesitas para estudiar: libro, apuntes y una hoja en blanco.', 2, 'low', ['estudio', 'arranque']],
  ['c20', 'Escribir la duda que te bloquea', 'Formula por escrito la pregunta concreta que te impide avanzar. Nombrarla ya es avanzar.', 2, 'medium', ['proyecto', 'desbloqueo']],
];

const POTIONS: Row[] = [
  ['p01', 'Responder un mensaje pendiente', 'Elige el mensaje más fácil de tu lista y respóndelo en dos líneas.', 2, 'low', ['mensajes', 'admin']],
  ['p02', 'Archivar diez correos', 'Archiva o elimina diez correos que ya no necesitan nada de ti.', 2, 'low', ['correo', 'digital']],
  ['p03', 'Despejar el escritorio del ordenador', 'Mueve los archivos sueltos del escritorio a una carpeta «Ordenar» y vacía la papelera.', 5, 'low', ['digital', 'orden']],
  ['p04', 'Pagar una factura', 'Paga una factura pendiente y guarda el comprobante en su carpeta.', 5, 'medium', ['finanzas', 'admin']],
  ['p05', 'Pasar una fecha al calendario', 'Apunta en el calendario una cita o fecha que ahora solo vive en tu cabeza.', 1, 'low', ['calendario', 'organización']],
  ['p06', 'Despejar una superficie', 'Elige una superficie pequeña —mesa, mesita o estante— y deja solo lo esencial.', 5, 'low', ['hogar', 'orden']],
  ['p07', 'Vaciar el fregadero', 'Lava, seca o mete en el lavavajillas lo que haya en el fregadero ahora mismo.', 10, 'medium', ['hogar']],
  ['p08', 'Completar la lista de la compra', 'Echa un vistazo a la nevera y la despensa y añade a la lista lo que falta.', 5, 'low', ['hogar', 'planificación']],
  ['p09', 'Cerrar pestañas del navegador', 'Cierra las pestañas que no vas a usar hoy. Guarda en una nota los enlaces importantes.', 2, 'low', ['digital', 'foco']],
  ['p10', 'Renombrar cinco archivos', 'Pon nombres claros a cinco archivos de tu carpeta de descargas o de proyecto.', 5, 'low', ['digital', 'orden']],
  ['p11', 'Hacer una copia de seguridad', 'Copia la carpeta de tu proyecto principal a la nube o a un disco externo.', 5, 'medium', ['digital', 'seguridad']],
  ['p12', 'Poner una lavadora', 'Separa la ropa, pon una lavadora y deja una alarma para tenderla.', 5, 'medium', ['hogar']],
  ['p13', 'Revisar los últimos movimientos', 'Mira los últimos movimientos de tu cuenta y anota si algo no te cuadra.', 5, 'medium', ['finanzas']],
  ['p14', 'Darse de baja de un boletín', 'Abre un correo publicitario que nunca lees y date de baja.', 1, 'low', ['correo', 'digital']],
  ['p15', 'Rellenar un trámite pendiente', 'Completa ese formulario o trámite corto que llevas días posponiendo.', 15, 'high', ['admin', 'trámites']],
  ['p16', 'Ordenar la mochila o el bolso', 'Vacía la mochila o el bolso, tira lo que sobra y vuelve a guardar lo útil.', 5, 'low', ['orden']],
  ['p17', 'Dejar lista la ropa de mañana', 'Elige la ropa que vas a usar mañana y déjala preparada.', 2, 'low', ['hogar', 'planificación']],
  ['p18', 'Cambiar una contraseña débil', 'Cambia una contraseña que repites o que sería fácil de adivinar.', 5, 'medium', ['digital', 'seguridad']],
  ['p19', 'Silenciar una app que interrumpe', 'Desactiva las notificaciones de una app que te interrumpe sin aportarte nada.', 2, 'low', ['digital', 'foco']],
  ['p20', 'Hacer una llamada corta', 'Haz esa llamada breve que tienes pendiente. Si no contestan, deja un mensaje y cuenta como hecha.', 5, 'high', ['admin', 'mensajes']],
];

const KEYS: Row[] = [
  ['k01', 'Beber un vaso de agua', 'Llena un vaso de agua y bébelo con calma antes de seguir.', 1, 'low', ['descanso', 'cuerpo']],
  ['k02', 'Soltar hombros y cuello', 'Haz rotaciones suaves de hombros y cuello durante dos minutos, sin forzar.', 2, 'low', ['movimiento']],
  ['k03', 'Caminar cinco minutos', 'Sal a caminar o recorre tu casa durante cinco minutos sin mirar la pantalla.', 5, 'low', ['movimiento', 'transición']],
  ['k04', 'Tres respiraciones lentas', 'Haz tres respiraciones lentas, soltando el aire más despacio de lo que entra.', 1, 'low', ['pausa']],
  ['k05', 'Mirar a lo lejos', 'Aparta la vista de la pantalla y mira algo lejano por la ventana durante un minuto.', 1, 'low', ['descanso', 'pantalla']],
  ['k06', 'Cerrar la sesión de trabajo', 'Anota dónde te quedas y cuál será el siguiente paso. Después cierra lo que tengas abierto.', 5, 'medium', ['transición', 'cierre']],
  ['k07', 'Preparar el espacio para lo siguiente', 'Retira lo que ya no necesitas y deja a mano solo lo de la próxima tarea.', 2, 'low', ['transición', 'espacio']],
  ['k08', 'Escuchar una canción sin hacer nada más', 'Pon una canción que te guste y solo escúchala, lejos de la pantalla.', 5, 'low', ['descanso', 'música']],
  ['k09', 'Subir y bajar un tramo de escaleras', 'Sube y baja un tramo de escaleras unas cuantas veces, a tu ritmo.', 2, 'medium', ['movimiento']],
  ['k10', 'Comer algo sencillo lejos del escritorio', 'Prepara un tentempié sencillo y cómelo en otro sitio que no sea tu mesa de trabajo.', 10, 'low', ['descanso', 'cuerpo']],
  ['k11', 'Ventilar la habitación', 'Abre la ventana unos minutos y deja que entre aire fresco.', 2, 'low', ['espacio', 'pausa']],
  ['k12', 'Escribir cómo estás en una línea', 'Anota en una línea cómo te sientes ahora mismo, sin juzgarlo.', 1, 'low', ['pausa', 'reflexión']],
  ['k13', 'Cambiar de lugar', 'Muévete a otra habitación o a otro rincón para la siguiente tarea.', 2, 'medium', ['transición', 'espacio']],
  ['k14', 'Paseo sin teléfono', 'Da un paseo de quince minutos con el teléfono en casa o en silencio.', 15, 'medium', ['movimiento', 'desconexión']],
  ['k15', 'Estirar piernas y espalda', 'Ponte de pie y estira suavemente piernas y espalda durante cinco minutos.', 5, 'low', ['movimiento']],
  ['k16', 'Elegir tres cosas para el resto del día', 'Escribe las tres únicas cosas que harían que el día termine bien.', 5, 'medium', ['planificación', 'transición']],
  ['k17', 'Lavarte la cara', 'Lávate la cara con agua fresca como señal de que empiezas algo nuevo.', 2, 'low', ['transición', 'cuerpo']],
  ['k18', 'Dejar el escritorio listo para mañana', 'Despeja la mesa para que mañana sea fácil empezar.', 5, 'medium', ['cierre', 'espacio']],
  ['k19', 'Pausa larga sin pantallas', 'Tómate quince minutos lejos de cualquier pantalla. Lo que quieras, menos el móvil.', 15, 'medium', ['descanso', 'desconexión']],
  ['k20', 'Bailar una canción', 'Pon una canción animada y muévete como te apetezca hasta que termine.', 5, 'medium', ['movimiento', 'energía']],
];

const build = (rows: Row[], category: TaskCategory): LibraryQuest[] =>
  rows.map(([id, title, instruction, durationMin, effort, tags]) => ({
    id,
    title,
    instruction,
    category,
    durationMin,
    effort,
    tags,
    expReward: expFor(durationMin, effort),
    source: 'library',
  }));

export const QUEST_LIBRARY: LibraryQuest[] = [
  ...build(COMBAT, 'combat'),
  ...build(POTIONS, 'potions'),
  ...build(KEYS, 'keys'),
];

export const LIBRARY_BY_ID: ReadonlyMap<string, LibraryQuest> = new Map(QUEST_LIBRARY.map((q) => [q.id, q]));
