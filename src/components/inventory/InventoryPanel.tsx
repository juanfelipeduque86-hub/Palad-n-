import type { Task, TaskCategory } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_ICON } from './categoryIcon';
import { OrbitMap } from './OrbitMap';
import { TaskList } from './TaskList';
import { PixelIcon } from '../ui/PixelIcon';
import { Sheet } from '../ui/Sheet';

interface InventoryPanelProps {
  category: TaskCategory | null;
  tasks: Task[];
  now: number;
  onClose: () => void;
  onFocus: (taskId: string) => void;
}

export function InventoryPanel({ category, tasks, now, onClose, onFocus }: InventoryPanelProps) {
  return (
    <Sheet open={category !== null} onClose={onClose} labelledBy="inventory-title">
      {category && (
        <InventoryContent category={category} tasks={tasks} now={now} onFocus={onFocus} />
      )}
    </Sheet>
  );
}

function InventoryContent({
  category,
  tasks,
  now,
  onFocus,
}: {
  category: TaskCategory;
  tasks: Task[];
  now: number;
  onFocus: (taskId: string) => void;
}) {
  const meta = CATEGORIES[category];
  const inCat = tasks.filter((t) => t.category === category);
  const openCount = inCat.filter((t) => t.status !== 'completed').length;

  return (
    <>
      <header className="flex items-center gap-4 px-6 pt-2 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-mute">
            <PixelIcon name={CATEGORY_ICON[category]} size={16} className="text-white" />
            <span className="font-display text-[10px] tracking-[0.25em]">SLOT · {openCount} EN ÓRBITA</span>
          </div>
          <h2 id="inventory-title" className="mt-2 font-display text-[28px] leading-none font-bold">
            {meta.label}
          </h2>
          <p className="mt-2 text-[13px] leading-snug text-mute">{meta.tagline}</p>
        </div>
        <OrbitMap tasks={inCat} now={now} />
      </header>
      <div className="overflow-y-auto overscroll-contain px-5 pt-1 pb-8">
        <TaskList tasks={inCat} now={now} onFocus={onFocus} />
      </div>
    </>
  );
}
