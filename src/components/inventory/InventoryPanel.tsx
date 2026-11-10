import type { Task, TaskCategory } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_ICON } from './categoryIcon';
import { TaskList } from './TaskList';
import { Icon } from '../ui/Icon';
import { Sheet } from '../ui/Sheet';

interface InventoryPanelProps {
  open: boolean;
  category: TaskCategory;
  tasks: Task[];
  now: number;
  onClose: () => void;
  onFocus: (taskId: string) => void;
}

export function InventoryPanel({ open, category, tasks, now, onClose, onFocus }: InventoryPanelProps) {
  const meta = CATEGORIES[category];
  const inCat = tasks.filter((t) => t.category === category);
  const openCount = inCat.filter((t) => t.status !== 'completed').length;

  return (
    <Sheet open={open} onClose={onClose} labelledBy="inventory-title">
      <header className="flex items-center gap-3 px-5 pt-1 pb-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mint text-mint-ink">
          <Icon name={CATEGORY_ICON[category]} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="inventory-title" className="text-[20px] leading-tight font-semibold">
            {meta.label}
          </h2>
          <p className="truncate text-[13px] text-sub">{meta.tagline}</p>
        </div>
        <span className="shrink-0 rounded-full bg-raised px-3 py-1.5 text-[12px] font-medium text-sub tabular-nums">
          {openCount} pendientes
        </span>
      </header>
      <div className="overflow-y-auto overscroll-contain px-3 pb-4">
        <TaskList tasks={inCat} now={now} onFocus={onFocus} />
      </div>
    </Sheet>
  );
}
