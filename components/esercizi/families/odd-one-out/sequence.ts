/**
 * components/esercizi/families/odd-one-out/sequence.ts
 *
 * Composizione runtime di un trial Odd One Out (Famiglia 3).
 *
 * Single-responsibility: questo file orchestra solo la combinazione
 * di N-1 stimoli base + 1 anomalia in un trial pronto al rendering.
 * Lo shuffling delle posizioni avviene qui; la pesca degli stimoli
 * (programmatica per numeri/lettere, da pool NVdB per parole miste)
 * vive nelle strategy `./stimuli/numeri-lettere.ts` e
 * `./stimuli/parole-miste.ts` — sequence.ts resta **agnostico** al
 * tipo di stimolo e al criterio di anomalia.
 *
 * Vincoli architetturali:
 *   - Nessun import da `./stimuli/*` (le strategy importano da qui, non
 *     viceversa, per evitare cicli e mantenere il single-responsibility).
 *   - Nessuno state interno: il vincolo no-rep (5 trial per numeri/lettere,
 *     10 trial per parole) è gestito dalle strategy o dall'Engine, non qui.
 *   - Composizione deterministica via `rng` iniettabile (Math.random in
 *     produzione, mulberry32 nei test).
 *
 * Riferimento: docs/gdd/families/odd-one-out.md §Generazione stimoli
 */

// ── Tipi esportati ────────────────────────────────────────────────────────────

/**
 * Singolo stimolo del trial. Il rendering legge solo `valore` come
 * stringa visualizzata nella cella. `metadata` è tipato libero
 * (`Record<string, unknown>`) perché numeri/lettere e parole miste
 * hanno schemi diversi (vedi `./stimuli/*`):
 *   - numeri/lettere: { tipo: "numero"|"lettera", pariDispari?, vocaleConsonante?, ... }
 *   - parole miste:   { categoria, sottoCategoria?, contestoUso, nSillabe, ... }
 *
 * sequence.ts NON legge `metadata` — agnostico. Le strategy lo usano
 * per scegliere coerentemente N stimoli base + 1 anomalia, e poi lo
 * mantengono nel trial per eventuali analytics future.
 */
export type StimoloOdd = {
  /** Stringa visualizzata nella cella (es. "7", "B", "mela", "12"). */
  valore: string;
  /** Metadati specifici per stimulusType, opachi a sequence.ts. */
  metadata: Record<string, unknown>;
};

/**
 * Payload runtime di un trial Odd One Out. Passato come TStimulus di TrialFlow.
 * `assemblaTrialOdd` produce una nuova istanza per ogni trial valutativo
 * (e per il trial bonus, con N+1 o N+2 stimoli).
 */
export type TrialOdd = {
  /** Stimoli del trial, lunghi nStimuli (4–12). Posizioni post-shuffle. */
  stimoli: StimoloOdd[];
  /** Indice (0-based) dell'anomalia dentro `stimoli` post-shuffle. */
  anomaliaIndex: number;
  /**
   * Identificativo della regola discriminante usata per questo trial
   * (es. "numeri_vs_lettere", "pari_vs_dispari", "cucina_vs_altro",
   * "multipli_di_3"). Permette alle strategy di applicare il vincolo
   * no-rep su (regolaId, anomalia.valore) entro N trial.
   *
   * Stringhe libere: il valore è interpretato solo dalle strategy che
   * lo emettono. sequence.ts lo trasporta opaco.
   */
  regolaId: string;
};

/**
 * TResponse di TrialFlow — raccolta dal componente di rendering al tap.
 *   tappato:  indice [0..nStimuli-1] dello stimolo cliccato.
 *   tempoMs:  RT in ms (now - inizio trial, misurato lato Stimulus).
 */
export type RispostaOdd = {
  tappato: number;
  tempoMs: number;
};

// ── shuffleFisherYates ────────────────────────────────────────────────────────

/**
 * Produce un nuovo array shuffled tramite Fisher–Yates classico (in-place
 * sulla copia, niente mutazione dell'input). Determinismo garantito quando
 * `rng` è seedata (es. mulberry32 nei test).
 *
 * Esportata per testabilità diretta — la proprietà "anomalia non sempre
 * alla stessa posizione" si verifica direttamente su shuffleFisherYates
 * + counting bucket per posizione.
 */
export function shuffleFisherYates<T>(
  array: readonly T[],
  rng: () => number = Math.random,
): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

// ── assemblaTrialOdd ──────────────────────────────────────────────────────────

/**
 * Combina N-1 stimoli base + 1 anomalia in un trial pronto al rendering.
 * Mescola le posizioni via Fisher–Yates e calcola `anomaliaIndex` post-shuffle.
 *
 * @param stimoliBase Stimoli che condividono la regola discriminante
 *                    (es. 4 lettere, 4 frutti). Lunghezza ≥ 1.
 * @param anomalia    Stimolo che VIOLA la regola (es. 1 numero in mezzo a
 *                    lettere). Reference passata al merge — `anomaliaIndex`
 *                    viene calcolato via reference equality post-shuffle.
 * @param regolaId    Identificativo non vuoto della regola applicata.
 * @param rng         Generatore casuale [0,1). Default Math.random.
 *                    Iniettare PRNG seedata nei test per determinismo.
 *
 * Validazione input: early-fail con Error chiaro su parametri invalidi.
 * Niente silenziamento: input invalido = bug nelle strategy a monte.
 */
export function assemblaTrialOdd(
  stimoliBase: readonly StimoloOdd[],
  anomalia: StimoloOdd,
  regolaId: string,
  rng: () => number = Math.random,
): TrialOdd {
  if (stimoliBase.length < 1) {
    throw new Error(
      `[odd-one-out/sequence] stimoliBase vuoto — atteso almeno 1 elemento`,
    );
  }
  if (regolaId === "") {
    throw new Error(
      `[odd-one-out/sequence] regolaId stringa vuota`,
    );
  }

  const merged: StimoloOdd[] = [...stimoliBase, anomalia];
  const shuffled = shuffleFisherYates(merged, rng);
  // Reference equality: anomalia non viene cloned, identità preservata.
  const anomaliaIndex = shuffled.findIndex((s) => s === anomalia);

  return {
    stimoli:       shuffled,
    anomaliaIndex,
    regolaId,
  };
}
