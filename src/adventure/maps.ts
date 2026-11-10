import type { AdventureMap } from './engine';

/** Hand-made maps. Each one is verified solvable by an automated solver (see README). */
export const MAPS: AdventureMap[] = [
  {
    id: 'cripta',
    title: 'La Cripta del Umbral',
    blurb: 'Una cripta pequeña para empezar: una palanca, una llave, una puerta rúnica y una fuente que guarda un secreto.',
    runeLevel: 1,
    rows: [
      '###############',
      '#@..#...#.....#',
      '#.#.#.#.#.###.#',
      '#.#...#.#.#E#R#',
      '#.#####q#.#.#.#',
      '#.....#.#...#.#',
      '#.#.#.#.#####D#',
      '#k#.#.Q.......#',
      '#.F.#*#########',
      '###############',
    ],
  },
  {
    id: 'jardin',
    title: 'El Jardín de Piedra',
    blurb: 'Un bloque que empujar hasta su placa, un altar que pide una idea y una gema escondida tras una reja.',
    runeLevel: 2,
    rows: [
      '#############',
      '#@..#.....#E#',
      '#.#.#.#q#.#R#',
      '#.#...o.p.#.#',
      '#.#####P###.#',
      '#.#...k.Q*#.#',
      '#.##A######D#',
      '#......T....#',
      '#############',
    ],
  },
];
