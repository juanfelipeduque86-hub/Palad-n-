import type { AppData, PersonalQuest } from '../types';
import { expFor } from '../lib/exp';
import { HOUR, MINUTE, toIso } from '../lib/time';

function personal(
  id: string,
  title: string,
  instruction: string,
  category: PersonalQuest['category'],
  durationMin: PersonalQuest['durationMin'],
  effort: PersonalQuest['effort'],
  createdIso: string,
): PersonalQuest {
  return {
    id,
    title,
    instruction,
    category,
    durationMin,
    effort,
    expReward: expFor(durationMin, effort),
    tags: ['personal'],
    source: 'personal',
    status: 'open',
    createdAt: createdIso,
    updatedAt: createdIso,
    completedAt: null,
  };
}

export function createInitialData(now: number): AppData {
  const created = toIso(now - 26 * HOUR);
  return {
    version: 2,
    player: {
      level: 3,
      exp: 120,
      totalExp: 370,
      streak: 0,
      completedCount: 0,
      lastCompletedAt: null,
      lastActivityAt: toIso(now - 25 * MINUTE),
    },
    personal: [
      personal('u-ejemplo-1', 'Terminar el moodboard del cliente', 'Reúne seis imágenes de referencia y colócalas en una sola lámina.', 'combat', 15, 'high', created),
      personal('u-ejemplo-2', 'Responder el correo de la imprenta', 'Confirma las medidas y pregunta el plazo de entrega.', 'potions', 5, 'low', created),
    ],
    favorites: ['k01', 'c12'],
    history: [],
    suggest: { current: null, seen: {}, recent: [] },
    prefs: { filters: { category: 'all', duration: 'any', effort: 'any' }, dailyGoal: 5 },
  };
}
