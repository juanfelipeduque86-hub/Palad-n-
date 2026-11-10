export type Certainty = 'establecido' | 'aproximado' | 'debatido';

export const CERTAINTY_LABEL: Record<Certainty, string> = {
  establecido: 'Hecho establecido',
  aproximado: 'Cifra aproximada',
  debatido: 'Cuestión debatida',
};

export interface Fact {
  id: string;
  topic: 'Espacio' | 'Tierra' | 'Naturaleza' | 'Historia' | 'Cuerpo humano' | 'Física' | 'Mitos';
  title: string;
  /** One-line hook shown before opening. */
  hook: string;
  body: string;
  certainty: Certainty;
  /** Where this comes from; specific enough to look up. */
  source: string;
  /** Optional: guess before reading. Never graded beyond "this is what happens". */
  predict?: { question: string; options: string[]; answer: number };
  followups: Array<{ q: string; a: string }>;
  related: string[];
}

export const FACTS: Fact[] = [
  {
    id: 'f01', topic: 'Espacio', title: 'Un día más largo que un año',
    hook: 'En Venus, el día dura más que el año.',
    body: 'Venus tarda unos 243 días terrestres en girar una vez sobre sí mismo, pero solo unos 225 en dar la vuelta al Sol. Además gira en sentido contrario al de casi todos los planetas.',
    certainty: 'establecido', source: 'NASA, ficha planetaria de Venus',
    predict: { question: '¿Qué crees que dura más en Venus?', options: ['Su día (una rotación)', 'Su año (una órbita)'], answer: 0 },
    followups: [
      { q: '¿Por qué gira al revés?', a: 'No se sabe con certeza. Las hipótesis más citadas son un gran impacto en su pasado o efectos de mareas y de su atmósfera densa a lo largo de miles de millones de años.' },
      { q: '¿Y el día solar?', a: 'Por girar al revés, el tiempo entre dos amaneceres (el día solar) es más corto que su rotación: unos 117 días terrestres.' },
    ],
    related: ['f02', 'f15'],
  },
  {
    id: 'f02', topic: 'Espacio', title: 'La luz que ves del Sol',
    hook: 'La luz del Sol que te llega salió hace unos ocho minutos.',
    body: 'La Tierra está a unos 150 millones de kilómetros del Sol. A la velocidad de la luz (casi 300 000 km por segundo), ese viaje dura unos 8 minutos y 20 segundos.',
    certainty: 'establecido', source: 'NASA, materiales educativos sobre la distancia Tierra-Sol',
    followups: [
      { q: '¿Varía ese tiempo?', a: 'Sí, un poco: la órbita de la Tierra es ligeramente elíptica, así que el tiempo oscila entre algo más de 8 minutos 10 segundos y casi 8 minutos 30 segundos a lo largo del año.' },
      { q: '¿Y la luz de la Luna?', a: 'La Luna está mucho más cerca: su luz (que es luz solar reflejada) tarda algo más de un segundo en llegar.' },
    ],
    related: ['f01'],
  },
  {
    id: 'f03', topic: 'Naturaleza', title: 'Tres corazones y sangre azul',
    hook: 'Los pulpos tienen tres corazones.',
    body: 'Dos corazones bombean sangre a través de las branquias y un tercero la reparte por el resto del cuerpo. Su sangre es azulada porque transporta oxígeno con hemocianina, una proteína con cobre, en lugar de la hemoglobina con hierro que usamos nosotros.',
    certainty: 'establecido', source: 'Smithsonian Ocean y textos de biología marina',
    predict: { question: '¿Cuántos corazones crees que tiene un pulpo?', options: ['Uno', 'Dos', 'Tres'], answer: 2 },
    followups: [
      { q: '¿Por qué cobre y no hierro?', a: 'La hemocianina funciona bien en aguas frías y con poco oxígeno, aunque transporta menos oxígeno que la hemoglobina en otras condiciones.' },
      { q: '¿Su sangre es azul de verdad?', a: 'Es incolora sin oxígeno y se vuelve azulada al oxigenarse, por el cobre de la hemocianina.' },
    ],
    related: ['f08'],
  },
  {
    id: 'f04', topic: 'Naturaleza', title: 'El plátano es una baya',
    hook: 'Para la botánica, el plátano es una baya y la fresa no.',
    body: 'En botánica, una baya es un fruto carnoso que se forma a partir de un solo ovario y suele tener varias semillas dentro. El plátano, el tomate o la uva cumplen esa definición. La fresa no: la parte carnosa viene del receptáculo de la flor, y las «semillas» de fuera son en realidad sus frutos.',
    certainty: 'establecido', source: 'Encyclopaedia Britannica, entrada «berry»',
    followups: [
      { q: '¿Entonces por qué la llamamos fruta del bosque?', a: 'El lenguaje cotidiano y el culinario agrupan los frutos por sabor y uso, no por su origen en la flor. Ninguno de los dos usos está «mal»: responden a preguntas distintas.' },
      { q: '¿Qué otras bayas sorprenden?', a: 'El tomate, el pimiento, la berenjena y el kiwi también son bayas en sentido botánico.' },
    ],
    related: ['f05'],
  },
  {
    id: 'f05', topic: 'Naturaleza', title: 'Tiburones más antiguos que los árboles',
    hook: 'Los tiburones existían antes que los primeros árboles.',
    body: 'Los registros fósiles de tiburones se remontan a unos 450 millones de años. Los primeros árboles aparecen hace unos 385–390 millones de años. Las fechas se ajustan con nuevos fósiles, pero el orden es sólido.',
    certainty: 'aproximado', source: 'Natural History Museum (Londres) y literatura paleontológica',
    followups: [
      { q: '¿Cómo eran aquellos tiburones?', a: 'Muy distintos a los actuales. Las pruebas más antiguas son sobre todo escamas fósiles; los esqueletos de cartílago casi nunca se conservan.' },
      { q: '¿Cuál fue uno de los primeros árboles?', a: 'Se suele citar a Wattieza y a Archaeopteris, del Devónico.' },
    ],
    related: ['f04', 'f08'],
  },
  {
    id: 'f06', topic: 'Historia', title: 'Cleopatra, más cerca de la Luna que de las pirámides',
    hook: 'Cleopatra vivió más cerca de la llegada a la Luna que de la construcción de la Gran Pirámide.',
    body: 'La Gran Pirámide de Guiza se construyó hacia el 2560 a. C. Cleopatra VII murió en el 30 a. C., unos 2500 años después. Desde su muerte hasta 1969 pasaron unos 2000 años.',
    certainty: 'aproximado', source: 'Cronologías del Egipto antiguo (fechas de Guiza aproximadas)',
    predict: { question: '¿Qué distancia en el tiempo es mayor?', options: ['De la Gran Pirámide a Cleopatra', 'De Cleopatra a la llegada a la Luna'], answer: 0 },
    followups: [
      { q: '¿Por qué sorprende tanto?', a: 'Solemos agrupar todo el «antiguo Egipto» en un mismo bloque, pero duró casi tres mil años. Para Cleopatra, las pirámides ya eran monumentos antiquísimos.' },
      { q: '¿Cleopatra era egipcia?', a: 'Pertenecía a la dinastía ptolemaica, de origen macedonio griego, aunque reinó Egipto y, según fuentes antiguas, habló egipcio.' },
    ],
    related: ['f07'],
  },
  {
    id: 'f07', topic: 'Historia', title: 'Oxford y los aztecas',
    hook: 'En Oxford ya se enseñaba antes de que se fundara Tenochtitlan.',
    body: 'La Universidad de Oxford sitúa el inicio de la enseñanza en la ciudad hacia 1096. Tenochtitlan, la capital mexica, se fundó hacia 1325, más de dos siglos después.',
    certainty: 'aproximado', source: 'Universidad de Oxford, historia institucional; historiografía mexica',
    followups: [
      { q: '¿Por qué «hacia»?', a: 'Oxford no tiene un acta fundacional; se data por indicios de enseñanza. La fecha de Tenochtitlan procede de fuentes mexicas y coloniales y tiene cierto margen.' },
    ],
    related: ['f06'],
  },
  {
    id: 'f08', topic: 'Naturaleza', title: 'Tardígrados en el espacio',
    hook: 'Unos animales microscópicos sobrevivieron al espacio abierto.',
    body: 'En 2007, tardígrados deshidratados viajaron en la misión FOTON-M3 expuestos al vacío y a la radiación del espacio. Al volver y rehidratarse, una parte sobrevivió y se reprodujo, sobre todo los que no recibieron toda la radiación ultravioleta solar.',
    certainty: 'establecido', source: 'Jönsson y otros, Current Biology (2008)',
    followups: [
      { q: '¿Cómo lo consiguen?', a: 'Entran en un estado llamado criptobiosis: pierden casi toda el agua y su metabolismo se detiene casi por completo, con proteínas que protegen sus células.' },
      { q: '¿Son indestructibles?', a: 'No. Resisten condiciones extremas en estado deshidratado y durante un tiempo, pero activos son frágiles, y la radiación UV intensa mató a muchos en el experimento.' },
    ],
    related: ['f03'],
  },
  {
    id: 'f09', topic: 'Cuerpo humano', title: 'Nacemos con más huesos',
    hook: 'Un bebé tiene más piezas óseas que un adulto.',
    body: 'Al nacer hay entre unas 270 y 300 piezas óseas y cartilaginosas, según cómo se cuenten. Muchas se fusionan con el crecimiento, por ejemplo en el cráneo y la pelvis, hasta llegar a los 206 huesos habituales en un adulto.',
    certainty: 'aproximado', source: 'Encyclopaedia Britannica, «human skeleton»',
    followups: [
      { q: '¿Todos los adultos tienen 206?', a: 'Es la cifra típica, pero varía un poco entre personas, por ejemplo por huesos sesamoideos adicionales o costillas cervicales.' },
      { q: '¿Para qué sirven las fontanelas?', a: 'Las zonas blandas del cráneo del bebé permiten que la cabeza se adapte en el parto y que el cerebro crezca rápido en los primeros años.' },
    ],
    related: ['f10'],
  },
  {
    id: 'f10', topic: 'Naturaleza', title: 'Heces en forma de cubo',
    hook: 'Los wómbats producen heces con forma de cubo.',
    body: 'Un estudio de 2021 mostró que la forma surge en la parte final del intestino: zonas de la pared intestinal con distinta rigidez moldean las heces en caras planas y aristas. Los wómbats las usan para marcar territorio.',
    certainty: 'establecido', source: 'Yang y otros, Soft Matter (2021)',
    followups: [
      { q: '¿Para qué sirve la forma?', a: 'Se ha propuesto que los cubos ruedan menos y se quedan en rocas o troncos donde sirven como señales, aunque esa ventaja es más una hipótesis que algo medido.' },
    ],
    related: ['f03'],
  },
  {
    id: 'f11', topic: 'Física', title: 'El agua hierve antes en la montaña',
    hook: 'En la cima del Everest el agua hierve a unos 70 °C.',
    body: 'El punto de ebullición depende de la presión. A más altura hay menos presión atmosférica, y el agua hierve a menor temperatura: en la cumbre del Everest, en torno a 70 °C. Por eso cocinar pasta allí lleva más tiempo.',
    certainty: 'aproximado', source: 'Tablas de presión de vapor del agua (física de la ebullición)',
    predict: { question: 'A más altura, el agua hierve…', options: ['A más temperatura', 'A menos temperatura', 'Igual'], answer: 1 },
    followups: [
      { q: '¿Y la olla a presión?', a: 'Hace lo contrario: aumenta la presión y el agua hierve por encima de 100 °C, así que la comida se cocina más rápido.' },
    ],
    related: ['f12', 'f13'],
  },
  {
    id: 'f12', topic: 'Física', title: 'Un rayo, más caliente que el Sol',
    hook: 'Un rayo calienta el aire más que la superficie del Sol.',
    body: 'El aire del canal de un rayo puede alcanzar casi 30 000 °C durante un instante, unas cinco veces más que la superficie visible del Sol (unos 5500 °C). El calentamiento brusco del aire produce la onda que oímos como trueno.',
    certainty: 'aproximado', source: 'NOAA, Servicio Meteorológico Nacional de EE. UU.',
    followups: [
      { q: '¿Por qué el trueno llega después?', a: 'La luz viaja casi instantáneamente; el sonido, a unos 340 m por segundo. Contar los segundos entre relámpago y trueno y dividir entre tres da la distancia aproximada en kilómetros.' },
    ],
    related: ['f11'],
  },
  {
    id: 'f13', topic: 'Mitos', title: '¿El agua caliente se congela antes?',
    hook: 'A veces se afirma que el agua caliente se congela antes que la fría.',
    body: 'Es el llamado efecto Mpemba. Hay observaciones que lo apoyan, pero los experimentos controlados dan resultados contradictorios: depende mucho del recipiente, la evaporación, las corrientes y cómo se mide «congelarse». No hay consenso sobre si existe como fenómeno general.',
    certainty: 'debatido', source: 'Burridge y Linden, Scientific Reports (2016), y revisiones posteriores',
    followups: [
      { q: '¿Por qué podría pasar?', a: 'Se han propuesto la evaporación (el agua caliente pierde masa), las corrientes de convección o los gases disueltos. Ninguna explicación lo resuelve por completo.' },
      { q: '¿Entonces es falso?', a: 'No se puede afirmar ni negar como regla general. Lo honesto es decir que en ciertas condiciones se ha observado y en otras no.' },
    ],
    related: ['f14', 'f11'],
  },
  {
    id: 'f14', topic: 'Mitos', title: 'El vidrio no «fluye» con los siglos',
    hook: 'Las vidrieras antiguas no son más gruesas abajo por gotear lentamente.',
    body: 'El vidrio es un sólido amorfo. Cálculos sobre su viscosidad indican que a temperatura ambiente tardaría muchísimo más que la edad del universo en deformarse de forma visible. Las diferencias de grosor en ventanas antiguas vienen de cómo se fabricaba el vidrio y de cómo se colocaba.',
    certainty: 'establecido', source: 'Zanotto, American Journal of Physics (1998)',
    followups: [
      { q: '¿Siempre está lo grueso abajo?', a: 'No. Se han encontrado vidrios antiguos con la parte gruesa arriba o a un lado, algo que no encajaría con un goteo lento.' },
    ],
    related: ['f13'],
  },
  {
    id: 'f15', topic: 'Tierra', title: 'La montaña más alta, según cómo midas',
    hook: 'El Everest es el más alto sobre el mar, pero no desde su base.',
    body: 'El Everest es la cumbre más alta sobre el nivel del mar (unos 8849 m). El Mauna Kea, en Hawái, mide más de 10 000 m desde su base en el fondo del océano, aunque solo asoma unos 4200 m sobre el agua.',
    certainty: 'aproximado', source: 'USGS (Servicio Geológico de EE. UU.) y mediciones oficiales del Everest',
    followups: [
      { q: '¿Y el punto más lejano del centro de la Tierra?', a: 'Es el Chimborazo, en Ecuador: la Tierra está achatada y abultada en el ecuador, así que su cima queda más lejos del centro que la del Everest.' },
    ],
    related: ['f01'],
  },
  {
    id: 'f16', topic: 'Física', title: 'Los días se alargan',
    hook: 'Los días en la Tierra se van alargando, muy despacio.',
    body: 'Las mareas que provoca la Luna frenan poco a poco la rotación terrestre. A largo plazo, la duración del día crece del orden de dos milésimas de segundo por siglo. Hay variaciones de corto plazo que a veces lo enmascaran.',
    certainty: 'aproximado', source: 'Stephenson y otros, Proceedings of the Royal Society A (2016)',
    followups: [
      { q: '¿Cómo se sabe?', a: 'Comparando registros antiguos de eclipses con lo que predicen los cálculos: si la Tierra no se hubiera frenado, esos eclipses se habrían visto desde otros lugares.' },
      { q: '¿Y la Luna?', a: 'Al mismo tiempo, la Luna se aleja unos 3,8 cm al año, medido con láser y reflectores dejados en su superficie.' },
    ],
    related: ['f02'],
  },
];
