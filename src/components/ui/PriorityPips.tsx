import type { TaskPriority } from '../../types';

const LEVEL: Record<TaskPriority, number> = { low: 1, medium: 2, high: 3 };
const LABEL: Record<TaskPriority, string> = { low: 'baja', medium: 'media', high: 'alta' };

export function PriorityPips({ priority }: { priority: TaskPriority }) {
  const n = LEVEL[priority];
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`Prioridad ${LABEL[priority]}`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-2 w-2 ${i <= n ? 'bg-white' : 'border border-dim bg-transparent'}`}
        />
      ))}
    </span>
  );
}
