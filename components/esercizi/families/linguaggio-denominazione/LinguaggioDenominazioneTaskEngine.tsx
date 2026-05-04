"use client";

/**
 * LinguaggioDenominazioneTaskEngine — engine per Picture Naming e Synonym/Antonym.
 *
 * Discrimina via esercizioId:
 *   picture_naming          → Picture Naming (emoji → digitare nome)
 *   synonym_antonym_decision → Synonym/Antonym Decision (3-pulsanti)
 *
 * Modello A (timer 90s). T.Lim gestito internamente dalla session (tLimMs={null}).
 * Micro-progressione su T.Lim: delta=-200ms, maxDelta=2 step, floor per tipo.
 *   Floor picture_naming:  2000ms
 *   Floor synonym_antonym:  800ms
 *
 * Accuratezza: corretti / trial valutativi (standard TrialFlow).
 */

import { useCallback, useMemo, useRef } from "react";
import type {
  GameEngineProps,
  TutorialConfig,
  MicroProgressioneConfig,
} from "@/lib/exercise-types";
import { TrialFlow } from "@/components/esercizi/shared/TrialFlow";
import {
  getPictureNamingLevel,
  getSynonymAntonymLevel,
  FLOOR_TLIM_PICTURE_NAMING,
  FLOOR_TLIM_SYNONYM_ANTONYM,
} from "./levels";
import {
  creaPoolRef,
  generaPictureNaming,
  generaSynonymAntonym,
  isRispostaPNCorretta,
  type StimoloLD,
  type RispostaLD,
  type LDPoolRef,
} from "./sequence";
import type { SARelazione } from "./word-pools";
import { PictureNamingSession }   from "./PictureNamingSession";
import { SynonymAntonymSession }  from "./SynonymAntonymSession";

// ── Engine ─────────────────────────────────────────────────────────────────────

export function LinguaggioDenominazioneTaskEngine({
  livello,
  esercizioId,
  tempoScaduto,
  mostraTutorial,
  onReady,
  onComplete,
  onProgress,
}: GameEngineProps) {
  const isPictureNaming = esercizioId === "picture_naming";

  const level = useMemo(
    () => isPictureNaming
      ? getPictureNamingLevel(livello)
      : getSynonymAntonymLevel(livello),
    [isPictureNaming, livello],
  );

  const floor = isPictureNaming
    ? FLOOR_TLIM_PICTURE_NAMING
    : FLOOR_TLIM_SYNONYM_ANTONYM;

  // ── Pool senza ripetizione ───────────────────────────────────────────────────
  const rng     = useRef(Math.random);
  const poolRef = useRef<LDPoolRef>(creaPoolRef(rng.current));

  // ── Micro-progressione su T.Lim ──────────────────────────────────────────────
  const microProgressione = useMemo((): MicroProgressioneConfig => ({
    valoreBase: level.tLimMs,
    delta:      -200,
    maxDelta:   2,
    limite:     floor,
  }), [level.tLimMs, floor]);

  // ── generaStimolo ─────────────────────────────────────────────────────────────
  const generaStimolo = useCallback(
    (ctx: { valoreCorrente: number }): StimoloLD => {
      const tLimMs = Math.max(floor, ctx.valoreCorrente);
      if (isPictureNaming) {
        const pnLevel = getPictureNamingLevel(livello);
        return generaPictureNaming(pnLevel.frequencyBand, tLimMs, poolRef.current);
      } else {
        const saLevel = getSynonymAntonymLevel(livello);
        return generaSynonymAntonym(saLevel.difficoltà, tLimMs, poolRef.current);
      }
    },
    [isPictureNaming, livello, floor],
  );

  // ── valutaRisposta ────────────────────────────────────────────────────────────
  const valutaRisposta = useCallback(
    (stimolo: StimoloLD, risposta: RispostaLD): boolean => {
      if (risposta === null) return false;
      if (stimolo.modo === "picture_naming") {
        return isRispostaPNCorretta(risposta as string, stimolo.risposteAccettate);
      } else {
        return (risposta as SARelazione) === stimolo.relazioneCorrelta;
      }
    },
    [],
  );

  // ── renderStimolo ─────────────────────────────────────────────────────────────
  const renderStimolo = useCallback(
    (props: { stimolo: StimoloLD; onRisposta: (r: RispostaLD) => void }) => {
      if (props.stimolo.modo === "picture_naming") {
        return (
          <PictureNamingSession
            stimolo={props.stimolo}
            onRisposta={(r) => props.onRisposta(r)}
          />
        );
      }
      return (
        <SynonymAntonymSession
          stimolo={props.stimolo}
          onRisposta={(r) => props.onRisposta(r)}
        />
      );
    },
    [],
  );

  // ── Tutorial ──────────────────────────────────────────────────────────────────
  const tutorial: TutorialConfig | null = mostraTutorial
    ? {
        pagine: isPictureNaming
          ? [{
              titolo: "Denomina l'immagine",
              testo:
                "Guarda l'immagine e scrivi il nome di quello che vedi. " +
                "Vai il più velocemente possibile. Premi Invio o tocca Conferma per rispondere.",
            }]
          : [
              {
                titolo: "Sinonimo o contrario?",
                testo:
                  "Vedrai due parole. Scegli se la seconda è un sinonimo (stesso significato), " +
                  "un contrario (significato opposto) o non correlata alla prima.",
              },
            ],
      }
    : null;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <TrialFlow<StimoloLD, RispostaLD>
      tLimMs={null}
      trialValutativi={level.trialsPerSession}
      microProgressione={microProgressione}
      generaStimolo={generaStimolo}
      renderStimolo={renderStimolo}
      valutaRisposta={valutaRisposta}
      tutorial={tutorial}
      warning={null}
      feedbackType="standard"
      tempoScaduto={tempoScaduto}
      onReady={onReady}
      onComplete={onComplete}
      onProgress={onProgress}
    />
  );
}
