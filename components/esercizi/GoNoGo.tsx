"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type StimulusType = "cromatico" | "semantico" | "multimodale" | "lessicale";

type LivelloConfig = {
  isiMs: number;
  ratioGo: number;
  tRispostaMs: number;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { isiMs: 1500, ratioGo: 0.75, tRispostaMs: 1500 };
  if (idx <= 4) return { isiMs: 1300, ratioGo: 0.73, tRispostaMs: 1200 };
  if (idx <= 6) return { isiMs: 1100, ratioGo: 0.70, tRispostaMs: 900 };
  if (idx <= 9) return { isiMs: 900, ratioGo: 0.68, tRispostaMs: 800 };
  if (idx <= 11) return { isiMs: 750, ratioGo: 0.65, tRispostaMs: 700 };
  if (idx <= 14) return { isiMs: 650, ratioGo: 0.62, tRispostaMs: 630 };
  if (idx <= 15) return { isiMs: 600, ratioGo: 0.60, tRispostaMs: 580 };
  if (idx <= 17) return { isiMs: 560, ratioGo: 0.55, tRispostaMs: 550 };
  return { isiMs: 500, ratioGo: 0.50, tRispostaMs: 500 };
}

const ANIMALI = ["CANE","GATTO","ORSO","LEONE","AQUILA","RONDINE","CAPRA","TOPO"];
const OGGETTI = ["TAVOLO","SEDIA","LIBRO","BORSA","LAMPADA","CHIAVE","PENNA","PORTA"];
const PAROLE_REALI = ["CASA","SOLE","MARE","LUNA","PANE","ROSA","MANO","ACQUA"];
const NON_PAROLE = ["BATRO","SELMO","CRUNTO","FOLPE","DASTI","MILVO","TRECA","SNOPE"];

interface Stimolo { testo: string; colore?: string; forma?: string; isGo: boolean; }

function generateStimolo(type: StimulusType, ratioGo: number): Stimolo {
  const isGo = Math.random() < ratioGo;
  if (type === "cromatico") {
    return { testo: isGo ? "VERDE" : "ROSSO", colore: isGo ? "#22C55E" : "#EF4444", isGo };
  }
  if (type === "semantico") {
    const pool = isGo ? ANIMALI : OGGETTI;
    return { testo: pool[Math.floor(Math.random() * pool.length)], isGo };
  }
  if (type === "lessicale") {
    const pool = isGo ? PAROLE_REALI : NON_PAROLE;
    return { testo: pool[Math.floor(Math.random() * pool.length)], isGo };
  }
  // multimodale
  return { testo: isGo ? "●" : "■", forma: isGo ? "cerchio" : "quadrato", isGo };
}

type Fase = "intro" | "running" | "isi";

interface Props {
  stimulusType: StimulusType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function GoNoGo({ stimulusType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const tapRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const correttiRef = useRef(0);
  const totaleRef = useRef(0);

  const [fase, setFase] = useState<Fase>("intro");
  const [stimolo, setStimolo] = useState<Stimolo | null>(null);
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [lastResult, setLastResult] = useState<"ok" | "err" | null>(null);

  const runTrial = useCallback(() => {
    const s = generateStimolo(stimulusType, cfg.ratioGo);
    tapRef.current = false;
    setStimolo(s);
    setLastResult(null);
    setFase("running");
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    timerRef.current = setTimeout(() => {
      const tapped = tapRef.current;
      const ok = s.isGo ? tapped : !tapped;
      correttiRef.current += ok ? 1 : 0;
      totaleRef.current += 1;
      setCorretti(correttiRef.current);
      setTotale(totaleRef.current);
      setLastResult(ok ? "ok" : "err");
      setFase("isi");
      timerRef.current = setTimeout(runTrial, 400);
    }, cfg.tRispostaMs);
  }, [stimulusType, cfg]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const score = totaleRef.current > 0 ? Math.round((correttiRef.current / totaleRef.current) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, onComplete]);

  function handleTap() {
    if (fase !== "running") return;
    tapRef.current = true;
  }

  const goLabel: Record<StimulusType, string> = {
    cromatico: "Tocca se VERDE",
    semantico: "Tocca se ANIMALE",
    lessicale: "Tocca se PAROLA REALE",
    multimodale: "Tocca se CERCHIO ●",
  };

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">🎯</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Go / No-Go</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>{goLabel[stimulusType]}. Se no, aspetta.</p>
        <button onClick={() => runTrial()} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  const bgColor = fase === "running" && stimolo
    ? (stimolo.colore ? stimolo.colore + "33" : stimolo.isGo ? COLORS.successLight : "#FEE2E2")
    : COLORS.surfaceAlt;
  const borderColor = fase === "running" && stimolo
    ? (stimolo.colore ?? (stimolo.isGo ? COLORS.success : "#EF4444"))
    : COLORS.border;

  return (
    <div className="flex flex-col items-center gap-6 py-4 px-4">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Corretti: {corretti} / {totale}</p>

      <div
        onClick={handleTap}
        className="w-56 h-56 rounded-3xl flex items-center justify-center cursor-pointer active:scale-95 transition-all select-none"
        style={{ backgroundColor: bgColor, border: `4px solid ${borderColor}` }}
      >
        {fase === "running" && stimolo ? (
          <span className="font-extrabold text-center" style={{ fontSize: 48, color: stimolo.colore ?? COLORS.ink }}>
            {stimolo.testo}
          </span>
        ) : (
          <span style={{ color: COLORS.border, fontSize: 36 }}>+</span>
        )}
      </div>

      {lastResult && (
        <div className="text-3xl transition-opacity">{lastResult === "ok" ? "✓" : "✗"}</div>
      )}

      <p className="text-sm text-center" style={{ color: COLORS.inkMuted }}>{goLabel[stimulusType]}</p>
    </div>
  );
}
