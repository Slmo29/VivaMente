"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type StimulusType = "parole_semantiche" | "parole_non_correlate" | "numeri" | "parole_living" | "parole_non_living" | "immagini";

type LivelloConfig = {
  nItems: number;
  distractors: "non_correlati" | "semantici" | "fonetici";
  delayS: number;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { nItems: 5, distractors: "non_correlati", delayS: 0 };
  if (idx <= 4) return { nItems: 6, distractors: "non_correlati", delayS: 0 };
  if (idx <= 5) return { nItems: 7, distractors: "semantici", delayS: 30 };
  if (idx <= 9) return { nItems: 8, distractors: "semantici", delayS: 60 };
  if (idx <= 11) return { nItems: 10, distractors: "semantici", delayS: 120 };
  if (idx <= 14) return { nItems: 11, distractors: "semantici", delayS: 150 };
  if (idx <= 16) return { nItems: 13, distractors: "fonetici", delayS: 180 };
  if (idx <= 18) return { nItems: 14, distractors: "fonetici", delayS: 240 };
  return { nItems: 15, distractors: "fonetici", delayS: 300 };
}

const POOL_SEMANTICHE = ["CANE","GATTO","ORSO","TOPO","AQUILA","LEONE","TIGRE","VOLPE","LUPO","CERVO","CAPRA","CONIGLIO"];
const POOL_LIVING = ["CANE","GATTO","ORSO","LEON","AQUILA","RONDINE","CAPRA","TOPO","TIGRE","VOLPE"];
const POOL_NON_LIVING = ["TAVOLO","SEDIA","PORTA","FINESTRA","LAMPADA","LIBRO","BORSA","SCARPA","CHIAVE","PENNA"];
const POOL_NON_CORRELATE = ["CASA","LUNA","PANE","FIORE","MANO","VINO","NOTTE","ACQUA","SOLE","MARE","ROSA","PIETRA"];
const POOL_NUMERI = ["3","7","12","5","18","9","14","2","16","8","11","4","19","6","13","21"];
const POOL_IMMAGINI = ["🍎","🐱","🚗","🌸","⭐","🏠","🎵","🍕","🐶","🌙","🌊","🦋","🌴","🎈","🦁","🍓"];

const DISTRATTORI_FONETICI: Record<string, string> = {
  "CANE": "CANI", "GATTO": "GETTI", "CASA": "COSE", "SOLE": "SALE",
  "PANE": "PINE", "MARE": "MORE", "MANO": "MONO", "FIORE": "FIERO",
  "LUNA": "LENA", "ROSA": "RISA", "ORSO": "URSO", "TOPO": "TIPO",
};

function getPool(st: StimulusType): string[] {
  if (st === "parole_semantiche") return POOL_SEMANTICHE;
  if (st === "parole_living") return POOL_LIVING;
  if (st === "parole_non_living") return POOL_NON_LIVING;
  if (st === "numeri") return POOL_NUMERI;
  if (st === "immagini") return POOL_IMMAGINI;
  return POOL_NON_CORRELATE;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildRispondiItems(targets: string[], pool: string[], distractors: LivelloConfig["distractors"]): { val: string; isTarget: boolean }[] {
  const nDist = Math.min(targets.length + 4, pool.length);
  let distPool: string[];
  if (distractors === "fonetici") {
    distPool = targets.map((t) => DISTRATTORI_FONETICI[t] ?? t + "O").filter((d) => !targets.includes(d));
    const extra = pool.filter((x) => !targets.includes(x));
    while (distPool.length < nDist - targets.length) distPool.push(extra[distPool.length % extra.length]);
  } else {
    distPool = shuffle(pool.filter((x) => !targets.includes(x))).slice(0, nDist - targets.length);
  }
  return shuffle([
    ...targets.map((v) => ({ val: v, isTarget: true })),
    ...distPool.map((v) => ({ val: v, isTarget: false })),
  ]);
}

type Fase = "intro" | "mostra" | "countdown" | "rispondi" | "feedback";

interface Props {
  stimulusType: StimulusType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function MemoriaLista({ stimulusType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const pool = getPool(stimulusType);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);

  const targetsRef = useRef<string[]>(shuffle(pool).slice(0, cfg.nItems));
  const [targets, setTargets] = useState<string[]>(() => targetsRef.current);
  const [idxMostrato, setIdxMostrato] = useState(0);
  const [fase, setFase] = useState<Fase>("intro");
  const [countdownLeft, setCountdownLeft] = useState(cfg.delayS);
  const [rispondiItems, setRispondiItems] = useState<{ val: string; isTarget: boolean }[]>([]);
  const [selezioni, setSelezioni] = useState<Set<string>>(new Set());
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);

  const avanzaMostra = useCallback((idx: number) => {
    const currentTargets = targetsRef.current;
    if (idx >= currentTargets.length) {
      if (cfg.delayS > 0) {
        setFase("countdown");
        setCountdownLeft(cfg.delayS);
      } else {
        setRispondiItems(buildRispondiItems(currentTargets, pool, cfg.distractors));
        setFase("rispondi");
        if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
      }
      return;
    }
    setIdxMostrato(idx);
    setFase("mostra");
    setTimeout(() => avanzaMostra(idx + 1), 1400);
  }, [pool, cfg.delayS, cfg.distractors, cfg.nItems]);

  useEffect(() => {
    const t = setTimeout(() => avanzaMostra(0), 1500);
    return () => clearTimeout(t);
  }, [avanzaMostra]);

  useEffect(() => {
    if (fase !== "countdown") return;
    if (countdownLeft <= 0) {
      setRispondiItems(buildRispondiItems(targetsRef.current, pool, cfg.distractors));
      setFase("rispondi");
      if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
      return;
    }
    const t = setTimeout(() => setCountdownLeft((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [fase, countdownLeft, targets, pool, cfg.distractors, cfg.nItems]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleToggle(val: string) {
    setSelezioni((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val); else next.add(val);
      return next;
    });
  }

  function handleConferma() {
    let corr = 0;
    targets.forEach((t) => { if (selezioni.has(t)) corr++; });
    const _penalita = Array.from(selezioni).filter((s) => !targets.includes(s)).length; void _penalita;
    setCorretti((c) => c + corr);
    setTotale((t) => t + targets.length);
    setFase("feedback");
    setTimeout(() => {
      if (completato.current) return;
      // genera nuova lista e riparte; il tempoScaduto chiuderà l'esercizio
      const newTargets = shuffle(pool).slice(0, cfg.nItems);
      targetsRef.current = newTargets;
      setTargets(newTargets);
      setIdxMostrato(0);
      setSelezioni(new Set());
      setCountdownLeft(cfg.delayS);
      avanzaMostra(0);
    }, 1500);
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
        <span className="text-6xl">📋</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Memorizza la lista</p>
        <p className="text-base" style={{ color: COLORS.inkMuted }}>Guarda gli elementi uno per uno, poi selezionali dalla lista mista.</p>
        <div className="flex gap-2 mt-4">
          {[0,1,2].map((i) => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: COLORS.primary, animationDelay: `${i * 0.15}s` }} />)}
        </div>
      </div>
    );
  }

  if (fase === "mostra") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 px-4">
        <div className="flex gap-1">
          {targets.map((_, i) => <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: i <= idxMostrato ? COLORS.primary : COLORS.border }} />)}
        </div>
        <div className="w-48 h-48 rounded-3xl flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight, border: `3px solid ${COLORS.primary}` }}>
          <span className="font-extrabold text-center px-4" style={{ fontSize: stimulusType === "immagini" ? 80 : 32, color: COLORS.primary }}>
            {targets[idxMostrato]}
          </span>
        </div>
        <p className="text-sm" style={{ color: COLORS.inkMuted }}>{idxMostrato + 1} / {targets.length}</p>
      </div>
    );
  }

  if (fase === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
        <p className="text-base font-bold" style={{ color: COLORS.ink }}>Attendi…</p>
        <div className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-extrabold" style={{ backgroundColor: COLORS.primaryLight, border: `3px solid ${COLORS.primary}`, color: COLORS.primary }}>
          {countdownLeft}s
        </div>
        <p className="text-sm" style={{ color: COLORS.inkMuted }}>Poi dovrai ricordare gli elementi</p>
      </div>
    );
  }

  if (fase === "rispondi") {
    return (
      <div className="flex flex-col gap-4 py-4 px-3">
        <p className="text-base font-bold text-center" style={{ color: COLORS.ink }}>Tocca gli elementi che erano nella lista</p>
        <div className="grid grid-cols-3 gap-2">
          {rispondiItems.map((item, i) => (
            <button key={i} onClick={() => handleToggle(item.val)}
              className="rounded-2xl flex items-center justify-center font-bold active:scale-95 transition-transform"
              style={{
                height: 60, fontSize: stimulusType === "immagini" ? 32 : 15,
                backgroundColor: selezioni.has(item.val) ? COLORS.primaryLight : COLORS.surfaceAlt,
                border: `2px solid ${selezioni.has(item.val) ? COLORS.primary : COLORS.border}`,
                color: selezioni.has(item.val) ? COLORS.primary : COLORS.ink,
              }}>
              {item.val}
            </button>
          ))}
        </div>
        <button onClick={handleConferma} className="rounded-2xl font-bold text-white active:scale-95 transition-transform"
          style={{ height: 56, fontSize: 18, backgroundColor: COLORS.primary, border: "none" }}>
          Conferma ({selezioni.size} selezionati)
        </button>
      </div>
    );
  }

  if (fase === "feedback") {
    const pct = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    return (
      <div className="flex flex-col items-center gap-5 py-16 px-4 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl" style={{ backgroundColor: pct >= 70 ? COLORS.successLight : "#FEE2E2" }}>
          {pct >= 70 ? "✓" : "✗"}
        </div>
        <p className="text-2xl font-extrabold" style={{ color: pct >= 70 ? COLORS.success : "#EF4444" }}>{pct}%</p>
        <p className="text-sm" style={{ color: COLORS.inkMuted }}>{corretti} / {totale} elementi corretti</p>
      </div>
    );
  }

  return null;
}
