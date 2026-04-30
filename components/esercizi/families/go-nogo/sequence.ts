/**
 * Generazione stimoli Go/No-Go cromatico — refactor on-demand (deroga 2026-04-30).
 *
 * Dopo lo switch a Modello A timer 60s (vedi `_deroghe.ts`) la generazione
 * non è più pre-calcolata in un pool finito (`generaPool`), ma on-demand
 * stimolo-per-stimolo via `generaProssimoStimolo(state, ...)`. Lo state
 * mantiene cap su nogo consecutivi e ratio rolling 80/20 con BLOCK_SIZE=10.
 *
 * Ratio go/nogo: 80% go + 20% nogo. Fisso per tutti i livelli (standard clinico).
 * Fonte: docs/gdd/families/go-nogo.md §Go/No-Go ratio.
 *
 * BLOCK_SIZE = 10: ogni 10 stimoli il contatore go/nogo del blocco si azzera,
 * garantendo che la media converga al ratio prescritto. Cap "max 1 nogo
 * consecutivo": prevenzione nogo back-to-back, clinicamente rilevante per
 * non permettere all'utente di "aspettare" invece di inibire attivamente.
 *
 * Struttura stimolo: { tipo, colore }. Forma non inclusa — hard-coded a cerchio
 * nel renderer per lv 1–13. Lv 14–20 (congiunzione) estenderà con campo forma.
 */

import type { CoppiaColore, ColoreGoNogo } from "./levels";

// ── Tipi (esportati — usati da GoNogoTaskEngine e GoNogoStimulus) ────────────

export interface GoNogoStimolo {
  tipo:   "go" | "nogo";
  colore: ColoreGoNogo;
}

// ── Costanti (esportate per testabilità) ──────────────────────────────────────

export const BLOCK_SIZE     = 10;
export const NOGO_PER_BLOCK = 2;   // 2/10 = 20%
export const GO_PER_BLOCK   = BLOCK_SIZE - NOGO_PER_BLOCK; // 8

// ── State stream ─────────────────────────────────────────────────────────────

/**
 * Stato cumulativo del flusso Go/No-Go di una sessione.
 * Mantenuto in `useRef` lato Engine, mutato in-place da
 * `generaProssimoStimolo` per evitare allocazioni superflue su flusso lungo
 * (60s × ~1 stimolo/secondo = ~60 stimoli per sessione, max ~70).
 */
export type GoNogoStreamState = {
  /** Tipo dell'ultimo stimolo emesso (vincolo cross-block per il pattern successivo). */
  tail: "go" | "nogo" | null;
  /** Conteggio go nel blocco corrente. */
  blockGoCount: number;
  /** Conteggio nogo nel blocco corrente. */
  blockNogoCount: number;
  /** Indice nel blocco corrente, 0..BLOCK_SIZE-1. */
  blockIndex: number;
  /**
   * Pattern del blocco corrente (lazy init al boundary). length=0 prima
   * dell'inizializzazione del prossimo blocco. Pre-generato per garantire
   * SIA ratio esatto (8 go + 2 nogo) SIA cap (no nogo consecutivi within
   * block e cross-block).
   */
  currentBlockPattern: ("go" | "nogo")[];
};

/** Costruisce uno stato iniziale fresh. */
export function creaStreamState(): GoNogoStreamState {
  return {
    tail:                null,
    blockGoCount:        0,
    blockNogoCount:      0,
    blockIndex:          0,
    currentBlockPattern: [],
  };
}

// ── Pattern blocco (pre-generato al boundary) ────────────────────────────────

/**
 * Genera un pattern di BLOCK_SIZE posizioni con NOGO_PER_BLOCK nogo,
 * vincolo "no nogo consecutivi" (distanza tra posizioni nogo ≥ 2).
 *
 * @param vincoloPrimaPosizioneGo Se true, posizione 0 NON può essere nogo
 *                                (cross-block: il blocco precedente è
 *                                terminato con nogo).
 * @param rng                     RNG per scelta posizioni.
 *
 * Strategia: rejection sampling con max 50 tentativi (probabilità di
 * convergenza > 99% in pochi attempts). Fallback constructive con
 * posizioni fissate per garanzia totale.
 */
function generaPatternBlocco(
  vincoloPrimaPosizioneGo: boolean,
  rng: () => number,
): ("go" | "nogo")[] {
  const MAX_ATTEMPTS = 50;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const p1 = Math.floor(rng() * BLOCK_SIZE);
    const p2 = Math.floor(rng() * BLOCK_SIZE);
    if (p1 === p2) continue;
    if (Math.abs(p1 - p2) < 2) continue;
    if (vincoloPrimaPosizioneGo && (p1 === 0 || p2 === 0)) continue;
    const pattern: ("go" | "nogo")[] = Array(BLOCK_SIZE).fill("go");
    pattern[p1] = "nogo";
    pattern[p2] = "nogo";
    return pattern;
  }
  // Fallback constructive: posizioni fissate ben distanziate.
  const pattern: ("go" | "nogo")[] = Array(BLOCK_SIZE).fill("go");
  if (vincoloPrimaPosizioneGo) {
    pattern[3] = "nogo";
    pattern[7] = "nogo";
  } else {
    pattern[1] = "nogo";
    pattern[6] = "nogo";
  }
  return pattern;
}

// ── generaProssimoStimolo ────────────────────────────────────────────────────

/**
 * Genera il prossimo stimolo applicando ratio 80/20 con cap su nogo
 * consecutivi e BLOCK_SIZE rolling.
 *
 * Mutazione: lo `state` viene aggiornato in-place (perf su flusso lungo).
 * Determinismo: con `rng` seedata, l'output è ripetibile.
 *
 * Logica di scelta tipo:
 *   1. Se `tail === "nogo"` → forza go (cap nogo consecutivi).
 *   2. Altrimenti, usa contatori del blocco:
 *      - se nogoRimasti = 0 → go.
 *      - se goRimasti = 0   → nogo.
 *      - altrimenti probabilità nogo = nogoRimasti / (goRimasti + nogoRimasti)
 *        (converge esattamente al target del blocco entro BLOCK_SIZE).
 *
 * Logica colore:
 *   - tipo "go"   → coppiaCanonical.go (sempre).
 *   - tipo "nogo" → random tra `distrattori` (1 colore lv 1-2, 2..6 lv 3+).
 *
 * @param state             State mutato in-place.
 * @param coppiaCanonical   Coppia GDD-canonical (Go base + 1 No-Go canonical).
 * @param distrattori       Pool colori No-Go di sessione (1..6 colori).
 *                          Per lv 1-2 è [coppiaCanonical.nogo].
 * @param rng               Generatore casuale [0,1). Default Math.random.
 */
export function generaProssimoStimolo(
  state: GoNogoStreamState,
  coppiaCanonical: CoppiaColore,
  distrattori: readonly ColoreGoNogo[],
  rng: () => number = Math.random,
): GoNogoStimolo {
  // Lazy init pattern al boundary del blocco.
  if (state.blockIndex === 0 || state.currentBlockPattern.length === 0) {
    const vincolo = state.tail === "nogo";
    state.currentBlockPattern = generaPatternBlocco(vincolo, rng);
  }

  const tipo = state.currentBlockPattern[state.blockIndex];

  // Aggiorna contatori del blocco.
  if (tipo === "nogo") {
    state.blockNogoCount += 1;
  } else {
    state.blockGoCount += 1;
  }
  state.tail = tipo;
  state.blockIndex += 1;
  if (state.blockIndex >= BLOCK_SIZE) {
    state.blockIndex          = 0;
    state.blockGoCount        = 0;
    state.blockNogoCount      = 0;
    state.currentBlockPattern = [];
  }

  // Pesca colore.
  const colore: ColoreGoNogo =
    tipo === "go"
      ? coppiaCanonical.go
      : (distrattori.length === 1
          ? distrattori[0]
          : distrattori[Math.floor(rng() * distrattori.length)]);

  return { tipo, colore };
}
