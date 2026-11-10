import type { CategoryMeta, TaskCategory } from '../types';

export const CATEGORIES: Record<TaskCategory, CategoryMeta> = {
  combat: { id: 'combat', label: 'Combat', tagline: 'Concentración profunda' },
  potions: { id: 'potions', label: 'Potions', tagline: 'Mantenimiento rápido' },
  keys: { id: 'keys', label: 'Keys', tagline: 'Transiciones y descansos' },
};

export const CATEGORY_ORDER: TaskCategory[] = ['combat', 'potions', 'keys'];
