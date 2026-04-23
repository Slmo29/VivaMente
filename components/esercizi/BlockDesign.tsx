"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type StimulusType = "colori" | "bw";

type LivelloConfig = {
  nBlocks: 4 | 9 | 16;
  complexity: "semplice" | "media" | "alta";
  timeLimitMs: number | null;
  hints: "full" | "partial" | "none";
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { nBlocks: 4, complexity: "semplice", timeLimitMs: null, hints: "full" };
  if (idx <= 3) return { nBlocks: 4, complexity: "semplice", timeLimitMs: null, hints: "full" };
  if (idx <= 4) return { nBlocks: 4, complexity: "media", timeLimitMs: null, hints: "partial" };
  if (idx <= 7) return { nBlocks: 4, complexity: "media", timeLimitMs: null, hints: "partial" };
  if (idx <= 8) return { nBlocks: 9, complexity: "media", timeLimitMs: 30000, hints: "none" };
  if (idx <= 11) return { nBlocks: 9, complexity: "media", timeLimitMs: 25000, hints: "none" };
  if (idx <= 13) return { nBlocks: 9, complexity: "alta", timeLimitMs: 22000, hints: "none" };
  if (idx <= 14) return { nBlocks: 9, complexity: "alta", timeLimitMs: 20000, hints: "none" };
  if (idx <= 17) return { nBlocks: 16, complexity: "alta", timeLimitMs: 15000, hints: "none" };
  return { nBlocks: 16, complexity: "alta", timeLimitMs: 10000, hints: "none" };
}

const COLORI_SEMPLICE = ["#EF4444", "#3B82F6"];
const COLORI_MEDIA = ["#EF4444", "#3B82F6", "#22C55E"];
const COLORI_ALTA = ["#EF4444", "#3B82F6", "#22C55E", "#EAB308"];
const BW_SEMPLICE = ["#1A1A2E", "#FFFFFF"];
const BW_ALTA = ["#1A1A2E", "#FFFFFF", "#888888"];

function getColori(stimulusType: StimulusType, complexity: LivelloConfig["complexity"]): string[] {
  if (stimulusType === "bw") return complexity === "alta" ? BW_ALTA : BW_SEMPLICE;
  return complexity === "semplice" ? COLORI_SEMPLICE : complexity === "media" ? COLORI_MEDIA : COLORI_ALTA;
}

function generateTarget(n: number, colori: string[]): string[] {
  return Array.from({ length: n }, () => colori[Math.floor(Math.random() * colori.length)]);
}

type Fase = "intro" | "mostra_target" | "componi" | "feedback";

interface Props {
  stimulusType: StimulusType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function BlockDesign({ stimulusType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colori = getColori(stimulusType, cfg.complexity);
  const gridSize = Math.sqrt(cfg.nBlocks);

  const [target, setTarget] = useState<string[]>([]);
  const [utente, setUtente] = useState<string[]>([]);
  const [fase, setFase] = useState<Fase>("intro");
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [trialMs, setTrialMs] = useState(cfg.timeLimitMs ?? 0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  const avanzaTrial = useCallback(() => {
    const t = generateTarget(cfg.nBlocks, colori);
    setTarget(t);
    setUtente(Array(cfg.nBlocks).fill(colori[0]));
    setLastOk(null);
    setFase("mostra_target");
    timerRef.current = setTimeout(() => {
      setFase("componi");
      if (cfg.timeLimitMs) setTrialMs(cfg.timeLimitMs);
      if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    }, 2500);
  }, [cfg.nBlocks, cfg.timeLimitMs, colori]);

  useEffect(() => {
    if (fase !== "componi" || !cfg.timeLimitMs) return;
    if (trialMs <= 0) {
      valuta();
      return;
    }
    const t = setTimeout(() => setTrialMs((m) => m - 100), 100);
    return () => clearTimeout(t);
  }, [fase, trialMs, cfg.timeLimitMs]);

  function valuta() {
    const ok = utente.every((c, i) => c === target[i]);
    setCorretti((c) => c + (ok ? 1 : 0));
    setTotale((t) => t + 1);
    setLastOk(ok);
    setFase("feedback");
    timerRef.current = setTimeout(avanzaTrial, 1000);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleCellTap(idx: number) {
    if (fase !== "componi") return;
    setUtente((prev) => {
      const next = [...prev];
      const currIdx = colori.indexOf(next[idx]);
      next[idx] = colori[(currIdx + 1) % colori.length];
      return next;
    });
  }

  function handleConferma() {
    if (timerRef.current) clearTimeout(timerRef.current);
    valuta();
  }

  const cellSize = Math.min(Math.floor(280 / gridSize), 72);

  function renderGrid(data: string[], interactive = false) {
    return (
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)` }}>
        {data.map((colore, i) => (
          <button key={i} onClick={interactive ? () => handleCellTap(i) : undefined}
            disabled={!interactive}
            className="rounded-lg active:scale-95 transition-all"
            style={{ width: cellSize, height: cellSize, backgroundColor: colore, border: `2px solid ${COLORS.border}` }}
          />
        ))}
      </div>
    );
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">🎨</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Block Design</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Guarda il pattern, poi riproducilo toccando le celle per cambiare colore.
        </p>
        <button onClick={avanzaTrial} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-3">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Corretti: {corretti} / {totale}</p>

      {cfg.timeLimitMs && fase === "componi" && (
        <div className="w-full rounded-full overflow-hidden h-2" style={{ backgroundColor: COLORS.border }}>
          <div className="h-full rounded-full transition-all duration-100" style={{ width: `${(trialMs / cfg.timeLimitMs) * 100}%`, backgroundColor: trialMs / cfg.timeLimitMs > 0.4 ? COLORS.primary : "#EF4444" }} />
        </div>
      )}

      {/* Target visibile solo durante memorizzazione e feedback */}
      {(fase === "mostra_target" || fase === "feedback") && (
        <>
          <p className="text-sm font-bold" style={{ color: COLORS.inkMuted }}>Pattern da copiare:</p>
          {renderGrid(target, false)}
        </>
      )}

      {fase === "feedback" && <div className="text-4xl">{lastOk ? "✓" : "✗"}</div>}

      {(fase === "componi" || fase === "feedback") && (
        <>
          <p className="text-sm font-bold" style={{ color: COLORS.inkMuted }}>Il tuo pattern (tocca per cambiare):</p>
          {renderGrid(utente, fase === "componi")}
        </>
      )}

      {fase === "mostra_target" && (
        <div className="flex gap-2 mt-2">
          {[0,1,2].map((i) => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: COLORS.primary, animationDelay: `${i * 0.15}s` }} />)}
        </div>
      )}

      {fase === "componi" && (
        <>
          {cfg.hints === "full" && (
            <p className="text-xs text-center" style={{ color: COLORS.inkMuted }}>
              Colori disponibili: {colori.map((c, i) => <span key={i} className="inline-block w-4 h-4 rounded-sm mx-1" style={{ backgroundColor: c, display: "inline-block" }} />)}
            </p>
          )}
          <button onClick={handleConferma} className="rounded-2xl font-bold text-white py-3 px-8 text-base active:scale-95" style={{ backgroundColor: COLORS.primary }}>
            Conferma
          </button>
        </>
      )}
    </div>
  );
}
