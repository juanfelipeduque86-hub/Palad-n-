import { MotionConfig } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Quest, SuggestFilters, TaskCategory } from './types';
import { useAppStore } from './hooks/useAppStore';
import { useNow } from './hooks/useNow';
import { derivePaladinState, effectiveStreak, idleMs as getIdleMs } from './lib/paladin';
import { describeFilters, filterKey, findQuest, isSuggestible, matchesFilters } from './lib/quests';
import { eligibleQuests, type SuggestResult } from './lib/recommend';
import { levelProgress } from './lib/leveling';
import { completedToday, weeklyActivity } from './data/activity';
import { CATEGORY_ORDER } from './data/categories';
import { QUEST_LIBRARY } from './data/questLibrary';
import { Dashboard } from './components/dashboard/Dashboard';
import { LevelUpBurst } from './components/dashboard/LevelUpBurst';
import { FocusTunnel, type FocusSession } from './components/focus-tunnel/FocusTunnel';
import { InventoryBar } from './components/inventory/InventoryBar';
import { CategoryView } from './components/quests/CategoryView';
import { HistoryView } from './components/quests/HistoryView';
import { LibraryView } from './components/quests/LibraryView';
import { QuestDetail } from './components/quests/QuestDetail';
import { QuestEditor } from './components/quests/QuestEditor';
import { SuggestFiltersView } from './components/quests/SuggestFiltersView';
import { EMPTY_LIBRARY_FILTERS, isTallView, viewKey, type LibraryFilters, type View } from './components/quests/views';
import { SettingsView } from './components/settings/SettingsView';
import { Notice, type NoticeAction } from './components/ui/Notice';
import { Sheet } from './components/ui/Sheet';
import { Toast, type ToastMessage } from './components/ui/Toast';

const LEVEL_UP_MS = 1800;
const TOAST_MS = 2200;

const newSessionId = (): string => `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const store = useAppStore();
  const { data, requestSuggestion } = store;
  const tickNow = useNow(15_000);
  // Re-read the clock on every tick and every data change so time-derived UI never lags.
  const now = useMemo(() => Date.now(), [tickNow, data]);

  const [views, setViews] = useState<View[]>([]);
  const [libraryFilters, setLibraryFilters] = useState<LibraryFilters>(EMPTY_LIBRARY_FILTERS);
  const [focus, setFocus] = useState<FocusSession | null>(null);
  const [notice, setNotice] = useState<SuggestResult | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [levelUpEventId, setLevelUpEventId] = useState<number | null>(null);
  const toastId = useRef(0);

  const { player, prefs } = data;
  const filters = prefs.filters;
  const paladinState = derivePaladinState(player, now);
  const streak = effectiveStreak(player, now);
  const idle = getIdleMs(player, now);

  // ---------- derived ----------
  const suggestion: Quest | null = useMemo(() => {
    const id = data.suggest.current;
    const q = id ? findQuest(data, id) : undefined;
    return q && matchesFilters(q, filters) && isSuggestible(q, data.history, now) ? q : null;
  }, [data, filters, now]);

  const focusQuest = focus ? (findQuest(data, focus.questId) ?? null) : null;
  const nextQuest = suggestion && suggestion.id !== focus?.questId ? suggestion : null;

  const counts = useMemo(() => {
    const out = {} as Record<TaskCategory, number>;
    for (const c of CATEGORY_ORDER) out[c] = eligibleQuests(data, { category: c, duration: 'any', effort: 'any' }, now).length;
    return out;
  }, [data, now]);
  const week = useMemo(() => weeklyActivity(data.history, now), [data.history, now]);
  const todayCount = completedToday(data.history, now);

  // ---------- helpers ----------
  const showToast = useCallback((text: string) => {
    toastId.current += 1;
    setToast({ id: toastId.current, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const lc = store.lastCompletion;
    if (lc?.leveledUp) setLevelUpEventId(lc.id);
  }, [store.lastCompletion]);

  // Separate timer so a later completion never cancels the dismissal.
  useEffect(() => {
    if (levelUpEventId === null) return;
    const id = window.setTimeout(() => setLevelUpEventId(null), LEVEL_UP_MS);
    return () => window.clearTimeout(id);
  }, [levelUpEventId]);

  // Keep a valid suggestion on the dashboard (or explain why there is none).
  const suggestionValid = suggestion !== null;
  const fKey = filterKey(filters);
  useEffect(() => {
    if (suggestionValid) return;
    const r = requestSuggestion('fresh', focus?.questId ?? null);
    setNotice(r.kind === 'ok' ? null : r);
  }, [suggestionValid, fKey, data.history.length, data.personal]);

  // ---------- navigation ----------
  const openRoot = useCallback((v: View) => setViews([v]), []);
  const pushView = useCallback((v: View) => setViews((s) => [...s, v]), []);
  const back = useCallback(() => setViews((s) => s.slice(0, -1)), []);
  const closeViews = useCallback(() => setViews([]), []);

  const startQuest = useCallback((questId: string) => {
    setViews([]);
    setNotice(null);
    setFocus({ questId, sessionId: newSessionId() });
  }, []);

  const applyFilters = useCallback(
    (f: SuggestFilters) => {
      store.setFilters(f);
      setNotice(null);
    },
    [store],
  );

  const openFilters = useCallback(() => {
    setFocus(null);
    openRoot({ kind: 'filters' });
  }, [openRoot]);

  const openFavorites = useCallback(() => {
    setFocus(null);
    setLibraryFilters({ ...EMPTY_LIBRARY_FILTERS, favoritesOnly: true });
    openRoot({ kind: 'library' });
  }, [openRoot]);

  /** "Another quest": from the tunnel (switches quest) or the dashboard (changes suggestion). */
  const handleAnother = useCallback(
    (currentId?: string) => {
      const r = requestSuggestion('another', currentId ?? null);
      if (r.kind === 'ok') {
        setNotice(null);
        if (focus && currentId === focus.questId && !data.history.some((h) => h.sessionId === focus.sessionId)) {
          setFocus({ questId: r.quest.id, sessionId: newSessionId() });
        }
      } else {
        setNotice(r);
      }
    },
    [requestSuggestion, focus, data.history],
  );

  const handleNewRound = useCallback(() => {
    const r = store.startNewRound();
    if (r.kind === 'ok') {
      setNotice(null);
      if (focus && !data.history.some((h) => h.sessionId === focus.sessionId)) {
        setFocus({ questId: r.quest.id, sessionId: newSessionId() });
      }
    } else {
      setNotice(r);
    }
  }, [store, focus, data.history]);

  const increaseLevel = useCallback(() => {
    if (suggestion) {
      startQuest(suggestion.id);
      return;
    }
    const r = requestSuggestion('fresh');
    if (r.kind === 'ok' || r.kind === 'single') startQuest(r.quest.id);
    else setNotice(r);
  }, [suggestion, requestSuggestion, startQuest]);

  const selectCategory = useCallback(
    (c: TaskCategory) => {
      if (filters.category !== c) applyFilters({ ...filters, category: c });
      openRoot({ kind: 'category', category: c });
    },
    [filters, applyFilters, openRoot],
  );

  // ---------- notice ----------
  const renderNotice = (): ReactNode => {
    if (!notice || notice.kind === 'ok') return null;
    const desc = describeFilters(filters);
    let title = '';
    let body = '';
    let actions: NoticeAction[] = [];
    switch (notice.kind) {
      case 'single':
        title = 'Es la única quest con estos filtros';
        body = `«${desc}» solo deja una opción disponible, así que no hay otra que proponer.`;
        actions = [
          { label: 'Ampliar filtros', onClick: openFilters, primary: true },
          { label: 'Entendido', onClick: () => setNotice(null) },
        ];
        break;
      case 'explored':
        title = 'Ya viste todas las de esta selección';
        body = `Las ${notice.eligible} quests disponibles para «${desc}» ya salieron en esta ronda.`;
        actions = [
          { label: 'Nueva ronda', onClick: handleNewRound, primary: true },
          { label: 'Ampliar filtros', onClick: openFilters },
          { label: 'Favoritas', onClick: openFavorites },
        ];
        break;
      case 'empty':
        title = 'Nada disponible con estos filtros';
        body = `No hay quests para «${desc}» ahora mismo. Las completadas hace poco descansan unas horas.`;
        actions = [
          ...notice.relaxations.map((r, i) => ({
            label: `${r.label} (${r.count})`,
            onClick: () => applyFilters(r.filters),
            primary: i === 0,
          })),
          {
            label: 'Crear quest',
            onClick: () => {
              setFocus(null);
              openRoot({ kind: 'editor', questId: null, category: filters.category === 'all' ? 'combat' : filters.category });
            },
          },
        ];
        break;
    }
    return <Notice icon={notice.kind === 'empty' ? 'sliders' : 'spark'} title={title} body={body} actions={actions} />;
  };
  const noticeNode = renderNotice();

  // ---------- views ----------
  const top = views[views.length - 1] ?? null;
  const onBack = views.length > 1 ? back : undefined;

  const renderView = (v: View): ReactNode => {
    switch (v.kind) {
      case 'library':
        return (
          <LibraryView
            data={data}
            now={now}
            filters={libraryFilters}
            onFiltersChange={setLibraryFilters}
            onBack={onBack}
            onClose={closeViews}
            onOpenQuest={(id) => pushView({ kind: 'detail', questId: id })}
            onCreate={() =>
              pushView({ kind: 'editor', questId: null, category: libraryFilters.category === 'all' ? 'combat' : libraryFilters.category })
            }
          />
        );
      case 'category':
        return (
          <CategoryView
            data={data}
            now={now}
            category={v.category}
            onBack={onBack}
            onClose={closeViews}
            onOpenQuest={(id) => pushView({ kind: 'detail', questId: id })}
            onCreate={(c) => pushView({ kind: 'editor', questId: null, category: c })}
            onBrowseAll={(c) => {
              setLibraryFilters({ ...EMPTY_LIBRARY_FILTERS, category: c });
              pushView({ kind: 'library' });
            }}
            onOpenHistory={() => pushView({ kind: 'history' })}
          />
        );
      case 'history':
        return (
          <HistoryView
            data={data}
            now={now}
            onBack={onBack}
            onClose={closeViews}
            onReplay={startQuest}
            onReopen={(id) => {
              store.setPersonalStatus(id, 'open');
              showToast('Quest reabierta');
            }}
            onOpenQuest={(id) => pushView({ kind: 'detail', questId: id })}
            onBrowse={() => pushView({ kind: 'library' })}
          />
        );
      case 'settings':
        return (
          <SettingsView
            data={data}
            storageOk={store.storageOk}
            paladinState={paladinState}
            streak={streak}
            idleMs={idle}
            onBack={onBack}
            onClose={closeViews}
            onDailyGoal={store.setDailyGoal}
            onOpenQuest={(id) => pushView({ kind: 'detail', questId: id })}
            onSimulateInactivity={() => {
              store.simulateInactivity(3);
              closeViews();
              showToast('Simuladas 3 h sin actividad');
            }}
            onReset={() => {
              store.resetAll();
              setNotice(null);
              closeViews();
              showToast('Progreso borrado');
            }}
          />
        );
      case 'filters':
        return (
          <SuggestFiltersView
            data={data}
            now={now}
            onBack={onBack}
            onClose={closeViews}
            onApply={(f) => {
              applyFilters(f);
              closeViews();
            }}
          />
        );
      case 'detail': {
        const q = findQuest(data, v.questId);
        if (!q) return null;
        return (
          <QuestDetail
            quest={q}
            favorite={data.favorites.includes(q.id)}
            history={data.history}
            now={now}
            onBack={onBack}
            onClose={closeViews}
            onStart={startQuest}
            onToggleFavorite={(id) => showToast(store.toggleFavorite(id) ? 'Guardada en favoritas' : 'Quitada de favoritas')}
            onEdit={(id) => pushView({ kind: 'editor', questId: id, category: q.category })}
            onSetStatus={(id, status) => {
              store.setPersonalStatus(id, status);
              showToast(status === 'archived' ? 'Quest archivada · puedes restaurarla en Ajustes' : 'Quest reabierta');
              if (status === 'archived') back();
            }}
          />
        );
      }
      case 'editor': {
        const existing = v.questId ? data.personal.find((p) => p.id === v.questId) ?? null : null;
        return (
          <QuestEditor
            quest={existing}
            defaultCategory={v.category}
            onBack={onBack}
            onClose={closeViews}
            onSave={(draft) => {
              if (existing) {
                store.updatePersonal(existing.id, draft);
                showToast('Cambios guardados');
                back();
              } else {
                const created = store.createPersonal(draft);
                showToast('Quest creada');
                setViews((s) => [...s.slice(0, -1), { kind: 'detail', questId: created.id }]);
              }
            }}
            onArchive={(id) => {
              store.setPersonalStatus(id, 'archived');
              showToast('Quest archivada · puedes restaurarla en Ajustes');
              // Leave both the editor and the (now archived) detail view.
              setViews((s) => s.slice(0, -1).filter((x) => !(x.kind === 'detail' && x.questId === id)));
            }}
          />
        );
      }
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-x-hidden bg-bg text-text">
        <Dashboard
          player={player}
          paladinState={paladinState}
          streak={streak}
          idleMs={idle}
          lastCompletion={store.lastCompletion}
          suggestion={suggestion}
          notice={focus ? null : noticeNode}
          filters={filters}
          todayCount={todayCount}
          dailyGoal={prefs.dailyGoal}
          week={week}
          libraryCount={QUEST_LIBRARY.length + data.personal.filter((p) => p.status !== 'archived').length}
          historyCount={data.history.length}
          receded={focus !== null}
          onIncreaseLevel={increaseLevel}
          onStartQuest={startQuest}
          onOpenQuest={(id) => openRoot({ kind: 'detail', questId: id })}
          onAnother={() => handleAnother(suggestion?.id)}
          onEditFilters={() => openRoot({ kind: 'filters' })}
          onOpenLibrary={() => openRoot({ kind: 'library' })}
          onOpenHistory={() => openRoot({ kind: 'history' })}
          onOpenSettings={() => openRoot({ kind: 'settings' })}
        />

        <InventoryBar
          counts={counts}
          active={filters.category === 'all' ? null : filters.category}
          onSelect={selectCategory}
        />

        <Sheet
          open={top !== null}
          onClose={closeViews}
          labelledBy={top ? `${top.kind}-title` : 'sheet'}
          tall={top ? isTallView(top) : false}
          viewKey={top ? viewKey(top) : 'none'}
        >
          {top && renderView(top)}
        </Sheet>

        <FocusTunnel
          session={focus}
          quest={focusQuest}
          nextQuest={nextQuest}
          notice={focus ? noticeNode : null}
          level={player.level}
          levelPct={levelProgress(player) * 100}
          onComplete={store.completeQuest}
          onAnother={handleAnother}
          onStart={startQuest}
          onClose={() => setFocus(null)}
          onStop={() => {
            setFocus(null);
            showToast('Buen trabajo. Parar también es una buena decisión.');
          }}
        />

        <Toast message={toast} />
        <LevelUpBurst eventId={levelUpEventId} level={player.level} />
      </div>
    </MotionConfig>
  );
}

