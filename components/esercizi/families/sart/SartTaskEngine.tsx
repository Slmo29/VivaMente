"use client";

/**
 * SartTaskEngine — game engine per la famiglia SART numerico (Famiglia 11).
 *
 * Modello B (sessione a completamento dei blocchi previsti). Un trial = un
 * blocco = sequenza di sequenceLength stimoli scorsa internamente da
 * SartStream. trialValutativi = config.trialsPerSession (2 o 3).
 *
 * Differenze chiave vs GoNogoTaskEngine:
 *   1. TStimulus = SartBlock (blocco aggregato), TResponse = SartBlockEsito.
 *      renderStimolo monta SartStream che vive un blocco intero.
 *   2. tLimMs = null: il T.Lim per-stimolo è dentro SartStream, non a livello
 *      blocco (un blocco dura sempre sequenceLength × soaMs ms).
 *   3. isiMs = 2000: pausa 2s tra blocchi (GDD §Struttura sessione).
 *      NON è il SOA per-stimolo, che vive in SartBlock.soaMs.
 *   4. valutaRisposta = bonus condition GDD letterale (0 commission AND ≥95%
 *      non-target corretti). Stretta perché TrialFlow la usa per attivare
 *      il blocco bonus.
 *   5. accuratezzaValutativa esposta a page.tsx ricalcolata su contatori clinici
 *      grezzi (override via onCompleteWrapped) — la "corretto" di TrialFlow è
 *      semantica diversa, vedi punto 4. Vedi design doc §8 via b.
 *   6. bonusInCorsoRef: esclude blocchi bonus dalle metriche cliniche
 *      (workaround §8 senza modificare TrialFlow).
 *
 * Micro-progressione (GDD §Micro-progressione):
 *   parametro = soaMs (= isiMs GDD), delta -50ms, max -2 step, floor 700ms.
 *   trialsPerSession=2 → streak ≥3 mai raggiunta → bonus inactive by design
 *   lv 15+. Comportamento intenzionale: i parametri base sono già al limite.
 *
 * TODO DB lookup excludeLastUsed (target):
 *   First-pass: scegliTargetSart(null) → random puro 1–9.
 *   Implementazione futura unificata con coppia Go/No-Go (query ultima sessione).
 *
 * Riferimenti:
 *   docs/gdd/families/sart.md
 *   docs/gdd/families/sart-design.md
 *   docs/gdd/shared/02-trial-flow.md (eccezioni SART)
 *   docs/gdd/shared/03-progression.md (micro-progressione)
 */

import { useCallback, useMemo, useRef } from "react";
import type {
  GameEngineProps,
  MicroProgressioneConfig,
  SessionResult,
  TutorialConfig,
} from "@/lib/exercise-types";
import { TrialFlow } from "@/components/esercizi/shared/TrialFlow";
import {
  getSartLevel,
  MICRO_PROGRESSIONE_SART,
  getSartMechanicWarning,
} from "./levels";
import {
  generaSequenzaSart,
  scegliTargetSart,
  type SartBlock,
  type SartBlockEsito,
} from "./sequence";
import { SartStream } from "./SartStream";

// ── Demo statico per il tutorial ──────────────────────────────────────────────
// Mostra 4 cifre [d1, d2, target, d3] con etichette "Tocca" / "NON toccare".
// Statico, no animazione: lo stato adattivo dei numeri reali è troppo veloce
// per essere riprodotto nel demo senza confondere l'utente. Coerenza UX:
// il target effettivo della sessione viene mostrato nel demo
// (lesson learned Fix #1 Go/No-Go).

function chooseDemoDigits(target: number): [number, number, number] {
  const pool: number[] = [];
  for (let d = 1; d <= 9; d++) if (d !== target) pool.push(d);
  // Scelta deterministica: prime 3 cifre disponibili. Niente RNG nel demo
  // per riproducibilità visiva tra sessioni.
  return [pool[0], pool[1], pool[2]];
}

function SartDemo({ target }: { target: number }) {
  const [d1, d2, d3] = chooseDemoDigits(target);
  const sequenza: Array<{ cifra: number; tocca: boolean }> = [
    { cifra: d1,     tocca: true  },
    { cifra: d2,     tocca: true  },
    { cifra: target, tocca: false },
    { cifra: d3,     tocca: true  },
  ];
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {sequenza.map((s, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 flex items-center justify-center rounded-xl bg-white border-2"
            style={{
              borderColor: s.tocca ? "#16A34A" : "#DC2626",
              fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
              fontSize:    "2rem",
              fontWeight:  700,
              color:       "#111827",
            }}
            aria-label={`Cifra ${s.cifra}`}
          >
            {s.cifra}
          </div>
          <span
            className="text-xs font-bold"
            style={{ color: s.tocca ? "#16A34A" : "#DC2626" }}
          >
            {s.tocca ? "Tocca" : "NON toccare"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── SartTaskEngine ────────────────────────────────────────────────────────────

export function SartTaskEngine({
  livello,
  tempoScaduto,
  mostraTutorial,
  livelloPrec,
  onReady,
  onComplete,
  onProgress,
}: GameEngineProps) {

  // ── Configurazione livello ─────────────────────────────────────────────────

  const config = getSartLevel(livello);

  // ── Selezione target al mount ──────────────────────────────────────────────
  // Lazy init in body component: idempotente sotto StrictMode (double-invoke
  // del render in dev). La guard === null garantisce che la seconda esecuzione
  // non sovrascriva il target già scelto. Pattern allineato a coppiaAttivaRef
  // in GoNogoTaskEngine.tsx.
  // TODO DB lookup excludeLastUsed: query ultima sessione (user_id, esercizio_id)
  // per estrarre il target precedente. Unificato con la coppia Go/No-Go.

  const targetRef = useRef<number | null>(null);
  if (targetRef.current === null) {
    targetRef.current = scegliTargetSart(null);
  }
  const target = targetRef.current;

  // ── Micro-progressione ─────────────────────────────────────────────────────
  // valoreBase iniettato a runtime (= config.isiMs). Inattiva ai lv 15–20:
  // trialsPerSession=2 → streak di 3 consecutivi corretti non raggiungibile.
  // Comportamento by design (vedi head comment + design doc §8).

  const microProgressione: MicroProgressioneConfig = useMemo(
    () => ({ valoreBase: config.isiMs, ...MICRO_PROGRESSIONE_SART }),
    [config.isiMs],
  );

  // ── Tutorial (prima sessione) ──────────────────────────────────────────────
  // Una sola pagina con testo + demo statico inline. Limite 3 righe di testo.

  const tutorial: TutorialConfig | null = mostraTutorial
    ? {
        pagine: [
          {
            titolo: `Tocca tutti i numeri TRANNE il ${target}`,
            testo:
              `Vedrai una serie di numeri uno alla volta. Tocca lo schermo quando ` +
              `appare un numero diverso da ${target}. Quando appare ${target}, NON ` +
              `toccare. Rispondi il più velocemente possibile.`,
            demo: <SartDemo target={target} />,
          },
        ],
      }
    : null;

  // ── Warning cambio meccanica ───────────────────────────────────────────────
  // Bidirezionale: scatta su promozione lv 9→10 (intro masking) e su
  // retrocessione lv 10→9 (rimozione masking). Vedi levels.ts.

  const warning = useMemo(
    () => getSartMechanicWarning(livelloPrec, livello),
    [livelloPrec, livello],
  );

  // ── bonusInCorsoRef ────────────────────────────────────────────────────────
  // Ref per escludere i blocchi bonus dalle metriche cliniche (GDD
  // bonusCountsForAccuracy: false). Settato in generaStimolo (ctx.isBonus
  // disponibile), letto in aggiornaMetriche. Workaround senza modificare
  // TrialFlow — vedi design doc §8 via b.

  const bonusInCorsoRef = useRef<boolean>(false);

  // ── generaStimolo ──────────────────────────────────────────────────────────

  const generaStimolo = useCallback(
    (ctx: { valoreCorrente: number; isBonus: boolean }): SartBlock => {
      bonusInCorsoRef.current = ctx.isBonus;
      const sequenza = generaSequenzaSart(
        config.sequenceLength,
        config.targetFrequency,
        target,
      );
      return {
        sequenza,
        target,
        // soaMs = valoreCorrente: per blocchi valutativi = config.isiMs,
        // per blocchi bonus = config.isiMs + bonusLevel × (-50), con floor 700.
        soaMs:     ctx.valoreCorrente,
        maskingMs: config.maskingMs,
      };
    },
    [config.sequenceLength, config.targetFrequency, config.maskingMs, target],
  );

  // ── valutaRisposta ─────────────────────────────────────────────────────────
  // Bonus condition GDD letterale: 0 commission AND ≥95% non-target corretti.
  // TrialFlow usa il booleano restituito per la streak consecutiviCorretti
  // → attivazione blocco bonus.
  //
  // Per l'accuratezza CLINICA esposta a page.tsx vedi onCompleteWrapped: lì
  // ricalcoliamo dai contatori grezzi con soglia clinicamente sensata.
  //
  // risposta === null per timeout di TrialFlow: in SART tLimMs=null quindi
  // non accade, ma gestiamo defensively (corretto = false).

  const valutaRisposta = useCallback(
    (_stimolo: SartBlock, risposta: SartBlockEsito | null): boolean => {
      if (risposta === null) return false;
      const omissionRate =
        risposta.nontargetTotali > 0
          ? risposta.omissionErrori / risposta.nontargetTotali
          : 0;
      return risposta.commissionErrori === 0 && omissionRate <= 0.05;
    },
    [],
  );

  // ── aggiornaMetriche ───────────────────────────────────────────────────────
  // 5 contatori grezzi cumulativi sui blocchi VALUTATIVI (esclude bonus).
  // I rate clinici (commission_error_rate, omission_error_rate) sono derivati
  // lato analytics da contatori e totali — niente divisioni con denominatore
  // 0 a runtime nei livelli a target frequency bassa.

  const aggiornaMetriche = useCallback(
    (
      precedenti: Record<string, number>,
      _stimolo: SartBlock,
      risposta: SartBlockEsito | null,
      _corretto: boolean,
    ): Record<string, number> => {
      // Escludi blocchi bonus dai contatori clinici (workaround §8 via b).
      if (bonusInCorsoRef.current) return precedenti;
      // risposta null (timeout TrialFlow) — non accade in SART (tLimMs=null);
      // defensively non aggiornare i contatori.
      if (risposta === null) return precedenti;

      return {
        ...precedenti,
        commission_errori:
          (precedenti.commission_errori ?? 0) + risposta.commissionErrori,
        omission_errori:
          (precedenti.omission_errori ?? 0) + risposta.omissionErrori,
        target_totali:
          (precedenti.target_totali ?? 0) + risposta.targetTotali,
        nontarget_totali:
          (precedenti.nontarget_totali ?? 0) + risposta.nontargetTotali,
        tempo_totale_nontarget_ms:
          (precedenti.tempo_totale_nontarget_ms ?? 0) + risposta.tempoTotaleNontargetMs,
      };
    },
    [],
  );

  // ── renderStimolo ──────────────────────────────────────────────────────────
  // Function-as-component (pattern Go/No-Go). TrialFlow.renderStimolo è
  // tipizzato React.ComponentType<{stimolo, onRisposta}> — qui forniamo
  // direttamente il componente di rendering del blocco.

  const renderStimolo = useCallback(
    (props: {
      stimolo: SartBlock;
      onRisposta: (esito: SartBlockEsito) => void;
    }) => <SartStream stimolo={props.stimolo} onRisposta={props.onRisposta} />,
    [],
  );

  // ── onCompleteWrapped — override accuratezza clinica (B1 via b) ───────────
  // SART deroga vs Stroop/Flanker/Go/No-Go (che usano l'accuratezza calcolata
  // da TrialFlow = trialValutativiCorretti/Completati). Ragione: il "trial
  // corretto" di TrialFlow per SART è la bonus condition GDD (commission=0
  // AND omission≤5%), troppo stretta per la promozione clinica — un blocco
  // con 1 commission su 10 target è ancora una buona performance per un senior.
  // Qui ricalcoliamo l'accuratezza sui contatori grezzi (esclusi blocchi
  // bonus via aggiornaMetriche). Vedi design doc §8 via b.

  const onCompleteWrapped = useCallback(
    (risultato: SessionResult) => {
      const m = risultato.metriche;
      const denom = (m.target_totali ?? 0) + (m.nontarget_totali ?? 0);
      const errori = (m.commission_errori ?? 0) + (m.omission_errori ?? 0);
      const accuratezzaClinica = denom > 0 ? (denom - errori) / denom : 0;

      onComplete({
        ...risultato,
        accuratezzaValutativa: accuratezzaClinica,
        scoreGrezzo:           Math.round(accuratezzaClinica * 100),
      });
    },
    [onComplete],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <TrialFlow<SartBlock, SartBlockEsito>
      tLimMs={null}
      trialValutativi={config.trialsPerSession}
      microProgressione={microProgressione}
      generaStimolo={generaStimolo}
      renderStimolo={renderStimolo}
      valutaRisposta={valutaRisposta}
      aggiornaMetriche={aggiornaMetriche}
      tutorial={tutorial}
      warning={warning}
      feedbackType="error-only"
      isiMs={2000}
      tempoScaduto={tempoScaduto}
      onReady={onReady}
      onComplete={onCompleteWrapped}
      onProgress={onProgress}
    />
  );
}
