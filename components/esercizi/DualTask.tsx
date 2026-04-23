"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type LivelloConfig = {
  secondaryTask: "word_recognition" | "calcolo" | "lexical_decision";
  rhythmMs: number;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 5)  return { secondaryTask: "word_recognition", rhythmMs: 800 };
  if (idx <= 10) return { secondaryTask: "calcolo", rhythmMs: 800 };
  if (idx <= 15) return { secondaryTask: "calcolo", rhythmMs: 700 };
  return { secondaryTask: "lexical_decision", rhythmMs: 600 };
}

const PAROLE_REALI = ["CASA","SOLE","MARE","LUNA","PANE","ROSA","MANO","GATTO"];
const NON_PAROLE = ["BATRO","SELMO","CRUNTO","FOLPE","DASTI","MILVO","TRECA","SNOPE"];

function getSecondaryItem(task: LivelloConfig["secondaryTask"]): { testo: string; corretto: boolean | number; opzioni?: string[] } {
  if (task === "word_recognition") {
    const isParola = Math.random() < 0.5;
    const pool = isParola ? PAROLE_REALI : NON_PAROLE;
    return { testo: pool[Math.floor(Math.random() * pool.length)], corretto: isParola };
  }
  if (task === "calcolo") {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const risultato = a + b;
    const errato = risultato + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
    const scambiato = Math.random() < 0.5;
    return { testo: `${a} + ${b} = ?`, corretto: risultato, opzioni: scambiato ? [String(errato), String(risultato)] : [String(risultato), String(errato)] };
  }
  // lexical_decision
  const isParola = Math.random() < 0.5;
  const pool = isParola ? PAROLE_REALI : NON_PAROLE;
  return { testo: pool[Math.floor(Math.random() * pool.length)], corretto: isParola };
}

interface Props {
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

type Fase = "intro" | "running";

export default function DualTask({ livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimestamps = useRef<number[]>([]);
  const expectedTaps = useRef<number[]>([]);
  const startTime = useRef(0);
  const secundaryRef = useRef(getSecondaryItem(cfg.secondaryTask));

  const [fase, setFase] = useState<Fase>("intro");
  const [pulse, setPulse] = useState(false);
  const [secondaryItem, setSecondaryItem] = useState(secundaryRef.current);
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [_tapScore, setTapScore] = useState(0);

  const runMetronome = useCallback(() => {
    const now = Date.now();
    expectedTaps.current.push(now);
    setPulse(true);
    timerRef.current = setTimeout(() => setPulse(false), 200);
    timerRef.current = setTimeout(runMetronome, cfg.rhythmMs);
  }, [cfg.rhythmMs]);

  const rotateCognitive = useCallback(() => {
    const item = getSecondaryItem(cfg.secondaryTask);
    secundaryRef.current = item;
    setSecondaryItem(item);
    timerRef.current = setTimeout(rotateCognitive, 4000);
  }, [cfg.secondaryTask]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const cogScore = totale > 0 ? (corretti / totale) : 0;
    const rhythmScore = expectedTaps.current.length > 0
      ? Math.min(tapTimestamps.current.length / expectedTaps.current.length, 1)
      : 1;
    const score = Math.round(((cogScore + rhythmScore) / 2) * 100);
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function startGame() {
    startTime.current = Date.now();
    setFase("running");
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    runMetronome();
    rotateCognitive();
  }

  function handleTap() {
    const now = Date.now();
    tapTimestamps.current.push(now);
    setTapCount((c) => c + 1);
    const closest = expectedTaps.current.reduce((best, t) => Math.abs(t - now) < Math.abs(best - now) ? t : best, Infinity);
    const diff = Math.abs(closest - now);
    setTapScore((s) => s + (diff < 300 ? 1 : 0));
  }

  function handleCognitive(risposta: boolean | string) {
    const item = secundaryRef.current;
    let ok: boolean;
    if (cfg.secondaryTask === "calcolo") {
      ok = risposta === String(item.corretto);
    } else {
      ok = risposta === item.corretto;
    }
    setCorretti((c) => c + (ok ? 1 : 0));
    setTotale((t) => t + 1);
    const newItem = getSecondaryItem(cfg.secondaryTask);
    secundaryRef.current = newItem;
    setSecondaryItem(newItem);
  }

  const taskLabel: Record<LivelloConfig["secondaryTask"], string> = {
    word_recognition: "È una parola reale?",
    calcolo: "Calcola:",
    lexical_decision: "Parola reale o no?",
  };

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">🎵</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Doppio Compito</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Tappa a ritmo col metronomo in basso, E rispondi alle domande in alto!
        </p>
        <button onClick={startGame} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 px-3 min-h-full">
      <p className="text-sm font-medium text-center" style={{ color: COLORS.inkMuted }}>
        Cognitivo: {corretti}/{totale} | Tap: {tapCount}
      </p>

      {/* Zona cognitiva (sopra) */}
      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}` }}>
        <p className="text-sm font-bold text-center" style={{ color: COLORS.primary }}>{taskLabel[cfg.secondaryTask]}</p>
        <p className="text-xl font-extrabold text-center" style={{ color: COLORS.ink }}>{secondaryItem.testo}</p>
        {cfg.secondaryTask === "calcolo" && secondaryItem.opzioni ? (
          <div className="grid grid-cols-2 gap-3">
            {secondaryItem.opzioni.map((opt, i) => (
              <button key={i} onClick={() => handleCognitive(opt)}
                className="rounded-xl font-bold active:scale-95 transition-transform"
                style={{ height: 52, fontSize: 20, backgroundColor: COLORS.surface, border: `2px solid ${COLORS.border}`, color: COLORS.ink }}>
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleCognitive(true)}
              className="rounded-xl font-bold active:scale-95"
              style={{ height: 52, fontSize: 16, backgroundColor: COLORS.successLight, border: `2px solid ${COLORS.success}`, color: COLORS.success }}>
              ✓ Sì
            </button>
            <button onClick={() => handleCognitive(false)}
              className="rounded-xl font-bold active:scale-95"
              style={{ height: 52, fontSize: 16, backgroundColor: "#FEE2E2", border: `2px solid #EF4444`, color: "#EF4444" }}>
              ✗ No
            </button>
          </div>
        )}
      </div>

      {/* Zona tapping (sotto) */}
      <div className="flex flex-col items-center gap-3 mt-2">
        <div
          className="w-12 h-12 rounded-full transition-all duration-100"
          style={{ backgroundColor: pulse ? COLORS.primary : COLORS.border, transform: pulse ? "scale(1.3)" : "scale(1)" }}
        />
        <button onClick={handleTap}
          className="rounded-3xl w-full font-extrabold active:scale-95 transition-transform"
          style={{ height: 88, fontSize: 28, backgroundColor: COLORS.primaryLight, border: `3px solid ${COLORS.primary}`, color: COLORS.primary }}>
          🥁 TAP
        </button>
        <p className="text-xs text-center" style={{ color: COLORS.inkMuted }}>Tappa a ritmo col punto lampeggiante</p>
      </div>
    </div>
  );
}
