"use client";

/**
 * GoNogoStimulus — componente di rendering per un singolo trial Go/No-Go cromatico.
 *
 * Responsabilità: mostrare il cerchio colorato e catturare il tap.
 * Lo stesso componente renderizza sia stimoli go (tappare) sia stimoli nogo (NON tappare).
 * La distinzione la fa l'engine via valutaRisposta sul tipo dello stimolo.
 *
 * INVARIANTE DI RIMONTO: TrialFlow rimonta questo componente ad ogni trial.
 * startRef inizializzato a performance.now() al mount = inizio del trial.
 *
 * Il bottone "Tocca" è presente SEMPRE, indipendentemente dal tipo go/nogo.
 * È l'utente che decide se tappare in base al colore del cerchio.
 *
 * Pulse motorio JS-driven (deroga 2026-04-30): al tap il bottone fa scale
 * 1 → 1.05 → 1 in 80ms. Lo stato `tapPulse` controlla il transform inline.
 * Il `active:scale-95` Tailwind resta come feedback durante il press
 * (additivo), ma scompare al rilascio prima che l'utente possa percepirlo;
 * il pulse JS post-tap garantisce conferma motoria visibile.
 *
 * Forma stimolo: cerchio fisso (lv 1-13). Lv 14-20 (congiunzione) richiederà
 * estensione con prop `forma: "cerchio" | "quadrato" | "triangolo" | "stella"`.
 */

import { useRef, useCallback, useState, useEffect } from "react";
import { COLORE_CSS_GO_NOGO } from "./levels";
import type { GoNogoStimolo } from "./sequence";

// ── Tipo risposta (esportato — usato da GoNogoTaskEngine) ─────────────────────

export interface GoNogoRisposta {
  tempoMs: number;
}

// ── Costanti ─────────────────────────────────────────────────────────────────

/** Durata pulse motorio post-tap in ms. */
const TAP_PULSE_DURATION_MS = 80;

// ── Props ─────────────────────────────────────────────────────────────────────

interface GoNogoStimulusProps {
  stimolo:      GoNogoStimolo;
  onRisposta(risposta: GoNogoRisposta): void;
  disabilitato: boolean;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function GoNogoStimulus({
  stimolo,
  onRisposta,
  disabilitato,
}: GoNogoStimulusProps) {

  // startRef inizializzato al mount — inizio del trial.
  const startRef = useRef(performance.now());

  // Pulse motorio.
  const [tapPulse, setTapPulse] = useState(false);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer su unmount (TrialFlow rimonta ad ogni trial).
  useEffect(() => {
    return () => {
      if (pulseTimerRef.current !== null) {
        clearTimeout(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  }, []);

  const onTap = useCallback(() => {
    if (disabilitato) return;
    // Attiva pulse: scale 1.05 per TAP_PULSE_DURATION_MS, poi reset.
    setTapPulse(true);
    if (pulseTimerRef.current !== null) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(
      () => setTapPulse(false),
      TAP_PULSE_DURATION_MS,
    );
    onRisposta({ tempoMs: performance.now() - startRef.current });
  }, [disabilitato, onRisposta]);

  return (
    <div
      className="flex flex-col items-center gap-12 py-8 px-4 select-none"
      style={{ touchAction: "manipulation" }}
    >
      {/* Cerchio stimolo — 160px, colore determinato dalla coppia go/nogo attiva */}
      <div
        className="w-40 h-40 rounded-full"
        style={{ backgroundColor: COLORE_CSS_GO_NOGO[stimolo.colore] }}
        aria-label={`Stimolo colore ${stimolo.colore}`}
      />

      {/* Bottone tap — unico target, bg neutro per non confondersi col colore stimolo.
          Pulse JS-driven post-tap (scale 1→1.05→1 in 80ms) + active:scale-95 nativo. */}
      <button
        onClick={onTap}
        disabled={disabilitato}
        aria-label="Tocca"
        style={{
          transform: tapPulse ? "scale(1.05)" : "scale(1)",
          transition: "transform 40ms ease-out",
        }}
        className="w-full max-w-md min-h-[80px] rounded-2xl bg-blue-600 text-white text-xl font-bold active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
      >
        Tocca
      </button>
    </div>
  );
}
