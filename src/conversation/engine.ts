import type {
  ConversationEngine,
  Direction,
  EngineReply,
  EngineState,
  Facet,
  SlotKey,
  SummaryItem,
  Understanding,
} from './types';
import { extract, isStockLabel, lastSegment, looksLikeWords, matchAnyDetail, matchDetail, type Extraction } from './extract';
import { exploreQuestion, focusRef, gatherQuestion, insight, optionSet, stepFor, subjectRef, type Question } from './content';
import { clause, norm, pick, toSecondPerson, upperFirst } from './text';

type Out = EngineReply['messages'];

export const OPENING = '¿Qué te gustaría aclarar o resolver ahora?';
const OPENING_CHIPS = ['Un proyecto que no avanza', 'Una decisión', 'Algo que estoy estudiando', 'Solo quiero pensar en voz alta'];

export function emptyUnderstanding(): Understanding {
  return {
    domain: null,
    subject: null,
    goal: null,
    focus: null,
    detail: null,
    blocker: null,
    feeling: null,
    success: null,
    tried: null,
    constraints: [],
    options: null,
    reference: null,
    whyNow: null,
    smallest: null,
    others: null,
    worry: null,
    criterion: null,
    choice: null,
    skipped: [],
  };
}

function initialState(): EngineState {
  return {
    version: 1,
    u: emptyUnderstanding(),
    asked: [],
    pending: { kind: 'slot', questionId: 'opening', slot: 'goal', chips: OPENING_CHIPS, helped: false },
    summarizedHash: null,
    usedInsights: [],
    usedOptionSets: [],
    usedSteps: [],
    paused: [],
    misses: 0,
    turn: 0,
  };
}

// ---------- understanding helpers ----------

const SLOT_LABEL: Record<SlotKey, string> = {
  subject: 'Sobre qué',
  goal: 'Qué quieres',
  focus: 'Lo que más cuesta',
  detail: 'Parte concreta',
  blocker: 'Qué lo complica',
  success: 'Qué buscas',
  tried: 'Ya probaste',
  constraints: 'Límites',
  reference: 'Referencia',
  whyNow: 'Por qué ahora',
  smallest: 'Parte pequeña',
  others: 'Otras personas',
  worry: 'Preocupación',
  criterion: 'Criterio',
  choice: 'Te inclinas por',
};

const facetText = (f: Facet | null): string | null => f?.label ?? null;

function slotValue(u: Understanding, slot: SlotKey): string | null {
  switch (slot) {
    case 'subject':
      return u.options ? `«${u.options[0]}» o «${u.options[1]}»` : u.subject ? toSecondPerson(u.subject.said) : null;
    case 'goal':
      return u.goal;
    case 'focus':
      return facetText(u.focus);
    case 'detail':
      return facetText(u.detail);
    case 'blocker':
      return facetText(u.blocker);
    case 'constraints':
      return u.constraints.length ? u.constraints.join(', ') : null;
    default:
      return u[slot];
  }
}

const SUMMARY_ORDER: SlotKey[] = [
  'goal',
  'subject',
  'focus',
  'detail',
  'blocker',
  'success',
  'tried',
  'constraints',
  'criterion',
  'choice',
  'reference',
  'whyNow',
  'smallest',
  'others',
  'worry',
];

export function summaryItems(u: Understanding): SummaryItem[] {
  return SUMMARY_ORDER.flatMap((slot) => {
    const value = slotValue(u, slot);
    return value ? [{ slot, label: SLOT_LABEL[slot], value: upperFirst(value) }] : [];
  });
}

export function unclearItems(u: Understanding): string[] {
  const out: string[] = [];
  if (!u.subject && !u.options) out.push('sobre qué es exactamente');
  if (!u.focus && u.domain !== 'decision') out.push('qué parte cuesta más');
  if (!u.success && u.domain !== 'decision') out.push('cómo sabrías que está resuelto');
  if (u.domain === 'decision' && !u.criterion) out.push('qué criterio pesa más');
  return out;
}

const hashOf = (u: Understanding): string => JSON.stringify(summaryItems(u).map((i) => i.value));

export function topicTitle(u: Understanding): string {
  if (u.options) return `${u.options[0]} o ${u.options[1]}`;
  if (u.subject && !u.subject.generic) return upperFirst(toSecondPerson(u.subject.said));
  if (u.goal) return u.goal;
  return 'Conversación';
}

function setSlotRaw(u: Understanding, slot: SlotKey, text: string): Understanding {
  const words = clause(text.replace(/^\s*(que|pues|bueno|es que|creo que)\s+/i, ''), 70);
  // Quoted values keep the user's own words; only the subject is woven into Paladin's sentences.
  const v = slot === 'subject' || slot === 'goal' ? toSecondPerson(words) : words;
  const custom = (label: string): Facet => ({ id: 'custom', label });
  switch (slot) {
    case 'subject':
      return { ...u, subject: { said: v, ref: v, generic: false } };
    case 'focus':
      return { ...u, focus: custom(v) };
    case 'detail':
      return { ...u, detail: custom(v) };
    case 'blocker':
      return { ...u, blocker: custom(v) };
    case 'constraints':
      return { ...u, constraints: [...u.constraints, v] };
    default:
      return { ...u, [slot]: v };
  }
}

function slotFilled(u: Understanding, slot: SlotKey): boolean {
  return slot === 'constraints' ? u.constraints.length > 0 : slotValue(u, slot) !== null;
}

/** Adds newly recognised facts without overwriting what the user already said. */
function merge(u: Understanding, ex: Extraction, overwrite = false): Understanding {
  const take = <T,>(cur: T | null, next: T | null): T | null => (next !== null && (overwrite || cur === null) ? next : cur);
  const subject =
    ex.subject && (overwrite || !u.subject || (u.subject.generic && !ex.subject.generic)) ? ex.subject : u.subject;
  const domain =
    ex.domain && (overwrite || !u.domain || u.domain === 'general' || (u.subject?.generic && ex.domain !== 'general'))
      ? ex.domain
      : u.domain;
  const focus = take(u.focus, ex.focus);
  return {
    ...u,
    domain,
    subject,
    goal: take(u.goal, ex.goal),
    focus,
    // A detail only belongs to its own focus.
    detail: overwrite && ex.focus && !ex.detail ? null : take(u.detail, ex.detail),
    // The most recent difficulty mentioned is the most relevant one.
    blocker: ex.blocker ?? u.blocker,
    feeling: take(u.feeling, ex.feeling),
    success: take(u.success, ex.success),
    tried: take(u.tried, ex.tried),
    constraints: overwrite && ex.constraints.length ? ex.constraints : [...new Set([...u.constraints, ...ex.constraints])],
    options: take(u.options, ex.options),
  };
}

/** Infers a focus from detail words ("los colores" implies design). */
function inferFocus(u: Understanding): Understanding {
  if (u.focus || !u.detail) return u;
  const designDetails = ['colors', 'layout', 'icons', 'typography'];
  if (designDetails.includes(u.detail.id)) return { ...u, focus: { id: 'design', label: 'el diseño' } };
  if (['structure', 'opening', 'voice', 'ending'].includes(u.detail.id)) return { ...u, focus: { id: 'content', label: 'el contenido' } };
  return u;
}

/** Merge + infer focus + resolve focus-dependent details from the same text. */
function absorb(u: Understanding, ex: Extraction, text: string, overwrite = false): Understanding {
  let next = inferFocus(merge(u, ex, overwrite));
  if (next.focus && (!next.detail || overwrite)) {
    const d = matchDetail(text, next.focus.id);
    if (d) next = { ...next, detail: d };
  }
  return inferFocus(next);
}

/** Short acknowledgement that names what was just learned. */
function acknowledge(before: Understanding, after: Understanding, seed: number): string {
  const parts: string[] = [];
  if (after.options && !before.options) parts.push(`Dudas entre «${after.options[0]}» y «${after.options[1]}».`);
  else if (after.subject && after.subject !== before.subject && !after.subject.generic)
    parts.push(pick([`Vale, ${toSecondPerson(after.subject.said)}.`, `Entendido: ${toSecondPerson(after.subject.said)}.`], seed));
  if (after.goal && after.goal !== before.goal) parts.push(`Entiendo que quieres ${after.goal}.`);
  if (after.focus && after.focus !== before.focus)
    parts.push(after.focus.id === 'custom' ? `Lo que más te cuesta: «${after.focus.label}».` : `Lo que más te cuesta es ${after.focus.label}.`);
  if (after.detail && after.detail !== before.detail)
    parts.push(after.detail.id === 'custom' ? `En concreto, «${after.detail.label}».` : `Empezamos por ${after.detail.label}.`);
  if (after.blocker && after.blocker.label !== before.blocker?.label && parts.length < 3)
    parts.push(
      !isStockLabel(after.blocker.label)
        ? `Anoto: «${after.blocker.label}».`
        : parts.length
          ? `Y que ${after.blocker.label}.`
          : `Anoto que ${after.blocker.label}.`,
    );
  if (after.success && after.success !== before.success) parts.push(`Anoto lo que buscas: «${after.success}».`);
  if (after.tried && after.tried !== before.tried)
    parts.push(/nada/.test(after.tried) ? 'Bien, partimos de cero entonces.' : `Bien saber que ya probaste «${after.tried}»; no te lo voy a volver a proponer.`);
  const newConstraints = after.constraints.filter((c) => !before.constraints.includes(c));
  if (newConstraints.length) parts.push(`Tomo nota: ${newConstraints.join(', ')}.`);
  if (after.criterion && after.criterion !== before.criterion) parts.push(`Tu criterio principal: «${after.criterion}».`);
  if (after.choice && after.choice !== before.choice && after.domain === 'decision')
    parts.push(`Te inclinas por «${after.choice}». La decisión es tuya y puedes cambiarla cuando quieras.`);
  for (const k of ['reference', 'whyNow', 'smallest', 'others', 'worry'] as const) {
    if (after[k] && after[k] !== before[k]) parts.push(`Me lo apunto: «${after[k]}».`);
  }
  if (after.feeling && !before.feeling) parts.push(`Se nota ${after.feeling.label} en lo que cuentas; vamos con calma.`);
  return parts.slice(0, 3).join(' ');
}

// ---------- reply builders ----------

function ask(st: EngineState, q: Question, lead: string, out: Out): EngineReply {
  out.push({ text: lead ? `${lead} ${q.text}` : q.text });
  return {
    state: { ...st, asked: [...st.asked, q.id], pending: { kind: 'slot', questionId: q.id, slot: q.slot, chips: q.chips, helped: false } },
    messages: out,
    chips: q.chips,
  };
}

function summarize(st: EngineState, lead: string, out: Out): EngineReply {
  out.push({
    text: `${lead ? `${lead} ` : ''}Déjame comprobar si te he entendido. Esto es lo que tengo, y es provisional:`,
    summary: summaryItems(st.u),
    unclear: unclearItems(st.u),
  });
  out.push({ text: '¿Lo he entendido bien? Si algo no es así, corrígeme.' });
  return {
    state: { ...st, summarizedHash: hashOf(st.u), pending: { kind: 'confirm' } },
    messages: out,
    chips: ['Sí, es eso', 'Corregir algo'],
  };
}

function directionChips(st: EngineState, short = false): string[] {
  const chips = [
    short ? 'Sigue preguntando' : 'Seguir explorando',
    'Entender por qué pasa',
    'Ver opciones',
    ...(st.u.domain === 'decision' ? ['Decidir'] : []),
    'Un paso pequeño',
    'Lo dejo aquí',
  ];
  return [...chips, ...st.paused.map((p) => `Retomar: ${p.title}`)];
}

function offerDirections(st: EngineState, lead: string, out: Out, short = false): EngineReply {
  out.push({
    text: short
      ? `${lead ? `${lead} ` : ''}¿Sigo preguntando por aquí o prefieres otra cosa?`
      : `${lead ? `${lead} ` : ''}¿Cómo quieres seguir? Podemos seguir explorando, intentar entender por qué pasa o ver opciones. Si te apetece, también un paso pequeño, o dejarlo aquí.`,
  });
  return { state: { ...st, pending: { kind: 'direction' } }, messages: out, chips: directionChips(st, short) };
}

/** After new information: keep gathering, re-summarise if the picture changed, or go back to choosing a direction. */
function continueAfterInfo(st: EngineState, lead: string, out: Out): EngineReply {
  const q = gatherQuestion(st.u, st.asked);
  if (q && !readyForSummary(st.u)) return ask(st, q, lead, out);
  if (st.summarizedHash !== hashOf(st.u) && st.summarizedHash === null) return summarize(st, lead, out);
  if (st.summarizedHash !== hashOf(st.u)) {
    // The full picture lives in the "Entiendo" strip; here one line is enough.
    return offerDirections({ ...st, summarizedHash: hashOf(st.u) }, `${lead ? `${lead} ` : ''}Lo añado a lo que entiendo.`, out, true);
  }
  return offerDirections(st, lead || 'Eso ya lo tengo en cuenta.', out, true);
}

function readyForSummary(u: Understanding): boolean {
  if (u.domain === 'decision') return Boolean(u.options && (u.criterion || u.blocker));
  const core = Boolean((u.subject && !u.subject.generic) || u.goal) && Boolean(u.focus) && Boolean(u.detail || u.blocker);
  return core && Boolean(u.success || u.tried || u.skipped.length);
}

function closing(st: EngineState, out: Out): EngineReply {
  out.push({
    text: 'Gracias por contármelo. Dejo guardado lo que entendí en esta conversación; puedes retomarla cuando quieras desde el historial. No hace falta hacer nada más ahora.',
  });
  return { state: { ...st, pending: { kind: 'none' } }, messages: out, chips: ['Seguir hablando'] };
}

function honestMiss(st: EngineState, text: string, out: Out): EngineReply {
  const misses = st.misses + 1;
  if (misses >= 2) {
    out.push({
      text: 'Creo que no te estoy entendiendo bien. Soy un prototipo con reglas limitadas: reconozco proyectos, estudio, trabajo, decisiones y organización, y algunas expresiones en español. ¿Puedes contármelo con otras palabras o elegir una opción?',
    });
    return { state: { ...st, misses, pending: { kind: 'direction' } }, messages: out, chips: directionChips(st, true) };
  }
  out.push({ text: `Cuando dices «${clause(text, 60)}», ¿a qué te refieres? Cuéntame un poco más.` });
  return { state: { ...st, misses }, messages: out, chips: [] };
}

function handleDirection(st: EngineState, dir: Direction, out: Out): EngineReply {
  const u = st.u;
  switch (dir) {
    case 'stop':
      return closing(st, out);
    case 'explore': {
      const q = exploreQuestion(u, st.asked) ?? gatherQuestion(u, st.asked);
      if (q) return ask(st, q, '', out);
      out.push({ text: `Creo que ya tengo una imagen bastante completa de ${subjectRef(u)}. Preguntar más sería dar vueltas. Si quieres, vemos opciones o lo dejamos aquí.` });
      return { state: { ...st, pending: { kind: 'direction' } }, messages: out, chips: ['Ver opciones', 'Un paso pequeño', 'Lo dejo aquí'] };
    }
    case 'understand': {
      const ins = insight(u, st.usedInsights);
      if (!ins) {
        out.push({ text: 'No tengo otra lectura que aportar sin inventarme cosas. ¿Prefieres ver opciones o seguir explorando?' });
        return { state: { ...st, pending: { kind: 'direction' } }, messages: out, chips: ['Ver opciones', 'Seguir explorando', 'Lo dejo aquí'] };
      }
      out.push({ text: `Te comparto una lectura provisional; corrígeme si no encaja. ${ins.text}` });
      out.push({ text: '¿Te encaja?' });
      return {
        state: { ...st, usedInsights: [...st.usedInsights, ins.id], pending: { kind: 'insight-check' } },
        messages: out,
        chips: ['Sí, encaja', 'No del todo'],
      };
    }
    case 'options': {
      const set = optionSet(u, st.usedOptionSets);
      if (!set) {
        out.push({ text: 'Ya te mostré las opciones que tengo para esto y no quiero repetirlas. ¿Seguimos explorando o prefieres un paso pequeño?' });
        return { state: { ...st, pending: { kind: 'direction' } }, messages: out, chips: ['Seguir explorando', 'Un paso pequeño', 'Lo dejo aquí'] };
      }
      out.push({ text: `Algunas opciones a partir de lo que me contaste${u.tried && !/nada/.test(u.tried) ? ` (dejo fuera «${u.tried}», que ya probaste)` : ''}:`, options: set.options });
      out.push({ text: '¿Alguna se acerca a lo que buscas?' });
      const titles = set.options.map((o) => o.title);
      return {
        state: { ...st, usedOptionSets: [...st.usedOptionSets, set.id], pending: { kind: 'option-pick', titles } },
        messages: out,
        chips: [...titles, 'Ninguna me convence'],
      };
    }
    case 'decide': {
      if (u.domain === 'decision' && u.options) {
        if (!u.criterion)
          return ask(
            st,
            {
              id: `d_criterion_${st.turn}`,
              slot: 'criterion',
              text: 'Antes de elegir: si solo pudieras usar un criterio, ¿cuál sería el más importante para ti?',
              chips: ['El dinero', 'El tiempo', 'Lo que me ilusiona', 'La seguridad'],
            },
            '',
            out,
          );
        const q: Question = {
          id: `d_choice_${st.turn}`,
          slot: 'choice',
          text: `Si decidieras hoy solo con ${u.criterion ? `«${u.criterion}»` : 'lo que más te importa'}, ¿qué elegirías: «${u.options[0]}» o «${u.options[1]}»? Yo no puedo decidir por ti, pero puedo ayudarte a ver qué te dice tu respuesta.`,
          chips: [upperFirst(u.options[0]), upperFirst(u.options[1]), 'Aún no lo sé'],
        };
        return ask(st, q, '', out);
      }
      return handleDirection(st, 'options', out);
    }
    case 'act': {
      const step = stepFor(u, u.choice);
      out.push({ text: 'Si te sirve, un paso pequeño. Puedes editarlo, guardarlo o descartarlo:', step: { text: step.text, why: step.why, status: 'proposed' } });
      return { state: { ...st, usedSteps: [...st.usedSteps, step.id], pending: { kind: 'step' } }, messages: out, chips: [] };
    }
  }
}

/** Exact chip labels (normalised). Free text goes through the extractor instead. */
const DIRECTION_CHIPS: Array<[RegExp, Direction]> = [
  [/^(sigue preguntando|seguir explorando|seguir hablando|sigamos)[.!]?$/, 'explore'],
  [/^entender por que pasa[.!?]?$/, 'understand'],
  [/^(ver opciones|dame opciones)[.!]?$/, 'options'],
  [/^decidir[.!]?$/, 'decide'],
  [/^(un paso pequeno|dar un paso pequeno)[.!]?$/, 'act'],
  [/^lo dejo aqui[.!]?$/, 'stop'],
];

function directionOf(n: string, ex: Extraction): Direction | null {
  const chip = DIRECTION_CHIPS.find(([re]) => re.test(n));
  return chip ? chip[1] : ex.direction;
}

function applyCorrection(st: EngineState, text: string, slot: SlotKey | null, out: Out): EngineReply {
  const stripped = text.replace(/^(no[,.!]?\s*|en realidad,?\s*|mas bien,?\s*|más bien,?\s*|me refer[ií]a a\s*|corrijo:?\s*|perdona,?\s*|eso no,?\s*|no del todo,?\s*)+/i, '');
  const target = lastSegment(norm(stripped)) === norm(stripped) ? stripped : stripped.slice(stripped.length - lastSegment(norm(stripped)).length);
  const ex = extract(target);
  let u: Understanding;
  if (slot) {
    // The user pointed at one item: change only that one.
    const candidate = absorb(st.u, ex, target, true);
    const changedSlot = slotValue(candidate, slot) !== slotValue(st.u, slot);
    u = changedSlot ? ({ ...st.u, [slot]: candidate[slot as keyof Understanding] } as Understanding) : st.u;
    if (slot === 'focus' && changedSlot) u = { ...u, detail: candidate.detail };
    if (!changedSlot && target.trim()) u = setSlotRaw(slot === 'constraints' ? { ...st.u, constraints: [] } : st.u, slot, target);
  } else {
    u = absorb(st.u, ex, target, true);
  }
  u = inferFocus(u);
  const changed = summaryItems(u).filter((i) => !summaryItems(st.u).some((j) => j.slot === i.slot && j.value === i.value));
  if (!changed.length) {
    const items = summaryItems(st.u);
    out.push({ text: 'No estoy seguro de qué punto quieres corregir. ¿Cuál es?' });
    return {
      state: { ...st, pending: { kind: 'correct', slot: null } },
      messages: out,
      chips: items.map((i) => i.label),
    };
  }
  // A new focus invalidates the old detail question.
  const asked = changed.some((c) => c.slot === 'focus') ? st.asked.filter((a) => a !== 'detail' && a !== 'blocker') : st.asked;
  const lead = `Gracias por corregirme. Ahora entiendo: ${changed.map((c) => `${c.label.toLowerCase()}, «${c.value}»`).join('; ')}.`;
  return continueAfterInfo({ ...st, u, asked, misses: 0 }, lead, out);
}

function pausedTitleMatch(st: EngineState, text: string): number {
  const m = /^retomar:\s*(.+)$/i.exec(text.trim());
  if (!m?.[1]) return -1;
  const want = norm(m[1]);
  return st.paused.findIndex((p) => norm(p.title) === want);
}

function resume(st: EngineState, index: number): EngineReply {
  const target = st.paused[index];
  if (!target) return { state: st, messages: [{ text: 'No encuentro ese tema en pausa.' }], chips: [] };
  const informative = summaryItems(st.u).length > 0;
  const paused = st.paused.filter((_, i) => i !== index);
  if (informative) paused.push({ title: topicTitle(st.u), u: st.u, asked: st.asked });
  const next: EngineState = { ...st, u: target.u, asked: target.asked, paused, summarizedHash: hashOf(target.u), misses: 0 };
  const out: Out = [
    { text: `Retomamos «${target.title}». Lo que tenía de antes:`, summary: summaryItems(target.u), unclear: unclearItems(target.u) },
  ];
  return offerDirections(next, '', out, true);
}

/** Any reply that isn't an explicit "I didn't understand" resets the miss counter. */
function respond(prev: EngineState, raw: string): EngineReply {
  const r = respondInner(prev, raw);
  return r.state.misses > prev.misses ? r : { ...r, state: { ...r.state, misses: 0 } };
}

function respondInner(prev: EngineState, raw: string): EngineReply {
  const text = raw.trim();
  const n = norm(text);
  const st: EngineState = { ...prev, turn: prev.turn + 1 };
  const out: Out = [];
  if (!text) return { state: prev, messages: [], chips: [] };

  const resumeIdx = pausedTitleMatch(st, text);
  if (resumeIdx >= 0) return resume(st, resumeIdx);

  const ex = extract(text);
  const pending = st.pending;

  if (ex.stop && text.length < 40) return closing(st, out);

  if (ex.topicChange) {
    const paused = summaryItems(st.u).length ? [...st.paused, { title: topicTitle(st.u), u: st.u, asked: st.asked }] : st.paused;
    const rest = text.replace(/^.*?(otra cosa|cambiar de tema|cambiemos de tema|otro tema|hablemos de)[:,]?\s*/i, '');
    const fresh: EngineState = { ...st, u: emptyUnderstanding(), asked: [], paused, summarizedHash: null, usedInsights: [], usedOptionSets: [], usedSteps: [], misses: 0 };
    const lead = paused.length > st.paused.length ? `Claro. Dejo «${topicTitle(st.u)}» en pausa; puedes retomarlo cuando quieras.` : 'Claro.';
    const restEx = extract(rest);
    if (rest && restEx.informative) {
      const u = absorb(fresh.u, restEx, rest);
      return continueAfterInfo({ ...fresh, u }, `${lead} ${acknowledge(fresh.u, u, st.turn)}`.trim(), out);
    }
    out.push({ text: `${lead} ¿De qué quieres hablar ahora?` });
    return {
      state: { ...fresh, pending: { kind: 'slot', questionId: 'opening', slot: 'goal', chips: [], helped: true } },
      messages: out,
      chips: [],
    };
  }

  // Tapped chips work from any state.
  const chipDir = DIRECTION_CHIPS.find(([re]) => re.test(n));
  if (chipDir && n.length < 30) return handleDirection(st, chipDir[1], out);
  if (/^corregir algo$/.test(n)) {
    out.push({ text: '¿Qué he entendido mal? Elige el punto o cuéntamelo con tus palabras.' });
    return { state: { ...st, pending: { kind: 'correct', slot: null } }, messages: out, chips: summaryItems(st.u).map((i) => i.label) };
  }

  if (pending.kind === 'correct') {
    const items = summaryItems(st.u);
    const byLabel = items.find((i) => norm(i.label) === n);
    if (byLabel) return beginCorrection(st, byLabel.slot);
    if ((ex.yes || ex.dontKnow) && !ex.informative) return offerDirections(st, 'Vale, lo mantengo así por ahora.', out, true);
    return applyCorrection(st, text, pending.slot, out);
  }
  if (ex.correction && summaryItems(st.u).length && pending.kind !== 'slot') return applyCorrection(st, text, null, out);
  if (pending.kind === 'slot' && summaryItems(st.u).length && /(en realidad|mas bien|\bsino\b|me referia|corrijo|^no es\b|^no era\b|^eso no\b)/.test(n))
    return applyCorrection(st, text, null, out);

  // Out-of-scope factual questions: say so instead of pretending.
  if (ex.question && !ex.informative && pending.kind === 'slot' && pending.questionId === 'opening') {
    out.push({
      text: 'Ese tipo de pregunta no la puedo responder: este prototipo no tiene conocimiento general ni conexión a internet. Está pensado para ayudarte a aclarar algo que quieras resolver. ¿Hay algo así?',
    });
    return { state: { ...st, misses: st.misses + 1 }, messages: out, chips: OPENING_CHIPS };
  }

  switch (pending.kind) {
    case 'confirm': {
      if (ex.yes && !ex.informative) return offerDirections(st, 'Bien.', out);
      if (ex.dontKnow) return offerDirections(st, 'Vale, lo dejamos así de momento; siempre puedes corregirlo.', out);
      if (ex.no && !ex.informative && n.length < 12) {
        out.push({ text: '¿Qué he entendido mal? Elige el punto o cuéntamelo con tus palabras.' });
        return { state: { ...st, pending: { kind: 'correct', slot: null } }, messages: out, chips: summaryItems(st.u).map((i) => i.label) };
      }
      if (ex.informative) {
        const u = absorb(st.u, ex, text);
        return continueAfterInfo({ ...st, u }, acknowledge(st.u, u, st.turn), out);
      }
      break;
    }
    case 'insight-check': {
      if (ex.yes) return offerDirections(st, 'Bien.', out, true);
      if (ex.no || /^no del todo/.test(n)) {
        if (n.replace(/^no( del todo)?[,.]?\s*/, '').length > 3 && ex.informative) return applyCorrection(st, text, null, out);
        out.push({ text: '¿Qué parte no encaja? Me ayuda a ajustar lo que entiendo.' });
        return { state: { ...st, pending: { kind: 'correct', slot: null } }, messages: out, chips: summaryItems(st.u).map((i) => i.label) };
      }
      break;
    }
    case 'option-pick': {
      const idx = pending.titles.findIndex((t) => n.includes(norm(t)) || norm(t).includes(n));
      const ordinal = /primera/.test(n) ? 0 : /segunda/.test(n) ? 1 : /tercera/.test(n) ? 2 : -1;
      const chosen = pending.titles[idx >= 0 ? idx : ordinal];
      if (chosen && n.length < 80) {
        const u = { ...st.u, choice: chosen };
        out.push({
          text: `«${chosen}» encaja con ${u.success ? `lo que buscas: «${u.success}»` : 'lo que me contaste'}. ¿Quieres convertirlo en un paso pequeño, seguir hablando de ello o dejarlo aquí?`,
        });
        return { state: { ...st, u, pending: { kind: 'direction' } }, messages: out, chips: ['Un paso pequeño', 'Seguir explorando', 'Lo dejo aquí'] };
      }
      if (/ninguna/.test(n) || ex.no) {
        return ask(st, { id: `o_missing_${st.turn}`, slot: 'worry', text: '¿Qué les falta a estas opciones? Con eso puedo afinar.', chips: [] }, 'Vale.', out);
      }
      break;
    }
    case 'direction':
    case 'none':
    case 'step': {
      const dir = directionOf(n, ex);
      if (dir && n.length < 60) return handleDirection(st, dir, out);
      if (ex.yes && !ex.informative) return offerDirections(st, 'Bien.', out, true);
      break;
    }
    case 'slot':
      return answerSlot(st, pending, text, ex, out);
  }

  // Free text outside a question: treat it as new information if we recognise any.
  if (ex.informative) {
    const u = absorb(st.u, ex, text);
    const lead = acknowledge(st.u, u, st.turn);
    if (lead) return continueAfterInfo(st.summarizedHash ? { ...st, u } : { ...st, u }, lead, out);
  }
  if (ex.dontKnow) return offerDirections(st, 'No pasa nada.', out, true);
  const open = openSlot(st.u);
  if (open && looksLikeWords(text) && text.length > 2) {
    const u = setSlotRaw(st.u, open, text);
    const lead = `Lo apunto como ${SLOT_LABEL[open].toLowerCase()}: «${slotValue(u, open) ?? ''}». Si no era eso, corrígeme.`;
    return continueAfterInfo({ ...st, u }, lead, out);
  }
  return honestMiss(st, text, out);
}

/** The most useful thing still unknown, for interpreting a loose answer. */
function openSlot(u: Understanding): SlotKey | null {
  if (u.domain === 'decision') return u.criterion ? null : 'criterion';
  if (!u.success) return 'success';
  if (!u.tried) return 'tried';
  return null;
}

function answerSlot(
  st: EngineState,
  pending: Extract<EngineState['pending'], { kind: 'slot' }>,
  text: string,
  ex: Extraction,
  out: Out,
): EngineReply {
  const n = norm(text);
  const { slot } = pending;

  if (ex.dontKnow && !ex.informative) {
    if (pending.questionId === 'opening') {
      out.push({ text: 'Está bien no tenerlo claro. Podemos empezar por algo pequeño: ¿hay algo a lo que lleves días dándole vueltas o que estés posponiendo?' });
      return { state: { ...st, pending: { ...pending, helped: true } }, messages: out, chips: OPENING_CHIPS };
    }
    if (!pending.helped && pending.chips.length) {
      out.push({ text: 'No pasa nada, no hace falta tenerlo claro todavía. Por si ayuda, ¿alguna de estas se parece?' });
      return { state: { ...st, pending: { ...pending, helped: true } }, messages: out, chips: pending.chips };
    }
    const u = { ...st.u, skipped: [...st.u.skipped, slot] };
    return continueAfterInfo({ ...st, u }, 'Lo dejamos abierto, no pasa nada.', out);
  }

  // Opening chips that name a kind of situation.
  if (pending.questionId === 'opening' || pending.questionId === 'which') {
    if (/^solo quiero pensar/.test(n)) {
      out.push({ text: 'De acuerdo, sin prisa. Cuéntame lo que tengas en la cabeza; solo te preguntaré cuando algo no me quede claro.' });
      return { state: { ...st, pending: { ...pending, chips: [] } }, messages: out, chips: [] };
    }
    if (/^un proyecto/.test(n)) ex = { ...ex, domain: 'project', subject: ex.subject ?? { said: 'un proyecto', ref: 'tu proyecto', generic: true }, informative: true };
    if (/^(algo que estoy estudiando|algo que estudio)/.test(n)) ex = { ...ex, domain: 'study', informative: true };
    if (/^una decision/.test(n)) ex = { ...ex, domain: 'decision', informative: true };
  }

  let u = absorb(st.u, ex, text);
  if (slot === 'focus' && !u.focus && ex.blocker?.id === 'noStart') u = { ...u, focus: { id: 'start', label: 'por dónde empezar' } };
  if ((slot === 'focus' || slot === 'detail') && !u.detail) {
    const any = matchAnyDetail(text);
    if (any) u = inferFocus({ ...u, detail: any.detail, focus: u.focus ?? (any.focus === 'content' ? { id: 'content', label: 'el contenido' } : { id: 'code', label: 'la parte técnica' }) });
  }
  // A difficulty described in the user's own words is more precise than the generic label.
  if (ex.blocker && slot !== 'blocker' && looksLikeWords(text) && ex.blocker.id === st.u.blocker?.id)
    u = { ...u, blocker: { id: ex.blocker.id, label: clause(text, 70) } };
  const learnedSomething = hashOf(u) !== hashOf(st.u);

  // Short yes/no answers to specific questions.
  if (!slotFilled(u, slot) && (ex.no || /^(todavia nada|nada|ninguno|no, solo yo)/.test(n))) {
    if (slot === 'tried') u = { ...u, tried: 'nada todavía' };
    else if (slot === 'others') u = { ...u, others: 'solo tú' };
    else if (slot === 'constraints') u = { ...u, constraints: ['sin límites especiales'] };
    else u = { ...u, skipped: [...u.skipped, slot] };
  }

  // Listen: if nothing matched the asked slot, keep the user's own words for it.
  // If the answer told us other things instead, keep those and don't force it into this slot.
  if (!slotFilled(u, slot) && !u.skipped.includes(slot) && !learnedSomething) {
    if (!looksLikeWords(text)) return honestMiss(st, text, out);
    u = inferFocus(setSlotRaw(u, slot, text));
  }
  if (pending.questionId === 'opening' && !u.domain) u = { ...u, domain: 'general' };

  const lead = acknowledge(st.u, u, st.turn);
  return continueAfterInfo({ ...st, u, misses: 0 }, lead, out);
}

function beginCorrection(st: EngineState, slot: SlotKey): EngineReply {
  const current = slotValue(st.u, slot);
  return {
    state: { ...st, pending: { kind: 'correct', slot } },
    messages: [{ text: `Claro. Ahora tengo «${current ?? '—'}» como ${SLOT_LABEL[slot].toLowerCase()}. ¿Qué es lo correcto?` }],
    chips: [],
  };
}

function stepOutcome(st: EngineState, saved: boolean): EngineReply {
  return {
    state: { ...st, pending: { kind: 'direction' } },
    messages: [
      {
        text: saved
          ? 'Guardado en tus acciones. No hace falta hacerlo ahora. ¿Seguimos hablando o lo dejamos aquí?'
          : 'Sin problema; no hace falta convertir esto en una tarea. ¿Seguimos hablando o lo dejamos aquí?',
      },
    ],
    chips: ['Seguir explorando', 'Entender por qué pasa', 'Lo dejo aquí'],
  };
}

export const localEngine: ConversationEngine = {
  id: 'local-rules-v1',
  label: 'Prototipo local con reglas',
  start: () => ({ state: initialState(), messages: [{ text: OPENING }], chips: OPENING_CHIPS }),
  respond,
  beginCorrection,
  resume,
  stepOutcome,
};

export const __test = { extract, merge, readyForSummary, focusRef };
