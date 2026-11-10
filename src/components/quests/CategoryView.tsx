import { motion } from 'framer-motion';
import type { AppData, TaskCategory } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_ICON } from '../inventory/categoryIcon';
import { QUEST_LIBRARY } from '../../data/questLibrary';
import { isSuggestible } from '../../lib/quests';
import { Icon } from '../ui/Icon';
import { Notice } from '../ui/Notice';
import { SheetHeader } from '../ui/SheetHeader';
import { QuestRow } from './QuestRow';
import { press } from '../../lib/motion';

interface CategoryViewProps {
  data: AppData;
  now: number;
  category: TaskCategory;
  onBack?: () => void;
  onClose: () => void;
  onOpenQuest: (id: string) => void;
  onCreate: (category: TaskCategory) => void;
  onBrowseAll: (category: TaskCategory) => void;
  onOpenHistory: () => void;
}

const PICKS = 4;

export function CategoryView({
  data,
  now,
  category,
  onBack,
  onClose,
  onOpenQuest,
  onCreate,
  onBrowseAll,
  onOpenHistory,
}: CategoryViewProps) {
  const meta = CATEGORIES[category];
  const favorites = new Set(data.favorites);
  const mine = data.personal.filter((p) => p.category === category && p.status === 'open');
  const mineDone = data.personal.filter((p) => p.category === category && p.status === 'completed').length;
  const seen = new Set(data.suggest.recent);
  const library = QUEST_LIBRARY.filter((q) => q.category === category);
  const available = library.filter((q) => isSuggestible(q, data.history, now));
  // Favorites first, then quests not shown recently.
  const picks = [...available]
    .sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)) || Number(seen.has(a.id)) - Number(seen.has(b.id)))
    .slice(0, PICKS);

  return (
    <>
      <SheetHeader
        id="category-title"
        title={meta.label}
        subtitle={meta.tagline}
        onBack={onBack}
        onClose={onClose}
        leading={
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mint text-mint-ink">
            <Icon name={CATEGORY_ICON[category]} size={19} />
          </span>
        }
      />
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        <section>
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="text-[13px] font-semibold text-sub">Tus quests · {mine.length}</h3>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              transition={press}
              onClick={() => onCreate(category)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-raised px-3 text-[13px] font-medium transition-colors hover:bg-track"
            >
              <Icon name="plus" size={15} className="text-mint" />
              Nueva
            </motion.button>
          </div>
          {mine.length === 0 ? (
            <Notice
              icon={CATEGORY_ICON[category]}
              title={`No tienes quests propias pendientes en ${meta.label}`}
              body={
                mineDone > 0
                  ? `Completaste ${mineDone}. Siguen en tu historial por si quieres reabrir alguna.`
                  : 'Puedes elegir una de la biblioteca o escribir la tuya.'
              }
              actions={[
                { label: 'Crear quest', onClick: () => onCreate(category), primary: true },
                ...(mineDone > 0 ? [{ label: 'Ver historial', onClick: onOpenHistory }] : []),
              ]}
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {mine.map((q) => (
                <QuestRow key={q.id} quest={q} favorite={favorites.has(q.id)} showCategory={false} onOpen={onOpenQuest} />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-5">
          <h3 className="mb-2 px-2 text-[13px] font-semibold text-sub">
            De la biblioteca · {available.length} disponibles de {library.length}
          </h3>
          {picks.length === 0 ? (
            <Notice
              title="Completaste todas las de esta categoría hace poco"
              body="Descansan unas horas antes de volver a sugerirse. Puedes repetir cualquiera desde la biblioteca."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {picks.map((q) => (
                <QuestRow key={q.id} quest={q} favorite={favorites.has(q.id)} showCategory={false} onOpen={onOpenQuest} />
              ))}
            </ul>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            transition={press}
            onClick={() => onBrowseAll(category)}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-sub transition-colors hover:text-text"
          >
            Ver las {library.length} de {meta.label} en la biblioteca
            <Icon name="chevron" size={16} />
          </motion.button>
        </section>
      </div>
    </>
  );
}
