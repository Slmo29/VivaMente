/**
 * Generazione stimoli Go/No-Go Semantico.
 *
 * Stessa struttura a blocchi 80/20 del cromatico (BLOCK_SIZE=10, NOGO_PER_BLOCK=2).
 * Differenza: invece del colore, lo stimolo è una parola pescata dal pool
 * go/nogo della coppia semantica selezionata per la sessione.
 *
 * Parole go e nogo vengono pescate senza rimpiazzo all'interno di una sessione
 * (shuffle del pool + indice avanzante) per evitare ripetizioni ravvicinate.
 * Quando il pool si esaurisce si riazzera il cursore (pool ciclico).
 */

import type { CoppiaSemantica } from "./levels";

// ── Tipi ──────────────────────────────────────────────────────────────────────

export interface StimoloSemantico {
  tipo:   "go" | "nogo";
  parola: string;
}

// ── Costanti ──────────────────────────────────────────────────────────────────

export const BLOCK_SIZE      = 10;
export const NOGO_PER_BLOCK  = 2;
export const GO_PER_BLOCK    = BLOCK_SIZE - NOGO_PER_BLOCK;

// ── Stream state ───────────────────────────────────────────────────────────────

export interface GoNogoSemanticoStreamState {
  tail:                "go" | "nogo" | null;
  blockIndex:          number;
  currentBlockPattern: ("go" | "nogo")[];
  /** Indice nel pool go shuffled (ciclico). */
  goPoolIdx:           number;
  /** Indice nel pool nogo shuffled (ciclico). */
  nogoPoolIdx:         number;
  /** Pool go nella sessione (shuffled). */
  goPool:              string[];
  /** Pool nogo nella sessione (shuffled). */
  nogoPool:            string[];
}

// ── Shuffle Fisher-Yates ───────────────────────────────────────────────────────

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Inizializzazione ───────────────────────────────────────────────────────────

export function creaStreamStateSemantico(
  coppia: CoppiaSemantica,
  rng: () => number,
): GoNogoSemanticoStreamState {
  return {
    tail:                null,
    blockIndex:          0,
    currentBlockPattern: [],
    goPoolIdx:           0,
    nogoPoolIdx:         0,
    goPool:              shuffle([...coppia.paroleGo],   rng),
    nogoPool:            shuffle([...coppia.paroleNogo], rng),
  };
}

// ── Selezione coppia per sessione ─────────────────────────────────────────────

/**
 * Sceglie casualmente una coppia tra quelle ammesse al livello,
 * evitando la coppia dell'ultima sessione (per etichetta).
 */
export function selezionaCoppia(
  coppieAmmesse: readonly CoppiaSemantica[],
  ultimaEtichetta: string | null,
  rng: () => number,
): CoppiaSemantica {
  const candidate = coppieAmmesse.length > 1
    ? coppieAmmesse.filter(c => c.etichetta !== ultimaEtichetta)
    : coppieAmmesse;
  const pool = candidate.length > 0 ? candidate : [...coppieAmmesse];
  return pool[Math.floor(rng() * pool.length)];
}

// ── Pattern blocco ─────────────────────────────────────────────────────────────

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
  // Fallback costruttivo.
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

// ── Generazione stimolo ────────────────────────────────────────────────────────

export function generaProssimoStimoloSemantico(
  state: GoNogoSemanticoStreamState,
  rng: () => number = Math.random,
): StimoloSemantico {
  // Lazy init pattern al boundary.
  if (state.blockIndex === 0 || state.currentBlockPattern.length === 0) {
    state.currentBlockPattern = generaPatternBlocco(state.tail === "nogo", rng);
  }

  const tipo = state.currentBlockPattern[state.blockIndex];
  state.tail = tipo;
  state.blockIndex += 1;
  if (state.blockIndex >= BLOCK_SIZE) {
    state.blockIndex          = 0;
    state.currentBlockPattern = [];
  }

  // Pesca parola dal pool ciclico.
  let parola: string;
  if (tipo === "go") {
    parola = state.goPool[state.goPoolIdx % state.goPool.length];
    state.goPoolIdx += 1;
    if (state.goPoolIdx >= state.goPool.length) state.goPoolIdx = 0;
  } else {
    parola = state.nogoPool[state.nogoPoolIdx % state.nogoPool.length];
    state.nogoPoolIdx += 1;
    if (state.nogoPoolIdx >= state.nogoPool.length) state.nogoPoolIdx = 0;
  }

  return { tipo, parola };
}
