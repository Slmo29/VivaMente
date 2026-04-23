"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type Cue = "explicit" | "implicit";
type LivelloConfig = {
  cue: Cue;
  nRegole: number;
  isiMs: number;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { cue: "explicit", nRegole: 2, isiMs: 1500 };
  if (idx <= 4) return { cue: "explicit", nRegole: 2, isiMs: 1200 };
  if (idx <= 6) return { cue: "explicit", nRegole: 2, isiMs: 900 };
  if (idx <= 9) return { cue: "explicit", nRegole: 2, isiMs: 700 };
  if (idx <= 10) return { cue: "implicit", nRegole: 2, isiMs: 700 };
  if (idx <= 13) return { cue: "implicit", nRegole: 2, isiMs: 600 };
  if (idx <= 14) return { cue: "implicit", nRegole: 3, isiMs: 600 };
  if (idx <= 17) return { cue: "implicit", nRegole: 3, isiMs: 500 };
  return { cue: "implicit", nRegole: 3, isiMs: 400 };
}

// Regola A: pari/dispari, Regola B: >5 o ≤5
// Regola C (lv alti): cifra<5 o ≥5 (lato)
type Regola = "A" | "B" | "C";

interface Trial {
  numero: number;
  regola: Regola;
  correttaDir: "left" | "right"; // left = pari / ≤5 / <5, right = dispari / >5 / ≥5
}

function generateTrial(regola: Regola): Trial {
  const numero = Math.floor(Math.random() * 9) + 1;
  let correttaDir: "left" | "right";
  if (regola === "A") correttaDir = numero % 2 === 0 ? "left" : "right";
  else if (regola === "B") correttaDir = numero <= 5 ? "left" : "right";
  else correttaDir = numero < 5 ? "left" : "right";
  return { numero, regola, correttaDir };
}

const REGOLA_LABEL: Record<Regola, string> = {
  A: "PARI ← | DISPARI →",
  B: "≤5 ← | >5 →",
  C: "<5 ← | ≥5 →",
};
const REGOLA_ICON: Record<Regola, string> = { A: "2/3", B: "≤5/>5", C: "4/5" };

type Fase = "intro" | "cue" | "mostra" | "feedback";

interface Props {
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function TaskSwitching({ livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trialIdxRef = useRef(0);
  const correttiRef = useRef(0);
  const totaleRef = useRef(0);

  const regolaSeq: Regola[] = cfg.nRegole === 3 ? ["A", "B", "C"] : ["A", "B"];

  const [fase, setFase] = useState<Fase>("intro");
  const [trial, setTrial] = useState<Trial | null>(null);
  const [currentRegola, setCurrentRegola] = useState<Regola>("A");
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  const avanzaTrial = useCallback(() => {
    const idx = trialIdxRef.current;
    const regola = regolaSeq[idx % regolaSeq.length];
    const t = generateTrial(regola);
    setCurrentRegola(regola);
    setTrial(t);
    setLastOk(null);
    if (cfg.cue === "explicit") {
      setFase("cue");
      timerRef.current = setTimeout(() => {
        setFase("mostra");
        if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
      }, 900);
    } else {
      setFase("mostra");
      if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    }
    timerRef.current = setTimeout(() => {
      totaleRef.current++;
      setTotale(totaleRef.current);
      setLastOk(false);
      setFase("feedback");
      timerRef.current = setTimeout(() => { trialIdxRef.current++; avanzaTrial(); }, 500);
    }, cfg.isiMs + (cfg.cue === "explicit" ? 900 : 0));
  }, [cfg, regolaSeq]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const score = totaleRef.current > 0 ? Math.round((correttiRef.current / totaleRef.current) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, onComplete]);

  function handleRisposta(dir: "left" | "right") {
    if (fase !== "mostra" || !trial) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const ok = dir === trial.correttaDir;
    correttiRef.current += ok ? 1 : 0;
    totaleRef.current++;
    setCorretti(correttiRef.current);
    setTotale(totaleRef.current);
    setLastOk(ok);
    setFase("feedback");
    timerRef.current = setTimeout(() => { trialIdxRef.current++; avanzaTrial(); }, 500);
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">🔀</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Cambia Regola</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Classifica il numero secondo la regola mostrata. La regola cambia ad ogni turno!
        </p>
        <div className="flex flex-col gap-2 text-sm font-medium" style={{ color: COLORS.primary }}>
          <span>Regola A: PARI ← | DISPARI →</span>
          <span>Regola B: ≤5 ← | &gt;5 →</span>
          {cfg.nRegole === 3 && <span>Regola C: &lt;5 ← | ≥5 →</span>}
        </div>
        <button onClick={() => avanzaTrial()} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Corretti: {corretti} / {totale}</p>

      {cfg.cue === "explicit" && (
        <div className="rounded-xl px-4 py-2 text-center" style={{ backgroundColor: COLORS.primaryLight, border: `1px solid ${COLORS.primary}` }}>
          <p className="text-sm font-bold" style={{ color: COLORS.primary }}>
            {REGOLA_ICON[currentRegola]} — {REGOLA_LABEL[currentRegola]}
          </p>
        </div>
      )}

      <div
        className="w-44 h-44 rounded-3xl flex items-center justify-center"
        style={{
          backgroundColor: fase === "feedback" ? (lastOk ? COLORS.successLight : "#FEE2E2") : COLORS.primaryLight,
          border: `4px solid ${fase === "feedback" ? (lastOk ? COLORS.success : "#EF4444") : COLORS.primary}`,
        }}
      >
        {trial && fase !== "cue" && (
          <span className="font-extrabold" style={{ fontSize: 96, color: COLORS.primary }}>{trial.numero}</span>
        )}
        {fase === "cue" && (
          <span className="font-extrabold text-2xl" style={{ color: COLORS.primary }}>{REGOLA_LABEL[currentRegola]}</span>
        )}
      </div>

      {fase === "feedback" && <div className="text-4xl">{lastOk ? "✓" : "✗"}</div>}

      <div className="grid grid-cols-2 gap-6 w-full mt-1">
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
