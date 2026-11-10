import type { GameState, Task } from '../types';
import { DAY, HOUR, MINUTE, toIso } from '../lib/time';

type Seed = Omit<Task, 'status' | 'createdAt' | 'lastInteractedAt'> & {
  createdAgo: number;
  idleFor: number;
};

const SEEDS: Seed[] = [
  // Combat
  {
    id: 'c1',
    title: 'Esbozar 3 ideas para el moodboard',
    description: 'Bocetos feos permitidos. 10 minutos, sin borrar nada.',
    category: 'combat',
    expReward: 50,
    priority: 'high',
    gravity: 66,
    createdAgo: 2 * DAY,
    idleFor: 26 * HOUR,
  },
  {
    id: 'c2',
    title: 'Escribir el primer párrafo del ensayo',
    description: 'Una sola frase ya cuenta como victoria.',
    category: 'combat',
    expReward: 45,
    priority: 'medium',
    gravity: 52,
    createdAgo: 1 * DAY,
    idleFor: 9 * HOUR,
  },
  {
    id: 'c3',
    title: 'Revisar una escena del guion',
    description: 'Lee una escena y marca un único cambio.',
    category: 'combat',
    expReward: 40,
    priority: 'low',
    gravity: 30,
    createdAgo: 5 * HOUR,
    idleFor: 2 * HOUR,
  },
  // Potions
  {
    id: 'p1',
    title: 'Responder el correo del cliente',
    description: 'Dos líneas: confirma y agradece. Enviar.',
    category: 'potions',
    expReward: 20,
    priority: 'high',
    gravity: 70,
    createdAgo: 3 * DAY,
    idleFor: 30 * HOUR,
  },
  {
    id: 'p2',
    title: 'Pagar la factura de internet',
    description: 'Abre la app, paga, cierra. Nada más.',
    category: 'potions',
    expReward: 15,
    priority: 'medium',
    gravity: 58,
    createdAgo: 2 * DAY,
    idleFor: 14 * HOUR,
  },
  {
    id: 'p3',
    title: 'Vaciar la carpeta de descargas',
    description: 'Mueve todo a "ordenar luego". Sin clasificar.',
    category: 'potions',
    expReward: 15,
    priority: 'low',
    gravity: 18,
    createdAgo: 6 * HOUR,
    idleFor: 40 * MINUTE,
  },
  // Keys
  {
    id: 'k1',
    title: 'Caminar 5 minutos sin pantalla',
    description: 'Transición activa: sal, respira, vuelve.',
    category: 'keys',
    expReward: 25,
    priority: 'medium',
    gravity: 48,
    createdAgo: 4 * HOUR,
    idleFor: 3 * HOUR,
  },
  {
    id: 'k2',
    title: 'Beber un vaso de agua',
    description: 'Recarga rápida antes de la siguiente quest.',
    category: 'keys',
    expReward: 10,
    priority: 'high',
    gravity: 64,
    createdAgo: 2 * HOUR,
    idleFor: 2 * HOUR,
  },
  {
    id: 'k3',
    title: 'Estirar hombros y cuello',
    description: 'Descanso obligatorio: 2 minutos, ojos cerrados.',
    category: 'keys',
    expReward: 20,
    priority: 'low',
    gravity: 28,
    createdAgo: 8 * HOUR,
    idleFor: 1 * HOUR,
  },
];

export function createMockTasks(now: number): Task[] {
  return SEEDS.map(({ createdAgo, idleFor, ...rest }) => ({
    ...rest,
    status: 'pending',
    createdAt: toIso(now - createdAgo),
    lastInteractedAt: toIso(now - idleFor),
  }));
}

export function createInitialState(now: number): GameState {
  return {
    version: 1,
    player: {
      level: 3,
      exp: 120,
      totalExp: 370,
      streak: 0,
      completedCount: 0,
      lastCompletedAt: null,
      lastActivityAt: toIso(now - 25 * MINUTE),
    },
    tasks: createMockTasks(now),
  };
}
