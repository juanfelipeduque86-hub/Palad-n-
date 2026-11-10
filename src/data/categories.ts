import type { CategoryMeta, TaskCategory } from '../types';

export const CATEGORIES: Record<TaskCategory, CategoryMeta> = {
  combat: {
    id: 'combat',
    label: 'Combat',
    tagline: 'Alta concentración. Una ofensiva a la vez.',
  },
  potions: {
    id: 'potions',
    label: 'Potions',
    tagline: 'Mantenimiento rápido. Bébelas y sigue.',
  },
  keys: {
    id: 'keys',
    label: 'Keys',
    tagline: 'Transiciones y descansos que abren la siguiente puerta.',
  },
};

export const CATEGORY_ORDER: TaskCategory[] = ['combat', 'potions', 'keys'];
