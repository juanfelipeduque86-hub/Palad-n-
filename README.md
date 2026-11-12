# Paladin

Compañero guerrero en pixel art para razonar, descubrir, imaginar y explorar. Interfaz editorial en marfil: tinta casi negra, títulos con serifa, líneas finas y superficies mate.

> **Todo es local y escrito a mano. No hay IA.** Paladin no genera contenido, no mantiene conversaciones abiertas
> y no evalúa la calidad de ideas libres. La app lo indica con la etiqueta «Contenido local · sin IA».

## Premisa

El protagonista ya usó magia que no debía. El Jardín de Piedra es donde le esperan las consecuencias.

- **Mancha (0–7):** sube con cada rito (primera ofrenda en un altar, beber de la fuente, forzar una puerta rúnica con un sello) y no baja nunca.
- **Costes:** beber revela el trazado y sella la gema; forzar una puerta evita la disputa; con Mancha ≥ 2 las pistas cambian de voz y con ≥ 4 Veda retiene la primera.
- **Veda, la escribana:** lleva la bitácora. Texto escrito de antemano con cinco estados según la Mancha: anota, tarda, omite, escribe sobre ti en tercera persona, cierra el cuaderno.
- **Disputa** (antes Lucha): razonar contra lo escrito es lo único que no mancha.
- **Expuesto** (antes Explorado): salir habiendo visto más del 80 % cambia el epitafio final.

## Las tres disciplinas y las aventuras

| Modo | Qué hace | Qué comprueba Paladin |
|---|---|---|
| **I · Lucha** (razonamiento) | 30 retos de lógica, deducción, patrones, palabras, números y pensamiento lateral. Pistas progresivas, reintentos, «no sé por dónde empezar», explicación con confirmación, «otro diferente». Dificultad elegida por la persona: nunca sube sola. | Compara la respuesta con la solución, variantes válidas y trampas habituales (con su explicación concreta). |
| **II · Pociones** (curiosidad) | 16 datos con contexto, fuente y grado de certeza (establecido / aproximado / debatido). Predicción opcional, preguntas de seguimiento con respuesta escrita, datos relacionados y cuaderno. | Nada que puntuar: solo se descubre. |
| **III · Encantamientos** (creatividad) | 16 retos de asociación, usos inesperados, «¿y si…?», microrrelatos, invenciones y replanteamientos. Grimorio persistente. | Solo reglas explícitas (palabras exactas, palabras obligatorias, ideas por línea, letra inicial). Después muestra otros enfoques posibles; nunca dice que una idea es mejor. |
| **IV · Aventuras** | Mazmorras jugables en pixel art: movimiento (teclado, cruceta, deslizar), niebla de guerra, llaves, puertas, palancas, rejas, bloques sobre placas de presión, deshacer y reinicio. Puertas rúnicas (Lucha), fuentes (Pociones) y altares (Encantamientos) aparecen dentro. Estado persistente y reanudable. | El motor aplica las reglas del juego. |

Las mazmorras están verificadas con un solucionador automático (búsqueda en anchura sobre el motor real):
*La Cripta del Umbral* se completa en 67 movimientos (69 con la gema) y *El Jardín de Piedra* en 47 (52).

## Arte

El guerrero (96×96) y los tiles (16×16) se dibujan en código con un pequeño rasterizador (`src/lib/pixel.ts`):
materiales con tres tonos, luz desde arriba a la izquierda y contorno automático. Se muestran con `image-rendering: pixelated`
a escala entera.

## Stack y scripts

React 19 · Vite 6 · TypeScript estricto · Tailwind CSS 4 · Framer Motion 12. Sin backend.

```bash
npm install
npm run dev
npm run build   # typecheck + build de producción (PWA con service worker)
```

Progreso en `localStorage` (`paladin:progress:v1`), con recuperación por secciones si algo está dañado.

## Estructura

```
src/
  art/          palette, warrior (96×96), tiles (16×16)
  adventure/    engine (puro), maps, render
  content/      riddles, facts, prompts
  lib/          pixel (rasterizador), answers, progress, motion
  hooks/        useProgress
  components/
    home/ lucha/ pociones/ encantamientos/ aventuras/ modes/ ui/
```

## Con una IA real

Conversaciones abiertas o comentarios sobre ideas libres requerirían un servidor propio con la clave de API (nunca en
el navegador), enviar los textos al proveedor y asumir un coste por uso. No está integrado.
