/**
 * components/esercizi/families/odd-one-out/stimuli/numeri-lettere.ts
 *
 * Strategy programmatica per la variante `odd_one_out_numeri_lettere`.
 *
 * Genera stimoli a runtime (cifre 0–20 + lettere A–Z) con metadata
 * pre-calcolati per ogni proprietà discriminante richiesta dal GDD
 * (tipo, pari/dispari, vocale/consonante, range numerico, divisibilità,
 * classe fonologica BPDT).
 *
 * Per ogni trial sceglie una regola applicabile a (dimensione, nStimuli),
 * pesca N-1 stimoli base coerenti + 1 anomalia che viola la regola, e
 * ritorna il triplo `(stimoliBase, anomalia, regolaId)` pronto per essere
 * passato a `assemblaTrialOdd` (vedi `../sequence.ts`) — questa strategy
 * NON chiama assemblaTrialOdd: shuffle e tracking no-rep sono responsabilità
 * dell'Engine, qui orchestriamo solo la pesca.
 *
 * Vincoli no-rep: gestiti dall'Engine via ref + filtro su (regolaId,
 * anomalia.valore) entro 5 trial — NON qui (questa strategy è stateless).
 *
 * TODO regole astratto incomplete:
 *   GDD §Astratto/trasversale lista anche "lettere che sono cifre romane"
 *   (I, V, X, L, C, D, M = 7 lettere) come regola astratta. First-pass
 *   implementa solo `multipli_3_vs_no`. Le regole astratte applicabili sono
 *   limitate dal pool 0–20 (7 multipli di 3) → nStimuli max applicabile = 8.
 *   Per lv 16+ con nStimuli ≥ 11 throw esplicito "Regola non disponibile";
 *   l'Engine deve degradare gracefully (TODO Engine).
 *
 * TODO classeFonologica:
 *   GDD §Semantico contestuale lista "lettere del gruppo B/P/D/T" come
 *   regola fonologica. Pool ridotto (4 lettere) → applicabile solo a
 *   nStimuli ≤ 5 (lv 1–3 di rara concorrenza con dim semantico_contestuale).
 *   Altre classi fonologiche (fricative, nasali) sono TODO.
 *
 * Riferimento: docs/gdd/families/odd-one-out.md §Generazione stimoli
 */

import type { StimoloOdd } from "../sequence";
import type { DimensioneDiscriminante } from "../levels";

// ── Metadata interno ──────────────────────────────────────────────────────────

/**
 * Etichette pre-calcolate per ogni stimolo numero/lettera. Vivono nel
 * `metadata: Record<string, unknown>` di StimoloOdd come dato opaco a
 * sequence.ts. Questa strategy le legge tramite cast interno.
 */
export type MetadataNumeroLettera = {
  tipo: "numero" | "lettera";
  /** Solo per numeri. */
  pariDispari?: "pari" | "dispari";
  /** Solo per lettere. */
  vocaleConsonante?: "vocale" | "consonante";
  /** Solo per numeri. */
  divisibilePer3?: boolean;
  /** Solo per numeri. */
  divisibilePer5?: boolean;
  /** Per numeri: range numerico del pool. */
  rangeNumerico?: "0-9" | "10-20";
  /** Solo per lettere consonanti. */
  classeFonologica?: "occlusiva_BPDT" | "altro";
};

// ── Costruzione pool (al modulo load) ────────────────────────────────────────

const VOCALI = new Set(["A", "E", "I", "O", "U"]);
const CONSONANTI_BPDT = new Set(["B", "P", "D", "T"]);

function costruisciStimoloNumero(n: number, range: "0-9" | "10-20"): StimoloOdd {
  const meta: MetadataNumeroLettera = {
    tipo:           "numero",
    pariDispari:    n % 2 === 0 ? "pari" : "dispari",
    divisibilePer3: n % 3 === 0,
    divisibilePer5: n % 5 === 0,
    rangeNumerico:  range,
  };
  return { valore: String(n), metadata: meta as Record<string, unknown> };
}

function costruisciStimoloLettera(c: string): StimoloOdd {
  const isVocale = VOCALI.has(c);
  const meta: MetadataNumeroLettera = {
    tipo:             "lettera",
    vocaleConsonante: isVocale ? "vocale" : "consonante",
    classeFonologica: !isVocale && CONSONANTI_BPDT.has(c) ? "occlusiva_BPDT" : "altro",
  };
  return { valore: c, metadata: meta as Record<string, unknown> };
}

const POOL_NUMERI_0_9: readonly StimoloOdd[] =
  Array.from({ length: 10 }, (_, i) => costruisciStimoloNumero(i, "0-9"));

const POOL_NUMERI_10_20: readonly StimoloOdd[] =
  Array.from({ length: 11 }, (_, i) => costruisciStimoloNumero(10 + i, "10-20"));

const POOL_NUMERI_0_20: readonly StimoloOdd[] = [
  ...POOL_NUMERI_0_9,
  ...POOL_NUMERI_10_20,
];

const POOL_LETTERE_A_Z: readonly StimoloOdd[] =
  Array.from({ length: 26 }, (_, i) =>
    costruisciStimoloLettera(String.fromCharCode(65 + i)),
  );

// ── Helper di filtro ──────────────────────────────────────────────────────────

const meta = (s: StimoloOdd) => s.metadata as MetadataNumeroLettera;

function filtra(
  pool: readonly StimoloOdd[],
  pred: (m: MetadataNumeroLettera) => boolean,
): readonly StimoloOdd[] {
  return pool.filter((s) => pred(meta(s)));
}

// ── Pool derivati per regole ──────────────────────────────────────────────────

const POOL_PARI       = filtra(POOL_NUMERI_0_20, (m) => m.pariDispari === "pari");
const POOL_DISPARI    = filtra(POOL_NUMERI_0_20, (m) => m.pariDispari === "dispari");
const POOL_VOCALI     = filtra(POOL_LETTERE_A_Z, (m) => m.vocaleConsonante === "vocale");
const POOL_CONSONANTI = filtra(POOL_LETTERE_A_Z, (m) => m.vocaleConsonante === "consonante");
const POOL_BPDT       = filtra(POOL_LETTERE_A_Z, (m) => m.classeFonologica === "occlusiva_BPDT");
const POOL_NON_BPDT   = filtra(POOL_LETTERE_A_Z, (m) => m.classeFonologica !== "occlusiva_BPDT");
const POOL_MULTIPLI_3 = filtra(POOL_NUMERI_0_20, (m) => m.divisibilePer3 === true);
const POOL_NON_MULT_3 = filtra(POOL_NUMERI_0_20, (m) => m.divisibilePer3 === false);

// ── Tabella regole per dimensione ────────────────────────────────────────────

type RegolaSpec = {
  id:           string;
  poolTarget:   readonly StimoloOdd[];
  poolAnomalia: readonly StimoloOdd[];
};

const REGOLE_PER_DIMENSIONE: Record<DimensioneDiscriminante, readonly RegolaSpec[]> = {
  categoriale_alto: [
    { id: "numeri_vs_lettere", poolTarget: POOL_NUMERI_0_9, poolAnomalia: POOL_LETTERE_A_Z },
    { id: "lettere_vs_numeri", poolTarget: POOL_LETTERE_A_Z, poolAnomalia: POOL_NUMERI_0_9 },
  ],
  categoriale_medio: [
    { id: "pari_vs_dispari",        poolTarget: POOL_PARI,       poolAnomalia: POOL_DISPARI    },
    { id: "dispari_vs_pari",        poolTarget: POOL_DISPARI,    poolAnomalia: POOL_PARI       },
    { id: "vocali_vs_consonanti",   poolTarget: POOL_VOCALI,     poolAnomalia: POOL_CONSONANTI },
    { id: "consonanti_vs_vocali",   poolTarget: POOL_CONSONANTI, poolAnomalia: POOL_VOCALI     },
  ],
  semantico_contestuale: [
    { id: "range_10_20_vs_fuori",   poolTarget: POOL_NUMERI_10_20, poolAnomalia: POOL_NUMERI_0_9 },
    { id: "BPDT_vs_altre",          poolTarget: POOL_BPDT,         poolAnomalia: POOL_NON_BPDT   },
  ],
  astratto: [
    { id: "multipli_3_vs_no",       poolTarget: POOL_MULTIPLI_3, poolAnomalia: POOL_NON_MULT_3 },
    { id: "no_multipli_3",          poolTarget: POOL_NON_MULT_3, poolAnomalia: POOL_MULTIPLI_3 },
  ],
};

// ── Helper interni ────────────────────────────────────────────────────────────

/**
 * Estrae `n` elementi univoci dal pool via Fisher-Yates partial.
 * Determinismo garantito quando rng è seedata.
 *
 * @throws RangeError se il pool è insufficiente.
 */
function pescaSenzaRipetizioni<T>(
  pool: readonly T[],
  n: number,
  rng: () => number,
): T[] {
  if (n > pool.length) {
    throw new RangeError(
      `[odd-one-out/numeri-lettere] pool insufficiente: ` +
      `richiesti ${n}, disponibili ${pool.length}`,
    );
  }
  const arr = [...pool];
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    result.push(arr[i]);
  }
  return result;
}

/**
 * Filtra le regole applicabili a (nStimuli) verificando che entrambi i pool
 * abbiano elementi sufficienti: poolTarget ≥ nStimuli-1, poolAnomalia ≥ 1.
 */
function regoleApplicabili(
  candidate: readonly RegolaSpec[],
  nStimuli: number,
): readonly RegolaSpec[] {
  const nBase = nStimuli - 1;
  return candidate.filter(
    (r) => r.poolTarget.length >= nBase && r.poolAnomalia.length >= 1,
  );
}

// ── pescaTrialNumeriLettere — funzione principale ────────────────────────────

/**
 * Pesca N-1 stimoli base + 1 anomalia per un trial numeri/lettere.
 * NON applica shuffle né tracking no-rep: l'Engine si occupa di entrambi.
 *
 * Validazione input:
 *   - nStimuli ∈ [4, 12] (range GDD §Tabella livelli).
 *   - dimensione riconosciuta.
 *   - Almeno una regola applicabile per (dimensione, nStimuli).
 *
 * @throws RangeError se nStimuli fuori range o nessuna regola applicabile.
 */
export function pescaTrialNumeriLettere(
  livello: number,
  dimensione: DimensioneDiscriminante,
  nStimuli: number,
  rng: () => number,
): { stimoliBase: StimoloOdd[]; anomalia: StimoloOdd; regolaId: string } {
  if (!Number.isInteger(nStimuli) || nStimuli < 4 || nStimuli > 12) {
    throw new RangeError(
      `[odd-one-out/numeri-lettere] nStimuli fuori range [4, 12]: ${nStimuli}`,
    );
  }

  const candidate = REGOLE_PER_DIMENSIONE[dimensione];
  if (!candidate || candidate.length === 0) {
    throw new RangeError(
      `[odd-one-out/numeri-lettere] dimensione non riconosciuta: ${dimensione}`,
    );
  }

  const applicabili = regoleApplicabili(candidate, nStimuli);
  if (applicabili.length === 0) {
    throw new RangeError(
      `[odd-one-out/numeri-lettere] nessuna regola applicabile per ` +
      `(dim=${dimensione}, nStimuli=${nStimuli}, lv=${livello}). ` +
      `First-pass MVP: pool insufficiente — vedi TODO regole astratto/BPDT.`,
    );
  }

  // Scelta regola random tra le applicabili
  const regola = applicabili[Math.floor(rng() * applicabili.length)];

  // Pesca N-1 elementi del gruppo target
  const stimoliBase = pescaSenzaRipetizioni(regola.poolTarget, nStimuli - 1, rng);
  // Pesca 1 anomalia, escludendo per sicurezza qualsiasi sovrapposizione
  // (in pratica i pool sono disgiunti per costruzione, ma defensivo).
  const valoriBase = new Set(stimoliBase.map((s) => s.valore));
  const poolAnomaliaFiltrato = regola.poolAnomalia.filter(
    (s) => !valoriBase.has(s.valore),
  );
  if (poolAnomaliaFiltrato.length === 0) {
    throw new Error(
      `[odd-one-out/numeri-lettere] nessuna anomalia disponibile per ` +
      `regola ${regola.id} dopo filtro disgiunzione (bug nei pool?)`,
    );
  }
  const [anomalia] = pescaSenzaRipetizioni(poolAnomaliaFiltrato, 1, rng);

  return {
    stimoliBase,
    anomalia,
    regolaId: regola.id,
  };
}
