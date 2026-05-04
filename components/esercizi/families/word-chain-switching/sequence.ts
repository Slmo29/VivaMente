/**
 * components/esercizi/families/word-chain-switching/sequence.ts
 *
 * Generatore stimoli Word Chain Switching.
 *
 * Riusa il pool lessicale di word-chain/words.ts, riorganizzato per categoria.
 * Ogni trial seleziona 2 categorie semanticamente distanti e N/2 parole ciascuna.
 * La sequenza corretta alterna: A → B → A → B → …
 *
 * Categorie usate (escluse verdure/veicoli — pool troppo piccolo):
 *   animali, frutta, cibi, oggetti, mestieri, natura, luoghi
 */

import { PAROLE_PER_LETTERA, ITALIAN_ALPHABET } from "../word-chain/words";
import type { WCSSemanticDistance } from "./levels";

// ── Pool per categoria ─────────────────────────────────────────────────────────

const _poolPerCat: Record<string, string[]> = {};
for (const l of ITALIAN_ALPHABET) {
  for (const w of PAROLE_PER_LETTERA[l]) {
    if (w.categoria === "verdure" || w.categoria === "veicoli") continue; // pool troppo piccolo
    if (!_poolPerCat[w.categoria]) _poolPerCat[w.categoria] = [];
    _poolPerCat[w.categoria].push(w.parola);
  }
}
export const POOL_PER_CATEGORIA: Readonly<Record<string, readonly string[]>> = _poolPerCat;

// ── Coppie di categorie ────────────────────────────────────────────────────────

interface CategoryPair {
  catA:  string;
  catB:  string;
  nomeA: string;
  nomeB: string;
}

const PAIRS_ALTA: readonly CategoryPair[] = [
  { catA: "animali",  catB: "oggetti",  nomeA: "Animale",  nomeB: "Oggetto"  },
  { catA: "animali",  catB: "mestieri", nomeA: "Animale",  nomeB: "Mestiere" },
  { catA: "frutta",   catB: "mestieri", nomeA: "Frutta",   nomeB: "Mestiere" },
  { catA: "natura",   catB: "cibi",     nomeA: "Natura",   nomeB: "Cibo"     },
  { catA: "animali",  catB: "luoghi",   nomeA: "Animale",  nomeB: "Luogo"    },
  { catA: "frutta",   catB: "oggetti",  nomeA: "Frutta",   nomeB: "Oggetto"  },
  { catA: "mestieri", catB: "luoghi",   nomeA: "Mestiere", nomeB: "Luogo"    },
];

const PAIRS_MEDIA: readonly CategoryPair[] = [
  { catA: "animali",  catB: "natura",   nomeA: "Animale",  nomeB: "Natura"   },
  { catA: "frutta",   catB: "cibi",     nomeA: "Frutta",   nomeB: "Cibo"     },
  { catA: "cibi",     catB: "natura",   nomeA: "Cibo",     nomeB: "Natura"   },
  { catA: "oggetti",  catB: "mestieri", nomeA: "Oggetto",  nomeB: "Mestiere" },
  { catA: "luoghi",   catB: "natura",   nomeA: "Luogo",    nomeB: "Natura"   },
];

// ── Tipi stimolo ───────────────────────────────────────────────────────────────

export type WCSColore = "A" | "B";

export interface WCSParola {
  idx:      number;       // posizione unica nel array parole
  parola:   string;
  categoria:string;
  colore:   WCSColore;
}

export interface StimoloWCS {
  parole:         WCSParola[];          // N parole mescolate (display)
  sequenzaCat:    WCSColore[];          // [A, B, A, B, ...] — N elementi
  nomiCategorie:  { A: string; B: string };
  mostraEtichetta: boolean;
  tLimMs:         number;
  targetTimeMs:   number;
}

export type RispostaWCS = { tempoMs: number } | null;

// ── Pool ref senza ripetizione ─────────────────────────────────────────────────

export interface WCSPoolRef {
  shuffled: Record<string, string[]>;
  indices:  Record<string, number>;
}

export function creaWCSPoolRef(rng: () => number): WCSPoolRef {
  const shuffled: Record<string, string[]> = {};
  const indices:  Record<string, number>   = {};
  for (const [cat, words] of Object.entries(POOL_PER_CATEGORIA)) {
    shuffled[cat] = shuffle([...words], rng);
    indices[cat]  = 0;
  }
  return { shuffled, indices };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextWords(
  cat: string,
  count: number,
  poolRef: WCSPoolRef,
  rng: () => number,
): string[] {
  const pool = poolRef.shuffled[cat] ?? [];
  const len  = pool.length;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (poolRef.indices[cat] + i) % len;
    result.push(pool[idx]);
  }
  poolRef.indices[cat] = (poolRef.indices[cat] + count) % len;
  // Rimescola quando si torna all'inizio
  if (poolRef.indices[cat] < count) {
    poolRef.shuffled[cat] = shuffle([...pool], rng);
  }
  return result;
}

// ── Generatore principale ──────────────────────────────────────────────────────

export function generaStimoloWCS(
  nWords:          number,
  distanza:        WCSSemanticDistance,
  mostraEtichetta: boolean,
  tLimMs:          number,
  targetTimeMs:    number,
  poolRef:         WCSPoolRef,
  rng:             () => number,
): StimoloWCS {
  const pairs = distanza === "alta" ? PAIRS_ALTA : PAIRS_MEDIA;
  const pair  = pairs[Math.floor(rng() * pairs.length)];

  const perCat = nWords / 2; // sempre intero (nWords multiplo di 2)

  const wordsA = nextWords(pair.catA, perCat, poolRef, rng).map(
    (p, i): WCSParola => ({ idx: i,         parola: p, categoria: pair.catA, colore: "A" }),
  );
  const wordsB = nextWords(pair.catB, perCat, poolRef, rng).map(
    (p, i): WCSParola => ({ idx: perCat + i, parola: p, categoria: pair.catB, colore: "B" }),
  );

  const parole = shuffle([...wordsA, ...wordsB], rng);

  // Sequenza alternata A, B, A, B, ...
  const sequenzaCat: WCSColore[] = Array.from({ length: nWords }, (_, i) =>
    i % 2 === 0 ? "A" : "B",
  );

  return {
    parole,
    sequenzaCat,
    nomiCategorie:   { A: pair.nomeA, B: pair.nomeB },
    mostraEtichetta,
    tLimMs,
    targetTimeMs,
  };
}
