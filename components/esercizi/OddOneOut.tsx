"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type LivelloConfig = {
  nDistractors: number;
  timeLimitMs: number;
};

const LIVELLI: LivelloConfig[] = [
  { nDistractors: 4,  timeLimitMs: 8000 }, // 1
  { nDistractors: 6,  timeLimitMs: 8000 }, // 2
  { nDistractors: 8,  timeLimitMs: 7000 }, // 3
  { nDistractors: 8,  timeLimitMs: 7000 }, // 4
  { nDistractors: 10, timeLimitMs: 6000 }, // 5
  { nDistractors: 12, timeLimitMs: 6000 }, // 6
  { nDistractors: 12, timeLimitMs: 5000 }, // 7
  { nDistractors: 16, timeLimitMs: 5000 }, // 8
  { nDistractors: 18, timeLimitMs: 5000 }, // 9
  { nDistractors: 20, timeLimitMs: 5000 }, // 10
  { nDistractors: 20, timeLimitMs: 4000 }, // 11
  { nDistractors: 24, timeLimitMs: 4000 }, // 12
  { nDistractors: 24, timeLimitMs: 3500 }, // 13
  { nDistractors: 25, timeLimitMs: 3500 }, // 14
  { nDistractors: 25, timeLimitMs: 3000 }, // 15
  { nDistractors: 30, timeLimitMs: 3000 }, // 16
  { nDistractors: 32, timeLimitMs: 2800 }, // 17
  { nDistractors: 35, timeLimitMs: 2500 }, // 18
  { nDistractors: 38, timeLimitMs: 2500 }, // 19
  { nDistractors: 40, timeLimitMs: 2000 }, // 20
];

const POOL_NUMERI = Array.from({ length: 9 }, (_, i) => String(i + 1));
const POOL_LETTERE = "ABCDEFGHIJKLMNOPRSTV".split("");
const POOL_FORME = ["◆","●","▲","■","★","◯","▼","◻"];
const POOL_PAROLE = ["GATTO","CANE","CASA","SOLE","MARE","LUNA","PANE","FIORE","LIBRO","ROSA"];

type StimulusType = "numeri_lettere" | "parole" | "forme";

interface Props {
  stimulusType: StimulusType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, accuratezza: number) => void;
  onReady?: () => void;
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function generaItems(tipo: StimulusType, n: number): { items: string[]; targetIdx: number } {
  let pool: string[];
  if (tipo === "numeri_lettere") pool = Math.random() > 0.5 ? POOL_NUMERI : POOL_LETTERE;
  else if (tipo === "forme") pool = POOL_FORME;
  else pool = POOL_PAROLE;

  const shuffled = shuffle(pool);
  const distractor = shuffled[0];
  const target = shuffled[1];
  const items = shuffle([target, ...Array(n).fill(distractor)]);
  const targetIdx = items.indexOf(target);
  return { items, targetIdx };
}

export default function OddOneOut({ stimulusType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = LIVELLI[Math.min(Math.max(livello - 1, 0), 19)];
  const [fase, setFase] = useState<"intro" | "gioco" | "feedback">("intro");
  const [items, setItems] = useState<string[]>([]);
  const [targetIdx, setTargetIdx] = useState(0);
  const [selezionato, setSelezionato] = useState<number | null>(null);
  const [timerMs, setTimerMs] = useState(cfg.timeLimitMs);
  const [risultati, setRisultati] = useState<boolean[]>([]);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);

  const nuovoTrial = useCallback(() => {
    const { items: it, targetIdx: ti } = generaItems(stimulusType, cfg.nDistractors);
    setItems(it);
    setTargetIdx(ti);
    setSelezionato(null);
    setTimerMs(cfg.timeLimitMs);
    setFase("gioco");
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
  }, [stimulusType, cfg]);

  useEffect(() => { const t = setTimeout(nuovoTrial, 1500); return () => clearTimeout(t); }, [nuovoTrial]);

  useEffect(() => {
    if (fase !== "gioco") return;
    if (timerMs <= 0) { handleTap(-1); return; }
    const t = setTimeout(() => setTimerMs(ms => ms - 100), 100);
    return () => clearTimeout(t);
  });

  function handleTap(idx: number) {
    if (fase !== "gioco") return;
    const ok = idx === targetIdx;
    setSelezionato(idx);
    setRisultati(r => [...r, ok]);
    setFase("feedback");
  }

  useEffect(() => {
    if (fase !== "feedback") return;
    const t = setTimeout(nuovoTrial, 1200);
    return () => clearTimeout(t);
  }, [fase, nuovoTrial]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = risultati.length > 0 ? Math.round((risultati.filter(Boolean).length / risultati.length) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, risultati, onComplete]);

  if (fase === "intro") return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center px-4">
      <span className="text-6xl">🔍</span>
      <p className="text-xl font-bold text-ink">Trova quello diverso</p>
      <p className="text-base" style={{ color: COLORS.inkMuted }}>Tocca l&apos;elemento che non si ripete</p>
    </div>
  );

  const cols = cfg.nDistractors <= 8 ? 3 : cfg.nDistractors <= 20 ? 4 : 5;
  const cellSize = cols === 3 ? 80 : cols === 4 ? 72 : 60;
  const timerPct = (timerMs / cfg.timeLimitMs) * 100;

  return (
    <div className="flex flex-col gap-4 py-4 px-2">
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.border }}>
        <div className="h-full rounded-full transition-all duration-100"
          style={{ width: `${timerPct}%`, backgroundColor: timerPct > 40 ? COLORS.primary : "#EF4444" }} />
      </div>

      <div className={`grid gap-2 mx-auto`} style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}>
        {items.map((item, i) => {
          const isTarget = i === targetIdx;
          const isSel = i === selezionato;
          let bg: string = COLORS.surfaceAlt;
          let border: string = COLORS.border;
          if (fase === "feedback" && isSel) { bg = isTarget ? COLORS.successLight : "#FEE2E2"; border = isTarget ? COLORS.success : "#EF4444"; }
          else if (fase === "feedback" && isTarget) { bg = COLORS.successLight; border = COLORS.success; }
          return (
            <button key={i} onClick={() => handleTap(i)}
              className="rounded-xl flex items-center justify-center font-bold active:scale-95 transition-all"
              style={{ width: cellSize, height: cellSize, backgroundColor: bg, border: `2px solid ${border}`, fontSize: stimulusType === "parole" ? 11 : 22, color: COLORS.ink }}>
              {item}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-center font-semibold" style={{ color: COLORS.inkMuted }}>{risultati.filter(Boolean).length} / {risultati.length} corretti</p>
    </div>
  );
}
