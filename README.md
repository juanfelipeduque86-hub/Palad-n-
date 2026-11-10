# Paladin

PWA móvil de gestión de tareas gamificada para personas creativas y con ADHD.
Quests, atención y un caballero 1-bit que reacciona a tu ritmo.

> Solo frontend: sin backend, login ni integraciones. Biblioteca local + `localStorage`.

## Stack

React 19 · Vite 6 · TypeScript estricto · Tailwind CSS 4 · Framer Motion 12

## Scripts

```bash
npm install
npm run dev        # servidor de desarrollo
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + build de producción
npm run preview    # sirve dist/ (registra el service worker)
```

## Qué incluye

- **Dashboard** (punto de entrada, sin saturar): Paladin con sus tres estados, barra de EXP,
  cápsula de próxima quest (con «otra» y «empezar»), botón `INCREASE LEVEL`, anillo de meta diaria,
  actividad semanal real y accesos a Biblioteca e Historial.
- **Biblioteca de 60 micro-quests** en español (20 Combat, 20 Potions, 20 Keys) con duración
  (1–15 min), esfuerzo, EXP y etiquetas. Búsqueda sin tildes y filtros por categoría, duración,
  esfuerzo y favoritas.
- **Quests personales**: crear, editar, archivar, restaurar y reabrir. Quedan completadas hasta que
  las reabres; nunca se reciclan solas.
- **Focus Tunnel**: una sola quest, `COMPLETE`, «Otra quest» y «Ahora no». Tras completar muestra
  la EXP, el progreso de nivel y una siguiente sugerencia, o deja volver al inicio / parar.
- **Recomendador local** (`src/lib/recommend.ts`): respeta los filtros, no repite la quest actual,
  prioriza las no vistas en la ronda, luego las tuyas y favoritas. Explica cuándo solo hay una opción,
  cuándo ya viste todas (nueva ronda / ampliar filtros / favoritas) y cuándo no hay resultados
  (propone relajar filtros con el número de quests que aparecerían).
- **Reglas de repetición**: cada completada genera un registro propio; la EXP se otorga una vez por
  sesión de foco (los toques repetidos no duplican). Las quests de biblioteca descansan 8 h antes de
  volver a sugerirse, aunque puedes repetirlas a propósito desde la biblioteca o el historial.
- **Historial** agrupado por día, con repetir/reabrir. **Ajustes** con meta diaria, quests archivadas,
  estado del guardado y controles de demo.
- **Persistencia local versionada** (`paladin:data:v2`): progreso, quests personales, favoritas,
  historial, sugerencias vistas y preferencias. Si el almacenamiento falla o está corrupto, la app
  recupera campo a campo y sigue funcionando.
- **PWA**: manifest, iconos y service worker offline (solo en build de producción).

La app no genera contenido con IA: todo sale de la biblioteca local y de tus propias quests.

## Estructura

```
src/
  components/
    dashboard/     AppHeader, ExperienceBar, NextQuestCapsule, IncreaseLevelButton, QuestRing,
                   WeeklyActivity, ExploreRow, FilterSummary, LevelUpBurst, Dashboard
    paladin/       PaladinAvatar, PaladinSprite
    quests/        LibraryView, CategoryView, HistoryView, QuestDetail, QuestEditor,
                   SuggestFiltersView, QuestRow
    settings/      SettingsView
    inventory/     InventoryBar
    focus-tunnel/  FocusTunnel
    ui/            Icon, IconButton, Card, Sheet, SheetHeader, Chip, Segmented, Field, Notice, Toast
  hooks/           useAppStore, useNow
  lib/             recommend, quests, exp, leveling, paladin, storage, time, motion, haptics
  types/           modelos de dominio (plantilla, quest personal, registro de completada…)
  data/            questLibrary (60 quests), seed, categories, activity
```
