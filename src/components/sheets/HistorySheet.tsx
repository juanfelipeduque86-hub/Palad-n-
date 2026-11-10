import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ConversationData } from '../../conversation/storage';
import type { SavedAction } from '../../conversation/storage';
import { IconButton } from '../ui/IconButton';
import { Segmented } from '../ui/Segmented';
import { SheetHeader } from '../ui/SheetHeader';
import { press } from '../../lib/motion';

interface HistorySheetProps {
  data: ConversationData;
  onClose: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onActionStatus: (id: string, status: SavedAction['status']) => void;
}

const fmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function HistorySheet({ data, onClose, onOpen, onDelete, onActionStatus }: HistorySheetProps) {
  const [tab, setTab] = useState<'chats' | 'actions'>('chats');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const sessions = data.sessions.filter((s) => s.messages.some((m) => m.from === 'user'));
  const actions = data.actions.filter((a) => a.status !== 'dropped');

  return (
    <>
      <SheetHeader id="history-title" title="Historial" subtitle="Guardado solo en este navegador" onClose={onClose} />
      <div className="px-4 pb-3">
        <Segmented<'chats' | 'actions'>
          label="Ver"
          value={tab}
          options={[
            { value: 'chats', label: `Conversaciones · ${sessions.length}` },
            { value: 'actions', label: `Acciones · ${actions.length}` },
          ]}
          onChange={setTab}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-5">
        {tab === 'chats' ? (
          sessions.length === 0 ? (
            <p className="rounded-[22px] bg-raised p-4 text-[14px] text-sub">Aún no hay conversaciones guardadas.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-2 rounded-[22px] bg-raised py-2.5 pr-2.5 pl-4">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(s.id)} aria-label={`Abrir: ${s.title}`}>
                    <span className="block truncate text-[15px] font-semibold">{s.title}</span>
                    <span className="block text-[12px] text-sub">
                      {fmt.format(new Date(s.updatedAt))} · {s.messages.filter((m) => m.from === 'user').length} mensajes tuyos
                      {s.id === data.currentId ? <span className="text-mint"> · abierta</span> : null}
                    </span>
                  </button>
                  {confirmDelete === s.id ? (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      transition={press}
                      onClick={() => {
                        onDelete(s.id);
                        setConfirmDelete(null);
                      }}
                      className="h-9 shrink-0 rounded-full bg-lav/20 px-3 text-[12px] font-semibold text-lav"
                    >
                      Borrar
                    </motion.button>
                  ) : (
                    <IconButton icon="close" label={`Borrar: ${s.title}`} onClick={() => setConfirmDelete(s.id)} size="sm" tone="card" />
                  )}
                </li>
              ))}
            </ul>
          )
        ) : actions.length === 0 ? (
          <p className="rounded-[22px] bg-raised p-4 text-[14px] leading-relaxed text-sub">
            No has guardado ninguna acción. Solo aparecen aquí los pasos que decidas guardar durante una conversación.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {actions.map((a) => {
              const done = a.status === 'done';
              return (
                <li key={a.id} className="flex items-start gap-3 rounded-[22px] bg-raised py-3 pr-2.5 pl-3">
                  <IconButton
                    icon="check"
                    label={done ? `Marcar como pendiente: ${a.text}` : `Marcar como hecha: ${a.text}`}
                    active={done}
                    onClick={() => onActionStatus(a.id, done ? 'open' : 'done')}
                    size="sm"
                    tone="card"
                  />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className={`text-[14px] leading-snug ${done ? 'text-faint line-through' : ''}`}>{a.text}</p>
                    <p className="mt-1 text-[12px] text-faint">De «{a.sessionTitle}»</p>
                  </div>
                  <IconButton icon="archive" label={`Quitar: ${a.text}`} onClick={() => onActionStatus(a.id, 'dropped')} size="sm" tone="card" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
