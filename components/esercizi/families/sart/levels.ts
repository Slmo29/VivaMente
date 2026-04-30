/**
 * components/esercizi/families/sart/levels.ts
 *
 * Configurazione livelli per SART numerico (Famiglia 11, esercizio_id: sart_numerico).
 *
 * Dominio cognitivo: Attenzione — sustained attention + inibizione della risposta
 * automatica (paradigma Robertson et al., 1997).
 *
 * Modello B (sessione a completamento dei blocchi previsti):
 *   un trial = un blocco = sequenza di `sequenceLength` stimoli (cifre 1–9).
 *   Vedi docs/gdd/families/sart.md §Struttura sessione.
 *
 * Decisioni implementative:
 *   - 20 livelli completi (gioco unico, niente split first-pass).
 *   - Lv 1–9 senza masking. Lv 10–20 con masking ramp 200→350ms (cambio meccanica
 *     al lv 10, warning bidirezionale via getSartMechanicWarning).
 *   - trialsPerSession: 3 per lv 1–14, 2 per lv 15–20.
 *   - Pausa 2s tra blocchi gestita via isiMs={2000} di TrialFlow (vedi
 *     SartTaskEngine). NON è il SOA per-stimolo, che vive in SartBlock.soaMs.
 *   - Micro-progressione su isiMs (= SOA): -50ms per step bonus, max -2 step,
 *     floor 700ms. Inattiva ai lv 15–20 by design (trialsPerSession=2 → la
 *     streak di 3 consecutivi corretti non si raggiunge).
 *
 * ## Deroghe GDD
 *
 * SART_LEVELS_GDD_STRICT contiene la tabella letterale del GDD (esportata
 * per testabilità delle deroghe). SART_LEVELS è la versione runtime con
 * SART_DEROGA_LUNGHEZZA_BLOCCO applicato a sequenceLength. Il moltiplicatore
 * e tutte le altre deroghe vivono in `_deroghe.ts`. Per tornare al GDD strict
 * basta settare il moltiplicatore a 1.0.
 *
 * Selezione del target (cifra 1–9) per sessione: responsabilità dell'Engine.
 * Lazy init via useRef al mount, escludendo l'ultima cifra usata (TODO DB lookup).
 *
 * Riferimento: docs/gdd/families/sart.md
 */

import type { MicroProgressioneConfig } from "@/lib/exercise-types";
import { SART_DEROGA_LUNGHEZZA_BLOCCO } from "./_deroghe";

// ── Tipo configurazione livello ───────────────────────────────────────────────

export type SartLevelConfig = {
  /** Indice 1-based, 1–20. */
  livello: number;
  /** Numero di stimoli per blocco (50–200 GDD strict; ridotto da deroga). */
  sequenceLength: number;
  /**
   * SOA (Stimulus Onset Asynchrony) per-stimolo in ms (700–1500).
   * Termine GDD letterale "ISI" — vedi tabella docs/gdd/families/sart.md.
   * Lato SartBlock viene rinominato `soaMs` per evitare name-clash con
   * l'isiMs di TrialFlow (che gestisce la pausa 2s tra blocchi).
   */
  isiMs: number;
  /** Proporzione di stimoli target nella sequenza (0.05–0.20). */
  targetFrequency: number;
  /**
   * Durata del masking visivo dopo lo stimolo, in ms. null lv 1–9.
   * 200/250/300/350 lv 10–20 (4 step).
   */
  maskingMs: number | null;
  /** Numero di blocchi valutativi per sessione: 3 (lv 1–14) o 2 (lv 15–20). */
  trialsPerSession: number;
};

// ── Tabella livelli GDD strict ────────────────────────────────────────────────
/**
 * Fonte: docs/gdd/families/sart.md §Tabella livelli (righe 59–80).
 * Trascrizione letterale, ordine livello crescente.
 *
 * Esportata per testabilità della deroga lunghezza_blocco — i test verificano
 * che SART_LEVELS sia coerente con il moltiplicatore applicato a questa.
 */
export const SART_LEVELS_GDD_STRICT: readonly SartLevelConfig[] = [
  { livello:  1, sequenceLength:  50, isiMs: 1500, targetFrequency: 0.20, maskingMs: null, trialsPerSession: 3 },
  { livello:  2, sequenceLength:  60, isiMs: 1400, targetFrequency: 0.20, maskingMs: null, trialsPerSession: 3 },
  { livello:  3, sequenceLength:  70, isiMs: 1300, targetFrequency: 0.15, maskingMs: null, trialsPerSession: 3 },
  { livello:  4, sequenceLength:  80, isiMs: 1300, targetFrequency: 0.15, maskingMs: null, trialsPerSession: 3 },
  { livello:  5, sequenceLength:  90, isiMs: 1200, targetFrequency: 0.12, maskingMs: null, trialsPerSession: 3 },
  { livello:  6, sequenceLength: 100, isiMs: 1200, targetFrequency: 0.12, maskingMs: null, trialsPerSession: 3 },
  { livello:  7, sequenceLength: 100, isiMs: 1100, targetFrequency: 0.10, maskingMs: null, trialsPerSession: 3 },
  { livello:  8, sequenceLength: 120, isiMs: 1100, targetFrequency: 0.10, maskingMs: null, trialsPerSession: 3 },
  { livello:  9, sequenceLength: 120, isiMs: 1000, targetFrequency: 0.10, maskingMs: null, trialsPerSession: 3 },
  // ── Lv 10: introduzione masking (cambio meccanica → warning) ──
  { livello: 10, sequenceLength: 130, isiMs: 1000, targetFrequency: 0.10, maskingMs: 200, trialsPerSession: 3 },
  { livello: 11, sequenceLength: 140, isiMs:  950, targetFrequency: 0.08, maskingMs: 200, trialsPerSession: 3 },
  { livello: 12, sequenceLength: 140, isiMs:  950, targetFrequency: 0.08, maskingMs: 200, trialsPerSession: 3 },
  { livello: 13, sequenceLength: 150, isiMs:  900, targetFrequency: 0.08, maskingMs: 250, trialsPerSession: 3 },
  { livello: 14, sequenceLength: 150, isiMs:  900, targetFrequency: 0.07, maskingMs: 250, trialsPerSession: 3 },
  // ── Lv 15: trialsPerSession 3→2 (compensa seqLen più lunghi) ──
  { livello: 15, sequenceLength: 160, isiMs:  850, targetFrequency: 0.07, maskingMs: 250, trialsPerSession: 2 },
  { livello: 16, sequenceLength: 170, isiMs:  850, targetFrequency: 0.06, maskingMs: 300, trialsPerSession: 2 },
  { livello: 17, sequenceLength: 170, isiMs:  800, targetFrequency: 0.06, maskingMs: 300, trialsPerSession: 2 },
  { livello: 18, sequenceLength: 180, isiMs:  800, targetFrequency: 0.05, maskingMs: 300, trialsPerSession: 2 },
  { livello: 19, sequenceLength: 180, isiMs:  750, targetFrequency: 0.05, maskingMs: 350, trialsPerSession: 2 },
  { livello: 20, sequenceLength: 200, isiMs:  700, targetFrequency: 0.05, maskingMs: 350, trialsPerSession: 2 },
] as const;

// ── Tabella livelli runtime (con deroga lunghezza blocco applicata) ──────────
/**
 * Versione runtime delle config livelli: SART_LEVELS_GDD_STRICT con
 * sequenceLength scalato di SART_DEROGA_LUNGHEZZA_BLOCCO. Tutti gli altri
 * campi invariati. getSartLevel legge da qui.
 *
 * Verifica feasibility matematica con moltiplicatore 0.6:
 *   lv 1:  round(50×0.6)=30,  freq 0.20 → 6 target, min seq 26, margine 4 ✓
 *   lv 18: round(180×0.6)=108, freq 0.05 → 5 target, min seq 21, margine 87 ✓
 *   tutti i livelli intermedi feasible.
 */
export const SART_LEVELS: readonly SartLevelConfig[] = SART_LEVELS_GDD_STRICT.map(
  (lv): SartLevelConfig => ({
    ...lv,
    sequenceLength: Math.round(lv.sequenceLength * SART_DEROGA_LUNGHEZZA_BLOCCO),
  }),
);

// ── Lookup livello con clamp ──────────────────────────────────────────────────

/**
 * Ritorna la configurazione del livello, clampando l'input al range [1, 20].
 * Pattern allineato a getGoNogoLevel — robusto contro valori fuori range
 * provenienti dallo store o dal DB.
 */
export function getSartLevel(livello: number): SartLevelConfig {
  const clamped = Math.min(20, Math.max(1, livello));
  return SART_LEVELS[clamped - 1];
}

// ── Micro-progressione ────────────────────────────────────────────────────────
/**
 * Costanti micro-progressione SART. valoreBase viene iniettato a runtime
 * dall'Engine (= config.isiMs del livello corrente).
 *
 * Fonte GDD: docs/gdd/families/sart.md §Micro-progressione.
 *   parameter   = isiMs
 *   increment   = -50ms per trial bonus
 *   maxSteps    = 2 (max -100ms totale)
 *   floor       = 700ms
 *
 * Inattiva ai lv 15–20 (trialsPerSession=2 → streak di 3 consecutivi corretti
 * non raggiungibile). Comportamento intenzionale, vedi commento head file.
 */
export const MICRO_PROGRESSIONE_SART = {
  delta:    -50,
  maxDelta: 2,
  limite:   700,
} as const satisfies Omit<MicroProgressioneConfig, "valoreBase">;

// ── Warning cambio meccanica ──────────────────────────────────────────────────

/**
 * Ritorna il payload del warning quando si attraversa la soglia del masking
 * (lv 9 ↔ lv 10), in entrambe le direzioni. Per la prima sessione (livelloPrec
 * === null) ritorna sempre null: il tutorial copre l'introduzione.
 *
 * Il testo NON hardcoda la cifra target — usa "il target" generico. Coerenza UX:
 * il target effettivo viene mostrato nel tutorial demo (vedi SartTaskEngine).
 *
 * Fonte: docs/gdd/shared/02-trial-flow.md §Cambi di livello con cambio di meccanica
 *        + Domanda GDD #2 risolta nel design doc (warning bidirezionale).
 */
export function getSartMechanicWarning(
  livelloPrec: number | null,
  livelloCorrente: number,
): { titolo: string; testo: string } | null {
  if (livelloPrec === null) return null;

  // Promozione: ingresso al masking (lv ≤9 → lv ≥10)
  if (livelloPrec <= 9 && livelloCorrente >= 10) {
    return {
      titolo: "Attenzione: ora i numeri spariranno più in fretta",
      testo:
        "Da questo livello, dopo ogni numero appare brevemente una maschera (#######). " +
        "Serve a impedire di 'leggere a memoria' la cifra dopo che è scomparsa. " +
        "Continua a toccare quando vedi un numero diverso dal target.",
    };
  }

  // Retrocessione: uscita dal masking (lv ≥10 → lv ≤9)
  if (livelloPrec >= 10 && livelloCorrente <= 9) {
    return {
      titolo: "I numeri restano visibili più a lungo",
      testo:
        "Da questo livello la maschera tra i numeri scompare. " +
        "Continua come prima — tocca quando vedi un numero diverso dal target.",
    };
  }

  return null;
}
