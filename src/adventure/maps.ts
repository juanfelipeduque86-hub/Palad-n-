import type { AdventureMap } from './engine';

/** Hand-made maps. Each one is verified solvable by an automated solver (see README). */
export const MAPS: AdventureMap[] = [
  {
    id: 'cripta',
    title: 'La Cripta del Umbral',
    blurb: 'Una palanca, una llave, una puerta escrita en tu letra y una fuente que enseña el trazado a cambio de algo.',
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
    blurb: 'Una losa fuera de su sitio, un altar de cera negra y una reja sin cerradura. Las tumbas se abrieron desde dentro.',
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
