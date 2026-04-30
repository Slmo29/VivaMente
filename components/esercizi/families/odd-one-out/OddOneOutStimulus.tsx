"use client";

/**
 * OddOneOutStimulus — componente di rendering passivo per un trial Odd One Out.
 *
 * Riceve un TrialOdd (stimoli + anomaliaIndex + regolaId) e una callback
 * onRisposta. Mostra una griglia di celle tappabili. Misura il tempo di
 * risposta al mount (TrialFlow rimonta il componente ad ogni trial — vedi
 * `TrialFlow.tsx` "INVARIANTE DI RIMONTO" — quindi `useRef(performance.now())`
 * è sempre fresh senza reset esplicito).
 *
 * Layout:
 *   - flex-wrap centrato (era `grid auto-fit`). Numero massimo di colonne
 *     calcolato come `min(4, ceil(sqrt(nStimuli)))` per layout "il più
 *     quadrato possibile" e cap mobile portrait. Le righe incomplete
 *     (es. 5 stimoli = 4+1, 7 = 4+3) sono **centrate automaticamente** —
 *     l'ultima cella delle file dispari non resta allineata a sinistra.
 *   - Tap target ≥ 80×80px (comodità senior 60+).
 *   - Font condizionale: ui-monospace per cifre/lettere singole (alta
 *     leggibilità), system-ui per emoji, sans-serif per parole (legacy).
 *
 * Pulse motorio 60ms al tap (scale 1→1.05→1): conferma di input, non di
 * correttezza. La correttezza è gestita da TrialFlow + feedback overlay
 * (verde/rosso) — coerente con GDD §Feedback risposta standard.
 *
 * Idempotenza:
 *   - `chiamatoRef.current` blocca semanticamente onRisposta dopo il primo tap.
 *   - `disabled={tappedIndex !== null}` blocca visualmente per la durata del
 *     pulse (60ms) — sufficiente per prevenire doppio-tap accidentale.
 *
 * Riferimento: docs/gdd/families/odd-one-out.md §Meccanica core
 *              docs/gdd/shared/05-ui-conventions.md §Esercizi con griglia
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { TrialOdd, StimoloOdd, RispostaOdd } from "./sequence";

// ── Props ─────────────────────────────────────────────────────────────────────

export type OddOneOutStimulusProps = {
  stimolo:    TrialOdd;
  onRisposta: (risposta: RispostaOdd) => void;
};

// ── Costanti ──────────────────────────────────────────────────────────────────

/** Durata pulse motorio della cella tappata (ms). */
const TAP_PULSE_DURATION_MS = 60;
/** Dimensione cella in px (lato fisso, allineato a tap-target ≥80px). */
const CELL_SIZE_PX = 80;
/** Gap tra celle in px. */
const CELL_GAP_PX = 8;
/** Cap colonne max (mobile portrait ~360px usable). */
const MAX_COLS = 4;

// ── Stile celle ───────────────────────────────────────────────────────────────

const styleCellaBase: CSSProperties = {
  backgroundColor: "#FFFFFF",
  border:          "1px solid #E5E7EB",   // gray-200
  borderRadius:    "1rem",                 // rounded-2xl
  padding:         "1rem",
  width:           `${CELL_SIZE_PX}px`,
  height:          `${CELL_SIZE_PX}px`,
  cursor:          "pointer",
  userSelect:      "none",
  display:         "flex",
  alignItems:      "center",
  justifyContent:  "center",
  color:           "#111827",              // gray-900
  flex:            "0 0 auto",             // no shrink, layout fisso
};

function styleCellaPerStimolo(s: StimoloOdd): CSSProperties {
  const tipo = (s.metadata as { tipo?: string }).tipo;
  if (tipo === "numero" || tipo === "lettera") {
    return {
      fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
      fontSize:   "2.5rem",
      fontWeight: 700,
      lineHeight: 1,
    };
  }
  // Emoji: metadata ha `categoria` ma non `tipo`.
  const categoria = (s.metadata as { categoria?: string }).categoria;
  if (categoria !== undefined && tipo === undefined) {
    return {
      fontFamily: 'system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      fontSize:   "3.5rem",
      fontWeight: 400,
      lineHeight: 1,
    };
  }
  // Default: parole (legacy, nessun consumer attivo dopo refactor immagini).
  return {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize:   "1.25rem",
    fontWeight: 600,
    textAlign:  "center",
    lineHeight: 1.2,
  };
}

// ── Componente ────────────────────────────────────────────────────────────────

export function OddOneOutStimulus({ stimolo, onRisposta }: OddOneOutStimulusProps) {
  const startRef = useRef(performance.now());
  const chiamatoRef = useRef(false);
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current !== null) {
        clearTimeout(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  }, []);

  const handleTap = (index: number) => {
    if (chiamatoRef.current) return;
    chiamatoRef.current = true;

    setTappedIndex(index);
    pulseTimerRef.current = setTimeout(
      () => setTappedIndex(null),
      TAP_PULSE_DURATION_MS,
    );

    const tempoMs = performance.now() - startRef.current;
    onRisposta({ tappato: index, tempoMs });
  };

  // Layout dinamico: nColsMax = ceil(sqrt(n)) capato a MAX_COLS.
  // Esempio: n=4 → 2 cols, n=5 → 3 cols, n=9 → 3 cols, n=12 → 4 cols.
  const nStimuli = stimolo.stimoli.length;
  const nColsMax = Math.min(MAX_COLS, Math.max(1, Math.ceil(Math.sqrt(nStimuli))));
  // maxWidth = nCols × CELL + (nCols - 1) × GAP (no gap fantasma).
  const containerMaxWidthPx =
    nColsMax * CELL_SIZE_PX + (nColsMax - 1) * CELL_GAP_PX;

  return (
    <div
      className="w-full flex justify-center"
      style={{ padding: "1rem" }}
    >
      <div
        style={{
          display:        "flex",
          flexWrap:       "wrap",
          justifyContent: "center",
          alignContent:   "center",
          gap:            `${CELL_GAP_PX}px`,
          width:          "100%",
          maxWidth:       `${containerMaxWidthPx}px`,
        }}
        aria-label="Griglia stimoli Odd One Out"
      >
        {stimolo.stimoli.map((s, i) => (
          <button
            key={`${stimolo.regolaId}-${i}-${s.valore}`}
            onClick={() => handleTap(i)}
            disabled={tappedIndex !== null}
            style={{
              ...styleCellaBase,
              ...styleCellaPerStimolo(s),
              transform:  tappedIndex === i ? "scale(1.05)" : "scale(1)",
              transition: "transform 30ms ease-out",
            }}
            aria-label={`Stimolo ${i + 1}: ${s.valore}`}
          >
            {s.valore}
          </button>
        ))}
      </div>
    </div>
  );
}
