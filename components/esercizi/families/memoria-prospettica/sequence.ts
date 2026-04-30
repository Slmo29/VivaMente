/**
 * components/esercizi/families/memoria-prospettica/sequence.ts
 *
 * Composizione runtime di un trial Memoria Prospettica (Famiglia 10).
 *
 * Genera la struttura dati `TrialMP` per un singolo trial continuo:
 *   - event-based: stream distrattore + N cue prospettici embedded a posizioni
 *     pseudo-casuali, finestre di accettazione calcolate.
 *   - time-based:  stream distrattore + intervalli temporali [interval, 2×, ...]
 *     senza cue embedded.
 *
 * ## Pool emoji condiviso
 *
 * Il pool emoji (8 categorie × 15) vive in `lib/data/emoji-categorized.ts` ed è
 * riusato cross-famiglia (Memoria Prospettica + Recall Grid). Le funzioni
 * `pescaEmojiPerCategoria`, `POOL_PER_CATEGORIA`, `TUTTE_LE_CATEGORIE` sono
 * importate da lì.
 *
 * `pescaCuePerSalience` rimane invece **MP-specific** (vive in questo file)
 * perché dipende da `CueSalience` di `./levels` — concetto non condiviso con
 * altre famiglie.
 *
 * Vincoli architetturali:
 *   - Stateless: nessuno state interno, RNG iniettabile per determinismo.
 *   - Niente import cross-famiglia.
 *   - Niente shuffle di posizioni nel cue: i cue NON sono mescolati con il
 *     resto, sono inseriti in posizioni pre-calcolate (vincolo spacing).
 *
 * Riferimento: docs/gdd/families/memoria-prospettica.md §Generazione stimoli
 */

import {
  FINESTRA_EVENT_K_ISI,
  type ClockVisibility,
  type CueSalience,
  type MPLevelEvent,
  type MPLevelTime,
} from "./levels";
import {
  pescaEmojiPerCategoria,
  POOL_PER_CATEGORIA,
  TUTTE_LE_CATEGORIE,
  type CategoriaEmoji,
  type EmojiCategorizzata,
} from "@/lib/data/emoji-categorized";

// ── Tipi esportati ────────────────────────────────────────────────────────────

/** Singolo stimolo dello stream distrattore. */
export type StimoloMP = {
  /** ID posizionale (0-based) — match deterministico nei test. */
  id: number;
  /** Carattere emoji visualizzato. */
  emoji: string;
  /** Categoria macro (per discriminare target/non-target distrattore). */
  categoria: string;
  /** True solo per i cue prospettici (event-based). */
  isCue: boolean;
  /** ID finestra prospettica associata (event-based, undefined per non-cue). */
  finestraId?: number;
};

/** Finestra prospettica event-based — calcolata da generaTrialMPEvent. */
export type FinestraEvent = {
  id: number;
  /** Posizione del cue nello stream (indice di sequenza). */
  cueIdx: number;
  /** Apertura finestra (ms da inizio Fase 2). */
  aperturaMs: number;
  /** Chiusura finestra (ms da inizio Fase 2). */
  chiusuraMs: number;
};

/** Variante event-based del trial. */
export type TrialMPEvent = {
  tipo: "event";
  /** Durata del trial in ms (= level.durationMs). */
  durationMs: number;
  /** Numero di finestre prospettiche programmate. */
  nWindows: number;
  /** ISI distrattore in ms. */
  distractorISIMs: number;
  /** Categoria target del task distrattore. */
  categoriaTarget: string;
  /** Sequenza completa di stimoli (incluso cue). */
  sequenza: StimoloMP[];
  /** Cue emoji prospettico (riferimento per il display Fase 1). */
  cueEmoji: string;
  /** Finestre programmate, length === nWindows. */
  finestre: FinestraEvent[];
};

/** Variante time-based del trial. */
export type TrialMPTime = {
  tipo: "time";
  durationMs: number;
  nWindows: number;
  distractorISIMs: number;
  categoriaTarget: string;
  sequenza: StimoloMP[];
  /** Intervalli target (ms da inizio Fase 2): [interval, 2×, ..., nWindows×]. */
  intervalliMs: number[];
  /** Tolleranza ± per ogni intervallo (ms). */
  toleranceMs: number;
  /** Visibilità orologio del livello. */
  clockVisibility: ClockVisibility;
};

/** Payload runtime di un trial — passato come TStimulus di TrialFlow. */
export type TrialMP = TrialMPEvent | TrialMPTime;

/** Esito aggregato di un trial — TResponse di TrialFlow, payload di onRisposta. */
export type RispostaMP = {
  finestreTotali: number;
  finestreCorrette: number;
  ricordamiFalsiTap: number;
  distrattoriTargetTotali: number;
  distrattoriTargetTappati: number;
  distrattoriFalsiTap: number;
  tempoTotaleDistrattoreMs: number;
};

// ── Costanti ──────────────────────────────────────────────────────────────────

/**
 * Quota di stimoli del distrattore appartenenti alla categoriaTarget.
 * 50% target / 50% non-target — il task distrattore richiede tap solo sui
 * target. Default ragionevole, calibrabile per livello in futuro.
 */
export const QUOTA_TARGET_DISTRATTORE = 0.5;

const EXCLUDE_NONE: ReadonlySet<string> = new Set();

// ── pescaCuePerSalience (MP-specific, locale a questo file) ──────────────────

/**
 * Pesca cue prospettico (event-based) in base alla salianza richiesta.
 *
 * MP-specific: dipende da `CueSalience` di `./levels` — per questo NON è
 * in `lib/data/emoji-categorized.ts`.
 *
 *   - alta:  cue di macro-categoria diversa da `categoriaDistrattore`
 *            (cue chiaramente fuori contesto rispetto allo stream).
 *   - media: cue stessa macro, sotto-categoria diversa rispetto al
 *            "tipo medio" del distrattore (es. distrattore cibo generico,
 *            cue cibo_frutto specifico).
 *   - bassa: TODO post-pilot. Richiede pool sotto-categoria espanso con
 *            varianti visive minimali. Throw esplicito.
 *
 * @throws RangeError per categoria non riconosciuta o pool esaurito.
 * @throws Error      per salianza "bassa" (gating first-pass).
 */
function pescaCuePerSalience(
  salience: CueSalience,
  categoriaDistrattore: CategoriaEmoji,
  exclude: ReadonlySet<string>,
  rng: () => number,
): EmojiCategorizzata {
  if (salience === "bassa") {
    throw new Error(
      `Salianza bassa richiede pool sotto-categoria espanso (TODO post-pilot). ` +
      `Lv 13+ event-based non disponibile in beta.`,
    );
  }

  if (salience === "alta") {
    // Cue da una macro-categoria diversa: pesca random tra le 7 restanti.
    const altre = TUTTE_LE_CATEGORIE.filter((c) => c !== categoriaDistrattore);
    const catCue = altre[Math.floor(rng() * altre.length)];
    const [cue] = pescaEmojiPerCategoria(catCue, 1, exclude, rng);
    return cue;
  }

  // salience === "media": stessa macro, una emoji con sottoCategoria definita.
  const pool = POOL_PER_CATEGORIA[categoriaDistrattore];
  if (!pool) {
    throw new RangeError(
      `[memoria-prospettica/sequence] categoria non riconosciuta: ${categoriaDistrattore}`,
    );
  }
  const conSotto = pool.filter(
    (s) => s.sottoCategoria !== undefined && !exclude.has(s.emoji),
  );
  if (conSotto.length < 1) {
    throw new RangeError(
      `[memoria-prospettica/sequence] nessun cue media disponibile per ` +
      `categoria=${categoriaDistrattore} dopo filtro exclude`,
    );
  }
  return conSotto[Math.floor(rng() * conSotto.length)];
}

// ── pescaPosizioniCue (esportata per testabilità) ────────────────────────────

/**
 * Pesca `nWindows` posizioni distinte in [0, nStimuli) con distanza minima
 * `distMin` tra coppie consecutive. Rejection sampling con max 100 tentativi;
 * se fallisce → fallback constructive (divide nStimuli in nWindows segmenti
 * uguali, posizione random in ogni segmento).
 *
 * Output ordinato crescente.
 *
 * @throws RangeError se infeasibile (nStimuli < nWindows o segLen < 1).
 */
export function pescaPosizioniCue(
  nStimuli: number,
  nWindows: number,
  distMin: number,
  rng: () => number,
): number[] {
  if (!Number.isInteger(nStimuli) || nStimuli < nWindows) {
    throw new RangeError(
      `[memoria-prospettica/sequence] nStimuli=${nStimuli} insufficiente per ` +
      `${nWindows} cue distinti`,
    );
  }
  const minDist = Math.max(1, distMin);

  // ── Step 1: rejection sampling ──
  const positions: number[] = [];
  const maxAttempts = 100;
  let attempts = 0;
  while (positions.length < nWindows && attempts < maxAttempts) {
    const candidate = Math.floor(rng() * nStimuli);
    let ok = true;
    for (const p of positions) {
      if (Math.abs(candidate - p) < minDist) { ok = false; break; }
    }
    if (ok) positions.push(candidate);
    attempts++;
  }

  if (positions.length === nWindows) {
    return positions.sort((a, b) => a - b);
  }

  // ── Step 2: fallback constructive ──
  const segLen = Math.floor(nStimuli / nWindows);
  if (segLen < 1) {
    throw new RangeError(
      `[memoria-prospettica/sequence] infeasibile: nStimuli=${nStimuli}, ` +
      `nWindows=${nWindows} (segLen=${segLen} < 1)`,
    );
  }
  const positions2: number[] = [];
  for (let i = 0; i < nWindows; i++) {
    const segStart = i * segLen;
    const offset = Math.floor(rng() * segLen);
    positions2.push(segStart + offset);
  }
  return positions2.sort((a, b) => a - b);
}

// ── Helper interni ────────────────────────────────────────────────────────────

function pickAltraCategoria(
  escluso: CategoriaEmoji,
  rng: () => number,
): CategoriaEmoji {
  const altre = TUTTE_LE_CATEGORIE.filter((c) => c !== escluso);
  return altre[Math.floor(rng() * altre.length)];
}

function pickCategoriaTarget(rng: () => number): CategoriaEmoji {
  return TUTTE_LE_CATEGORIE[Math.floor(rng() * TUTTE_LE_CATEGORIE.length)];
}

function componeSequenza(
  nStimuli: number,
  categoriaTarget: CategoriaEmoji,
  cue: EmojiCategorizzata | null,
  finestraIdByPos: ReadonlyMap<number, number>,
  rng: () => number,
): StimoloMP[] {
  const sequenza: StimoloMP[] = [];
  for (let i = 0; i < nStimuli; i++) {
    const finestraId = finestraIdByPos.get(i);
    if (cue !== null && finestraId !== undefined) {
      sequenza.push({
        id: i,
        emoji: cue.emoji,
        categoria: cue.categoria,
        isCue: true,
        finestraId,
      });
      continue;
    }
    // Distrattore: 50/50 target / non-target.
    const isTarget = rng() < QUOTA_TARGET_DISTRATTORE;
    const cat = isTarget
      ? categoriaTarget
      : pickAltraCategoria(categoriaTarget, rng);
    const [pesca] = pescaEmojiPerCategoria(cat, 1, EXCLUDE_NONE, rng);
    sequenza.push({
      id: i,
      emoji: pesca.emoji,
      categoria: pesca.categoria,
      isCue: false,
    });
  }
  return sequenza;
}

// ── generaTrialMPEvent ───────────────────────────────────────────────────────

/**
 * Genera un trial event-based: stream distrattore + cue prospettici embedded
 * + finestre calcolate in base a FINESTRA_EVENT_K_ISI.
 *
 * @throws Error      se level.tipo !== "event".
 * @throws RangeError per parametri invalidi (nWindows, distractorISIMs).
 * @throws Error      per gating salianza bassa (propagato da pescaCuePerSalience).
 */
export function generaTrialMPEvent(
  level: MPLevelEvent,
  rng: () => number,
): TrialMPEvent {
  if (level.tipo !== "event") {
    throw new Error(
      `[memoria-prospettica/sequence] generaTrialMPEvent richiede tipo="event", ` +
      `ricevuto ${level.tipo}`,
    );
  }
  if (!Number.isInteger(level.nWindows) || level.nWindows < 1) {
    throw new RangeError(
      `[memoria-prospettica/sequence] nWindows non valido: ${level.nWindows}`,
    );
  }
  if (!Number.isFinite(level.distractorISIMs) || level.distractorISIMs <= 0) {
    throw new RangeError(
      `[memoria-prospettica/sequence] distractorISIMs non valido: ${level.distractorISIMs}`,
    );
  }

  const categoriaTarget = pickCategoriaTarget(rng);
  // Pesca cue: throw propagato per salianza bassa (TODO post-pilot).
  const cue = pescaCuePerSalience(
    level.cueSalience,
    categoriaTarget,
    EXCLUDE_NONE,
    rng,
  );

  const nStimuli = Math.ceil(level.durationMs / level.distractorISIMs);
  const distMin = Math.floor(nStimuli / level.nWindows / 2);
  const cuePositions = pescaPosizioniCue(nStimuli, level.nWindows, distMin, rng);

  const finestraIdByPos = new Map<number, number>();
  cuePositions.forEach((pos, idx) => finestraIdByPos.set(pos, idx));

  const sequenza = componeSequenza(
    nStimuli,
    categoriaTarget,
    cue,
    finestraIdByPos,
    rng,
  );

  const finestre: FinestraEvent[] = cuePositions.map((idx, finestraId) => ({
    id: finestraId,
    cueIdx: idx,
    aperturaMs:  idx * level.distractorISIMs,
    chiusuraMs: (idx + FINESTRA_EVENT_K_ISI) * level.distractorISIMs,
  }));

  return {
    tipo: "event",
    durationMs:      level.durationMs,
    nWindows:        level.nWindows,
    distractorISIMs: level.distractorISIMs,
    categoriaTarget,
    sequenza,
    cueEmoji:        cue.emoji,
    finestre,
  };
}

// ── generaTrialMPTime ────────────────────────────────────────────────────────

/**
 * Genera un trial time-based: stream distrattore (no cue embedded) +
 * intervalli temporali calcolati come [interval×1, ..., interval×nWindows].
 *
 * @throws Error      se level.tipo !== "time".
 * @throws RangeError per parametri invalidi.
 */
export function generaTrialMPTime(
  level: MPLevelTime,
  rng: () => number,
): TrialMPTime {
  if (level.tipo !== "time") {
    throw new Error(
      `[memoria-prospettica/sequence] generaTrialMPTime richiede tipo="time", ` +
      `ricevuto ${level.tipo}`,
    );
  }
  if (!Number.isInteger(level.nWindows) || level.nWindows < 1) {
    throw new RangeError(
      `[memoria-prospettica/sequence] nWindows non valido: ${level.nWindows}`,
    );
  }
  if (!Number.isFinite(level.distractorISIMs) || level.distractorISIMs <= 0) {
    throw new RangeError(
      `[memoria-prospettica/sequence] distractorISIMs non valido: ${level.distractorISIMs}`,
    );
  }

  const categoriaTarget = pickCategoriaTarget(rng);
  const nStimuli = Math.ceil(level.durationMs / level.distractorISIMs);

  // Time-based: niente cue embedded → sequenza è puro distrattore.
  const sequenza = componeSequenza(
    nStimuli,
    categoriaTarget,
    null,
    new Map<number, number>(),
    rng,
  );

  const intervalMs = level.intervalS * 1000;
  const intervalliMs: number[] = [];
  for (let i = 1; i <= level.nWindows; i++) {
    intervalliMs.push(intervalMs * i);
  }

  return {
    tipo: "time",
    durationMs:      level.durationMs,
    nWindows:        level.nWindows,
    distractorISIMs: level.distractorISIMs,
    categoriaTarget,
    sequenza,
    intervalliMs,
    toleranceMs:     level.toleranceS * 1000,
    clockVisibility: level.clockVisibility,
  };
}
