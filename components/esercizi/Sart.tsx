"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type StimType = "cifre" | "lettere" | "simboli";
type LivelloConfig = {
  nStim: number;
  targetFreq: number;
  isiMs: number;
  tipo: StimType;
  masking: boolean;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0)  return { nStim: 50, targetFreq: 0.10, isiMs: 1000, tipo: "cifre", masking: false };
  if (idx <= 4)  return { nStim: 60, targetFreq: 0.10, isiMs: 850, tipo: "cifre", masking: false };
  if (idx <= 7)  return { nStim: 100, targetFreq: 0.10, isiMs: 650, tipo: "cifre", masking: false };
  if (idx <= 9)  return { nStim: 120, targetFreq: 0.08, isiMs: 580, tipo: "cifre", masking: false };
  if (idx <= 11) return { nStim: 130, targetFreq: 0.05, isiMs: 530, tipo: "lettere", masking: false };
  if (idx <= 14) return { nStim: 140, targetFreq: 0.05, isiMs: 480, tipo: "lettere", masking: false };
  if (idx <= 15) return { nStim: 160, targetFreq: 0.02, isiMs: 420, tipo: "simboli", masking: true };
  if (idx <= 17) return { nStim: 175, targetFreq: 0.02, isiMs: 360, tipo: "simboli", masking: true };
  return { nStim: 200, targetFreq: 0.02, isiMs: 300, tipo: "simboli", masking: true };
}

const POOL_CIFRE = ["1","2","4","5","6","7","8","9"];
const TARGET_CIFRE = "3";
const POOL_LETTERE = ["A","B","D","E","F","G","H","I","L","M","N","O","P","R","S","T","U","V","Z"];
const TARGET_LETTERE = "X";
const POOL_SIMBOLI = ["#","$","%","&","*","!","?","+","=","~"];
const TARGET_SIMBOLI = "@";

function getStimuli(tipo: StimType): { pool: string[]; target: string } {
  if (tipo === "cifre") return { pool: POOL_CIFRE, target: TARGET_CIFRE };
  if (tipo === "lettere") return { pool: POOL_LETTERE, target: TARGET_LETTERE };
  return { pool: POOL_SIMBOLI, target: TARGET_SIMBOLI };
}

function generateSequenza(nStim: number, targetFreq: number, tipo: StimType): { stim: string; isTarget: boolean }[] {
  const { pool, target } = getStimuli(tipo);
  return Array.from({ length: nStim }, () => {
    const isTarget = Math.random() < targetFreq;
    const stim = isTarget ? target : pool[Math.floor(Math.random() * pool.length)];
    return { stim, isTarget };
  });
}

interface Props {
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

type Fase = "intro" | "running" | "fine";

export default function Sart({ livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const { target: _target } = getStimuli(cfg.tipo);

  const [sequenza] = useState(() => generateSequenza(cfg.nStim, cfg.targetFreq, cfg.tipo));
  const [idxCorrente, setIdxCorrente] = useState(0);
  const [visibile, setVisibile] = useState(false);
  const [fase, setFase] = useState<Fase>("intro");
  const [corretteGo, setCorretteGo] = useState(0);
  const [corretteNogo, setCorretteNogo] = useState(0);
  const [totaleGo, setTotaleGo] = useState(0);
  const [totaleNogo, setTotaleNogo] = useState(0);
  const [riprodotto, setRiprodotto] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avanzaTrial = useCallback((idx: number) => {
    if (idx >= sequenza.length) {
      if (!completato.current) {
        completato.current = true;
        const tot = totaleGo + totaleNogo;
        const corr = corretteGo + corretteNogo;
        const score = tot > 0 ? Math.round((corr / tot) * 100) : 0;
        onComplete(score, score);
      }
      return;
    }
    setIdxCorrente(idx);
    setRiprodotto(false);
    setVisibile(true);
    if (cfg.masking) {
      timerRef.current = setTimeout(() => setVisibile(false), 250);
    }
    timerRef.current = setTimeout(() => {
      const item = sequenza[idx];
      if (!item.isTarget) {
        setTotaleGo((t) => t + 1);
        if (!riprodotto) setCorretteNogo((c) => c + 1); // no-tap on go = wrong, but this is handled via tap
      } else {
        setTotaleNogo((t) => t + 1);
        if (!riprodotto) setCorretteNogo((c) => c + 1); // no-tap on nogo = correct
      }
      avanzaTrial(idx + 1);
    }, cfg.isiMs);
  }, [sequenza, cfg.masking, cfg.isiMs, totaleGo, totaleNogo, corretteGo, corretteNogo, riprodotto, onComplete]);

  // Simpler direct approach
  const idxRef = useRef(0);
  const tapRef = useRef(false);
  const tGoRef = useRef(0);
  const tNoGoRef = useRef(0);
  const cGoRef = useRef(0);
  const cNoGoRef = useRef(0);

  const runTrial = useCallback((idx: number) => {
    if (idx >= sequenza.length) {
      if (!completato.current) {
        completato.current = true;
        const tot = tGoRef.current + tNoGoRef.current;
        const corr = cGoRef.current + cNoGoRef.current;
        const score = tot > 0 ? Math.round((corr / tot) * 100) : 0;
        onComplete(score, score);
      }
      return;
    }
    idxRef.current = idx;
    tapRef.current = false;
    setIdxCorrente(idx);
    setVisibile(true);
    if (cfg.masking) {
      setTimeout(() => setVisibile(false), 250);
    }
    timerRef.current = setTimeout(() => {
      const item = sequenza[idx];
      if (item.isTarget) {
        tNoGoRef.current++;
        if (!tapRef.current) cNoGoRef.current++; // corretto: non ha toccato
      } else {
        tGoRef.current++;
        if (tapRef.current) cGoRef.current++; // corretto: ha toccato
      }
      setTotaleGo(tGoRef.current);
      setTotaleNogo(tNoGoRef.current);
      setCorretteGo(cGoRef.current);
      setCorretteNogo(cNoGoRef.current);
      runTrial(idx + 1);
    }, cfg.isiMs);
  }, [sequenza, cfg.masking, cfg.isiMs, onComplete]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const tot = tGoRef.current + tNoGoRef.current;
    const corr = cGoRef.current + cNoGoRef.current;
    const score = tot > 0 ? Math.round((corr / tot) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, onComplete]);

  function handleTap() {
    if (fase !== "running") return;
    tapRef.current = true;
  }

  function startGame() {
    setFase("running");
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    runTrial(0);
  }

  const stimCorrente = sequenza[idxCorrente];
  const tipoLabel = cfg.tipo === "cifre" ? "numero 3" : cfg.tipo === "lettere" ? "lettera X" : "simbolo @";
  const totale = totaleGo + totaleNogo;
  const corretti = corretteGo + corretteNogo;

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">⚡</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Reazione veloce</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Tocca lo schermo per ogni stimolo, <strong>TRANNE</strong> quando appare il <strong>{tipoLabel}</strong>.
        </p>
        <button onClick={startGame} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 px-4">
      <div className="flex gap-4 text-sm font-medium" style={{ color: COLORS.inkMuted }}>
        <span>Corretti: {corretti}</span>
        <span>Totale: {totale}</span>
      </div>

      <div
        onClick={handleTap}
        className="w-52 h-52 rounded-3xl flex items-center justify-center cursor-pointer active:scale-95 transition-transform select-none"
        style={{
          backgroundColor: visibile && stimCorrente?.isTarget ? "#FEE2E2" : COLORS.primaryLight,
          border: `4px solid ${visibile && stimCorrente?.isTarget ? "#EF4444" : COLORS.primary}`,
        }}
      >
        {visibile && stimCorrente ? (
          <span className="font-extrabold" style={{ fontSize: 96, color: stimCorrente.isTarget ? "#EF4444" : COLORS.primary }}>
            {stimCorrente.stim}
          </span>
        ) : (
          <span style={{ color: COLORS.border, fontSize: 48 }}>+</span>
        )}
      </div>

      <p className="text-sm text-center" style={{ color: COLORS.inkMuted }}>
        {idxCorrente + 1} / {sequenza.length} — Non toccare il <strong>{tipoLabel}</strong>!
      </p>

      <div className="w-full rounded-full overflow-hidden h-2" style={{ backgroundColor: COLORS.border }}>
        <div className="h-full rounded-full transition-all duration-100" style={{ width: `${((idxCorrente + 1) / sequenza.length) * 100}%`, backgroundColor: COLORS.primary }} />
      </div>
    </div>
  );
}
