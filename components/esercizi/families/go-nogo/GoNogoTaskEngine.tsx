"use client";

/**
 * GoNogoTaskEngine — game engine per la famiglia Go/No-Go Cromatico (Famiglia 12).
 *
 * ## Deroghe GDD (vedi `_deroghe.ts`)
 *
 * 1. **Modello A timer 60s** invece di Modello B (decisione 2026-04-30).
 *    La sessione termina a `tempoScaduto` di pagina, non a count di stimoli.
 *    Conseguenze:
 *      - `trialValutativi = null`.
 *      - Generazione on-demand stimolo-per-stimolo via `generaProssimoStimolo`.
 *      - `getSessionDurationMs` di registry ritorna `GO_NOGO_TIMER_MS`.
 * 2. **N distrattori (No-Go) scalato** da lv 3+ (1→6 colori) invece di sempre
 *    1 vs 1. La coppia GDD-canonical resta usata per Go base (sempre lv 1+)
 *    e per il singolo distrattore lv 1–2.
 * 3. **ISI progressivo** (deroga 2026-04-30): da 400ms (lv 1) a 100ms (lv 12+).
 *    GDD prescrive 0 (flusso continuo). Curva senior-friendly ai livelli bassi.
 * 4. **Feedback "standard"** (deroga 2026-04-30): GDD prescrive "error-only",
 *    deroga per dare conferma positiva sui corretti.
 *
 * ## Comportamento invariato vs precedente versione
 *
 *   - 5 contatori metriche (no `tempo_totale_nogo_ms` — i nogo corretti non hanno tap).
 *   - `valutaRisposta` invertita: timeout su nogo = corretto (inibizione riuscita).
 *   - feedbackType = "error-only".
 *   - Override accuratezza clinica via `onCompleteWrapped` (pattern SART via b).
 *
 * Tutorial differenziato per N distrattori:
 *   - lv 1–2 (n=1): testo binario classico ("NON toccare i cerchi {nogo}").
 *   - lv 3+ (n≥2):  testo multi-distrattore ("Tocca SOLO i cerchi {go},
 *                   ignora tutti gli altri colori").
 *
 * Riferimenti:
 *   docs/gdd/families/go-nogo.md
 *   ./_deroghe.ts
 */

import { useRef, useCallback, useMemo } from "react";
import type {
  GameEngineProps,
  TutorialConfig,
  MicroProgressioneConfig,
  SessionResult,
} from "@/lib/exercise-types";
import { TrialFlow } from "@/components/esercizi/shared/TrialFlow";
import {
  getGoNogoLevel,
  getGoNogoMechanicWarning,
  MICRO_PROGRESSIONE_GO_NOGO,
  COLORE_CSS_GO_NOGO,
  type CoppiaColore,
  type ColoreGoNogo,
} from "./levels";
import {
  creaStreamState,
  generaProssimoStimolo,
  type GoNogoStreamState,
  type GoNogoStimolo,
} from "./sequence";
import { GoNogoStimulus, type GoNogoRisposta } from "./GoNogoStimulus";
import { getNDistrattori, getIsiMs, GO_NOGO_FEEDBACK_TYPE } from "./_deroghe";

// ── Tutti i colori disponibili ───────────────────────────────────────────────

const TUTTI_COLORI: readonly ColoreGoNogo[] = [
  "verde", "rosso", "blu", "arancio",
  "giallo", "viola", "turchese", "azzurro",
];

// ── Helper inline ────────────────────────────────────────────────────────────

/** Pesca `n` elementi univoci dal pool via Fisher-Yates partial. */
function pescaN<T>(pool: readonly T[], n: number, rng: () => number): T[] {
  const arr = [...pool];
  const result: T[] = [];
  for (let i = 0; i < n && i < arr.length; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    result.push(arr[i]);
  }
  return result;
}

/** Sceglie una coppia canonical random tra le ammesse del livello. */
function scegliCoppiaCanonical(
  coppie: readonly CoppiaColore[],
  rng: () => number,
): CoppiaColore {
  return coppie[Math.floor(rng() * coppie.length)];
}

// ── Demo per il tutorial — usa la coppia attiva runtime ──────────────────────

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
  const nDistrattori = getNDistrattori(livello);

  const microProgressione: MicroProgressioneConfig = useMemo(
    () => ({
      valoreBase: config.tLimMs,
      ...MICRO_PROGRESSIONE_GO_NOGO,
    }),
    [config.tLimMs],
  );

  // ── RNG sessione ────────────────────────────────────────────────────────
  const rngRef = useRef<() => number>(Math.random);

  // ── Setup coppia attiva + pool distrattori (lazy init al mount) ──────────

  const coppiaAttivaRef = useRef<CoppiaColore | null>(null);
  const distrattoriRef  = useRef<readonly ColoreGoNogo[] | null>(null);

  if (coppiaAttivaRef.current === null) {
    const coppia = scegliCoppiaCanonical(config.coppieAmmesse, rngRef.current);
    coppiaAttivaRef.current = coppia;

    if (nDistrattori === 1) {
      distrattoriRef.current = [coppia.nogo];
    } else {
      const candidati = TUTTI_COLORI.filter((c) => c !== coppia.go);
      distrattoriRef.current = pescaN(candidati, nDistrattori, rngRef.current);
    }
  }

  // ── Stato stream cumulativo (cap + ratio rolling) ────────────────────────
  const streamStateRef = useRef<GoNogoStreamState>(creaStreamState());

  // ── Tutorial (prima sessione) ───────────────────────────────────────────
  // Pagina nogo differenziata in base a nDistrattori:
  //   n=1 (lv 1-2): testo binario classico (nogo specifico per coppia).
  //   n≥2 (lv 3+): testo multi-distrattore ("ignora altri colori").

  const coppia = coppiaAttivaRef.current!;

  const paginaNogoTitolo = nDistrattori === 1
    ? `NON toccare i cerchi ${coppia.nogo}`
    : `NON toccare i cerchi di altri colori`;

  const paginaNogoTesto = nDistrattori === 1
    ? `Quando vedi un cerchio ${coppia.nogo}, NON toccare. Aspetta il prossimo.`
    : `Da questo livello compaiono cerchi di colori diversi. Tocca SOLO i cerchi ${coppia.go}, ignora tutti gli altri colori.`;

  const tutorial: TutorialConfig | null = mostraTutorial
    ? {
        pagine: [
          {
            titolo: `Tocca i cerchi ${coppia.go}`,
            testo: `Quando vedi un cerchio ${coppia.go}, tocca subito il pulsante.`,
            demo: <GoNogoDemo tipo="go" coppia={coppia} />,
          },
          {
            titolo: paginaNogoTitolo,
            testo: paginaNogoTesto,
            demo: <GoNogoDemo tipo="nogo" coppia={coppia} />,
          },
        ],
      }
    : null;

  // ── Warning cambio meccanica ────────────────────────────────────────────

  const warning = getGoNogoMechanicWarning(livelloPrec, livello);

  // ── generaStimolo (on-demand via state cumulativo) ──────────────────────

  const generaStimolo = useCallback((): GoNogoStimolo => {
    return generaProssimoStimolo(
      streamStateRef.current,
      coppiaAttivaRef.current!,
      distrattoriRef.current!,
      rngRef.current,
    );
  }, []);

  // ── renderGoNogoStimolo ─────────────────────────────────────────────────

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

  const valutaRisposta = useCallback(
    (stimolo: GoNogoStimolo, risposta: GoNogoRisposta | null): boolean => {
      if (risposta === null) {
        return stimolo.tipo === "nogo";
      }
      return stimolo.tipo === "go";
    },
    [],
  );

  // ── aggiornaMetriche ────────────────────────────────────────────────────

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
        tempo_totale_go_ms: (prev.tempo_totale_go_ms ?? 0) +
          (isGo && corretto && risposta !== null ? risposta.tempoMs : 0),
      };
    },
    [],
  );

  // ── onCompleteWrapped — override accuratezza clinica (SART via b) ─────────

  const onCompleteWrapped = useCallback(
    (risultato: SessionResult) => {
      const m = risultato.metriche;
      const totali = (m.go_totali ?? 0) + (m.nogo_totali ?? 0);
      const errori = (m.go_errori ?? 0) + (m.nogo_errori ?? 0);
      const accuratezzaClinica = totali > 0 ? (totali - errori) / totali : 0;

      onComplete({
        ...risultato,
        accuratezzaValutativa: accuratezzaClinica,
        scoreGrezzo:           Math.round(accuratezzaClinica * 100),
      });
    },
    [onComplete],
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <TrialFlow<GoNogoStimolo, GoNogoRisposta>
      tLimMs={config.tLimMs}
      trialValutativi={null}
      microProgressione={microProgressione}
      generaStimolo={generaStimolo}
      renderStimolo={renderGoNogoStimolo}
      valutaRisposta={valutaRisposta}
      tutorial={tutorial}
      warning={warning}
      aggiornaMetriche={aggiornaMetriche}
      feedbackType={GO_NOGO_FEEDBACK_TYPE}
      isiMs={getIsiMs(livello)}
      tempoScaduto={tempoScaduto}
      onReady={onReady}
      onComplete={onCompleteWrapped}
      onProgress={onProgress}
    />
  );
}
