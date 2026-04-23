"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type StimulusType = "forme" | "oggetti";

type LivelloConfig = {
  nTarget: number;
  gridN: number;
  bgComplexity: "bassa" | "media" | "alta";
  similarity: "bassa" | "media" | "alta";
  timeLimitMs: number;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { nTarget: 1, gridN: 4, bgComplexity: "bassa", similarity: "bassa", timeLimitMs: 8000 };
  if (idx <= 3) return { nTarget: 1, gridN: 4, bgComplexity: "bassa", similarity: "bassa", timeLimitMs: 7000 };
  if (idx <= 4) return { nTarget: 1, gridN: 5, bgComplexity: "media", similarity: "bassa", timeLimitMs: 6000 };
  if (idx <= 7) return { nTarget: 1, gridN: 5, bgComplexity: "media", similarity: "media", timeLimitMs: 5500 };
  if (idx <= 9) return { nTarget: 1, gridN: 6, bgComplexity: "media", similarity: "media", timeLimitMs: 4500 };
  if (idx <= 12) return { nTarget: 1, gridN: 6, bgComplexity: "alta", similarity: "media", timeLimitMs: 4000 };
  if (idx <= 14) return { nTarget: 2, gridN: 7, bgComplexity: "alta", similarity: "alta", timeLimitMs: 3500 };
  if (idx <= 17) return { nTarget: 2, gridN: 7, bgComplexity: "alta", similarity: "alta", timeLimitMs: 3000 };
  return { nTarget: 3, gridN: 8, bgComplexity: "alta", similarity: "alta", timeLimitMs: 2000 };
}

const DISTRACTOR_ANIMALI_BASSA = ["🐶","🐱","🐭","🐹","🐻","🐼","🐨","🐯"];
const DISTRACTOR_ANIMALI_MEDIA = ["🦊","🐺","🦝","🐗","🐴","🦄","🐝","🐛"];
const DISTRACTOR_ANIMALI_ALTA = ["🦔","🦡","🦫","🦦","🦥","🦘","🦙","🦞"];
const TARGET_ANIMALE = "🌟";
const TARGET_MEDIA = "🔶";
const TARGET_ALTA = "🔺";

const DISTRACTOR_OGGETTI_BASSA = ["⚽","🏀","🎾","🏈","⚾","🥎","🏐","🏉"];
const DISTRACTOR_OGGETTI_MEDIA = ["🎱","🏓","🏸","🥏","🎯","🎳","🏹","🪃"];
const DISTRACTOR_OGGETTI_ALTA = ["🪄","🎭","🎨","🎬","🎤","🎸","🥁","🎹"];
const TARGET_OGGETTO = "🌈";
const TARGET_OGGETTO_MEDIA = "🔷";
const TARGET_OGGETTO_ALTA = "🔻";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getEmoji(
  _stimulusType: StimulusType,
  bgComplexity: LivelloConfig["bgComplexity"],
  similarity: LivelloConfig["similarity"]
): { distractor: string; target: string } {
  if (_stimulusType === "forme") {
    const d = similarity === "bassa" ? DISTRACTOR_ANIMALI_BASSA[0]
      : similarity === "media" ? DISTRACTOR_ANIMALI_MEDIA[0]
      : DISTRACTOR_ANIMALI_ALTA[0];
    const t = similarity === "bassa" ? TARGET_ANIMALE : similarity === "media" ? TARGET_MEDIA : TARGET_ALTA;
    return { distractor: d, target: t };
  }
  const d = similarity === "bassa" ? DISTRACTOR_OGGETTI_BASSA[0]
    : similarity === "media" ? DISTRACTOR_OGGETTI_MEDIA[0]
    : DISTRACTOR_OGGETTI_ALTA[0];
  const t = similarity === "bassa" ? TARGET_OGGETTO : similarity === "media" ? TARGET_OGGETTO_MEDIA : TARGET_OGGETTO_ALTA;
  return { distractor: d, target: t };
}

function getDistractorPool(stimulusType: StimulusType, similarity: LivelloConfig["similarity"]): string[] {
  if (stimulusType === "forme") {
    return similarity === "bassa" ? DISTRACTOR_ANIMALI_BASSA : similarity === "media" ? DISTRACTOR_ANIMALI_MEDIA : DISTRACTOR_ANIMALI_ALTA;
  }
  return similarity === "bassa" ? DISTRACTOR_OGGETTI_BASSA : similarity === "media" ? DISTRACTOR_OGGETTI_MEDIA : DISTRACTOR_OGGETTI_ALTA;
}

function getTargetEmoji(stimulusType: StimulusType, similarity: LivelloConfig["similarity"]): string {
  if (stimulusType === "forme") return similarity === "bassa" ? TARGET_ANIMALE : similarity === "media" ? TARGET_MEDIA : TARGET_ALTA;
  return similarity === "bassa" ? TARGET_OGGETTO : similarity === "media" ? TARGET_OGGETTO_MEDIA : TARGET_OGGETTO_ALTA;
}

interface GridItem { emoji: string; isTarget: boolean; }

function buildGrid(cfg: LivelloConfig, stimulusType: StimulusType): GridItem[] {
  const total = cfg.gridN * cfg.gridN;
  const pool = getDistractorPool(stimulusType, cfg.similarity);
  const targetEmoji = getTargetEmoji(stimulusType, cfg.similarity);
  const targetPositions = new Set<number>();
  while (targetPositions.size < cfg.nTarget) targetPositions.add(Math.floor(Math.random() * total));
  return Array.from({ length: total }, (_, i) => {
    if (targetPositions.has(i)) return { emoji: targetEmoji, isTarget: true };
    return { emoji: pool[Math.floor(Math.random() * pool.length)], isTarget: false };
  });
}

type Fase = "intro" | "mostra" | "feedback";

interface Props {
  stimulusType: StimulusType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function FigureGround({ stimulusType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [grid, setGrid] = useState<GridItem[]>([]);
  const [fase, setFase] = useState<Fase>("intro");
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [trovati, setTrovati] = useState<Set<number>>(new Set());
  const [trialMs, setTrialMs] = useState(cfg.timeLimitMs);
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  const avanzaTrial = useCallback(() => {
    setGrid(buildGrid(cfg, stimulusType));
    setTrovati(new Set());
    setLastOk(null);
    setTrialMs(cfg.timeLimitMs);
    setFase("mostra");
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
  }, [cfg, stimulusType]);

  useEffect(() => {
    if (fase !== "mostra") return;
    if (trialMs <= 0) {
      const rimasti = grid.filter((g, i) => g.isTarget && !trovati.has(i)).length;
      setTotale((t) => t + 1);
      setLastOk(rimasti === 0);
      setFase("feedback");
      timerRef.current = setTimeout(avanzaTrial, 800);
      return;
    }
    const t = setTimeout(() => setTrialMs((m) => m - 100), 100);
    return () => clearTimeout(t);
  }, [fase, trialMs, grid, trovati, avanzaTrial]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleCellTap(idx: number) {
    if (fase !== "mostra") return;
    if (trovati.has(idx)) return;
    if (!grid[idx]?.isTarget) return;
    const nuovi = new Set(trovati).add(idx);
    setTrovati(nuovi);
    if (nuovi.size >= cfg.nTarget) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setCorretti((c) => c + 1);
      setTotale((t) => t + 1);
      setLastOk(true);
      setFase("feedback");
      timerRef.current = setTimeout(avanzaTrial, 700);
    }
  }

  const targetEmoji = getTargetEmoji(stimulusType, cfg.similarity);
  const cellSize = Math.min(Math.floor(320 / cfg.gridN), 52);

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">🔍</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Trova il diverso</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Trova il simbolo diverso nella griglia: <span style={{ fontSize: 28 }}>{targetEmoji}</span>
        </p>
        <button onClick={avanzaTrial} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-2">
      <div className="flex justify-between w-full px-2">
        <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Corretti: {corretti} / {totale}</p>
        <p className="text-sm font-medium" style={{ color: trialMs / cfg.timeLimitMs > 0.3 ? COLORS.inkMuted : "#EF4444" }}>{(trialMs / 1000).toFixed(1)}s</p>
      </div>

      <div className="w-full rounded-full overflow-hidden h-2 mb-1" style={{ backgroundColor: COLORS.border }}>
        <div className="h-full rounded-full transition-all duration-100" style={{ width: `${(trialMs / cfg.timeLimitMs) * 100}%`, backgroundColor: trialMs / cfg.timeLimitMs > 0.3 ? COLORS.primary : "#EF4444" }} />
      </div>

      <p className="text-sm" style={{ color: COLORS.inkMuted }}>Cerca: <span style={{ fontSize: 24 }}>{targetEmoji}</span></p>

      {fase === "feedback" && <div className="text-4xl">{lastOk ? "✓" : "✗"}</div>}

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cfg.gridN}, ${cellSize}px)` }}>
        {grid.map((item, i) => (
          <button key={i} onClick={() => handleCellTap(i)} disabled={fase !== "mostra"}
            className="rounded-lg flex items-center justify-center active:scale-95 transition-transform"
            style={{
              width: cellSize, height: cellSize,
              fontSize: cellSize * 0.55,
              backgroundColor: trovati.has(i) ? COLORS.successLight : COLORS.surfaceAlt,
              border: `1px solid ${trovati.has(i) ? COLORS.success : COLORS.border}`,
            }}>
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
