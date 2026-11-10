# Paladin

PWA móvil de gestión de tareas gamificada para personas creativas y con ADHD.
Quests, atención y un caballero 1-bit que reacciona a tu ritmo.

> Fase 1: solo frontend. Sin backend, login ni integraciones. Datos mock + `localStorage`.

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

- **Dashboard**: HUD superior (nivel, EXP segmentada, racha, perfil), avatar del Paladin,
  tarjeta de EXP con animación y celebración `LEVEL UP` monocromática.
- **Paladin**: SVG line-art con tres estados animados (`resting`, `battle-ready`, `fatigued`).
  - `battle-ready`: 2+ quests completadas con menos de 45 min entre ellas.
  - `fatigued`: 3 h sin actividad (completar o saltar cuenta como actividad).
  - `resting`: el resto del tiempo.
- **INCREASE LEVEL → Focus Tunnel**: oscurece y difumina todo, muestra una sola micro-quest
  (la de mayor gravedad) con `COMPLETE` / `SKIP`. Saltar no penaliza; la quest vuelve tras 3 min.
- **Inventario RPG**: slots `Combat`, `Potions`, `Keys` con contadores. Cada slot abre un panel
  con mapa orbital y tareas ordenadas por gravedad: las más pesadas quedan más cerca del centro,
  con más peso visual y un pulso suave. Tocar una tarea la abre en el Focus Tunnel.
- **Gravedad orbital**: `gravity` base + empuje por prioridad + deriva lenta según el tiempo sin tocarla.
  Sin fechas límite rígidas.
- **Perfil (icono de casco)**: estadísticas y controles de demo para simular 3 h de inactividad
  o reiniciar el progreso.
- **PWA**: manifest, iconos y service worker con caché offline (solo en build de producción).

## Estructura

```
src/
  components/
    dashboard/     StatusTopBar, ExperienceBar, IncreaseLevelButton, LevelUpBurst, ProfileSheet, Dashboard
    paladin/       PaladinAvatar, PaladinSprite
    inventory/     InventoryBar, InventoryPanel, TaskList, TaskCard, OrbitMap
    focus-tunnel/  FocusTunnel
    ui/            Island, Sheet, PixelIcon, PriorityPips
  hooks/           useGameState, useNow
  lib/             leveling, gravity, paladin, selectTask, storage, time, motion, haptics
  types/           modelos de dominio
  data/            tareas mock y categorías
```
