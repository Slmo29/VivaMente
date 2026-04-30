/**
 * components/esercizi/families/sart/sequence.ts
 *
 * Generazione sequenze SART numerico (Famiglia 11).
 *
 * Una sequenza = un blocco = una unità valutativa di TrialFlow (Modello B).
 * Per ogni livello l'Engine genera trialsPerSession sequenze di lunghezza
 * sequenceLength, ognuna sottoposta a SartStream.
 *
 * Vincoli GDD (docs/gdd/families/sart.md §Generazione stimoli):
 *   - cifre 1–9
 *   - target count = floor(sequenceLength × targetFrequency)
 *   - target non consecutivi (corollario di MIN_SPACING ≥ 2)
 *   - mai due target a distanza < 5 posizioni  → pos2 - pos1 ≥ MIN_SPACING (5)
 *     interpretazione letterale GDD: ≥ 4 non-target tra due target consecutivi
 *   - non-target = cifra random in 1–9 ≠ target (uniforme sui restanti 8 valori)
 *
 * Asimmetria di nomenclatura GDD ↔ runtime:
 *   - GDD usa "isiMs" per il SOA per-stimolo (1500→700ms tra livelli).
 *   - Lato runtime esponiamo "soaMs" su SartBlock per non collidere con
 *     l'isiMs di TrialFlow (che è la pausa 2s tra blocchi). Il rename
 *     avviene nell'Engine al momento di costruire SartBlock; SartLevelConfig
 *     mantiene "isiMs" per fedeltà letterale alla tabella GDD.
 *
 * Algoritmo:
 *   Step 1 — rejection sampling con vincolo MIN_SPACING (margine matematico
 *            +4 al peggio sui parametri GDD: convergenza in pochi tentativi).
 *   Step 2 — fallback constructive (piazzaCostruttivo) deterministico, mai
 *            attivato sui parametri GDD ma safety net contro modifiche future
 *            (es. abbassare targetFrequency floor o seqLen).
 *   Step 3 — riempi posizioni: target nelle posizioni scelte, non-target
 *            uniforme su [1..9] \ {target} altrove.
 *
 * Riferimento: docs/gdd/families/sart.md §Generazione stimoli
 */

// ── Tipi esportati ────────────────────────────────────────────────────────────

/**
 * Payload runtime di un blocco SART, passato come TStimulus di TrialFlow.
 * generaStimolo dell'Engine ritorna una nuova istanza per ogni blocco
 * (incluso l'eventuale blocco bonus, con soaMs ridotto).
 */
export type SartBlock = {
  /** Sequenza di stimoli, lunga sequenceLength, valori in [1..9]. */
  sequenza: number[];
  /** Cifra target della sessione (1..9), stabile per tutti i blocchi. */
  target: number;
  /**
   * SOA (Stimulus Onset Asynchrony) per-stimolo in ms (700..1500).
   * Equivale a "isiMs" della tabella GDD ma rinominato per evitare il
   * name-clash con l'isiMs di TrialFlow (vedi head comment).
   */
  soaMs: number;
  /** Durata masking in ms; null lv 1–9, 200..350 lv 10–20. */
  maskingMs: number | null;
};

/**
 * Esito aggregato di un blocco, prodotto da SartStream e consegnato a
 * TrialFlow tramite onRisposta. Tutti i conteggi sono cumulativi sul blocco.
 */
export type SartBlockEsito = {
  /** Tap su stimoli target (failure of inhibition — misura clinica primaria). */
  commissionErrori: number;
  /** Mancato tap su stimoli non-target (omission — cali di attenzione). */
  omissionErrori: number;
  /** = floor(sequenceLength × targetFrequency). */
  targetTotali: number;
  /** = sequenceLength − targetTotali. */
  nontargetTotali: number;
  /** Somma RT (ms) sui non-target tappati correttamente. */
  tempoTotaleNontargetMs: number;
};

// ── Costanti esportate ────────────────────────────────────────────────────────

/** GDD: "mai due target a distanza < 5 posizioni" → pos2 - pos1 ≥ MIN_SPACING. */
export const MIN_SPACING = 5;

/**
 * Tetto tentativi rejection sampling prima di passare al fallback constructive.
 * Empirico: lascia margine ampio anche al lv 1 (margine matematico +4 ⇒
 * failure rate trascurabile).
 */
export const MAX_ATTEMPTS_MULTIPLIER = 20;

// ── scegliTargetSart ─────────────────────────────────────────────────────────

/**
 * Sceglie casualmente la cifra target di una sessione, con uniforme
 * su [1..9] \ {escludi}. Pool size 8 quando escludi !== null, 9 altrimenti.
 *
 * TODO DB lookup excludeLastUsed:
 *   First-pass: l'Engine passa null → random puro su 1..9.
 *   Implementazione futura unificata con la coppia Go/No-Go: query
 *   dell'ultima sessione (user_id, esercizio_id) per estrarre il target
 *   precedente e passarlo come escludi.
 */
export function scegliTargetSart(
  escludi: number | null,
  rng: () => number = Math.random,
): number {
  const pool: number[] = [];
  for (let d = 1; d <= 9; d++) {
    if (d !== escludi) pool.push(d);
  }
  return pool[Math.floor(rng() * pool.length)];
}

// ── piazzaCostruttivo ────────────────────────────────────────────────────────

/**
 * Fallback deterministico per il piazzamento dei target quando il rejection
 * sampling fallisce. Divide seqLen in `t` segmenti di lunghezza ≥ minSpacing
 * e piazza un target per segmento in posizione random all'interno del range
 * ammesso del segmento.
 *
 * Invariante di spacing: dato segmento k di lunghezza L_k con offset o_k ∈
 * [0, L_k - minSpacing], la distanza tra target_k e target_{k+1} è almeno
 * (L_k - o_k) + o_{k+1} ≥ minSpacing. Quindi il vincolo GDD è rispettato
 * per costruzione.
 *
 * Esportata per testabilità diretta. Sui parametri GDD attuali non viene
 * mai invocata (rejection sampling converge sempre), ma serve come safety
 * net contro modifiche future della tabella livelli.
 */
export function piazzaCostruttivo(
  seqLen: number,
  t: number,
  minSpacing: number,
  rng: () => number,
): number[] {
  if (t === 0) return [];

  const baseSegLen = Math.floor(seqLen / t);
  if (baseSegLen < minSpacing) {
    throw new Error(
      `[sart/sequence] piazzaCostruttivo infeasibile: ` +
      `seqLen=${seqLen}, t=${t}, minSpacing=${minSpacing} ` +
      `(baseSegLen=${baseSegLen} < ${minSpacing}). ` +
      `Verificare la tabella livelli SART.`,
    );
  }

  // Distribuisci il resto: i primi `extra` segmenti hanno lunghezza baseSegLen+1.
  const extra = seqLen - baseSegLen * t;

  const positions: number[] = [];
  let cursor = 0;
  for (let i = 0; i < t; i++) {
    const segLen = baseSegLen + (i < extra ? 1 : 0);
    // Range ammesso per l'offset: [0, segLen - minSpacing] inclusivo.
    const offsetRange = segLen - minSpacing + 1;
    const offset = Math.floor(rng() * offsetRange);
    positions.push(cursor + offset);
    cursor += segLen;
  }

  return positions;
}

// ── generaSequenzaSart ────────────────────────────────────────────────────────

/**
 * Genera una sequenza completa di `seqLen` stimoli rispettando i vincoli GDD.
 *
 * @param seqLen     Lunghezza della sequenza (numero di stimoli del blocco).
 * @param targetFreq Proporzione di target attesa (0.05–0.20).
 * @param target     Cifra target (1..9), già scelta per la sessione.
 * @param rng        Generatore casuale [0,1). Default Math.random.
 *                   Iniettare una PRNG seedata nei test per determinismo.
 *
 * Validazione input: early-fail con Error chiaro su parametri fuori range.
 * Niente silenziamento: input invalido = bug a monte (livelli/registry).
 */
export function generaSequenzaSart(
  seqLen: number,
  targetFreq: number,
  target: number,
  rng: () => number = Math.random,
): number[] {
  // ── Validazione input ────────────────────────────────────────────────────
  if (!Number.isInteger(seqLen) || seqLen <= 0) {
    throw new Error(
      `[sart/sequence] seqLen non valido: ${seqLen} (atteso intero > 0)`,
    );
  }
  if (
    !Number.isFinite(targetFreq) ||
    targetFreq < 0 ||
    targetFreq > 1
  ) {
    throw new Error(
      `[sart/sequence] targetFreq fuori range [0, 1]: ${targetFreq}`,
    );
  }
  if (!Number.isInteger(target) || target < 1 || target > 9) {
    throw new Error(
      `[sart/sequence] target fuori range [1, 9]: ${target}`,
    );
  }

  const t = Math.floor(seqLen * targetFreq);
  const result: number[] = new Array(seqLen);

  // ── Step 1: rejection sampling ──────────────────────────────────────────
  let positions: number[] = [];
  const maxAttempts = seqLen * MAX_ATTEMPTS_MULTIPLIER;
  let attempts = 0;

  while (positions.length < t && attempts < maxAttempts) {
    const candidate = Math.floor(rng() * seqLen);
    let ok = true;
    for (const p of positions) {
      if (Math.abs(candidate - p) < MIN_SPACING) {
        ok = false;
        break;
      }
    }
    if (ok) positions.push(candidate);
    attempts++;
  }

  // ── Step 2: fallback constructive (safety net) ──────────────────────────
  if (positions.length < t) {
    positions = piazzaCostruttivo(seqLen, t, MIN_SPACING, rng);
  }

  // Ordinamento crescente per ergonomia di validazione (algoritmo non lo
  // richiede strettamente: il fill usa il Set).
  positions.sort((a, b) => a - b);
  const positionsSet = new Set(positions);

  // ── Step 3: riempi la sequenza ──────────────────────────────────────────
  for (let i = 0; i < seqLen; i++) {
    if (positionsSet.has(i)) {
      result[i] = target;
    } else {
      // Non-target uniforme su [1..9] \ {target}.
      // Tecnica: pesca in [1..8] (8 valori), poi shift di +1 se d ≥ target
      // per "saltare" il target mantenendo distribuzione uniforme sui 8
      // valori validi. Esempio target=5: d∈{1,2,3,4,5,6,7,8} → dopo shift
      // diventa {1,2,3,4,6,7,8,9}. Con target=9 nessuno shift è necessario.
      let d = Math.floor(rng() * 8) + 1;
      if (d >= target) d += 1;
      result[i] = d;
    }
  }

  return result;
}
