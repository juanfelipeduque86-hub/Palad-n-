import { useEffect, useState } from 'react';

/** Re-renders on an interval so time-derived state (fatigue, drift) stays live. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible') setNow(Date.now());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);
  return now;
}
