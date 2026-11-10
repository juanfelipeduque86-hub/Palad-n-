/** Answer normalisation for locally checkable challenges. */

const ARTICLES = /\b(el|la|los|las|es|son|seria|sera|que)\b/g;
const NUMBER_WORDS: Record<string, number> = {
  cero: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, veinte: 20, treinta: 30, cuarenta: 40, cincuenta: 50, cien: 100,
};

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[¿?¡!.,;:"'«»()]/g, ' ')
    .replace(ARTICLES, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Reads "0,05", "5", "cinco", "47 días" … into a number. */
export function parseNumber(s: string): number | null {
  // Keep decimal separators: "0,05" must not become "0 05".
  const m = /-?\d+(?:[.,]\d+)?/.exec(s);
  if (m) return Number(m[0].replace(',', '.'));
  const n = normalize(s);
  for (const word of n.split(' ')) if (word in NUMBER_WORDS) return NUMBER_WORDS[word] as number;
  return null;
}

/** True if the normalised input equals, or clearly contains, one of the accepted forms. */
export function matchesAny(input: string, accepted: string[]): boolean {
  const n = normalize(input);
  if (!n) return false;
  return accepted.some((a) => {
    const t = normalize(a);
    return n === t || (t.length >= 3 && (` ${n} `.includes(` ${t} `)));
  });
}
