"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type Congruenza = "congruente" | "mista" | "incongruente";
type Tipo = "frecce" | "lettere" | "simboli";

type LivelloConfig = {
  congruenza: Congruenza;
  nFlanker: number;
  isiMs: number;
  tipo: Tipo;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { congruenza: "congruente", nFlanker: 2, isiMs: 1500, tipo: "frecce" };
  if (idx <= 4) return { congruenza: "congruente", nFlanker: 2, isiMs: 1200, tipo: "frecce" };
  if (idx <= 7) return { congruenza: "mista", nFlanker: 4, isiMs: 950, tipo: "frecce" };
  if (idx <= 10) return { congruenza: "mista", nFlanker: 4, isiMs: 800, tipo: "frecce" };
  if (idx <= 11) return { congruenza: "mista", nFlanker: 4, isiMs: 750, tipo: "lettere" };
  if (idx <= 13) return { congruenza: "mista", nFlanker: 5, isiMs: 650, tipo: "lettere" };
  if (idx <= 14) return { congruenza: "incongruente", nFlanker: 6, isiMs: 600, tipo: "simboli" };
  if (idx <= 17) return { congruenza: "incongruente", nFlanker: 6, isiMs: 500, tipo: "simboli" };
  return { congruenza: "mista", nFlanker: 6, isiMs: 400, tipo: "simboli" };
}

const STIMOLI: Record<Tipo, { left: string; right: string }> = {
  frecce: { left: "←", right: "→" },
  lettere: { left: "S", right: "H" },
  simboli: { left: "<", right: ">" },
};

interface Trial {
  centro: "left" | "right";
  flanker: "left" | "right";
  display: string;
  isCongruente: boolean;
}

function generateTrial(cfg: LivelloConfig): Trial {
  const centro: "left" | "right" = Math.random() < 0.5 ? "left" : "right";
  let flanker: "left" | "right";
  if (cfg.congruenza === "congruente") flanker = centro;
  else if (cfg.congruenza === "incongruente") flanker = centro === "left" ? "right" : "left";
  else flanker = Math.random() < 0.5 ? "left" : "right";
  const isCongruente = centro === flanker;
  const stim = STIMOLI[cfg.tipo];
  const centroChar = centro === "left" ? stim.left : stim.right;
  const flankerChar = flanker === "left" ? stim.left : stim.right;
  const totalFlankers = cfg.nFlanker;
  const left = flankerChar.repeat(totalFlankers / 2);
  const right = flankerChar.repeat(totalFlankers / 2);
  return { centro, flanker, display: `${left} ${centroChar} ${right}`, isCongruente };
}

type Fase = "intro" | "mostra" | "isi" | "feedback";

interface Props {
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function Flanker({ livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fase, setFase] = useState<Fase>("intro");
  const [trial, setTrial] = useState<Trial | null>(null);
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  const avanzaTrial = useCallback(() => {
    setTrial(generateTrial(cfg));
    setLastOk(null);
    setFase("mostra");
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    timerRef.current = setTimeout(() => {
      setTotale((t) => t + 1);
      setLastOk(false);
      setFase("feedback");
      timerRef.current = setTimeout(avanzaTrial, 500);
    }, cfg.isiMs);
  }, [cfg]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleRisposta(dir: "left" | "right") {
    if (fase !== "mostra" || !trial) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const ok = dir === trial.centro;
    const nuoviCorretti = corretti + (ok ? 1 : 0);
    const nuoviTotale = totale + 1;
    setCorretti(nuoviCorretti);
    setTotale(nuoviTotale);
    setLastOk(ok);
    setFase("feedback");
    timerRef.current = setTimeout(avanzaTrial, 500);
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">↔</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Frecce Flanker</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Tocca il bottone che indica la direzione del simbolo <strong>CENTRALE</strong>. Ignora quelli ai lati.
        </p>
        <button onClick={() => avanzaTrial()} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-4">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Corretti: {corretti} / {totale}</p>

      <div
        className="w-full rounded-3xl flex items-center justify-center py-8"
        style={{
          backgroundColor: fase === "feedback" ? (lastOk ? COLORS.successLight : "#FEE2E2") : COLORS.primaryLight,
          border: `3px solid ${fase === "feedback" ? (lastOk ? COLORS.success : "#EF4444") : COLORS.primary}`,
          minHeight: 140,
        }}
      >
        {trial && (
          <span className="font-extrabold tracking-widest select-none" style={{ fontSize: 52, color: COLORS.ink, letterSpacing: "0.15em" }}>
            {trial.display}
          </span>
        )}
      </div>

      {fase === "feedback" && (
        <div className="text-4xl">{lastOk ? "✓" : "✗"}</div>
      )}

      <div className="grid grid-cols-2 gap-6 w-full mt-2">
        {(["left","right"] as const).map((dir) => (
          <button key={dir} onClick={() => handleRisposta(dir)} disabled={fase !== "mostra"}
            className="rounded-2xl font-extrabold active:scale-95 transition-transform"
            style={{ height: 72, fontSize: 40, backgroundColor: COLORS.surfaceAlt, border: `2px solid ${COLORS.border}`, color: COLORS.ink, opacity: fase !== "mostra" ? 0.5 : 1 }}>
            {dir === "left" ? "←" : "→"}
          </button>
        ))}
      </div>
    </div>
  );
}
