"use client";

/**
 * MemoriaProspetticaTaskEngine — engine top-level wrapper TrialFlow per la
 * famiglia Memoria Prospettica (Famiglia 10, classe MP).
 *
 * Discrimina le 2 varianti via `esercizioId`:
 *   - memoria_prospettica_event_based → tipoTrigger="event"
 *   - memoria_prospettica_time_based  → tipoTrigger="time"
 *
 * Modello B (sessione a completamento) con singolo trial continuo:
 *   - trialValutativi=1: l'intera sessione è un solo trial gestito dal
 *     mini-engine MemoriaProspetticaSession.
 *   - tLimMs=null: il timer di durata vive nel mini-engine (= durationMs
 *     del livello).
 *   - microProgressione=null: GDD §Micro-progressione letterale.
 *   - feedbackType="none": il feedback wrapper non è utile (1 solo trial),
 *     il feedback motorio sul tap "Ricordami" vive nel mini-engine.
 *
 * Override `accuratezzaValutativa`: pattern SART via (b). `valutaRisposta`
 * di TrialFlow è binaria; il valore esposto a page.tsx viene ricalcolato
 * in `onCompleteWrapped` come `finestre_corrette / finestre_totali` (vera
 * frazione clinica).
 *
 * Riferimenti:
 *   docs/gdd/families/memoria-prospettica.md
 *   docs/gdd/shared/02-trial-flow.md
 *   docs/gdd/shared/03-progression.md
 */

import { useCallback, useMemo, useRef } from "react";
import type {
  GameEngineProps,
  SessionResult,
  TutorialConfig,
} from "@/lib/exercise-types";
import { TrialFlow } from "@/components/esercizi/shared/TrialFlow";
import {
  getMPLevelEvent,
  getMPLevelTime,
  getMPMechanicWarning,
  type TipoTrigger,
} from "./levels";
import {
  generaTrialMPEvent,
  generaTrialMPTime,
  type TrialMP,
  type RispostaMP,
} from "./sequence";
import { MemoriaProspetticaSession } from "./MemoriaProspetticaSession";

// ── Lookup esercizioId → TipoTrigger ─────────────────────────────────────────

function tipoTriggerDa(esercizioId: string): TipoTrigger {
  if (esercizioId === "memoria_prospettica_event_based") return "event";
  if (esercizioId === "memoria_prospettica_time_based")  return "time";
  throw new Error(
    `[memoria-prospettica] esercizioId non riconosciuto: ${esercizioId}`,
  );
}

// ── MemoriaProspetticaTaskEngine ─────────────────────────────────────────────

export function MemoriaProspetticaTaskEngine({
  esercizioId,
  livello,
  tempoScaduto,
  mostraTutorial,
  livelloPrec,
  onReady,
  onComplete,
  onProgress,
}: GameEngineProps) {

  // ── Setup ──────────────────────────────────────────────────────────────────

  const tipoTrigger = useMemo(() => tipoTriggerDa(esercizioId), [esercizioId]);

  // RNG seedabile via ref (Math.random in produzione, mulberry32 nei test).
  const rngRef = useRef<() => number>(Math.random);

  // ── generaStimolo ──────────────────────────────────────────────────────────
  // _ctx.valoreCorrente / _ctx.isBonus ignorati (microProgressione=null).

  const generaStimolo = useCallback(
    (_ctx: { valoreCorrente: number; isBonus: boolean }): TrialMP => {
      const rng = rngRef.current;
      if (tipoTrigger === "event") {
        const level = getMPLevelEvent(livello);
        return generaTrialMPEvent(level, rng);
      }
      // tipoTrigger === "time"
      const level = getMPLevelTime(livello);
      return generaTrialMPTime(level, rng);
    },
    [tipoTrigger, livello],
  );

  // ── valutaRisposta ─────────────────────────────────────────────────────────
  // Binaria: trial corretto se almeno 1 finestra coperta. L'accuratezza
  // CLINICA reale (frazione finestre_corrette / totali) vive in onCompleteWrapped.

  const valutaRisposta = useCallback(
    (_stimolo: TrialMP, risposta: RispostaMP | null): boolean => {
      if (risposta === null) return false;
      return risposta.finestreCorrette > 0;
    },
    [],
  );

  // ── aggiornaMetriche ───────────────────────────────────────────────────────
  // 7 contatori grezzi. In MP è 1 trial → cumulazione = ultimo valore (ma il
  // pattern di accumulo è coerente con le altre famiglie e robusto a futuri
  // refactor multi-trial).

  const aggiornaMetriche = useCallback(
    (
      precedenti: Record<string, number>,
      _stimolo: TrialMP,
      risposta: RispostaMP | null,
      _corretto: boolean,
    ): Record<string, number> => {
      if (risposta === null) return precedenti;
      return {
        ...precedenti,
        finestre_totali:
          (precedenti.finestre_totali ?? 0) + risposta.finestreTotali,
        finestre_corrette:
          (precedenti.finestre_corrette ?? 0) + risposta.finestreCorrette,
        ricordami_falsi_tap:
          (precedenti.ricordami_falsi_tap ?? 0) + risposta.ricordamiFalsiTap,
        distrattori_target_totali:
          (precedenti.distrattori_target_totali ?? 0) + risposta.distrattoriTargetTotali,
        distrattori_target_tappati:
          (precedenti.distrattori_target_tappati ?? 0) + risposta.distrattoriTargetTappati,
        distrattori_falsi_tap:
          (precedenti.distrattori_falsi_tap ?? 0) + risposta.distrattoriFalsiTap,
        tempo_totale_distrattore_ms:
          (precedenti.tempo_totale_distrattore_ms ?? 0) + risposta.tempoTotaleDistrattoreMs,
      };
    },
    [],
  );

  // ── renderStimolo ──────────────────────────────────────────────────────────

  const renderStimolo = useCallback(
    (props: { stimolo: TrialMP; onRisposta: (risposta: RispostaMP) => void }) => (
      <MemoriaProspetticaSession
        stimolo={props.stimolo}
        onRisposta={props.onRisposta}
      />
    ),
    [],
  );

  // ── onCompleteWrapped — override accuratezza clinica ──────────────────────
  // Pattern SART via (b): `valutaRisposta` di TrialFlow è binaria — qui
  // ricalcoliamo l'accuratezza esposta a page.tsx come frazione vera
  // finestre_corrette / finestre_totali, coerente con GDD §Accuratezza.

  const onCompleteWrapped = useCallback(
    (risultato: SessionResult) => {
      const m = risultato.metriche;
      const totali   = m.finestre_totali ?? 0;
      const corrette = m.finestre_corrette ?? 0;
      const accuratezzaClinica = totali > 0 ? corrette / totali : 0;

      onComplete({
        ...risultato,
        accuratezzaValutativa: accuratezzaClinica,
        scoreGrezzo:           Math.round(accuratezzaClinica * 100),
      });
    },
    [onComplete],
  );

  // ── Tutorial (prima sessione) ──────────────────────────────────────────────
  // Nessun demo statico: la Fase 1 del mini-engine è essa stessa una
  // schermata di istruzione con cue/intervallo. Qui solo testo introduttivo.

  const tutorial: TutorialConfig | null = mostraTutorial
    ? {
        pagine: [{
          titolo: tipoTrigger === "event"
            ? "Memoria Prospettica — Quando vedi il segnale"
            : "Memoria Prospettica — A intervalli di tempo",
          testo: tipoTrigger === "event"
            ? `Ti verrà mostrato un simbolo da ricordare. Durante l'esercizio devi ` +
              `toccare ogni volta una categoria di oggetti che scorre sullo schermo. ` +
              `Quando vedi il simbolo che ti era stato mostrato, tocca subito il ` +
              `tasto "Ricordami".`
            : `Durante l'esercizio devi toccare ogni volta una categoria di oggetti ` +
              `che scorre sullo schermo. Inoltre, ogni tot secondi devi toccare il ` +
              `tasto "Ricordami". L'orologio ti aiuterà a tenere il tempo.`,
        }],
      }
    : null;

  // ── Warning cambio meccanica ───────────────────────────────────────────────

  const warning = useMemo(
    () => getMPMechanicWarning(livelloPrec, livello, tipoTrigger),
    [livelloPrec, livello, tipoTrigger],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <TrialFlow<TrialMP, RispostaMP>
      tLimMs={null}
      trialValutativi={1}
      microProgressione={null}
      generaStimolo={generaStimolo}
      renderStimolo={renderStimolo}
      valutaRisposta={valutaRisposta}
      aggiornaMetriche={aggiornaMetriche}
      tutorial={tutorial}
      warning={warning}
      feedbackType="none"
      tempoScaduto={tempoScaduto}
      onReady={onReady}
      onComplete={onCompleteWrapped}
      onProgress={onProgress}
    />
  );
}
