import type { TaskPriority } from '../../types';

const LEVEL: Record<TaskPriority, number> = { low: 1, medium: 2, high: 3 };
const LABEL: Record<TaskPriority, string> = { low: 'Baja', medium: 'Media', high: 'Alta' };

export function PriorityPips({ priority }: { priority: TaskPriority }) {
  const n = LEVEL[priority];
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`Prioridad ${LABEL[priority].toLowerCase()}`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`h-1.5 w-3 rounded-full ${i <= n ? 'bg-sub' : 'bg-track'}`} />
      ))}
    </span>
  );
}
