"use client";

/**
 * SynonymAntonymSession — UI per un singolo trial Synonym/Antonym Decision.
 *
 * Mostra la parola target (in alto) e la probe (in basso), con 3 pulsanti
 * di risposta. Gestisce internamente il T.Lim.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { StimoloSA } from "./sequence";
import type { SARelazione } from "./word-pools";

type Props = {
  stimolo:    StimoloSA;
  onRisposta: (r: SARelazione | null) => void;
};

const BUTTONS: { label: string; valore: SARelazione }[] = [
  { label: "Sinonimo",      valore: "sinonimo" },
  { label: "Contrario",     valore: "contrario" },
  { label: "Non correlato", valore: "non_correlato" },
];

// ── Componente ─────────────────────────────────────────────────────────────────

export function SynonymAntonymSession({ stimolo, onRisposta }: Props) {
  const [progressPct, setProgressPct] = useState(100);
  const [submitted,   setSubmitted]   = useState(false);
  const [scelta,      setScelta]       = useState<SARelazione | null>(null);

  const startMsRef = useRef(Date.now());
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const tlimRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submRef    = useRef(false);

  const submit = useCallback((valore: SARelazione | null) => {
    if (submRef.current) return;
    submRef.current = true;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (tlimRef.current)  clearTimeout(tlimRef.current);
    onRisposta(valore);
  }, [onRisposta]);

  // Reset e avvio timer su cambio stimolo
  useEffect(() => {
    submRef.current  = false;
    setSubmitted(false);
    setScelta(null);
    setProgressPct(100);
    startMsRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startMsRef.current;
      const pct = Math.max(0, 100 - (elapsed / stimolo.tLimMs) * 100);
      setProgressPct(pct);
    }, 50);

    tlimRef.current = setTimeout(() => {
      setProgressPct(0);
      submit(null);
    }, stimolo.tLimMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (tlimRef.current)  clearTimeout(tlimRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stimolo]);

  const handleTap = useCallback((valore: SARelazione) => {
    if (submitted) return;
    setScelta(valore);
    submit(valore);
  }, [submitted, submit]);

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">

      {/* Barra T.Lim */}
      <div
        style={{
          width: "100%",
          height: 6,
          backgroundColor: "#E5E7EB",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: "100%",
            backgroundColor: progressPct > 30 ? "#3B82F6" : "#EF4444",
            borderRadius: 3,
            transition: "width 50ms linear, background-color 200ms",
          }}
        />
      </div>

      {/* Parole target + probe */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Target */}
        <div
          style={{
            width: "100%",
            padding: "1.2rem",
            borderRadius: "1rem",
            backgroundColor: "#EFF6FF",
            border: "2px solid #BFDBFE",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.7rem", color: "#60A5FA", fontWeight: 600, marginBottom: 4, letterSpacing: "0.05em" }}>
            PAROLA
          </p>
          <p style={{ fontSize: "1.7rem", fontWeight: 800, color: "#1E40AF", letterSpacing: "0.04em" }}>
            {stimolo.target}
          </p>
        </div>

        {/* Separatore */}
        <div style={{ fontSize: "1.3rem", color: "#9CA3AF" }}>⟷</div>

        {/* Probe */}
        <div
          style={{
            width: "100%",
            padding: "1.2rem",
            borderRadius: "1rem",
            backgroundColor: "#F9FAFB",
            border: "2px solid #E5E7EB",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.7rem", color: "#6B7280", fontWeight: 600, marginBottom: 4, letterSpacing: "0.05em" }}>
            È…
          </p>
          <p style={{ fontSize: "1.7rem", fontWeight: 800, color: "#111827", letterSpacing: "0.04em" }}>
            {stimolo.probe}
          </p>
        </div>
      </div>

      {/* Pulsanti risposta */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {BUTTONS.map(({ label, valore }) => {
          const isSelected = scelta === valore;
          return (
            <button
              key={valore}
              onClick={() => handleTap(valore)}
              disabled={submitted}
              className={!submitted ? "active:scale-95" : ""}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "0.85rem",
                border: `2px solid ${isSelected ? "#2563EB" : "#D1D5DB"}`,
                backgroundColor: isSelected ? "#DBEAFE" : "#FFFFFF",
                color: isSelected ? "#1D4ED8" : "#374151",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: submitted ? "default" : "pointer",
                transition: "background-color 100ms, border-color 100ms",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
