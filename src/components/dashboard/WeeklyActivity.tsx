import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import type { DayActivity } from '../../data/activity';
import { springSoft } from '../../lib/motion';

interface WeeklyActivityProps {
  days: DayActivity[];
}

/** Seven compact bars; today is the only mint bar. */
export function WeeklyActivity({ days }: WeeklyActivityProps) {
  const max = Math.max(4, ...days.map((d) => d.count));
  const total = days.reduce((n, d) => n + d.count, 0);
  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-medium text-sub">Semana</p>
        <p className="text-[13px] text-sub tabular-nums">
          <span className="font-semibold text-text">{total}</span> quests
        </p>
      </div>
      <div className="mt-3 flex h-[84px] items-end justify-between gap-1.5">
        {days.map((d) => (
          <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div className="flex w-full flex-1 items-end">
              <motion.div
                className={`w-full rounded-full ${d.isToday ? 'bg-mint' : 'bg-track'}`}
                initial={false}
                animate={{ height: `${Math.max(8, (d.count / max) * 100)}%` }}
                transition={springSoft}
                title={`${d.count} quests`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-1.5">
        {days.map((d) => (
          <span
            key={d.key}
            className={`flex-1 text-center text-[11px] ${d.isToday ? 'font-semibold text-text' : 'text-faint'}`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </Card>
  );
}
