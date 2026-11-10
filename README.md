# Paladin

Compañero de conversación para aclarar lo que tienes entre manos: un proyecto que no avanza, algo que
estudias, una decisión. Paladin pregunta por lo que le cuentas, resume lo que entiende, acepta correcciones
y solo propone un paso pequeño si tú lo pides.

> **Estado: prototipo local con reglas, no una IA.** La conversación la genera un motor determinista en
> español (`src/conversation/`). Reconoce temas y expresiones concretas; cuando no entiende algo, lo dice.
> La interfaz lo indica siempre con la etiqueta «Prototipo local · sin IA».

## Stack

React 19 · Vite 6 · TypeScript estricto · Tailwind CSS 4 · Framer Motion 12. Sin backend.

```bash
npm install
npm run dev        # desarrollo
npm run typecheck
npm run build      # typecheck + build de producción (PWA con service worker)
```

## Cómo funciona la conversación

Bucle: **preguntar → escuchar → entender → repreguntar sobre lo dicho → aclarar juntos → paso opcional**.

- `extract.ts` saca de cada mensaje lo reconocible: de qué se trata (app, novela, examen, mudanza…), qué
  parte cuesta (diseño, contenido, memorizar…), detalles (colores, distribución, el final…), qué lo complica,
  límites de tiempo, opciones de una decisión, correcciones («no es X, en realidad es Y») y cambios de tema.
- `engine.ts` mantiene lo que entiende (`Understanding`), registra qué preguntó para no repetirlo y elige la
  siguiente pregunta según lo que falta. Cuando una respuesta no encaja en lo esperado, guarda tus palabras
  tal cual y te avisa de cómo las interpretó.
- Con suficiente contexto muestra un resumen provisional, corregible punto por punto. Después ofrece
  direcciones (seguir explorando, entender por qué pasa, ver opciones, decidir, un paso pequeño o parar) sin
  imponer ninguna. Los pasos son editables y se pueden descartar; guardar uno no encola otro.
- Los temas se pueden pausar y retomar. Las conversaciones y acciones guardadas viven solo en `localStorage`
  (`paladin:conversations:v1`), con recuperación si los datos están dañados.

### Límites conocidos

- No entiende lenguaje libre en general: solo los patrones programados, en español.
- No responde preguntas de conocimiento general ni tiene conexión a internet.
- Las lecturas («entender por qué pasa») y opciones salen de plantillas, adaptadas con tus palabras.

## Pasar a una IA real

`ConversationEngine` (en `src/conversation/types.ts`) define el contrato: `start`, `respond`,
`beginCorrection`, `resume`, `stepOutcome`. Un motor basado en un modelo de lenguaje podría implementarlo
llamando a un endpoint propio. Requisitos:

- **Servidor**: una función serverless o backend que guarde la clave de API. La clave nunca puede ir en el
  navegador ni en el repositorio. GitHub Pages no sirve para esto (solo archivos estáticos).
- **Privacidad**: los mensajes saldrían del dispositivo hacia el proveedor del modelo.
- **Coste**: se paga por tokens. Como referencia, Claude Opus 5.5 cuesta 4 $ por millón de tokens de entrada
  y 20 $ por millón de salida; un mensaje típico de esta app rondaría 1–2 céntimos de dólar.

## Estructura

```
src/
  conversation/  types, text, extract, content, engine, storage
  hooks/         useConversations
  components/
    chat/        ChatHeader, ContextStrip, MessageBubble, ChipBar, Composer, Welcome, Typing
    sheets/      UnderstandingSheet, HistorySheet, AboutSheet
    paladin/     PaladinSprite
    ui/          Icon, IconButton, Sheet, SheetHeader, Segmented, Field, Toast
  lib/           motion
  App.tsx
```
