import { motion } from 'framer-motion';
import type { CompletionRecord, Quest } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_ICON } from '../inventory/categoryIcon';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { QuestMeta } from '../ui/QuestMeta';
import { SheetHeader } from '../ui/SheetHeader';
import { formatAgo, formatSince, toMs } from '../../lib/time';
import { restingUntil } from '../../lib/quests';
import { press } from '../../lib/motion';

interface QuestDetailProps {
  quest: Quest;
  favorite: boolean;
  history: CompletionRecord[];
  now: number;
  onBack?: () => void;
  onClose: () => void;
  onStart: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (id: string) => void;
  onSetStatus: (id: string, status: 'open' | 'completed' | 'archived') => void;
}

function Action({ label, icon, onClick }: { label: string; icon: 'pencil' | 'archive' | 'undo'; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={press}
      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-raised text-[14px] font-medium transition-colors hover:bg-track"
    >
      <Icon name={icon} size={17} className="text-sub" />
      {label}
    </motion.button>
  );
}

export function QuestDetail({
  quest,
  favorite,
  history,
  now,
  onBack,
  onClose,
  onStart,
  onToggleFavorite,
  onEdit,
  onSetStatus,
}: QuestDetailProps) {
  const records = history.filter((r) => r.questId === quest.id);
  const last = records[0];
  const rest = restingUntil(quest, history);
  const resting = rest !== null && rest > now;
  const personal = quest.source === 'personal' ? quest : null;
  const startable = !personal || personal.status === 'open';

  return (
    <>
      <SheetHeader
        id="detail-title"
        title={personal ? 'Tu quest' : 'Quest de la biblioteca'}
        onBack={onBack}
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="flex items-center gap-2 text-[13px] text-sub">
          <Icon name={CATEGORY_ICON[quest.category]} size={17} />
          {CATEGORIES[quest.category].label}
          {personal?.status === 'completed' && <span className="text-mint">· Completada</span>}
          {personal?.status === 'archived' && <span className="text-faint">· Archivada</span>}
        </div>
        <h3 className="mt-2 text-[22px] leading-tight font-semibold tracking-[-0.01em]">{quest.title}</h3>
        {quest.instruction && <p className="mt-2 text-[15px] leading-relaxed text-sub">{quest.instruction}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex h-8 items-center rounded-full bg-raised px-3">
            <QuestMeta quest={quest} />
          </span>
          <span className="inline-flex h-8 items-center rounded-full bg-mint/12 px-3 text-[13px] font-semibold text-mint">
            +{quest.expReward} EXP
          </span>
        </div>
        {quest.tags.length > 0 && (
          <p className="mt-3 text-[12px] text-faint">{quest.tags.map((t) => `#${t}`).join('  ')}</p>
        )}

        <div className="mt-5 rounded-[22px] bg-raised p-4 text-[13px] text-sub">
          {last ? (
            <>
              Completada {records.length === 1 ? 'una vez' : `${records.length} veces`} · última {formatAgo(now - toMs(last.completedAt))}.
              {resting && rest !== null && (
                <> Descansa de las sugerencias durante {formatSince(rest - now)} más; puedes repetirla cuando quieras.</>
              )}
            </>
          ) : personal ? (
            'Quest personal: queda completada hasta que decidas reabrirla.'
          ) : (
            'Quest repetible: después de completarla descansa unas horas antes de volver a sugerirse.'
          )}
        </div>

        {personal && (
          <div className="mt-3 flex gap-2">
            {personal.status !== 'archived' && <Action label="Editar" icon="pencil" onClick={() => onEdit(quest.id)} />}
            {personal.status === 'completed' && (
              <Action label="Reabrir" icon="undo" onClick={() => onSetStatus(quest.id, 'open')} />
            )}
            {personal.status === 'archived' ? (
              <Action label="Restaurar" icon="undo" onClick={() => onSetStatus(quest.id, 'open')} />
            ) : (
              <Action label="Archivar" icon="archive" onClick={() => onSetStatus(quest.id, 'archived')} />
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 px-4 pt-2 pb-4">
        <IconButton
          icon="star"
          filledIcon={favorite}
          active={favorite}
          label={favorite ? 'Quitar de favoritas' : 'Guardar en favoritas'}
          onClick={() => onToggleFavorite(quest.id)}
          size="lg"
        />
        <motion.button
          type="button"
          disabled={!startable}
          onClick={() => onStart(quest.id)}
          whileTap={startable ? { scale: 0.975 } : undefined}
          transition={press}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-mint text-[15px] font-semibold text-mint-ink transition-colors hover:bg-mint-strong disabled:bg-raised disabled:text-faint"
        >
          <Icon name="play" size={17} filled={startable} />
          {!startable ? 'Reábrela para empezar' : last ? 'Repetir ahora' : 'Empezar'}
        </motion.button>
      </div>
    </>
  );
}
