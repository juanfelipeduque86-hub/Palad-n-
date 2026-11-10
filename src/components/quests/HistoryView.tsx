import type { AppData, CompletionRecord } from '../../types';
import { CATEGORY_ICON } from '../inventory/categoryIcon';
import { findQuest } from '../../lib/quests';
import { startOfDay } from '../../data/activity';
import { DAY } from '../../lib/time';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { Notice } from '../ui/Notice';
import { SheetHeader } from '../ui/SheetHeader';

interface HistoryViewProps {
  data: AppData;
  now: number;
  onBack?: () => void;
  onClose: () => void;
  onReplay: (questId: string) => void;
  onReopen: (questId: string) => void;
  onOpenQuest: (questId: string) => void;
  onBrowse: () => void;
}

const timeFmt = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });

function dayLabel(dayMs: number, now: number): string {
  const today = startOfDay(now);
  if (dayMs === today) return 'Hoy';
  if (dayMs === startOfDay(today - DAY / 2)) return 'Ayer';
  const s = dayFmt.format(dayMs);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-[22px] bg-raised px-3 py-3">
      <div className="text-[12px] text-sub">{label}</div>
      <div className="mt-0.5 text-[19px] font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function HistoryView({ data, now, onBack, onClose, onReplay, onReopen, onOpenQuest, onBrowse }: HistoryViewProps) {
  const { history } = data;
  const groups = new Map<number, CompletionRecord[]>();
  for (const r of history) {
    const d = startOfDay(new Date(r.completedAt).getTime());
    const list = groups.get(d) ?? [];
    list.push(r);
    groups.set(d, list);
  }
  const totalExp = history.reduce((n, r) => n + r.expGained, 0);

  return (
    <>
      <SheetHeader id="history-title" title="Historial" subtitle="Cada completada queda registrada" onBack={onBack} onClose={onClose} />
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        <div className="mb-4 flex gap-2">
          <Stat label="Completadas" value={String(history.length)} />
          <Stat label="EXP ganada" value={String(totalExp)} />
          <Stat label="Días activos" value={String(groups.size)} />
        </div>
        {history.length === 0 ? (
          <Notice
            icon="history"
            title="Aún no hay quests completadas"
            body="Cuando completes una aparecerá aquí, con su hora y la EXP que ganaste."
            actions={[{ label: 'Explorar la biblioteca', onClick: onBrowse, primary: true }]}
          />
        ) : (
          [...groups.entries()].map(([day, records]) => (
            <section key={day} className="mb-4">
              <h3 className="mb-2 flex justify-between px-2 text-[13px] font-semibold text-sub">
                <span>{dayLabel(day, now)}</span>
                <span className="font-normal text-faint">
                  {records.length} · +{records.reduce((n, r) => n + r.expGained, 0)} EXP
                </span>
              </h3>
              <ul className="flex flex-col gap-2">
                {records.map((r) => {
                  const quest = findQuest(data, r.questId);
                  const reopenable = quest?.source === 'personal' && quest.status === 'completed';
                  const replayable = quest?.source === 'library';
                  return (
                    <li key={r.id} className="flex items-center gap-3 rounded-[22px] bg-raised py-2.5 pr-2.5 pl-4">
                      <Icon name={CATEGORY_ICON[r.category]} size={18} className="shrink-0 text-sub" />
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => quest && onOpenQuest(quest.id)}
                        disabled={!quest}
                      >
                        <p className="truncate text-[14px] font-semibold">{r.title}</p>
                        <p className="text-[12px] text-faint">
                          {timeFmt.format(new Date(r.completedAt))} · <span className="text-mint">+{r.expGained} EXP</span>
                          {r.source === 'personal' && <span className="text-lav"> · Tuya</span>}
                        </p>
                      </button>
                      {replayable && (
                        <IconButton icon="refresh" label={`Repetir: ${r.title}`} onClick={() => onReplay(r.questId)} size="sm" tone="card" />
                      )}
                      {reopenable && (
                        <IconButton icon="undo" label={`Reabrir: ${r.title}`} onClick={() => onReopen(r.questId)} size="sm" tone="card" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}
