"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

// ── Configurazione livelli ────────────────────────────────────────────────────
type LivelloConfig = {
  gridSize: 3 | 4 | 5 | 6;
  nStimuli: number;
  exposureMs: number;
  delayMs: number;
};

const LIVELLI: LivelloConfig[] = [
  { gridSize: 3, nStimuli: 2, exposureMs: 3000, delayMs: 1000 }, // 1
  { gridSize: 3, nStimuli: 2, exposureMs: 3000, delayMs: 1500 }, // 2
  { gridSize: 3, nStimuli: 3, exposureMs: 2500, delayMs: 1500 }, // 3
  { gridSize: 3, nStimuli: 3, exposureMs: 2500, delayMs: 2000 }, // 4
  { gridSize: 3, nStimuli: 4, exposureMs: 2000, delayMs: 2000 }, // 5
  { gridSize: 4, nStimuli: 3, exposureMs: 2000, delayMs: 2000 }, // 6
  { gridSize: 4, nStimuli: 4, exposureMs: 2000, delayMs: 2500 }, // 7
  { gridSize: 4, nStimuli: 4, exposureMs: 1800, delayMs: 2500 }, // 8
  { gridSize: 4, nStimuli: 5, exposureMs: 1800, delayMs: 3000 }, // 9
  { gridSize: 4, nStimuli: 5, exposureMs: 1600, delayMs: 3000 }, // 10
  { gridSize: 4, nStimuli: 6, exposureMs: 1600, delayMs: 3000 }, // 11
  { gridSize: 4, nStimuli: 6, exposureMs: 1500, delayMs: 3500 }, // 12
  { gridSize: 5, nStimuli: 5, exposureMs: 1500, delayMs: 3000 }, // 13
  { gridSize: 5, nStimuli: 6, exposureMs: 1500, delayMs: 3000 }, // 14
  { gridSize: 5, nStimuli: 7, exposureMs: 1400, delayMs: 3500 }, // 15
  { gridSize: 5, nStimuli: 7, exposureMs: 1200, delayMs: 3500 }, // 16
  { gridSize: 5, nStimuli: 8, exposureMs: 1200, delayMs: 4000 }, // 17
  { gridSize: 5, nStimuli: 9, exposureMs: 1000, delayMs: 4000 }, // 18
  { gridSize: 6, nStimuli: 8, exposureMs: 1000, delayMs: 4500 }, // 19
  { gridSize: 6, nStimuli: 10, exposureMs: 800, delayMs: 5000 }, // 20
];

// ── Pool stimoli ──────────────────────────────────────────────────────────────
const POOL_NUMERI = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const POOL_PAROLE = [
  "SOLE","MARE","CASA","LUNA","PANE","ROSA","MANO","VINO",
  "GATTO","FIORE","LIBRO","PORTA","ACQUA","NOTTE","ALBERO","PESCA",
];

type Fase = "intro" | "mostra" | "delay" | "rispondi" | "feedback";

interface Props {
  stimulusType: "numeri" | "parole";
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, accuratezza: number) => void;
  onReady?: () => void;
}

function campione<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

export default function RecallGrid({ stimulusType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = LIVELLI[Math.min(Math.max(livello - 1, 0), 19)];
  const pool = stimulusType === "numeri" ? POOL_NUMERI : POOL_PAROLE;
  const totalCells = cfg.gridSize * cfg.gridSize;

  const [fase, setFase] = useState<Fase>("intro");
  const [posizioniTarget, setPosizioniTarget] = useState<number[]>([]);
  const [stimoliTarget, setStimoliTarget] = useState<string[]>([]);
  const [selezioni, setSelezioni] = useState<number[]>([]);
  const [risultati, setRisultati] = useState<{ corrette: number; totale: number }[]>([]);
  const [feedbackCorrecto, setFeedbackCorretto] = useState(false);

  const completato = useRef(false);
  const onReadyCalled = useRef(false);

  const iniziaTrial = useCallback(() => {
    const posizioni = campione(Array.from({ length: totalCells }, (_, i) => i), cfg.nStimuli);
    const stimoli = campione(pool, cfg.nStimuli);
    setPosizioniTarget(posizioni);
    setStimoliTarget(stimoli);
    setSelezioni([]);
    setFase("mostra");
  }, [cfg.nStimuli, totalCells, pool]);

  // Intro → primo trial
  useEffect(() => {
    const t = setTimeout(iniziaTrial, 1800);
    return () => clearTimeout(t);
  }, [iniziaTrial]);

  // Mostra → delay
  useEffect(() => {
    if (fase !== "mostra") return;
    const t = setTimeout(() => setFase("delay"), cfg.exposureMs);
    return () => clearTimeout(t);
  }, [fase, cfg.exposureMs]);

  // Delay → rispondi
  useEffect(() => {
    if (fase !== "delay") return;
    const t = setTimeout(() => {
      setFase("rispondi");
      if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    }, cfg.delayMs);
    return () => clearTimeout(t);
  }, [fase, cfg.delayMs]);

  function handleCellTap(idx: number) {
    if (fase !== "rispondi") return;
    setSelezioni((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= cfg.nStimuli) return prev;
      const nuove = [...prev, idx];
      if (nuove.length === cfg.nStimuli) {
        valutaRisposta(nuove);
      }
      return nuove;
    });
  }

  function valutaRisposta(sel: number[]) {
    const corrette = sel.filter((i) => posizioniTarget.includes(i)).length;
    const ok = corrette === cfg.nStimuli;
    setFeedbackCorretto(ok);
    setRisultati((prev) => [...prev, { corrette, totale: cfg.nStimuli }]);
    setFase("feedback");
  }

  // Feedback → prossimo trial
  useEffect(() => {
    if (fase !== "feedback") return;
    const t = setTimeout(iniziaTrial, 1400);
    return () => clearTimeout(t);
  }, [fase, iniziaTrial]);

  // Tempo scaduto
  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (risultati.length === 0) { onComplete(0, 0); return; }
    const totalCorrette = risultati.reduce((s, r) => s + r.corrette, 0);
    const totalPossibili = risultati.reduce((s, r) => s + r.totale, 0);
    const score = Math.round((totalCorrette / totalPossibili) * 100);
    onComplete(score, score);
  }, [tempoScaduto, risultati, onComplete]);

  // ── Render ────────────────────────────────────────────────────────────────

  const cellSize = cfg.gridSize === 3 ? 88 : cfg.gridSize === 4 ? 72 : cfg.gridSize === 5 ? 60 : 50;
  const fontSize = stimulusType === "parole" ? (cfg.gridSize <= 4 ? 13 : 11) : (cfg.gridSize <= 4 ? 22 : 18);

  function renderGrid(mostraContenuto: boolean, evidenzia?: number[]) {
    return (
      <div
        className="grid gap-2 mx-auto"
        style={{ gridTemplateColumns: `repeat(${cfg.gridSize}, ${cellSize}px)` }}
      >
        {Array.from({ length: totalCells }).map((_, idx) => {
          const isTarget = posizioniTarget.includes(idx);
          const targetIdx = posizioniTarget.indexOf(idx);
          const isSelezionata = selezioni.includes(idx);
          const isEvidenziata = evidenzia?.includes(idx);

          let bg: string = COLORS.surfaceAlt;
          let border: string = COLORS.border;
          const textColor = COLORS.ink;

          if (mostraContenuto && isTarget) {
            bg = COLORS.primaryLight;
            border = COLORS.primary;
          } else if (isSelezionata) {
            bg = COLORS.primaryLight;
            border = COLORS.primary;
          } else if (isEvidenziata) {
            bg = COLORS.successLight;
            border = COLORS.success;
          }

          return (
            <button
              key={idx}
              onClick={() => handleCellTap(idx)}
              className="rounded-xl flex items-center justify-center transition-all active:scale-95 font-bold"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: bg,
                border: `2px solid ${border}`,
                fontSize,
                color: textColor,
              }}
            >
              {mostraContenuto && isTarget ? stimoliTarget[targetIdx] : ""}
            </button>
          );
        })}
      </div>
    );
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
        <span className="text-6xl">🔲</span>
        <p className="text-xl font-bold text-ink">Ricorda le posizioni</p>
        <p className="text-base" style={{ color: COLORS.inkMuted }}>
          Guarda la griglia, poi tocca le celle dove erano gli elementi
        </p>
        <div className="flex gap-2 mt-4">
          {[0,1,2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: COLORS.primary, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (fase === "mostra") {
    return (
      <div className="flex flex-col items-center gap-6 py-6 px-4">
        <p className="text-base font-bold text-ink">Memorizza!</p>
        {renderGrid(true)}
      </div>
    );
  }

  if (fase === "delay") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
        <div className="flex gap-2">
          {[0,1,2].map((i) => (
            <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: COLORS.primary, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-base" style={{ color: COLORS.inkMuted }}>Dove erano?</p>
      </div>
    );
  }

  if (fase === "rispondi") {
    return (
      <div className="flex flex-col items-center gap-5 py-4 px-4">
        <div className="flex items-center gap-2">
          <p className="text-base font-bold text-ink">Tocca {cfg.nStimuli - selezioni.length} {cfg.nStimuli - selezioni.length === 1 ? "cella" : "celle"}</p>
        </div>
        {renderGrid(false)}
        {selezioni.length > 0 && (
          <button
            className="text-sm underline"
            style={{ color: COLORS.inkMuted }}
            onClick={() => setSelezioni((s) => s.slice(0, -1))}
          >
            ← Annulla ultima
          </button>
        )}
      </div>
    );
  }

  if (fase === "feedback") {
    const ultimo = risultati[risultati.length - 1];
    return (
      <div className="flex flex-col items-center gap-5 py-6 px-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ backgroundColor: feedbackCorrecto ? COLORS.successLight : "#FEE2E2" }}
        >
          {feedbackCorrecto ? "✓" : "✗"}
        </div>
        <p className="text-lg font-extrabold" style={{ color: feedbackCorrecto ? COLORS.success : "#EF4444" }}>
          {feedbackCorrecto ? "Perfetto!" : `${ultimo?.corrette ?? 0} / ${ultimo?.totale ?? 0} corrette`}
        </p>
        <div className="opacity-60">
          {renderGrid(true, selezioni)}
        </div>
      </div>
    );
  }

  return null;
}
