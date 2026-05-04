"use client";

/**
 * MemoriaListaRievocazioneParoleSession — free recall QWERTY per Memoria Lista.
 *
 * Flusso:
 *   1. encoding   — item uno alla volta (speedMs ciascuno)
 *   2. delay      — BouncingBall (delayMs)
 *   3. rievocazione — QWERTY; l'utente scrive le parole ricordate;
 *                    timeout automatico 90s o tap "Fine"
 *
 * Al termine confronta le parole digitate con gli item della lista (normalizzate)
 * e chiama onRisposta({ selezionati: matchedIds }) — compatibile con RispostaML.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StimoloML, RispostaML } from "./sequence";

const RECALL_TIMEOUT_MS = 90_000;

type Fase = "encoding" | "delay" | "rievocazione";

type Props = {
  stimolo:        StimoloML;
  onRisposta:     (r: RispostaML) => void;
  delayComponent: (props: { onCompleto: () => void }) => ReactNode;
  tempoScaduto:   boolean;
};

function normalizza(s: string): string {
  return s.trim().toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u");
}

export function MemoriaListaRievocazioneParoleSession({
  stimolo,
  onRisposta,
  delayComponent,
  tempoScaduto,
}: Props) {
  const [fase,       setFase]       = useState<Fase>("encoding");
  const [encIdx,     setEncIdx]     = useState(0);
  const [paroleInserite, setParoleInserite] = useState<string[]>([]);
  const [inputVal,   setInputVal]   = useState("");
  const [msRimasti,  setMsRimasti]  = useState(RECALL_TIMEOUT_MS);

  const completatoRef   = useRef(false);
  const cancelledRef    = useRef(false);
  const stimoloRef      = useRef(stimolo);
  const onRispostaRef   = useRef(onRisposta);
  const paroleRef       = useRef<string[]>([]);
  const recallStartRef  = useRef(0);
  const inputRef        = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => { stimoloRef.current    = stimolo;    });
  useLayoutEffect(() => { onRispostaRef.current = onRisposta; });

  // ── Commit risposta ───────────────────────────────────────────────────────
  const commitRisposta = useCallback(() => {
    if (completatoRef.current) return;
    completatoRef.current = true;
    cancelledRef.current  = true;

    const s       = stimoloRef.current;
    const typed   = paroleRef.current.map(normalizza);
    const matched = s.items
      .filter((item) => typed.includes(normalizza(item.parola)))
      .map((item) => item.id);

    onRispostaRef.current({ selezionati: matched });
  }, []);

  // ── tempoScaduto (sessione globale) ───────────────────────────────────────
  useEffect(() => {
    if (!tempoScaduto || completatoRef.current) return;
    cancelledRef.current  = true;
    completatoRef.current = true;
    onRispostaRef.current(null);
  }, [tempoScaduto]);

  // ── Encoding: avanza item per item ────────────────────────────────────────
  const avanzaEncoding = useCallback((idx: number) => {
    if (cancelledRef.current) return;
    setEncIdx(idx);
    setTimeout(() => {
      if (cancelledRef.current) return;
      if (idx + 1 < stimoloRef.current.items.length) {
        avanzaEncoding(idx + 1);
      } else {
        setFase("delay");
      }
    }, stimoloRef.current.speedMs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reset su cambio stimolo ───────────────────────────────────────────────
  useEffect(() => {
    completatoRef.current = false;
    cancelledRef.current  = false;
    paroleRef.current     = [];
    setParoleInserite([]);
    setInputVal("");
    setFase("encoding");
    setEncIdx(0);
    setMsRimasti(RECALL_TIMEOUT_MS);
    avanzaEncoding(0);
    return () => { cancelledRef.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stimolo]);

  // ── Delay completato ──────────────────────────────────────────────────────
  const handleDelayCompleto = useCallback(() => {
    if (cancelledRef.current) return;
    recallStartRef.current = Date.now();
    setFase("rievocazione");
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  // ── Countdown rievocazione ────────────────────────────────────────────────
  useEffect(() => {
    if (fase !== "rievocazione") return;
    const id = setInterval(() => {
      const elapsed = Date.now() - recallStartRef.current;
      const rimasti = Math.max(0, RECALL_TIMEOUT_MS - elapsed);
      setMsRimasti(rimasti);
      if (rimasti === 0) {
        clearInterval(id);
        commitRisposta();
      }
    }, 200);
    return () => clearInterval(id);
  }, [fase, commitRisposta]);

  // ── Aggiungi parola digitata ──────────────────────────────────────────────
  const handleAggiungi = useCallback(() => {
    const parola = inputVal.trim();
    if (!parola || completatoRef.current) return;
    const norm   = normalizza(parola);
    // Ignora duplicati
    if (paroleRef.current.some((p) => normalizza(p) === norm)) {
      setInputVal("");
      return;
    }
    const updated = [...paroleRef.current, parola];
    paroleRef.current = updated;
    setParoleInserite(updated);
    setInputVal("");
    setTimeout(() => inputRef.current?.focus(), 20);
  }, [inputVal]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") { e.preventDefault(); handleAggiungi(); }
    },
    [handleAggiungi],
  );

  // ── Render encoding ───────────────────────────────────────────────────────
  if (fase === "encoding") {
    const item = stimolo.items[encIdx];
    return (
      <div className="flex flex-col items-center gap-5 px-4 py-6">
        <p style={{ fontSize: "0.7rem", color: "#38BDF8", fontWeight: 700,
          letterSpacing: "0.08em" }}>
          MEMORIZZA {encIdx + 1} / {stimolo.items.length}
        </p>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", minHeight: 140, borderRadius: "1.5rem",
          backgroundColor: "#F0F9FF", border: "2px solid #BAE6FD",
          padding: "1.5rem",
        }}>
          <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1E3A5F" }}>
            {item.parola}
          </span>
        </div>
      </div>
    );
  }

  // ── Render delay ──────────────────────────────────────────────────────────
  if (fase === "delay") {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-4">
        <p style={{ fontSize: "0.75rem", color: "#6B7280", textAlign: "center",
          fontWeight: 600 }}>
          Segui la pallina — poi scriverai le parole che ricordi
        </p>
        {delayComponent({ onCompleto: handleDelayCompleto })}
      </div>
    );
  }

  // ── Render rievocazione ───────────────────────────────────────────────────
  const pct      = msRimasti / RECALL_TIMEOUT_MS;
  const secsLeft = Math.ceil(msRimasti / 1000);
  const barColor = pct > 0.5 ? "#22C55E" : pct > 0.25 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col items-start gap-3 px-4 py-4">
      <p style={{ fontSize: "0.7rem", color: "#7C3AED", fontWeight: 700,
        letterSpacing: "0.08em" }}>
        SCRIVI LE PAROLE CHE RICORDI
      </p>

      {/* Countdown */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{
          flex: 1, height: "6px", borderRadius: "3px",
          backgroundColor: "#E2E8F0", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: "3px",
            width: `${pct * 100}%`,
            backgroundColor: barColor,
            transition: "width 0.2s linear, background-color 0.3s",
          }} />
        </div>
        <span style={{
          fontSize: "0.85rem", fontWeight: 700, minWidth: "2.5rem", textAlign: "right",
          color: pct < 0.25 ? "#EF4444" : "#64748B",
        }}>
          {secsLeft}s
        </span>
      </div>

      {/* Input */}
      <div style={{ width: "100%", display: "flex", gap: "0.5rem" }}>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scrivi una parola…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          style={{
            flex: 1, padding: "0.8rem 1rem",
            borderRadius: "0.85rem", fontSize: "1rem", fontWeight: 600,
            border: "2px solid #CBD5E1", outline: "none",
            backgroundColor: "#FFFFFF", color: "#111827",
          }}
        />
        <button
          onClick={handleAggiungi}
          disabled={inputVal.trim().length === 0}
          className="active:scale-95"
          style={{
            padding: "0.8rem 1rem", borderRadius: "0.85rem",
            fontSize: "0.9rem", fontWeight: 700,
            backgroundColor: inputVal.trim().length > 0 ? "#1E3A5F" : "#CBD5E1",
            color: "#FFFFFF", border: "none",
            cursor: inputVal.trim().length > 0 ? "pointer" : "default",
          }}
        >
          Aggiungi
        </button>
      </div>

      {/* Parole inserite */}
      {paroleInserite.length > 0 && (
        <div style={{
          width: "100%", borderRadius: "0.75rem",
          border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC",
          padding: "0.5rem 0.75rem",
          display: "flex", flexWrap: "wrap", gap: "0.4rem",
          maxHeight: "120px", overflowY: "auto",
        }}>
          {paroleInserite.map((p, i) => (
            <span key={i} style={{
              fontSize: "0.9rem", fontWeight: 700,
              color: "#1E3A5F", backgroundColor: "#DBEAFE",
              borderRadius: "0.5rem", padding: "0.2rem 0.6rem",
            }}>
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Fine */}
      <button
        onClick={commitRisposta}
        className="active:scale-95"
        style={{
          width: "100%", padding: "0.9rem",
          borderRadius: "0.9rem", fontSize: "1rem", fontWeight: 700,
          backgroundColor: "#7C3AED", color: "#FFFFFF",
          border: "none", cursor: "pointer", marginTop: "0.25rem",
        }}
      >
        Fine — ho finito
      </button>
    </div>
  );
}
