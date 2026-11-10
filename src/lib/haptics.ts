/** Tiny, optional haptic tick. Silently ignored where unsupported. */
export function tick(pattern: number | number[] = 8): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* noop */
    }
  }
}
