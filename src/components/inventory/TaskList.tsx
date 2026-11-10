import { AnimatePresence } from 'framer-motion';
import type { Task } from '../../types';
import { byGravityDesc } from '../../lib/gravity';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  now: number;
  onFocus: (taskId: string) => void;
}

/** Open tasks ordered by gravity (heaviest first), completed ones below. */
export function TaskList({ tasks, now, onFocus }: TaskListProps) {
  const open = tasks.filter((t) => t.status !== 'completed').sort(byGravityDesc(now));
  const done = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="flex flex-col gap-4">
      {open.length === 0 ? (
        <p className="rounded-[22px] bg-raised p-6 text-center text-[14px] text-sub">
          Slot vacío. Nada pendiente aquí.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {open.map((t) => (
              <TaskCard key={t.id} task={t} now={now} onFocus={onFocus} />
            ))}
          </AnimatePresence>
        </ul>
      )}
      {done.length > 0 && (
        <section>
          <h4 className="mb-1 px-1 text-[12px] font-medium text-faint">Completadas · {done.length}</h4>
          <ul className="flex flex-col">
            {done.map((t) => (
              <TaskCard key={t.id} task={t} now={now} onFocus={onFocus} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
