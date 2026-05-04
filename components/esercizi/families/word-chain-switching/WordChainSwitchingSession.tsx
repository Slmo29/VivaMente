"use client";

/**
 * WordChainSwitchingSession — UI trial per Word Chain Switching.
 *
 * L'utente vede N parole color-coded (blu=A, rosso=B).
 * Deve tapparle alternando categoria: A → B → A → B → …
 *   • Tap corretto (categoria giusta): verde + numero d'ordine.
 *   • Tap sbagliato (categoria sbagliata): nessun effetto.
 *   • Lv 1–5: etichetta categoria mostrata sotto la parola.
 *
 * Countdown interno (tLimMs). Chiama onRisposta({ tempoMs }) o onRisposta(null).
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StimoloWCS, RispostaWCS, WCSColore } from "./sequence";

// Colori UI per le due categorie
const STYLE_A = { bg: "#EFF6FF", border: "#93C5FD", text: "#1D4ED8" }; // blue
const STYLE_B = { bg: "#FEF2F2", border: "#FCA5A5", text: "#B91C1C" }; // red
const STYLE_OK = { bg: "#DCFCE7", border: "#22C55E", text: "#15803D" }; // green

type Props = {
  stimolo:    StimoloWCS;
  onRisposta: (r: RispostaWCS) => void;
};

// ── Componente ─────────────────────────────────────────────────────────────────

export function WordChainSwitchingSession({ stimolo, onRisposta }: Props) {
  const [ordineMap, setOrdineMap] = useState<Record<number, number>>({});
  const [tappati,   setTappati]   = useState<Set<number>>(new Set());
  const [dispPct,   setDispPct]   = useState(100);

  const completedRef  = useRef(false);
  const pointerRef    = useRef(0);
  const ordineRef     = useRef<Record<number, number>>({});
  const tappatiRef    = useRef<Set<number>>(new Set());
  const startTimeRef  = useRef(0);
  const stimoloRef    = useRef(stimolo);
  const onRispostaRef = useRef(onRisposta);

  useLayoutEffect(() => { onRispostaRef.current = onRisposta; });
  useLayoutEffect(() => { stimoloRef.current    = stimolo;    });

  // ── Reset e countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    completedRef.current = false;
    pointerRef.current   = 0;
    ordineRef.current    = {};
    tappatiRef.current   = new Set();
    startTimeRef.current = Date.now();
    setOrdineMap({});
    setTappati(new Set());
    setDispPct(100);

    const t0     = Date.now();
    const tLimMs = stimolo.tLimMs;

    const interval = setInterval(() => {
      if (completedRef.current) { clearInterval(interval); return; }
      const elapsed = Date.now() - t0;
      const pct = Math.max(0, 100 - (elapsed / tLimMs) * 100);
      setDispPct(pct);
      if (elapsed >= tLimMs) {
        clearInterval(interval);
        completedRef.current = true;
        onRispostaRef.current(null);
      }
    }, 50);

    return () => { clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stimolo]);

  // ── Tap parola ─────────────────────────────────────────────────────────────
  const handleTap = useCallback((idx: number) => {
    if (completedRef.current) return;
    if (tappatiRef.current.has(idx)) return; // già tappata

    const s       = stimoloRef.current;
    const parola  = s.parole.find((p) => p.idx === idx);
    if (!parola) return;

    const expected: WCSColore = s.sequenzaCat[pointerRef.current];
    if (parola.colore !== expected) return; // categoria sbagliata: ignora

    // Tap corretto
    const order = pointerRef.current + 1;
    tappatiRef.current = new Set(tappatiRef.current).add(idx);
    ordineRef.current  = { ...ordineRef.current, [idx]: order };
    pointerRef.current++;

    setTappati(new Set(tappatiRef.current));
    setOrdineMap({ ...ordineRef.current });

    if (pointerRef.current >= s.sequenzaCat.length) {
      completedRef.current = true;
      const tempoMs = Date.now() - startTimeRef.current;
      onRispostaRef.current({ tempoMs });
    }
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  const { A: nomeA, B: nomeB } = stimolo.nomiCategorie;

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-4">

      {/* Barra countdown */}
      <div style={{ width: "100%", height: 6, backgroundColor: "#E5E7EB",
        borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          width: `${dispPct}%`, height: "100%",
          backgroundColor: dispPct > 30 ? "#3B82F6" : "#EF4444",
          borderRadius: 3, transition: "width 50ms linear, background-color 200ms",
        }} />
      </div>

      {/* Legenda categorie */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700,
          color: STYLE_A.text, backgroundColor: STYLE_A.bg,
          border: `1px solid ${STYLE_A.border}`, borderRadius: "0.5rem",
          padding: "0.2rem 0.6rem" }}>
          {nomeA}
        </span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700,
          color: STYLE_B.text, backgroundColor: STYLE_B.bg,
          border: `1px solid ${STYLE_B.border}`, borderRadius: "0.5rem",
          padding: "0.2rem 0.6rem" }}>
          {nomeB}
        </span>
      </div>

      {/* Istruzione */}
      <p style={{ fontSize: "0.7rem", color: "#6B7280", textAlign: "center" }}>
        Alterna le categorie: {nomeA} → {nomeB} → {nomeA}…
      </p>

      {/* Griglia parole */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "0.6rem", width: "100%" }}>
        {stimolo.parole.map((p) => {
          const tapped = tappati.has(p.idx);
          const num    = ordineMap[p.idx];
          const style  = tapped ? STYLE_OK : p.colore === "A" ? STYLE_A : STYLE_B;
          return (
            <button
              key={p.idx}
              onClick={() => handleTap(p.idx)}
              disabled={tapped}
              className={!tapped ? "active:scale-95" : ""}
              style={{
                position: "relative",
                padding: "0.75rem 0.4rem",
                borderRadius: "0.85rem",
                fontSize: "1rem",
                fontWeight: 700,
                border: `2px solid ${style.border}`,
                backgroundColor: style.bg,
                color: style.text,
                cursor: tapped ? "default" : "pointer",
                transition: "background-color 150ms, border-color 150ms",
                textAlign: "center",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 2,
              }}
            >
              <span>{p.parola}</span>
              {stimolo.mostraEtichetta && !tapped && (
                <span style={{ fontSize: "0.6rem", opacity: 0.7, fontWeight: 600 }}>
                  {p.colore === "A" ? nomeA : nomeB}
                </span>
              )}
              {tapped && num !== undefined && (
                <span style={{
                  position: "absolute", top: -8, right: -8,
                  width: 22, height: 22, borderRadius: "50%",
                  backgroundColor: "#16A34A", color: "#FFFFFF",
                  fontSize: "0.7rem", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {num}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progresso */}
      <p style={{ fontSize: "0.75rem", color: "#9CA3AF", alignSelf: "flex-end" }}>
        {tappati.size} / {stimolo.sequenzaCat.length}
      </p>
    </div>
  );
}
