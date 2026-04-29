"use client";

/**
 * GoNogoTaskEngine — game engine per la famiglia Go/No-Go Cromatico (Famiglia 12).
 *
 * Prima istanza di Modello B in produzione: sessione termina per conteggio trial
 * (trialValutativi = sequenceLength), non per timer fisso.
 *
 * 6 differenze critiche vs StroopTaskEngine:
 *   1. Modello B: trialValutativi = config.sequenceLength (non null)
 *   2. Selezione coppia attiva runtime al mount (random tra coppieAmmesse del livello)
 *   3. valutaRisposta logica invertita: timeout su nogo = CORRETTO (inibizione riuscita)
 *   4. 5 contatori metriche (no tempo_totale_nogo_ms — nogo corretti non hanno tap)
 *   5. ISI = 0 (flusso continuo, deroga GDD shared/02-trial-flow.md)
 *   6. feedbackType = "error-only" (solo flash rosso su errore, deroga GDD)
 *
 * TODO clinico bonus condition:
 *   TrialFlow approssima "ge90pct_go_correct AND ge90pct_nogo_correct" (GDD)
 *   con "3 consecutivi corretti" standard. Approssimazione consapevole.
 *
 * TODO esclusione coppia ultima usata:
 *   Per first-pass la selezione è random pura tra le 2 coppie ammesse.
 *   L'esclusione della coppia dell'ultima sessione richiede query DB (pattern SART).
 *   Da implementare quando arriverà il refactor SART.
 *
 * TODO lv 14–20:
 *   Congiunzione (colore + forma), estensione GoNogoStimolo con campo forma,
 *   warning cambio meccanica al lv 14 (getGoNogoMechanicWarning).
 *
 * Riferimento: docs/gdd/families/go-nogo.md
 */

import { useRef, useCallback } from "react";
import type {
  GameEngineProps,
  TutorialConfig,
  MicroProgressioneConfig,
} from "@/lib/exercise-types";
import { TrialFlow } from "@/components/esercizi/shared/TrialFlow";
import {
  getGoNogoLevel,
  getGoNogoMechanicWarning,
  MICRO_PROGRESSIONE_GO_NOGO,
  COLORE_CSS_GO_NOGO,
  type CoppiaColore,
} from "./levels";
import { generaPool, type GoNogoStimolo } from "./sequence";
import { GoNogoStimulus, type GoNogoRisposta } from "./GoNogoStimulus";

// ── Demo per il tutorial — usa la coppia attiva runtime ──────────────────────
// Mostra il colore effettivo della sessione, non una coppia canonica fissa.
// GoNogoTaskEngine passa coppiaAttivaRef.current! al momento della costruzione
// del tutorial (dopo lazy init) — il non-null assertion è corretto.

function GoNogoDemo({ tipo, coppia }: { tipo: "go" | "nogo"; coppia: CoppiaColore }) {
  const colore = tipo === "go" ? coppia.go : coppia.nogo;
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-24 h-24 rounded-full"
        style={{ backgroundColor: COLORE_CSS_GO_NOGO[colore] }}
        aria-label={`Cerchio ${colore}`}
      />
      <div className={`px-6 py-3 rounded-xl text-white text-sm font-bold ${
        tipo === "go"
          ? "bg-blue-600 ring-2 ring-green-500"
          : "bg-blue-600 opacity-30"
      }`}>
        {tipo === "go" ? "Tocca" : "NON toccare"}
      </div>
    </div>
  );
}

// ── GoNogoTaskEngine ──────────────────────────────────────────────────────────

export function GoNogoTaskEngine({
  livello,
  tempoScaduto,
  mostraTutorial,
  livelloPrec,
  onReady,
  onComplete,
  onProgress,
}: GameEngineProps) {

  // ── Configurazione livello ──────────────────────────────────────────────

  const config = getGoNogoLevel(livello);

  const microProgressione: MicroProgressioneConfig = {
    valoreBase: config.tLimMs,
    ...MICRO_PROGRESSIONE_GO_NOGO,
  };

  // ── Selezione coppia attiva al mount ────────────────────────────────────
  // Lazy init via useRef: la coppia viene scelta una volta per mount e resta
  // stabile per tutta la sessione. "Gioca ancora" rimonta il componente →
  // nuova selezione random tra le coppieAmmesse del livello.
  // TODO esclusione ultima coppia usata: richiede query DB (pattern SART).

  const coppiaAttivaRef = useRef<CoppiaColore | null>(null);

  if (coppiaAttivaRef.current === null) {
    const coppie = config.coppieAmmesse;
    coppiaAttivaRef.current = coppie[Math.floor(Math.random() * coppie.length)];
  }

  // ── Tutorial (prima sessione) ───────────────────────────────────────────
  // Due pagine: go (cerchio verde, tappa) + nogo (cerchio rosso, non tappare).
  // Max 3 righe di testo per pagina — vincolo docs/gdd/shared/02-trial-flow.md.

  const coppia = coppiaAttivaRef.current!;

  const tutorial: TutorialConfig | null = mostraTutorial
    ? {
        pagine: [
          {
            titolo: `Tocca i cerchi ${coppia.go}`,
            testo: `Quando vedi un cerchio ${coppia.go}, tocca subito il pulsante.`,
            demo: <GoNogoDemo tipo="go" coppia={coppia} />,
          },
          {
            titolo: `NON toccare i cerchi ${coppia.nogo}`,
            testo: `Quando vedi un cerchio ${coppia.nogo}, NON toccare. Aspetta il prossimo.`,
            demo: <GoNogoDemo tipo="nogo" coppia={coppia} />,
          },
        ],
      }
    : null;

  // ── Warning cambio meccanica ────────────────────────────────────────────
  // Ritorna sempre null per lv 1–13 first-pass (TODO lv 14–20).

  const warning = getGoNogoMechanicWarning(livelloPrec, livello);

  // ── Pool di stimoli ─────────────────────────────────────────────────────

  const poolRef = useRef<GoNogoStimolo[]>([]);
  const tailRef = useRef<0 | 1>(0); // solo 0|1 — max 1 nogo consecutivo

  // ── generaStimolo ───────────────────────────────────────────────────────

  const generaStimolo = useCallback(
    (_ctx: { valoreCorrente: number; isBonus: boolean }): GoNogoStimolo => {
      if (poolRef.current.length === 0) {
        // Modello B: pool = sequenceLength esatto del livello (già multiplo di BLOCK_SIZE).
        // Niente buffer +3 come Modello A — TrialFlow termina dopo trialValutativi raggiunti.
        // Refill (safety, non dovrebbe accadere): stessa size per mantenere ratio.
        poolRef.current = generaPool(
          config.sequenceLength,
          coppiaAttivaRef.current!,
          tailRef.current,
        );
      }

      const s = poolRef.current.shift()!;

      // Aggiorna tail tracker. All'esaurimento riflette il tipo dell'ultimo trial estratto,
      // valido per il prossimo refill cross-boundary.
      tailRef.current = (s.tipo === "nogo" ? 1 : 0) as 0 | 1;

      return s;
    },
    [config],
  );

  // ── renderGoNogoStimolo ─────────────────────────────────────────────────
  // GoNogoStimulus non riceve prop config-dependent (a differenza di Stroop
  // che passa coloriAttivi e nOptions) → deps [].

  const renderGoNogoStimolo = useCallback(
    (props: { stimolo: GoNogoStimolo; onRisposta: (r: GoNogoRisposta) => void }) => (
      <GoNogoStimulus
        {...props}
        disabilitato={false}
      />
    ),
    [],
  );

  // ── valutaRisposta ──────────────────────────────────────────────────────
  // Logica invertita vs Stroop/Flanker: il timeout su nogo è CORRETTO
  // (inibizione motoria riuscita), non errore. Differenza paradigmatica
  // fondamentale del Go/No-Go.

  const valutaRisposta = useCallback(
    (stimolo: GoNogoStimolo, risposta: GoNogoRisposta | null): boolean => {
      if (risposta === null) {
        // Timeout: corretto se nogo (inibizione corretta), errore se go (omissione)
        return stimolo.tipo === "nogo";
      }
      // Tap: corretto se go (hit), errore se nogo (commission/false alarm)
      return stimolo.tipo === "go";
    },
    [],
  );

  // ── aggiornaMetriche ────────────────────────────────────────────────────
  // 5 contatori (non 6 come Flanker/Stroop): asimmetria intrinseca al paradigma.
  // I nogo corretti non hanno tap → nessun RT da registrare → no tempo_totale_nogo_ms.

  const aggiornaMetriche = useCallback(
    (
      prev: Record<string, number>,
      stimolo: GoNogoStimolo,
      risposta: GoNogoRisposta | null,
      corretto: boolean,
    ): Record<string, number> => {
      const isGo = stimolo.tipo === "go";
      return {
        ...prev,
        go_totali:          (prev.go_totali   ?? 0) + (isGo  ? 1 : 0),
        nogo_totali:        (prev.nogo_totali ?? 0) + (!isGo ? 1 : 0),
        go_errori:          (prev.go_errori   ?? 0) + (isGo  && !corretto ? 1 : 0),
        nogo_errori:        (prev.nogo_errori ?? 0) + (!isGo && !corretto ? 1 : 0),
        // RT solo su go corretti — i nogo corretti non hanno tap quindi niente RT.
        tempo_totale_go_ms: (prev.tempo_totale_go_ms ?? 0) +
          (isGo && corretto && risposta !== null ? risposta.tempoMs : 0),
      };
    },
    [],
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <TrialFlow<GoNogoStimolo, GoNogoRisposta>
      tLimMs={config.tLimMs}
      trialValutativi={config.sequenceLength}
      microProgressione={microProgressione}
      generaStimolo={generaStimolo}
      renderStimolo={renderGoNogoStimolo}
      valutaRisposta={valutaRisposta}
      tutorial={tutorial}
      warning={warning}
      aggiornaMetriche={aggiornaMetriche}
      feedbackType="error-only"
      isiMs={0}
      tempoScaduto={tempoScaduto}
      onReady={onReady}
      onComplete={onComplete}
      onProgress={onProgress}
    />
  );
}
