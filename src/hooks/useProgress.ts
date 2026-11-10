import { useCallback, useEffect, useRef, useState } from 'react';
import { clearProgress, emptyProgress, loadProgress, saveProgress, storageAvailable, type Progress } from '../lib/progress';

export interface ProgressApi {
  progress: Progress;
  storageOk: boolean;
  /** Functional update; the latest state is always used. */
  update: (fn: (p: Progress) => Progress) => void;
  reset: () => void;
}

export function useProgress(): ProgressApi {
  const [storageOk] = useState(storageAvailable);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const ref = useRef(progress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    const next = fn(ref.current);
    ref.current = next;
    setProgress(next);
  }, []);

  const reset = useCallback(() => {
    clearProgress();
    const fresh = emptyProgress();
    ref.current = fresh;
    setProgress(fresh);
  }, []);

  return { progress, storageOk, update, reset };
}
