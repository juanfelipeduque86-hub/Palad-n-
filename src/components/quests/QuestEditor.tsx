import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Duration, Effort, PersonalQuest, QuestDraft, TaskCategory } from '../../types';
import { CATEGORIES, CATEGORY_ORDER } from '../../data/categories';
import { DURATIONS, EFFORTS, EFFORT_LABEL, expFor } from '../../lib/quests';
import { Field, inputClass } from '../ui/Field';
import { Segmented } from '../ui/Segmented';
import { SheetHeader } from '../ui/SheetHeader';
import { press } from '../../lib/motion';

const TITLE_MAX = 70;
const INSTRUCTION_MAX = 160;

interface QuestEditorProps {
  quest: PersonalQuest | null;
  defaultCategory: TaskCategory;
  onBack?: () => void;
  onClose: () => void;
  onSave: (draft: QuestDraft) => void;
  onArchive: (id: string) => void;
}

export function QuestEditor({ quest, defaultCategory, onBack, onClose, onSave, onArchive }: QuestEditorProps) {
  const [draft, setDraft] = useState<QuestDraft>(() => ({
    title: quest?.title ?? '',
    instruction: quest?.instruction ?? '',
    category: quest?.category ?? defaultCategory,
    durationMin: quest?.durationMin ?? 5,
    effort: quest?.effort ?? 'low',
  }));
  const valid = draft.title.trim().length >= 3;
  const set = <K extends keyof QuestDraft>(k: K, v: QuestDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave(draft);
      }}
    >
      <SheetHeader
        id="editor-title"
        title={quest ? 'Editar quest' : 'Nueva quest'}
        subtitle="Personal · se guarda en este dispositivo"
        onBack={onBack}
        onClose={onClose}
      />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
        <Field label="Título" hint={`${draft.title.length}/${TITLE_MAX}`}>
          <input
            className={`${inputClass} h-12`}
            value={draft.title}
            maxLength={TITLE_MAX}
            placeholder="Ej.: Ordenar la carpeta de facturas"
            onChange={(e) => set('title', e.target.value)}
            autoFocus={!quest}
          />
        </Field>
        <Field label="Primer paso" hint={`${draft.instruction.length}/${INSTRUCTION_MAX}`}>
          <textarea
            className={`${inputClass} min-h-[84px] resize-none py-3 leading-relaxed`}
            value={draft.instruction}
            maxLength={INSTRUCTION_MAX}
            placeholder="¿Cuál es la acción más pequeña para empezar?"
            onChange={(e) => set('instruction', e.target.value)}
          />
        </Field>
        <Field label="Categoría" group>
          <Segmented<TaskCategory>
            label="Categoría"
            value={draft.category}
            options={CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORIES[c].label }))}
            onChange={(v) => set('category', v)}
          />
        </Field>
        <Field label="Duración estimada" group>
          <Segmented<Duration>
            label="Duración"
            value={draft.durationMin}
            options={DURATIONS.map((d) => ({ value: d, label: `${d}′` }))}
            onChange={(v) => set('durationMin', v)}
          />
        </Field>
        <Field label="Esfuerzo" group>
          <Segmented<Effort>
            label="Esfuerzo"
            value={draft.effort}
            options={EFFORTS.map((e) => ({ value: e, label: EFFORT_LABEL[e] }))}
            onChange={(v) => set('effort', v)}
          />
        </Field>
        <p className="px-1 text-[13px] text-sub">
          Recompensa: <span className="font-semibold text-mint">+{expFor(draft.durationMin, draft.effort)} EXP</span>{' '}
          <span className="text-faint">(según duración y esfuerzo)</span>
        </p>
      </div>
      <div className="flex shrink-0 gap-2 px-4 pt-2 pb-4">
        {quest && quest.status !== 'archived' && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            transition={press}
            onClick={() => onArchive(quest.id)}
            className="h-12 rounded-full bg-raised px-5 text-[14px] font-medium text-sub transition-colors hover:bg-track hover:text-text"
          >
            Archivar
          </motion.button>
        )}
        <motion.button
          type="submit"
          disabled={!valid}
          whileTap={valid ? { scale: 0.975 } : undefined}
          transition={press}
          className="h-12 flex-1 rounded-full bg-mint text-[15px] font-semibold text-mint-ink transition-colors hover:bg-mint-strong disabled:bg-raised disabled:text-faint"
        >
          {quest ? 'Guardar cambios' : 'Crear quest'}
        </motion.button>
      </div>
    </form>
  );
}
