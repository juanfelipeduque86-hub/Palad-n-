import { AnimatePresence } from 'framer-motion';
import type { Task } from '../../types';
import { byGravityDesc } from '../../lib/gravity';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  now: number;
  onFocus: (taskId: string) => void;
}

export function TaskList({ tasks, now, onFocus }: TaskListProps) {
  const open = tasks.filter((t) => t.status !== 'completed').sort(byGravityDesc(now));
  const done = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="flex flex-col gap-5">
      {open.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-edge p-6 text-center text-sm text-mute">
          Slot vacío. Nada orbita aquí ahora mismo.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {open.map((t) => (
              <TaskCard key={t.id} task={t} now={now} onFocus={onFocus} />
            ))}
          </AnimatePresence>
        </ul>
      )}
      {done.length > 0 && (
        <section>
          <h4 className="mb-2 font-display text-[10px] tracking-[0.2em] text-dim">
            COMPLETADAS · {done.length}
          </h4>
          <ul className="flex flex-col gap-2">
            {done.map((t) => (
              <TaskCard key={t.id} task={t} now={now} onFocus={onFocus} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
