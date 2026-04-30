/**
 * components/esercizi/families/recall-grid/sequence.ts
 *
 * Composizione runtime di un trial Recall Grid (Famiglia 2).
 *
 * Genera la struttura dati `TrialRecallGrid` per un singolo trial:
 *   - Pesca posizioni distinte nella griglia.
 *   - Pesca stimoli (parole stub o immagini emoji) con vincoli specifici:
 *     * parole: pool stub FO (lv 1–10), gating throw lv 11+.
 *     * immagini: max 1 emoji per categoria (lv 1–17 MBT, tutto MLT) →
 *       max 2 per categoria (lv 18–20 MBT, regola necessaria perché 9–10
 *       stimoli > 8 categorie).
 *   - Associa stimolo ↔ posizione (zip).
 *
 * `delayMs` derivato dal tipo di livello:
 *   - MBT: level.delayMs direttamente (1000–5000).
 *   - MLT: level.delayS × 1000 (30000–180000).
 *
 * `isMlt` flag passato al mini-engine per discriminare il distrattore
 * (countdown vs palla rimbalzante).
 *
 * Vincoli architetturali:
 *   - Stateless: nessuno state interno, RNG iniettabile per determinismo.
 *   - Niente import cross-famiglia (emoji vivono in lib/data/).
 *
 * Riferimento: docs/gdd/families/recall-grid.md §Generazione stimoli
 */

import {
  ncells,
  type GridSize,
  type RecallGridLevelConfig,
  MAX_PER_CATEGORIA_BASE,
  MAX_PER_CATEGORIA_DEROGA,
  SOGLIA_DEROGA_CATEGORIA,
} from "./levels";
import {
  pescaParoleStub,
  SOGLIA_GATING_PAROLE_STUB,
} from "./stimuli/parole-stub";
import {
  pescaEmojiPerCategoria,
  POOL_PER_CATEGORIA,
  TUTTE_LE_CATEGORIE,
  type CategoriaEmoji,
  type EmojiCategorizzata,
} from "@/lib/data/emoji-categorized";

// ── Tipi esportati ────────────────────────────────────────────────────────────

export type StimulusType = "parole" | "immagini";

/**
 * Singolo stimolo posizionato nella griglia. Per parole, `valore` è la parola
 * lowercase. Per immagini, `valore` è il carattere emoji Unicode.
 */
export type StimoloRecallGrid = {
  /** ID univoco per match identità (prefisso "p_" parole, "e_" emoji). */
  id: string;
  valore: string;
  /** Categoria (per filtro diversità immagini, no-rep parole). */
  categoria: string;
  /** Riga 0-based nella griglia (0 = top). */
  row: number;
  /** Colonna 0-based (0 = left). */
  col: number;
};

/** Payload runtime di un trial — TStimulus di TrialFlow. */
export type TrialRecallGrid = {
  gridSize: GridSize;
  stimuli: StimoloRecallGrid[];
  exposureMs: number;
  /** Delay totale prima del retrieval (ms). MBT 1000–5000; MLT 30000–180000. */
  delayMs: number;
  tLimReproMs: number | null;
  /** True se trial MLT (palla rimbalzante invece di countdown). */
  isMlt: boolean;
  stimulusType: StimulusType;
};

/** Singolo posizionamento eseguito dall'utente nella fase retrieval. */
export type PosizionamentoUtente = {
  stimoloId: string;
  row: number;
  col: number;
};

/** TResponse di TrialFlow — payload onRisposta del mini-engine. */
export type RispostaRecallGrid = {
  /** Posizionamenti effettuati (lunghezza ≤ stimuli.length). */
  posizioni: PosizionamentoUtente[];
  /** Tempo retrieval (ms da inizio fase retrieval a tap "Conferma" o T.Lim). */
  tempoReproMs: number;
};

// ── Helper fasce frequenza per livello (parole) ──────────────────────────────

/**
 * Fasce frequenza NVdB ammesse per livello MBT parole.
 * Lv 1–10: solo FO; lv 11–20: FO + AU.
 * Fonte: docs/gdd/families/recall-grid.md §Generazione stimoli — Parole.
 */
export function fasceFrequenzaPerLivello(livello: number): readonly ("FO" | "AU")[] {
  return livello <= 10 ? ["FO"] : ["FO", "AU"];
}

// ── Helper pescaPosizioni (esportato per testabilità) ────────────────────────

/**
 * Pesca `n` posizioni distinte nella griglia di `nc` celle, mappate a
 * (row, col). Fisher-Yates partial. Output non ordinato (l'ordine è
 * irrilevante perché la griglia è 2D, non sequenza).
 *
 * @throws RangeError se n > nc.
 */
export function pescaPosizioni(
  gridSize: GridSize,
  n: number,
  rng: () => number,
): { row: number; col: number }[] {
  const nc = ncells(gridSize);
  if (n > nc) {
    throw new RangeError(
      `[recall-grid/sequence] nStimuli=${n} > ncells(${gridSize})=${nc}`,
    );
  }
  const [, colsStr] = gridSize.split("x");
  const cols = Number(colsStr);

  const indices = Array.from({ length: nc }, (_, i) => i);
  const result: { row: number; col: number }[] = [];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (indices.length - i));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
    const idx = indices[i];
    result.push({ row: Math.floor(idx / cols), col: idx % cols });
  }
  return result;
}

// ── Helper pescaEmojiConDiversita (privato) ──────────────────────────────────

/**
 * Pesca `n` emoji rispettando il vincolo `max maxPerCategoria` per categoria.
 * Itera le 8 categorie shuffled, pescando fino a `min(maxPerCategoria, ...)`
 * emoji per ciascuna. Si ferma a `n` raggiunti.
 *
 * @throws RangeError se 8 × maxPerCategoria < n (impossibile con tabelle GDD)
 *                   o se pool esaurito dopo recentlyUsed.
 */
function pescaEmojiConDiversita(
  n: number,
  maxPerCategoria: number,
  recentlyUsed: ReadonlySet<string>,
  rng: () => number,
): EmojiCategorizzata[] {
  // Shuffle categorie via Fisher-Yates su copy.
  const cats: CategoriaEmoji[] = [...TUTTE_LE_CATEGORIE];
  for (let i = cats.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = cats[i];
    cats[i] = cats[j];
    cats[j] = tmp;
  }

  const result: EmojiCategorizzata[] = [];
  const usedSoFar = new Set<string>(recentlyUsed);

  for (const cat of cats) {
    if (result.length >= n) break;
    const pool = POOL_PER_CATEGORIA[cat];
    const available = pool.filter((s) => !usedSoFar.has(s.emoji)).length;
    const need = Math.min(maxPerCategoria, n - result.length, available);
    if (need < 1) continue;

    const pesca = pescaEmojiPerCategoria(cat, need, usedSoFar, rng);
    for (const p of pesca) {
      result.push(p);
      usedSoFar.add(p.emoji);
    }
  }

  if (result.length < n) {
    throw new RangeError(
      `[recall-grid/sequence] pool emoji insufficiente con vincolo diversità: ` +
      `richiesti ${n}, ottenuti ${result.length}, maxPerCategoria=${maxPerCategoria}, ` +
      `recentlyUsed=${recentlyUsed.size}`,
    );
  }
  return result;
}

// ── generaTrialRecallGrid ────────────────────────────────────────────────────

/**
 * Genera un trial Recall Grid completo (encoding-ready).
 *
 * @param level         Configurazione livello (MBT o MLT, discriminata da .tipo).
 * @param stimulusType  "parole" o "immagini".
 * @param recentlyUsed  Set di stimoli (parole o emoji) già usati cross-trial,
 *                      filtrati dal pool. L'Engine mantiene il ref.
 * @param rng           Generatore casuale [0,1).
 *
 * @throws Error      gating parole lv ≥ 11 (beta limitata).
 * @throws RangeError nStimuli > ncells (sanity), pool insufficiente.
 */
export function generaTrialRecallGrid(
  level: RecallGridLevelConfig,
  stimulusType: StimulusType,
  recentlyUsed: ReadonlySet<string>,
  rng: () => number,
): TrialRecallGrid {
  // ── Validazione sanity ──
  if (level.nStimuli > ncells(level.gridSize)) {
    throw new RangeError(
      `[recall-grid/sequence] nStimuli=${level.nStimuli} > ` +
      `ncells(${level.gridSize})=${ncells(level.gridSize)}`,
    );
  }

  // ── Gating parole lv ≥ 11 ──
  if (
    stimulusType === "parole" &&
    level.livello >= SOGLIA_GATING_PAROLE_STUB
  ) {
    throw new Error(
      `Variante 'parole' disponibile in beta limitata: lv 1–10. ` +
      `Lv ${level.livello}+ richiede pool dataset NVdB esteso (in arrivo).`,
    );
  }

  // ── Pesca posizioni ──
  const posizioni = pescaPosizioni(level.gridSize, level.nStimuli, rng);

  // ── Pesca stimoli ──
  let stimuli: StimoloRecallGrid[];

  if (stimulusType === "parole") {
    const parole = pescaParoleStub(
      level.nStimuli,
      fasceFrequenzaPerLivello(level.livello),
      recentlyUsed,
      rng,
    );
    stimuli = parole.map((p, i) => ({
      id:        `p_${p.parola}`,
      valore:    p.parola,
      categoria: p.categoria,
      row:       posizioni[i].row,
      col:       posizioni[i].col,
    }));
  } else {
    // stimulusType === "immagini"
    // Deroga max-2-per-categoria per lv ≥ 18 MBT (8 categorie < 9–10 stimoli).
    const maxPerCategoria =
      level.tipo === "mbt" && level.livello >= SOGLIA_DEROGA_CATEGORIA
        ? MAX_PER_CATEGORIA_DEROGA
        : MAX_PER_CATEGORIA_BASE;

    const emoji = pescaEmojiConDiversita(
      level.nStimuli,
      maxPerCategoria,
      recentlyUsed,
      rng,
    );
    stimuli = emoji.map((e, i) => ({
      id:        `e_${e.emoji}`,
      valore:    e.emoji,
      categoria: e.categoria,
      row:       posizioni[i].row,
      col:       posizioni[i].col,
    }));
  }

  // ── Calcolo delayMs unificato ──
  const delayMs =
    level.tipo === "mbt"
      ? level.delayMs
      : level.delayS * 1000;

  return {
    gridSize:     level.gridSize,
    stimuli,
    exposureMs:   level.exposureMs,
    delayMs,
    tLimReproMs:  level.tLimReproMs,
    isMlt:        level.tipo === "mlt",
    stimulusType,
  };
}
