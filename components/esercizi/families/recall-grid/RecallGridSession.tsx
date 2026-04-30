"use client";

/**
 * RecallGridSession — mini-engine top-level di una sessione Recall Grid.
 *
 * Orchestra il flusso 3-fasi:
 *   1. encoding   → RecallGridGriglia read-only con stimoli pre-posizionati,
 *                   per stimolo.exposureMs.
 *   2. delay      → render del componente iniettato (`delayComponent`):
 *                   - MBT: countdown timer.
 *                   - MLT: BouncingBall (palla rimbalzante shared).
 *                   Il componente DEVE chiamare `onCompleto` al termine.
 *   3. retrieval  → RecallGridGriglia interattiva (drag/tap per posizionare),
 *                   bottone "Conferma" + timer opzionale (T.Lim retrieval).
 *
 * Idempotenza completamento via `completatoRef`. Cleanup completo timer su
 * unmount (TrialFlow rimonta il componente al prossimo trial).
 *
 * `tempoScaduto` (Modello A): se la pagina invia tempoScaduto=true durante
 * encoding/delay/retrieval, la sessione viene chiusa con i posizionamenti
 * correnti (anche vuoti). Coerente con il pattern Modello A delle altre
 * famiglie (Stroop, Flanker).
 *
 * Pattern allineato a MemoriaProspetticaSession (mini-engine per fasi
 * sequenziali, delay component iniettato dall'Engine genitore per
 * disaccoppiare MBT/MLT).
 *
 * Riferimento: docs/gdd/families/recall-grid.md §Meccanica core (riga 6)
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  TrialRecallGrid,
  RispostaRecallGrid,
  PosizionamentoUtente,
} from "./sequence";
import { RecallGridGriglia } from "./RecallGridGriglia";

// ── Props ─────────────────────────────────────────────────────────────────────

export type RecallGridSessionProps = {
  /** Trial pre-generato (MBT o MLT, discriminato da .isMlt). */
  stimolo: TrialRecallGrid;
  /** Callback chiamata UNA SOLA VOLTA al termine con esito aggregato. */
  onRisposta: (esito: RispostaRecallGrid) => void;
  /**
   * Componente da renderizzare durante la fase delay. L'Engine genitore lo
   * inietta come render-function (riceve `onCompleto`):
   *   - MBT: countdown timer che chiama onCompleto a stimolo.delayMs scaduto.
   *   - MLT: BouncingBall durataMs={stimolo.delayMs} onCompleto={...} ...
   *
   * IMPORTANTE: il componente deve chiamare `onCompleto` UNA SOLA VOLTA
   * al termine del delay.
   */
  delayComponent: (props: { onCompleto: () => void }) => ReactNode;
  /**
   * True quando il timer di sessione della pagina è scaduto (Modello A).
   * Forza il completamento della sessione in qualsiasi fase ≠ "completata"
   * con i posizionamenti correnti (eventualmente vuoti). Per Modello B
   * (MLT) la prop è sempre false e il path tempoScaduto resta dormiente.
   */
  tempoScaduto: boolean;
};

// ── Tipi interni ─────────────────────────────────────────────────────────────

type FasePhase = "encoding" | "delay" | "retrieval" | "completata";

// ── RecallGridSession ────────────────────────────────────────────────────────

export function RecallGridSession({
  stimolo,
  onRisposta,
  delayComponent,
  tempoScaduto,
}: RecallGridSessionProps) {

  // ── State ──────────────────────────────────────────────────────────────────
  const [fase, setFase] = useState<FasePhase>("encoding");
  const [posizionamenti, setPosizionamenti] = useState<PosizionamentoUtente[]>([]);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const startRetrievalAtRef = useRef<number>(0);
  const completatoRef       = useRef<boolean>(false);
  const timersRef           = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  // ── Cleanup unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  // ── completaSessione (idempotente) ─────────────────────────────────────────

  const completaSessione = useCallback(() => {
    if (completatoRef.current) return;
    completatoRef.current = true;
    setFase("completata");

    const tempoReproMs = startRetrievalAtRef.current === 0
      ? 0
      : Math.max(0, performance.now() - startRetrievalAtRef.current);

    const esito: RispostaRecallGrid = {
      posizioni: posizionamenti,
      tempoReproMs,
    };
    onRisposta(esito);
  }, [posizionamenti, onRisposta]);

  // ── handleDelayCompleto (transizione delay → retrieval) ────────────────────

  const handleDelayCompleto = useCallback(() => {
    if (fase !== "delay") return; // safety: ignora chiamate fuori fase
    startRetrievalAtRef.current = performance.now();
    setFase("retrieval");
  }, [fase]);

  // ── Effect: encoding → delay (mount-only) ─────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => setFase("delay"), stimolo.exposureMs);
    timersRef.current.push(id);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Effect: retrieval T.Lim ────────────────────────────────────────────────
  useEffect(() => {
    if (fase !== "retrieval" || stimolo.tLimReproMs === null) return;
    const id = setTimeout(() => completaSessione(), stimolo.tLimReproMs);
    timersRef.current.push(id);
    return () => clearTimeout(id);
  }, [fase, stimolo.tLimReproMs, completaSessione]);

  // ── Effect: tempoScaduto (Modello A timer pagina) ──────────────────────────
  // Forza il completamento in qualsiasi fase ≠ "completata" con i
  // posizionamenti correnti. Path dormiente per Modello B (MLT,
  // tempoScaduto sempre false).
  useEffect(() => {
    if (tempoScaduto && fase !== "completata") {
      completaSessione();
    }
  }, [tempoScaduto, fase, completaSessione]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (fase === "completata") return null;

  if (fase === "encoding") {
    return (
      <div
        className="flex flex-col gap-4 w-full px-4 py-4 items-center"
        aria-label="Fase memorizzazione"
      >
        <RecallGridGriglia
          gridSize={stimolo.gridSize}
          stimuli={stimolo.stimuli}
          modalita="encoding"
        />
      </div>
    );
  }

  if (fase === "delay") {
    return (
      <div
        className="flex flex-col w-full px-4 py-4"
        aria-label="Fase pausa"
      >
        {delayComponent({ onCompleto: handleDelayCompleto })}
      </div>
    );
  }

  // fase === "retrieval"
  const possoConfermare = posizionamenti.length > 0;
  return (
    <div
      className="flex flex-col gap-4 w-full px-4 py-4 items-center"
      aria-label="Fase riposizionamento"
    >
      <RecallGridGriglia
        gridSize={stimolo.gridSize}
        stimuli={stimolo.stimuli}
        modalita="retrieval"
        posizionamenti={posizionamenti}
        onPosizionamentoChange={setPosizionamenti}
      />
      <button
        onClick={completaSessione}
        disabled={!possoConfermare}
        style={{
          padding:         "1rem",
          borderRadius:    "1rem",
          border:          "1px solid #16A34A",
          backgroundColor: possoConfermare ? "#16A34A" : "#F3F4F6",
          color:           possoConfermare ? "#FFFFFF" : "#9CA3AF",
          fontSize:        "1.25rem",
          fontWeight:      700,
          width:           "100%",
          maxWidth:        "20rem",
          cursor:          possoConfermare ? "pointer" : "not-allowed",
        }}
        aria-label="Conferma posizionamenti"
      >
        Conferma
      </button>
    </div>
  );
}
