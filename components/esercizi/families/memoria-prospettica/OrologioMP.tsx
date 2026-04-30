"use client";

/**
 * OrologioMP — orologio passivo per Memoria Prospettica time-based.
 *
 * Renderizza il tempo trascorso da `startedAtMs` (= momento di inizio
 * Fase 2 della sessione) con visibilità modulata da `visibility`:
 *
 *   - "piena":   formato mm:ss sempre visibile, refresh ogni 1000ms.
 *   - "ridotta": formato `N min` visibile per 2s ogni 30s. Il render
 *                mantiene un placeholder invisibile della stessa
 *                dimensione nei 28s nascosti, per evitare layout shift.
 *   - "assente": ritorna null (nessun rendering, nessun timer).
 *
 * Il componente NON gestisce la logica delle finestre temporali — è
 * puramente di display. Il mini-engine MemoriaProspetticaSession
 * traccia internamente gli intervalli e valuta i tap "Ricordami".
 *
 * Riferimento: docs/gdd/families/memoria-prospettica.md §Definizione
 *              visibilità orologio (riga 128).
 */

import { useEffect, useState } from "react";
import type { ClockVisibility } from "./levels";

// ── Props ─────────────────────────────────────────────────────────────────────

export type OrologioMPProps = {
  /** Timestamp ms di inizio Fase 2 (= performance.now() al mount session). */
  startedAtMs: number;
  /** Visibilità: "piena" sempre, "ridotta" intermittente, "assente" no render. */
  visibility: ClockVisibility;
};

// ── Costanti ──────────────────────────────────────────────────────────────────

/** Refresh interval in ms — più rapido per "ridotta" (timing 2s/30s preciso). */
const TICK_MS_PIENA   = 1000;
const TICK_MS_RIDOTTA = 250;

/** Durata del ciclo intermittente in secondi (ridotta). */
const CICLO_RIDOTTA_S = 30;
/** Durata visibilità all'interno del ciclo (ultimi 2s del ciclo da 30s). */
const VISIBILE_RIDOTTA_S = 2;

// ── Helper formattazione ──────────────────────────────────────────────────────

function formatMMSS(elapsedMs: number): string {
  const totSec = Math.max(0, Math.floor(elapsedMs / 1000));
  const m = Math.floor(totSec / 60);
  const s = totSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatMin(elapsedMs: number): string {
  const m = Math.max(0, Math.floor(elapsedMs / 60000));
  return `${m} min`;
}

// ── Stile box ────────────────────────────────────────────────────────────────

const styleBox: React.CSSProperties = {
  padding:         "0.5rem 1rem",
  backgroundColor: "#F3F4F6",   // gray-100
  border:          "1px solid #E5E7EB",
  borderRadius:    "0.5rem",
  fontFamily:      'ui-monospace, "JetBrains Mono", monospace',
  fontSize:        "1.5rem",
  fontWeight:      700,
  color:           "#111827",
  display:         "inline-block",
  textAlign:       "center",
  minWidth:        "5rem",
};

// ── Componente ────────────────────────────────────────────────────────────────

export function OrologioMP({ startedAtMs, visibility }: OrologioMPProps) {
  const [now, setNow] = useState<number>(() => performance.now());

  useEffect(() => {
    if (visibility === "assente") return;
    const tickMs = visibility === "piena" ? TICK_MS_PIENA : TICK_MS_RIDOTTA;
    const id = setInterval(() => setNow(performance.now()), tickMs);
    return () => clearInterval(id);
  }, [visibility]);

  if (visibility === "assente") return null;

  const elapsedMs = Math.max(0, now - startedAtMs);

  if (visibility === "piena") {
    return (
      <div style={styleBox} aria-label={`Tempo trascorso ${formatMMSS(elapsedMs)}`}>
        {formatMMSS(elapsedMs)}
      </div>
    );
  }

  // visibility === "ridotta": visibile gli ultimi VISIBILE_RIDOTTA_S del ciclo.
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const cycleSec   = elapsedSec % CICLO_RIDOTTA_S;
  const visibileOra = cycleSec >= (CICLO_RIDOTTA_S - VISIBILE_RIDOTTA_S);

  if (visibileOra) {
    return (
      <div style={styleBox} aria-label={`Tempo trascorso ${formatMin(elapsedMs)}`}>
        {formatMin(elapsedMs)}
      </div>
    );
  }

  // Placeholder invisibile della stessa dimensione (no layout shift).
  return (
    <div
      style={{ ...styleBox, visibility: "hidden" }}
      aria-hidden="true"
    >
      0 min
    </div>
  );
}
