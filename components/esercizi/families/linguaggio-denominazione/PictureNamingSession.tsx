"use client";

/**
 * PictureNamingSession — UI per un singolo trial Picture Naming.
 *
 * Mostra l'emoji + campo testo auto-focalizzato + barra conto alla rovescia.
 * Gestisce internamente il T.Lim (da stimolo.tLimMs): chiama onRisposta(null)
 * allo scadere del tempo, oppure onRisposta(testo) alla conferma utente.
 *
 * feedbackType="standard" in TrialFlow (verde/rosso dopo onRisposta).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { StimoloPN } from "./sequence";

type Props = {
  stimolo:    StimoloPN;
  onRisposta: (r: string | null) => void;
};

// ── Componente ─────────────────────────────────────────────────────────────────

export function PictureNamingSession({ stimolo, onRisposta }: Props) {
  const [testo,       setTesto]       = useState("");
  const [progressPct, setProgressPct] = useState(100);
  const [submitted,   setSubmitted]   = useState(false);

  const inputRef   = useRef<HTMLInputElement>(null);
  const startMsRef = useRef(Date.now());
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const tlimRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submRef    = useRef(false);

  const submit = useCallback((valore: string | null) => {
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
    setTesto("");
    setProgressPct(100);
    startMsRef.current = Date.now();

    // Focus automatico
    const t = setTimeout(() => inputRef.current?.focus(), 50);

    // Barra progresso
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startMsRef.current;
      const pct = Math.max(0, 100 - (elapsed / stimolo.tLimMs) * 100);
      setProgressPct(pct);
    }, 50);

    // Timeout risposta
    tlimRef.current = setTimeout(() => {
      setProgressPct(0);
      submit(null);
    }, stimolo.tLimMs);

    return () => {
      clearTimeout(t);
      if (timerRef.current) clearInterval(timerRef.current);
      if (tlimRef.current)  clearTimeout(tlimRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stimolo]);

  const handleSubmit = useCallback(() => {
    if (testo.trim().length > 0) submit(testo);
  }, [testo, submit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  }, [handleSubmit]);

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

      {/* Emoji */}
      <div
        style={{
          fontSize: "7rem",
          lineHeight: 1,
          userSelect: "none",
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        {stimolo.emoji}
      </div>

      {/* Input testo */}
      <input
        ref={inputRef}
        type="text"
        value={testo}
        onChange={(e) => setTesto(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={submitted}
        placeholder="Scrivi il nome…"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        style={{
          width: "100%",
          maxWidth: 320,
          padding: "0.9rem 1rem",
          fontSize: "1.15rem",
          fontWeight: 600,
          textAlign: "center",
          borderRadius: "0.75rem",
          border: "2px solid #D1D5DB",
          outline: "none",
          backgroundColor: submitted ? "#F3F4F6" : "#FFFFFF",
          color: "#111827",
        }}
      />

      {/* Bottone conferma */}
      <button
        onClick={handleSubmit}
        disabled={submitted || testo.trim().length === 0}
        className={submitted || testo.trim().length === 0 ? "" : "active:scale-95"}
        style={{
          padding: "0.9rem 2.5rem",
          borderRadius: "1rem",
          backgroundColor:
            submitted || testo.trim().length === 0 ? "#D1D5DB" : "#2563EB",
          color: "#FFFFFF",
          fontSize: "1rem",
          fontWeight: 700,
          border: "none",
          cursor: submitted || testo.trim().length === 0 ? "default" : "pointer",
        }}
      >
        Conferma
      </button>
    </div>
  );
}
