"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type StimulusType = "forme" | "oggetti_3d";

type LivelloConfig = {
  angoloMax: number;
  mirrorRatio: number;
  timeLimitMs: number | null;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { angoloMax: 45, mirrorRatio: 0.0, timeLimitMs: null };
  if (idx <= 3) return { angoloMax: 60, mirrorRatio: 0.1, timeLimitMs: null };
  if (idx <= 4) return { angoloMax: 90, mirrorRatio: 0.2, timeLimitMs: null };
  if (idx <= 7) return { angoloMax: 110, mirrorRatio: 0.3, timeLimitMs: null };
  if (idx <= 9) return { angoloMax: 135, mirrorRatio: 0.4, timeLimitMs: 5000 };
  if (idx <= 12) return { angoloMax: 150, mirrorRatio: 0.45, timeLimitMs: 4500 };
  if (idx <= 14) return { angoloMax: 180, mirrorRatio: 0.5, timeLimitMs: 3500 };
  if (idx <= 17) return { angoloMax: 180, mirrorRatio: 0.5, timeLimitMs: 3000 };
  return { angoloMax: 180, mirrorRatio: 0.5, timeLimitMs: 2000 };
}

type FormaType = "cerchio" | "quadrato" | "triangolo" | "stella" | "esagono";
const FORME: FormaType[] = ["cerchio", "quadrato", "triangolo", "stella", "esagono"];
const FORMA_COLORS = [COLORS.primary, COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.warning];

function ShapesSVG({ forma, color, size = 80 }: { forma: FormaType; color: string; size?: number }) {
  const c = size / 2;
  const r = size * 0.4;
  if (forma === "cerchio") return (
    <svg width={size} height={size}><circle cx={c} cy={c} r={r} fill={color + "44"} stroke={color} strokeWidth={3} /></svg>
  );
  if (forma === "quadrato") return (
    <svg width={size} height={size}><rect x={size * 0.1} y={size * 0.1} width={size * 0.8} height={size * 0.8} rx={6} fill={color + "44"} stroke={color} strokeWidth={3} /></svg>
  );
  if (forma === "triangolo") {
    const pts = `${c},${size * 0.1} ${size * 0.9},${size * 0.9} ${size * 0.1},${size * 0.9}`;
    return <svg width={size} height={size}><polygon points={pts} fill={color + "44"} stroke={color} strokeWidth={3} /></svg>;
  }
  if (forma === "stella") {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.45;
      return `${c + rad * Math.cos(angle)},${c + rad * Math.sin(angle)}`;
    }).join(" ");
    return <svg width={size} height={size}><polygon points={pts} fill={color + "44"} stroke={color} strokeWidth={3} /></svg>;
  }
  // esagono
  const pts = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    return `${c + r * Math.cos(angle)},${c + r * Math.sin(angle)}`;
  }).join(" ");
  return <svg width={size} height={size}><polygon points={pts} fill={color + "44"} stroke={color} strokeWidth={3} /></svg>;
}

interface Trial {
  forma: FormaType;
  color: string;
  angolo: number;
  isMirror: boolean;
}

function generateTrial(cfg: LivelloConfig): Trial {
  const forma = FORME[Math.floor(Math.random() * FORME.length)];
  const color = FORMA_COLORS[FORME.indexOf(forma)];
  const angolo = Math.floor(Math.random() * cfg.angoloMax);
  const isMirror = Math.random() < cfg.mirrorRatio;
  return { forma, color, angolo, isMirror };
}

type Fase = "intro" | "mostra" | "feedback";

interface Props {
  stimulusType: StimulusType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function MentalRotation({ stimulusType: _stimulusType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [trial, setTrial] = useState<Trial | null>(null);
  const [fase, setFase] = useState<Fase>("intro");
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [trialMs, setTrialMs] = useState(cfg.timeLimitMs ?? 0);

  const avanzaTrial = useCallback(() => {
    setTrial(generateTrial(cfg));
    setLastOk(null);
    setFase("mostra");
    if (cfg.timeLimitMs) setTrialMs(cfg.timeLimitMs);
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
  }, [cfg]);

  useEffect(() => {
    if (fase !== "mostra" || !cfg.timeLimitMs) return;
    if (trialMs <= 0) {
      setTotale((t) => t + 1);
      setLastOk(false);
      setFase("feedback");
      timerRef.current = setTimeout(avanzaTrial, 700);
      return;
    }
    const t = setTimeout(() => setTrialMs((m) => m - 100), 100);
    return () => clearTimeout(t);
  }, [fase, trialMs, cfg.timeLimitMs, avanzaTrial]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleRisposta(uguale: boolean) {
    if (fase !== "mostra" || !trial) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const ok = uguale === !trial.isMirror;
    setCorretti((c) => c + (ok ? 1 : 0));
    setTotale((t) => t + 1);
    setLastOk(ok);
    setFase("feedback");
    timerRef.current = setTimeout(avanzaTrial, 700);
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">🔄</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Rotazione Mentale</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Vedi due figure. La seconda è ruotata. È la stessa figura o è specchiata?
        </p>
        <button onClick={avanzaTrial} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  const scaleX = trial?.isMirror ? -1 : 1;

  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Corretti: {corretti} / {totale}</p>

      {cfg.timeLimitMs && fase === "mostra" && (
        <div className="w-full rounded-full overflow-hidden h-2" style={{ backgroundColor: COLORS.border }}>
          <div className="h-full rounded-full transition-all duration-100" style={{ width: `${(trialMs / cfg.timeLimitMs) * 100}%`, backgroundColor: trialMs / (cfg.timeLimitMs) > 0.4 ? COLORS.primary : "#EF4444" }} />
        </div>
      )}

      {trial && (
        <div className="flex items-center gap-8 justify-center">
          <div className="flex flex-col items-center gap-1">
            <ShapesSVG forma={trial.forma} color={trial.color} size={100} />
            <p className="text-xs" style={{ color: COLORS.inkMuted }}>Figura A</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div style={{ transform: `rotate(${trial.angolo}deg) scaleX(${scaleX})` }}>
              <ShapesSVG forma={trial.forma} color={trial.color} size={100} />
            </div>
            <p className="text-xs" style={{ color: COLORS.inkMuted }}>Figura B ({trial.angolo}°)</p>
          </div>
        </div>
      )}

      {fase === "feedback" && (
        <div className="flex flex-col items-center gap-1">
          <div className="text-4xl">{lastOk ? "✓" : "✗"}</div>
          {!lastOk && trial && (
            <p className="text-sm" style={{ color: COLORS.inkMuted }}>Era: {trial.isMirror ? "Specchiata" : "Uguale"}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 w-full mt-2">
        <button onClick={() => handleRisposta(true)} disabled={fase !== "mostra"}
          className="rounded-2xl font-bold active:scale-95 transition-transform"
          style={{ height: 64, fontSize: 18, backgroundColor: COLORS.successLight, border: `2px solid ${COLORS.success}`, color: COLORS.success, opacity: fase !== "mostra" ? 0.5 : 1 }}>
          ✓ Uguale
        </button>
        <button onClick={() => handleRisposta(false)} disabled={fase !== "mostra"}
          className="rounded-2xl font-bold active:scale-95 transition-transform"
          style={{ height: 64, fontSize: 18, backgroundColor: "#FEE2E2", border: `2px solid #EF4444`, color: "#EF4444", opacity: fase !== "mostra" ? 0.5 : 1 }}>
          ↔ Specchiata
        </button>
      </div>
    </div>
  );
}
