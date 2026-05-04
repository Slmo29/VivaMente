"use client";

/**
 * WordChainSwitchingTaskEngine — engine Word Chain Switching Categoriale.
 *
 * Modello A (timer 90s). T.Lim gestito internamente (tLimMs={null}).
 * Micro-progressione su targetTimeMs: −2000ms per trial bonus, max −2, floor 15s.
 * Promozione: completato entro targetTimeMs.
 *
 * Riferimento: docs/gdd/families/word-chain-switching.md
 */

import { useCallback, useMemo, useRef } from "react";
import type {
  GameEngineProps,
  TutorialConfig,
  MicroProgressioneConfig,
} from "@/lib/exercise-types";
import { TrialFlow } from "@/components/esercizi/shared/TrialFlow";
import { getWCSLevel, getWCSMechanicWarning, WCS_TARGET_FLOOR_MS } from "./levels";
import {
  creaWCSPoolRef,
  generaStimoloWCS,
  type StimoloWCS,
  type RispostaWCS,
  type WCSPoolRef,
} from "./sequence";
import { WordChainSwitchingSession } from "./WordChainSwitchingSession";

// ── Engine ─────────────────────────────────────────────────────────────────────

export function WordChainSwitchingTaskEngine({
  livello,
  livelloPrec,
  tempoScaduto,
  mostraTutorial,
  onReady,
  onComplete,
  onProgress,
}: GameEngineProps) {
  const level   = useMemo(() => getWCSLevel(livello), [livello]);
  const rng     = useRef(Math.random);
  const poolRef = useRef<WCSPoolRef>(creaWCSPoolRef(rng.current));

  // ── Micro-progressione ─────────────────────────────────────────────────────
  const microProgressione = useMemo((): MicroProgressioneConfig => ({
    valoreBase: level.targetTimeMs,
    delta:      -2000,
    maxDelta:   2,
    limite:     WCS_TARGET_FLOOR_MS,
  }), [level.targetTimeMs]);

  // ── generaStimolo ──────────────────────────────────────────────────────────
  const generaStimolo = useCallback(
    (ctx: { valoreCorrente: number }): StimoloWCS =>
      generaStimoloWCS(
        level.nWords,
        level.distanza,
        level.cue === "etichetta_colore",
        level.tLimMs,
        Math.max(WCS_TARGET_FLOOR_MS, ctx.valoreCorrente),
        poolRef.current,
        rng.current,
      ),
    [level],
  );

  // ── valutaRisposta ─────────────────────────────────────────────────────────
  const valutaRisposta = useCallback(
    (stimolo: StimoloWCS, risposta: RispostaWCS): boolean =>
      risposta !== null && risposta.tempoMs <= stimolo.targetTimeMs,
    [],
  );

  // ── renderStimolo ──────────────────────────────────────────────────────────
  const renderStimolo = useCallback(
    (props: { stimolo: StimoloWCS; onRisposta: (r: RispostaWCS) => void }) => (
      <WordChainSwitchingSession stimolo={props.stimolo} onRisposta={props.onRisposta} />
    ),
    [],
  );

  // ── Tutorial ───────────────────────────────────────────────────────────────
  const tutorial: TutorialConfig | null = mostraTutorial
    ? {
        pagine: [{
          titolo: "Word Chain — Categorie",
          testo:
            "Vedrai parole di due colori (categorie diverse). " +
            "Toccale alternando categoria: prima una parola blu, poi una rossa, poi di nuovo blu… " +
            "Un tocco sulla categoria sbagliata non ha effetto. " +
            "Completa la sequenza il più velocemente possibile!",
        }],
      }
    : null;

  // ── Warning ────────────────────────────────────────────────────────────────
  const warning = useMemo(
    () => getWCSMechanicWarning(livelloPrec, livello),
    [livelloPrec, livello],
  );

  return (
    <TrialFlow<StimoloWCS, RispostaWCS>
      tLimMs={null}
      trialValutativi={level.trialsPerSession}
      microProgressione={microProgressione}
      generaStimolo={generaStimolo}
      renderStimolo={renderStimolo}
      valutaRisposta={valutaRisposta}
      tutorial={tutorial}
      warning={warning}
      feedbackType="standard"
      tempoScaduto={tempoScaduto}
      onReady={onReady}
      onComplete={onComplete}
      onProgress={onProgress}
    />
  );
}
