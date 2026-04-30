"use client";

/**
 * QwertyInput — tastiera virtuale italiana shared.
 *
 * Componente controlled per input di parole. Visualizza il valore corrente
 * + tastiera 3 righe layout QWERTY italiano + tasti speciali (backspace
 * sinistra, apostrofo, invio destra).
 *
 * Caratteristiche first-pass:
 *   - Solo lettere lowercase + apostrofo. Niente accenti grafici (l'NVdB
 *     filtrato per le famiglie consumer li esclude per costruzione).
 *   - Niente auto-suggest. Tastiera "dumb input".
 *   - Tap-target ≥48px (Apple HIG / Material).
 *   - aria-label sui tasti per accessibilità.
 *
 * Consumer attuali e futuri:
 *   - NON usata in Recall Grid (vedi Domanda GDD #1: tray con parole
 *     memorizzate è preferito a produzione lessicale via QWERTY).
 *   - Memoria Lista Parole Rievocazione (Famiglia 9, futuro).
 *   - Hayling Game (Famiglia 5, futuro).
 *   - Word Chain (futuro).
 *
 * Riferimento: docs/gdd/shared/05-ui-conventions.md §QWERTY input (riga 29)
 */

import { useCallback, type CSSProperties } from "react";
import {
  RIGA_1,
  RIGA_2,
  RIGA_3,
  MAX_LUNGHEZZA_DEFAULT,
  TASTO_HEIGHT_PX,
  TASTO_FONT_SIZE_REM,
  TASTO_BG,
  TASTO_BORDER,
  TASTO_INVIO_BG,
  TASTO_INVIO_TXT,
  TASTO_BACKSPACE_BG,
} from "./costanti";

// ── Props ─────────────────────────────────────────────────────────────────────

export type QwertyInputProps = {
  /** Valore corrente (controlled). */
  valore: string;
  /** Callback ad ogni modifica (lettera/apostrofo/backspace). */
  onCambiaValore: (nuovo: string) => void;
  /** Callback al tap di INVIO (verde). */
  onInvio: () => void;
  /** Disabled durante feedback/transizioni. Default false. */
  disabilitato?: boolean;
  /** Lunghezza massima della parola. Default MAX_LUNGHEZZA_DEFAULT (8). */
  maxLunghezza?: number;
  /** Placeholder mostrato nel display quando valore vuoto. */
  placeholder?: string;
};

// ── Stili helper ──────────────────────────────────────────────────────────────

const tastoBaseStyle: CSSProperties = {
  flex:           "1 1 0",
  minWidth:       0,
  height:         `${TASTO_HEIGHT_PX}px`,
  fontSize:       `${TASTO_FONT_SIZE_REM}rem`,
  fontWeight:     600,
  borderRadius:   "0.5rem",
  border:         `1px solid ${TASTO_BORDER}`,
  backgroundColor: TASTO_BG,
  color:          "#111827",
  cursor:         "pointer",
  userSelect:     "none",
  touchAction:    "manipulation",
};

const displayStyle: CSSProperties = {
  width:           "100%",
  minHeight:       "3rem",
  padding:         "0.75rem",
  borderRadius:    "0.5rem",
  border:          `1px solid ${TASTO_BORDER}`,
  backgroundColor: "#FFFFFF",
  fontFamily:      'ui-monospace, "JetBrains Mono", monospace',
  fontSize:        "1.5rem",
  fontWeight:      700,
  color:           "#111827",
  letterSpacing:   "0.05em",
  textAlign:       "center",
};

// ── Componenti tasto inline ──────────────────────────────────────────────────

function Tasto({
  lettera,
  onClick,
  disabilitato,
}: {
  lettera: string;
  onClick: (l: string) => void;
  disabilitato: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(lettera)}
      disabled={disabilitato}
      aria-label={lettera === "'" ? "apostrofo" : `lettera ${lettera}`}
      style={tastoBaseStyle}
    >
      {lettera}
    </button>
  );
}

function TastoSpeciale({
  tipo,
  onClick,
  disabilitato,
}: {
  tipo: "backspace" | "invio";
  onClick: () => void;
  disabilitato: boolean;
}) {
  const isInvio = tipo === "invio";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabilitato}
      aria-label={isInvio ? "Invio" : "Cancella ultima lettera"}
      style={{
        ...tastoBaseStyle,
        flex:            "1.5 1 0",
        backgroundColor: isInvio ? TASTO_INVIO_BG : TASTO_BACKSPACE_BG,
        color:           isInvio ? TASTO_INVIO_TXT : "#111827",
        fontWeight:      700,
      }}
    >
      {isInvio ? "Invio" : "←"}
    </button>
  );
}

// ── Componente principale ────────────────────────────────────────────────────

export function QwertyInput({
  valore,
  onCambiaValore,
  onInvio,
  disabilitato = false,
  maxLunghezza = MAX_LUNGHEZZA_DEFAULT,
  placeholder = "",
}: QwertyInputProps) {

  const handleLettera = useCallback(
    (lettera: string) => {
      if (valore.length < maxLunghezza) {
        onCambiaValore(valore + lettera);
      }
    },
    [valore, maxLunghezza, onCambiaValore],
  );

  const handleBackspace = useCallback(() => {
    if (valore.length > 0) {
      onCambiaValore(valore.slice(0, -1));
    }
  }, [valore, onCambiaValore]);

  const containerStyle: CSSProperties = {
    width:        "100%",
    opacity:      disabilitato ? 0.5 : 1,
    pointerEvents: disabilitato ? "none" : "auto",
  };

  return (
    <div className="flex flex-col gap-2 w-full" style={containerStyle}>
      {/* Display valore */}
      <div style={displayStyle} aria-live="polite">
        {valore.length > 0
          ? valore
          : <span style={{ color: "#9CA3AF" }}>{placeholder}</span>}
      </div>

      {/* Riga 1: 10 lettere */}
      <div className="flex gap-1 justify-center w-full">
        {RIGA_1.map((l) => (
          <Tasto key={l} lettera={l} onClick={handleLettera} disabilitato={disabilitato} />
        ))}
      </div>

      {/* Riga 2: 9 lettere */}
      <div className="flex gap-1 justify-center w-full">
        {RIGA_2.map((l) => (
          <Tasto key={l} lettera={l} onClick={handleLettera} disabilitato={disabilitato} />
        ))}
      </div>

      {/* Riga 3: backspace + 7 lettere + apostrofo + invio */}
      <div className="flex gap-1 justify-center w-full">
        <TastoSpeciale tipo="backspace" onClick={handleBackspace} disabilitato={disabilitato} />
        {RIGA_3.map((l) => (
          <Tasto key={l} lettera={l} onClick={handleLettera} disabilitato={disabilitato} />
        ))}
        <Tasto lettera="'" onClick={handleLettera} disabilitato={disabilitato} />
        <TastoSpeciale tipo="invio" onClick={onInvio} disabilitato={disabilitato} />
      </div>
    </div>
  );
}
