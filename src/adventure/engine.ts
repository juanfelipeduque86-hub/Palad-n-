/**
 * Pure adventure engine: maps are text, state is plain JSON (saved to localStorage).
 *
 * Legend
 *   #  wall          .  floor        @  start        E  exit (stairs)
 *   k  key           D  locked door  *  gem (optional treasure)
 *   q  lever         Q  gate opened by the lever
 *   o  stone block   p  pressure plate   P  gate open while every plate holds a block
 *   R  rune door (a Lucha riddle opens it)
 *   F  fountain (a Pociones fact; reveals the map)
 *   A  altar (an Encantamientos prompt) T  gate opened by the altar
 */

export type Dir = 'up' | 'down' | 'left' | 'right';
export interface Pos {
  x: number;
  y: number;
}

export interface AdventureMap {
  id: string;
  title: string;
  blurb: string;
  rows: string[];
  /** Max level of riddles used by rune doors (difficulty is chosen, never escalated). */
  runeLevel: 1 | 2 | 3;
}

export interface AdventureState {
  v: 1;
  id: string;
  pos: Pos;
  facing: Dir;
  /** '1' for every tile ever seen. */
  explored: string;
  keys: number;
  /** "x,y" of picked keys/gems and opened doors/runes. */
  taken: string[];
  opened: string[];
  lever: boolean;
  altarDone: boolean;
  fountainUsed: boolean;
  blocks: Pos[];
  steps: number;
  completed: boolean;
  log: string[];
}

export type Interaction = { kind: 'rune' | 'fountain' | 'altar'; at: Pos };

export interface MoveResult {
  state: AdventureState;
  message: string | null;
  interaction: Interaction | null;
}

const DELTA: Record<Dir, Pos> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const key = (p: Pos) => `${p.x},${p.y}`;
const VIEW_RADIUS = 2;

export const width = (m: AdventureMap) => (m.rows[0] ?? '').length;
export const height = (m: AdventureMap) => m.rows.length;
const raw = (m: AdventureMap, p: Pos): string => m.rows[p.y]?.[p.x] ?? '#';

function find(m: AdventureMap, ch: string): Pos[] {
  const out: Pos[] = [];
  m.rows.forEach((row, y) => [...row].forEach((c, x) => c === ch && out.push({ x, y })));
  return out;
}

export function initialState(m: AdventureMap): AdventureState {
  const start = find(m, '@')[0] ?? { x: 1, y: 1 };
  const s: AdventureState = {
    v: 1,
    id: m.id,
    pos: start,
    facing: 'down',
    explored: '0'.repeat(width(m) * height(m)),
    keys: 0,
    taken: [],
    opened: [],
    lever: false,
    altarDone: false,
    fountainUsed: false,
    blocks: find(m, 'o'),
    steps: 0,
    completed: false,
    log: ['Conoces este sitio. No has estado nunca.'],
  };
  return reveal(m, s);
}

export const platesHeld = (m: AdventureMap, s: AdventureState): boolean => {
  const plates = find(m, 'p');
  return plates.length > 0 && plates.every((p) => s.blocks.some((b) => b.x === p.x && b.y === p.y));
};

/** What occupies a tile right now, after doors, keys and mechanisms are taken into account. */
export type Cell =
  | 'wall' | 'floor' | 'exit' | 'key' | 'gem' | 'gemSealed' | 'door' | 'lever' | 'gate' | 'gateOpen' | 'block' | 'plate' | 'platePressed'
  | 'rune' | 'runeOpen' | 'fountain' | 'altar' | 'doorOpen';

export function cellAt(m: AdventureMap, s: AdventureState, p: Pos): Cell {
  const c = raw(m, p);
  const k = key(p);
  if (s.blocks.some((b) => b.x === p.x && b.y === p.y)) return 'block';
  switch (c) {
    case '#':
      return 'wall';
    case 'E':
      return 'exit';
    case 'k':
      return s.taken.includes(k) ? 'floor' : 'key';
    case '*':
      // Drinking from the fountain seals what was not yet taken.
      return s.taken.includes(k) ? 'floor' : s.fountainUsed ? 'gemSealed' : 'gem';
    case 'D':
      return s.opened.includes(k) ? 'doorOpen' : 'door';
    case 'q':
      return 'lever';
    case 'Q':
      return s.lever ? 'gateOpen' : 'gate';
    case 'P':
      return platesHeld(m, s) ? 'gateOpen' : 'gate';
    case 'T':
      return s.altarDone ? 'gateOpen' : 'gate';
    case 'p':
      return 'plate';
    case 'R':
      return s.opened.includes(k) ? 'runeOpen' : 'rune';
    case 'F':
      return 'fountain';
    case 'A':
      return 'altar';
    default:
      return 'floor';
  }
}

const walkable = (c: Cell) => ['floor', 'exit', 'key', 'gem', 'doorOpen', 'gateOpen', 'plate', 'platePressed', 'runeOpen'].includes(c);
/** A block can slide onto empty ground or a plate only. */
const blockFits = (c: Cell) => c === 'floor' || c === 'plate';

function reveal(m: AdventureMap, s: AdventureState): AdventureState {
  const w = width(m);
  const chars = s.explored.split('');
  for (let dy = -VIEW_RADIUS; dy <= VIEW_RADIUS; dy += 1) {
    for (let dx = -VIEW_RADIUS; dx <= VIEW_RADIUS; dx += 1) {
      const x = s.pos.x + dx;
      const y = s.pos.y + dy;
      if (x >= 0 && y >= 0 && x < w && y < height(m) && Math.abs(dx) + Math.abs(dy) <= VIEW_RADIUS + 1) chars[y * w + x] = '1';
    }
  }
  return { ...s, explored: chars.join('') };
}

export const isExplored = (m: AdventureMap, s: AdventureState, p: Pos) => s.explored[p.y * width(m) + p.x] === '1';

export function exploredRatio(m: AdventureMap, s: AdventureState): number {
  let open = 0;
  let seen = 0;
  m.rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === '#') return;
      open += 1;
      if (s.explored[y * width(m) + x] === '1') seen += 1;
    }),
  );
  return open ? seen / open : 0;
}

const withLog = (s: AdventureState, msg: string): AdventureState => ({ ...s, log: [msg, ...s.log].slice(0, 30) });

export function move(m: AdventureMap, prev: AdventureState, dir: Dir): MoveResult {
  if (prev.completed) return { state: prev, message: 'Ya bajaste. No queda nada que mover.', interaction: null };
  let s: AdventureState = { ...prev, facing: dir };
  const d = DELTA[dir];
  const to = { x: s.pos.x + d.x, y: s.pos.y + d.y };
  const cell = cellAt(m, s, to);

  const done = (state: AdventureState, message: string | null, interaction: Interaction | null = null): MoveResult => ({
    state: message ? withLog(state, message) : state,
    message,
    interaction,
  });

  switch (cell) {
    case 'wall':
      return done(s, null);
    case 'door':
      if (s.keys > 0) {
        s = { ...s, keys: s.keys - 1, opened: [...s.opened, key(to)] };
        return done(s, 'La llave entra sin resistencia. La cerradura la esperaba.');
      }
      return done(s, 'Cerrada. La cerradura está limpia: alguien la usa.');
    case 'gate':
      return done(s, raw(m, to) === 'P' ? 'Una reja. Debajo hay un hueco donde falta peso. Una losa cabría.' : raw(m, to) === 'T' ? 'Esta reja no tiene cerradura. Tiene un altar.' : 'Una reja. El hierro baja hasta una palanca que no ves.');
    case 'gemSealed':
      return done(s, 'La gema está bajo una losa que antes no estaba. Lo que viste, te vio.');
    case 'lever': {
      s = { ...s, lever: !s.lever };
      return done(s, s.lever ? 'Bajas la palanca. Lejos, algo se abre. No ha sonado a reja.' : 'Subes la palanca. Lo que se abrió, se cierra despacio.');
    }
    case 'rune':
      return done(s, 'Una puerta escrita. La inscripción está en tu letra.', { kind: 'rune', at: to });
    case 'fountain':
      return done(s, s.fountainUsed ? 'El agua está quieta. Ya no refleja.' : 'Una fuente. El agua no refleja el techo: refleja el trazado.', { kind: 'fountain', at: to });
    case 'altar':
      return done(s, s.altarDone ? 'La cera ya tiene lo que escribiste. No lo devuelve.' : 'Un altar con cera negra. No pide una respuesta. Pide algo tuyo.', { kind: 'altar', at: to });
    case 'block': {
      const beyond = { x: to.x + d.x, y: to.y + d.y };
      if (!blockFits(cellAt(m, s, beyond))) return done(s, 'La losa no cede. Hay algo al otro lado, apoyado.');
      const blocks = s.blocks.map((b) => (b.x === to.x && b.y === to.y ? beyond : b));
      const before = platesHeld(m, s);
      s = { ...s, blocks, pos: to, steps: s.steps + 1 };
      const after = platesHeld(m, s);
      s = reveal(m, s);
      return done(s, !before && after ? 'La losa vuelve a su sitio. Estaba fuera porque algo la empujó desde abajo.' : before && !after ? 'Quitas la losa de su sitio. La reja cae.' : 'Arrastras la losa. Debajo, la tierra está removida.');
    }
    default:
      break;
  }

  if (!walkable(cell)) return done(s, null);
  s = reveal(m, { ...s, pos: to, steps: s.steps + 1 });
  if (cell === 'key') return done({ ...s, keys: s.keys + 1, taken: [...s.taken, key(to)] }, 'La llave está tibia. Alguien la soltó hace poco.');
  if (cell === 'gem') return done({ ...s, taken: [...s.taken, key(to)] }, 'Una gema. No abre nada. La guardas igual.');
  if (cell === 'exit')
    return done(
      { ...s, completed: true },
      exploredRatio(m, s) > 0.8
        ? 'Bajas. Lo has visto casi todo. Casi todo te ha visto.'
        : 'Bajas. Arriba, las tumbas quedan abiertas. Así las dejaste.',
    );
  return done(s, null);
}

export function openRune(m: AdventureMap, s: AdventureState, at: Pos): AdventureState {
  if (raw(m, at) !== 'R' || s.opened.includes(key(at))) return s;
  return withLog({ ...s, opened: [...s.opened, key(at)] }, 'La inscripción se borra sola. La puerta cede.');
}

export function drinkFountain(m: AdventureMap, s: AdventureState): AdventureState {
  if (s.fountainUsed) return s;
  // Reveals the layout of the whole map (not the hazards' state).
  return withLog({ ...s, fountainUsed: true, explored: '1'.repeat(width(m) * height(m)) }, 'Bebes. Ahora conoces el trazado entero. El trazado también te conoce.');
}

export function completeAltar(s: AdventureState): AdventureState {
  if (s.altarDone) return s;
  return withLog({ ...s, altarDone: true }, 'La cera negra acepta lo que has escrito. No preguntes qué ha entendido.');
}

export const gemsTotal = (m: AdventureMap) => find(m, '*').length;
export const gemsFound = (m: AdventureMap, s: AdventureState) => find(m, '*').filter((p) => s.taken.includes(key(p))).length;
