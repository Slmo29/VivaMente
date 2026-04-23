"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type StimulusType = "numerici" | "parole_living" | "parole_non_living" | "parole_miste" | "misti";

type LivelloConfig = {
  seqLen: number;
  speedMs: number;
  ruleType: "singola" | "switching" | "switching_2" | "switching_3";
  trialsPerSession: number;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { seqLen: 3, speedMs: 2000, ruleType: "singola",    trialsPerSession: 8 };
  if (idx <= 3) return { seqLen: 4, speedMs: 1900, ruleType: "singola",    trialsPerSession: 8 };
  if (idx <= 4) return { seqLen: 5, speedMs: 1800, ruleType: "singola",    trialsPerSession: 7 };
  if (idx <= 7) return { seqLen: 6, speedMs: 1600, ruleType: "singola",    trialsPerSession: 7 };
  if (idx <= 9) return { seqLen: 7, speedMs: 1500, ruleType: "switching",  trialsPerSession: 6 };
  if (idx <= 12) return { seqLen: 8, speedMs: 1400, ruleType: "switching",  trialsPerSession: 6 };
  if (idx <= 14) return { seqLen: 10, speedMs: 1300, ruleType: "switching_2", trialsPerSession: 5 };
  if (idx <= 17) return { seqLen: 12, speedMs: 1000, ruleType: "switching_2", trialsPerSession: 5 };
  return { seqLen: 15, speedMs: 800, ruleType: "switching_3", trialsPerSession: 4 };
}

const PAROLE_LIVING = ["CANE","GATTO","ORSO","LEONE","AQUILA","RONDINE","CAPRA","TOPO","TIGRE","VOLPE"];
const PAROLE_NON_LIVING = ["TAVOLO","SEDIA","PORTA","FINESTRA","LAMPADA","LIBRO","BORSA","SCARPA","CHIAVE","PENNA"];
const PAROLE_MISTE = [...PAROLE_LIVING, ...PAROLE_NON_LIVING];
const NUMERI_POOL = [3,7,12,5,18,9,14,2,16,8,11,4,19,6,13];

function getPool(stimulusType: StimulusType): (string | number)[] {
  if (stimulusType === "numerici") return NUMERI_POOL;
  if (stimulusType === "parole_living") return PAROLE_LIVING;
  if (stimulusType === "parole_non_living") return PAROLE_NON_LIVING;
  return PAROLE_MISTE;
}

function genSeq(pool: (string | number)[], len: number): (string | number)[] {
  return Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]);
}

function getTarget(seq: (string | number)[], stimulusType: StimulusType): string | number {
  if (stimulusType === "numerici") return Math.max(...(seq as number[]));
  return seq[seq.length - 1];
}

function getOptions(target: string | number, pool: (string | number)[], isNumeric: boolean): (string | number)[] {
  const opts = new Set<string | number>([target]);
  const filtered = pool.filter((x) => x !== target);
  while (opts.size < 4 && filtered.length > 0) {
    const r = filtered.splice(Math.floor(Math.random() * filtered.length), 1)[0];
    if (isNumeric) {
      const delta = Math.floor(Math.random() * 6) - 3;
      opts.add((target as number) + delta + 1);
    } else {
      opts.add(r);
    }
  }
  const arr = Array.from(opts).slice(0, 4);
  while (arr.length < 4) arr.push(isNumeric ? Math.floor(Math.random() * 20) + 1 : pool[0]);
  return arr.sort(() => Math.random() - 0.5);
}

type Fase = "intro" | "mostra" | "rispondi" | "feedback";

interface Props {
  stimulusType: StimulusType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function UpdatingWm({ stimulusType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const pool = getPool(stimulusType);
  const isNumeric = stimulusType === "numerici";

  const seqRef = useRef<(string | number)[]>(genSeq(pool, cfg.seqLen));
  const trialRef = useRef(0);
  const [idxMostrato, setIdxMostrato] = useState(0);
  const [fase, setFase] = useState<Fase>("intro");
  const [opzioni, setOpzioni] = useState<(string | number)[]>([]);
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [target, setTarget] = useState<string | number | null>(null);

  const avanzaMostra = useCallback((idx: number) => {
    const seq = seqRef.current;
    if (idx >= seq.length) {
      const t = getTarget(seq, stimulusType);
      setTarget(t);
      setOpzioni(getOptions(t, pool, isNumeric));
      setFase("rispondi");
      if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
      return;
    }
    setIdxMostrato(idx);
    setFase("mostra");
    setTimeout(() => avanzaMostra(idx + 1), cfg.speedMs);
  }, [stimulusType, pool, isNumeric, cfg.speedMs]);

  useEffect(() => {
    const t = setTimeout(() => avanzaMostra(0), 1500);
    return () => clearTimeout(t);
  }, [avanzaMostra]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleScelta(val: string | number) {
    if (fase !== "rispondi") return;
    const ok = val === target;
    setCorretti((c) => c + (ok ? 1 : 0));
    setTotale((t) => t + 1);
    setLastOk(ok);
    setFase("feedback");
    setTimeout(() => {
      trialRef.current += 1;
      if (!completato.current && trialRef.current >= cfg.trialsPerSession) {
        completato.current = true;
        const nuoviC = corretti + (ok ? 1 : 0);
        const nuoviT = totale + 1;
        const score = nuoviT > 0 ? Math.round((nuoviC / nuoviT) * 100) : 0;
        onComplete(score, score);
        return;
      }
      seqRef.current = genSeq(pool, cfg.seqLen);
      setIdxMostrato(0);
      setLastOk(null);
      avanzaMostra(0);
    }, 1200);
  }

  if (fase === "intro") {
    const regola = isNumeric ? "il numero più GRANDE" : "l'ULTIMO elemento";
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
        <span className="text-6xl">🧠</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Aggiorna nella mente</p>
        <p className="text-base" style={{ color: COLORS.inkMuted }}>
          Guarda gli elementi e ricorda sempre {regola}. Alla fine dovrai rispondere.
        </p>
        <div className="flex gap-2 mt-4">
          {[0,1,2].map((i) => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: COLORS.primary, animationDelay: `${i * 0.15}s` }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-4">
      <div className="flex gap-2">
        {seqRef.current.map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full transition-all" style={{ backgroundColor: i < idxMostrato ? COLORS.primary : i === idxMostrato && fase === "mostra" ? COLORS.accent1 : COLORS.border }} />
        ))}
      </div>

      {fase === "mostra" && (
        <div className="w-44 h-44 rounded-3xl flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight, border: `3px solid ${COLORS.primary}` }}>
          <span className="font-extrabold" style={{ fontSize: isNumeric ? 64 : 28, color: COLORS.primary }}>
            {seqRef.current[idxMostrato]}
          </span>
        </div>
      )}

      {fase === "rispondi" && (
        <>
          <p className="text-base font-bold" style={{ color: COLORS.ink }}>
            {isNumeric ? "Qual è il numero più grande che hai visto?" : "Qual è stato l'ultimo elemento?"}
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {opzioni.map((opt, i) => (
              <button key={i} onClick={() => handleScelta(opt)}
                className="rounded-2xl flex items-center justify-center font-bold active:scale-95 transition-transform"
                style={{ height: 64, fontSize: isNumeric ? 28 : 18, backgroundColor: COLORS.surfaceAlt, border: `2px solid ${COLORS.border}`, color: COLORS.ink }}>
                {opt}
              </button>
            ))}
          </div>
        </>
      )}

      {fase === "feedback" && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl" style={{ backgroundColor: lastOk ? COLORS.successLight : "#FEE2E2" }}>
            {lastOk ? "✓" : "✗"}
          </div>
          <p className="text-lg font-extrabold" style={{ color: lastOk ? COLORS.success : "#EF4444" }}>
            {lastOk ? "Corretto!" : `La risposta era: ${target}`}
          </p>
        </div>
      )}
    </div>
  );
}
