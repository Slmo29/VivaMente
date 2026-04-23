"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type LivelloConfig = { isiMs: number; seqLen: number };

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0)  return { isiMs: 3000, seqLen: 5 };
  if (idx <= 3)  return { isiMs: 2800, seqLen: 7 };
  if (idx <= 4)  return { isiMs: 2600, seqLen: 9 };
  if (idx <= 7)  return { isiMs: 2400, seqLen: 11 };
  if (idx <= 9)  return { isiMs: 2200, seqLen: 14 };
  if (idx <= 12) return { isiMs: 2000, seqLen: 15 };
  if (idx <= 14) return { isiMs: 1700, seqLen: 17 };
  if (idx <= 17) return { isiMs: 1600, seqLen: 18 };
  return { isiMs: 1500, seqLen: 20 };
}

type DigitType = "single" | "double";
type Fase = "intro" | "primo" | "rispondi" | "feedback";

function genSeq(len: number, digitType: DigitType): number[] {
  return Array.from({ length: len }, () =>
    digitType === "single" ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 90) + 10
  );
}

function getOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  while (opts.size < 4) {
    const delta = Math.floor(Math.random() * 10) - 5;
    const v = correct + delta;
    if (v !== correct && v > 0) opts.add(v);
  }
  return Array.from(opts).sort(() => Math.random() - 0.5);
}

interface Props {
  digitType: DigitType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function PasatLight({ digitType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  // Somma cumulativa corretta — aggiornata sempre con la risposta attesa, non quella dell'utente
  const cumulativaRef = useRef(0);

  const [sequenza] = useState<number[]>(() => genSeq(cfg.seqLen, digitType));
  const [idxCorrente, setIdxCorrente] = useState(0);
  const [fase, setFase] = useState<Fase>("intro");
  const [opzioni, setOpzioni] = useState<number[]>([]);
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  // Mostra il primo numero: nessuna risposta, poi avanza automaticamente
  const avviaPrimo = useCallback(() => {
    setIdxCorrente(0);
    // La cumulativa parte dal primo numero
    cumulativaRef.current = sequenza[0];
    setFase("primo");
    setTimeout(() => {
      setIdxCorrente(1);
      // Risposta attesa: n[1] + cumulativa (= n[0])
      setOpzioni(getOptions(sequenza[1] + cumulativaRef.current));
      setFase("rispondi");
      if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    }, cfg.isiMs);
  }, [sequenza, cfg.isiMs, onReady]);

  useEffect(() => {
    const t = setTimeout(avviaPrimo, 1500);
    return () => clearTimeout(t);
  }, [avviaPrimo]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleScelta(val: number) {
    if (fase !== "rispondi") return;

    // Risposta corretta: numero corrente + cumulativa precedente
    const correct = sequenza[idxCorrente] + cumulativaRef.current;
    const ok = val === correct;

    // Aggiorna sempre con la risposta CORRETTA attesa, indipendentemente dall'utente
    cumulativaRef.current = correct;

    setCorretti((c) => c + (ok ? 1 : 0));
    setTotale((t) => t + 1);
    setLastOk(ok);
    setFase("feedback");

    setTimeout(() => {
      const next = idxCorrente + 1;
      if (next >= sequenza.length) {
        if (!completato.current) {
          completato.current = true;
          const nc = corretti + (ok ? 1 : 0);
          const nt = totale + 1;
          onComplete(Math.round((nc / nt) * 100), Math.round((nc / nt) * 100));
        }
        return;
      }
      setIdxCorrente(next);
      // Opzioni per il prossimo: n[next] + cumulativa aggiornata
      setOpzioni(getOptions(sequenza[next] + cumulativaRef.current));
      setFase("rispondi");
    }, 700);
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
        <span className="text-6xl">🔢</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Somma progressiva</p>
        <p className="text-base" style={{ color: COLORS.inkMuted }}>
          Ogni numero che compare, sommalo al totale precedente e tocca il risultato.
        </p>
        <div className="flex gap-2 mt-4">
          {[0,1,2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: COLORS.primary, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-4">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>
        {corretti} / {totale} corretti
      </p>

      {/* Numero corrente */}
      <div
        className="w-40 h-40 rounded-3xl flex items-center justify-center"
        style={{
          backgroundColor: fase === "feedback" ? (lastOk ? COLORS.successLight : "#FEE2E2") : COLORS.primaryLight,
          border: `3px solid ${fase === "feedback" ? (lastOk ? COLORS.success : "#EF4444") : COLORS.primary}`,
        }}
      >
        <span className="text-6xl font-extrabold" style={{ color: COLORS.primary }}>
          {sequenza[idxCorrente]}
        </span>
      </div>

      {fase === "primo" && (
        <p className="text-sm" style={{ color: COLORS.inkMuted }}>Memorizza questo numero…</p>
      )}

      {fase === "feedback" && (
        <div className="text-3xl">{lastOk ? "✓" : "✗"}</div>
      )}

      {fase === "rispondi" && (
        <>
          <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>
            Totale + {sequenza[idxCorrente]} = ?
          </p>
          <p className="text-xs" style={{ color: COLORS.inkMuted }}>
            (tieni a mente il totale precedente)
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {opzioni.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleScelta(opt)}
                className="rounded-2xl flex items-center justify-center font-extrabold active:scale-95 transition-transform"
                style={{
                  height: 64,
                  fontSize: 26,
                  backgroundColor: COLORS.surfaceAlt,
                  border: `2px solid ${COLORS.border}`,
                  color: COLORS.ink,
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
