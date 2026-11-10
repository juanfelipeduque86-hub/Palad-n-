/** Lower-case, accent-free copy for matching. Original text is kept for echoing. */
export const norm = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** First clause of what the user wrote, trimmed for reuse inside a sentence. */
export function clause(text: string, max = 70): string {
  const first = text.trim().split(/(?<=[.!?;])\s+|\n/)[0] ?? text;
  let out = first.replace(/[.!?;]+$/, '').trim();
  if (out.length > max) out = `${out.slice(0, max).replace(/\s+\S*$/, '')}…`;
  return lowerFirst(out);
}

export const lowerFirst = (s: string): string => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
export const upperFirst = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Turns first-person possessives into second person for echoing back ("mi app" → "tu app"). */
export function toSecondPerson(s: string): string {
  // Only possessives: conjugating verbs reliably needs more than rules.
  return s.replace(/\bmis\b/gi, 'tus').replace(/\bmi\b/gi, 'tu').replace(/\bconmigo\b/gi, 'contigo');
}

/** Picks a variant deterministically so replies vary without randomness in tests. */
export const pick = <T,>(items: readonly T[], seed: number): T => items[Math.abs(seed) % items.length] as T;
