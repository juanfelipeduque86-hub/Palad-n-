import { MotionConfig } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaladinState } from './types';
import type { SlotKey } from './conversation/types';
import { localEngine, OPENING, summaryItems, unclearItems } from './conversation/engine';
import { useConversations } from './hooks/useConversations';
import { ChatHeader } from './components/chat/ChatHeader';
import { ChipBar } from './components/chat/ChipBar';
import { Composer, type ComposerHandle } from './components/chat/Composer';
import { ContextStrip } from './components/chat/ContextStrip';
import { MessageBubble } from './components/chat/MessageBubble';
import { Typing } from './components/chat/Typing';
import { Welcome } from './components/chat/Welcome';
import { AboutSheet } from './components/sheets/AboutSheet';
import { HistorySheet } from './components/sheets/HistorySheet';
import { UnderstandingSheet } from './components/sheets/UnderstandingSheet';
import { Sheet } from './components/ui/Sheet';
import { Toast, type ToastMessage } from './components/ui/Toast';

type SheetKind = 'none' | 'history' | 'understanding' | 'about';

const engine = localEngine;

export default function App() {
  const c = useConversations(engine);
  const [sheet, setSheet] = useState<SheetKind>('none');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastId = useRef(0);
  const composer = useRef<ComposerHandle>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const cur = c.current;
  const state = cur?.state ?? null;
  const messages = cur?.messages ?? [];
  const items = state ? summaryItems(state.u) : [];
  const userCount = messages.filter((m) => m.from === 'user').length;
  const welcome = userCount === 0;
  const resumeCandidate = c.data.sessions.find((s) => s.id !== c.data.currentId && s.messages.some((m) => m.from === 'user'));
  const paladinState: PaladinState = state && (state.pending.kind === 'step' || state.u.choice) ? 'battle-ready' : 'resting';

  // Only the most recent summary / step stays editable.
  const lastSummaryId = [...messages].reverse().find((m) => m.summary)?.id;
  const lastStepId = [...messages].reverse().find((m) => m.step)?.id;

  const showToast = useCallback((text: string) => {
    toastId.current += 1;
    setToast({ id: toastId.current, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, c.thinking, cur?.id]);

  const closeSheet = useCallback(() => setSheet('none'), []);

  const correct = (slot: SlotKey) => {
    setSheet('none');
    c.correct(slot);
    composer.current?.focus();
  };

  const startNew = () => {
    setSheet('none');
    if (!welcome) c.newConversation();
    composer.current?.focus();
  };

  const openConversation = (id: string) => {
    // Don't leave an empty conversation behind.
    if (welcome && cur && cur.id !== id) c.deleteConversation(cur.id);
    c.openConversation(id);
    setSheet('none');
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex h-dvh w-full max-w-[460px] flex-col bg-bg px-4 pt-safe text-text">
        <ChatHeader paladinState={paladinState} onAbout={() => setSheet('about')} onHistory={() => setSheet('history')} onNew={startNew} />
        {!welcome && <ContextStrip items={items} paused={state?.paused.length ?? 0} onOpen={() => setSheet('understanding')} />}

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain" aria-live="polite">
          {welcome ? (
            <Welcome question={OPENING} resumeTitle={resumeCandidate?.title ?? null} onResume={() => resumeCandidate && openConversation(resumeCandidate.id)} />
          ) : (
            <ul className="flex flex-col gap-3 pt-1 pb-3">
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  interactive={m.id === lastSummaryId || m.id === lastStepId}
                  onCorrect={correct}
                  onStep={(id, text, saved) => {
                    c.decideStep(id, text, saved);
                    if (saved) showToast('Guardado en tus acciones');
                  }}
                />
              ))}
              {c.thinking && <Typing />}
            </ul>
          )}
          <div ref={bottom} />
        </main>

        <div className="shrink-0 pt-2 pb-safe">
          <ChipBar chips={cur?.chips ?? []} disabled={c.thinking} onPick={c.send} />
          <Composer
            ref={composer}
            disabled={c.thinking}
            placeholder={welcome ? 'Escribe con tus palabras…' : 'Responde o cuéntame más…'}
            onSend={c.send}
          />
        </div>
      </div>

      <Sheet open={sheet !== 'none'} onClose={closeSheet} labelledBy={`${sheet}-title`} tall={sheet === 'history'} viewKey={sheet}>
        {sheet === 'understanding' && state && (
          <UnderstandingSheet
            items={items}
            unclear={unclearItems(state.u)}
            paused={state.paused}
            onClose={closeSheet}
            onCorrect={correct}
            onResume={(i) => {
              setSheet('none');
              c.resumeTopic(i);
            }}
          />
        )}
        {sheet === 'history' && (
          <HistorySheet
            data={c.data}
            onClose={closeSheet}
            onOpen={openConversation}
            onDelete={(id) => {
              c.deleteConversation(id);
              showToast('Conversación borrada');
            }}
            onActionStatus={c.setActionStatus}
          />
        )}
        {sheet === 'about' && (
          <AboutSheet
            engineLabel={engine.label}
            storageOk={c.storageOk}
            onClose={closeSheet}
            onClearAll={() => {
              c.clearAll();
              setSheet('none');
              showToast('Todo borrado');
            }}
          />
        )}
      </Sheet>

      <Toast message={toast} />
    </MotionConfig>
  );
}
