# Escena de la fogata

Coloca aquí los archivos, con estos nombres exactos:

| Archivo | Obligatorio | Uso |
|---|---|---|
| `campfire_scene_base.png` | Sí | Fotograma base: fondo completo del campamento (incluye al caballero sentado). |
| `campfire_scene.gif` | No | El GIF original. Solo se muestra la zona del fuego, encima del fondo estático. |

No hace falta tocar código: al compilar, la app detecta qué archivos existen.
Sin `campfire_scene_base.png` se usa la escena pintada anterior.

La zona del fuego se ajusta en `src/scenes/campfire.ts` (`FIRE`). Para verla marcada sobre la
imagen, abre la app con `?firebox` al final de la dirección.
