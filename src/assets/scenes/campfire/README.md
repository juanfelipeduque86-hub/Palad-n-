# Escena de la fogata

Coloca aquí los archivos, con estos nombres exactos:

| Archivo | Obligatorio | Uso |
|---|---|---|
| `campfire_scene_base.png` | Sí | Fotograma base: fondo completo del campamento (incluye al caballero sentado). |
| `campfire_scene.gif` | No | El GIF original. Si está, se muestra su zona del fuego en lugar de las llamas generadas. |

No hace falta tocar código: al compilar, la app detecta qué archivos existen.
Sin `campfire_scene_base.png` se usa la escena pintada anterior.

El fuego se anima por código (`src/scenes/fire.ts`): llamas translúcidas, brasas que suben y un
resplandor que late, a 8 fotogramas por segundo y sobre la misma rejilla de píxeles de la imagen.

Ajustes en `src/scenes/campfire.ts`:

- `ART_SCALE`: tamaño de un píxel del dibujo en píxeles de la imagen (2 si se exportó al doble).
- `FIRE`: zona animada. `FLAME`: punto base, ancho y alto de las llamas.
- Abre la app con `?firebox` al final de la dirección para ver la zona marcada.
