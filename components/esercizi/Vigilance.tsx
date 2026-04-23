"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type LivelloConfig = {
  criticalEveryS: number;
  jumpDegrees: number;
  distractors: boolean;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { criticalEveryS: 40, jumpDegrees: 30, distractors: false };
  if (idx <= 4) return { criticalEveryS: 45, jumpDegrees: 25, distractors: false };
  if (idx <= 6) return { criticalEveryS: 55, jumpDegrees: 20, distractors: false };
  if (idx <= 10) return { criticalEveryS: 60, jumpDegrees: 18, distractors: false };
  if (idx <= 12) return { criticalEveryS: 70, jumpDegrees: 12, distractors: true };
  if (idx <= 15) return { criticalEveryS: 80, jumpDegrees: 10, distractors: true };
  if (idx <= 17) return { criticalEveryS: 85, jumpDegrees: 8, distractors: true };
  return { criticalEveryS: 90, jumpDegrees: 6, distractors: true };
}

const TICK_DEGREES = 6; // gradi per tick normale
const TICK_MS = 1000;

interface Props {
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

type Fase = "intro" | "running";

export default function Vigilance({ livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fase, setFase] = useState<Fase>("intro");
  const [angolo, setAngolo] = useState(0);
  const [corretti, setCorretti] = useState(0);
  const [falsiAllarmi, setFalsiAllarmi] = useState(0);
  const [totaleCritici, setTotaleCritici] = useState(0);
  const [missati, setMissati] = useState(0);
  const [_lastWasCritical, setLastWasCritical] = useState(false);
  const [_reacted, _setReacted] = useState(false);
  const [feedback, setFeedback] = useState<"ok" | "miss" | "false_alarm" | null>(null);

  // Contatore tick
  const tickRef = useRef(0);
  const criticalWindowRef = useRef(false);
  const reactedThisWindowRef = useRef(false);
  const windowStartRef = useRef(0);
  const nextCriticalTickRef = useRef(Math.floor(cfg.criticalEveryS / TICK_MS));

  const tick = useCallback(() => {
    tickRef.current++;
    const isCriticalNow = tickRef.current === nextCriticalTickRef.current;
    let jump = TICK_DEGREES;
    if (isCriticalNow) {
      jump = cfg.jumpDegrees;
      criticalWindowRef.current = true;
      reactedThisWindowRef.current = false;
      windowStartRef.current = Date.now();
      setTotaleCritici((t) => t + 1);
      setLastWasCritical(true);
      // Prossimo critico
      const spread = cfg.criticalEveryS + (Math.random() * 10 - 5);
      nextCriticalTickRef.current = tickRef.current + Math.max(10, Math.floor(spread));
    } else {
      setLastWasCritical(false);
    }

    setAngolo((a) => (a + jump) % 360);

    // Chiudi finestra critica se nessuno ha reagito entro 1500ms
    if (criticalWindowRef.current && !isCriticalNow) {
      const elapsed = Date.now() - windowStartRef.current;
      if (elapsed > 1500) {
        if (!reactedThisWindowRef.current) {
          setMissati((m) => m + 1);
          setFeedback("miss");
          setTimeout(() => setFeedback(null), 600);
        }
        criticalWindowRef.current = false;
      }
    }

    // Distrattore
    if (cfg.distractors && !isCriticalNow && Math.random() < 0.03) {
      setAngolo((a) => (a + TICK_DEGREES * 1.5) % 360);
    }

    timerRef.current = setTimeout(tick, TICK_MS);
  }, [cfg]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const tC = totaleCritici || 1;
    const score = Math.round(Math.max(0, ((corretti - falsiAllarmi * 0.5) / tC) * 100));
    onComplete(Math.min(100, Math.max(0, score)), Math.min(100, Math.max(0, score)));
  }, [tempoScaduto, corretti, falsiAllarmi, totaleCritici, onComplete]);

  function handleReazione() {
    if (fase !== "running") return;
    if (criticalWindowRef.current && !reactedThisWindowRef.current) {
      reactedThisWindowRef.current = true;
      criticalWindowRef.current = false;
      setCorretti((c) => c + 1);
      setFeedback("ok");
      setTimeout(() => setFeedback(null), 600);
    } else if (!criticalWindowRef.current) {
      setFalsiAllarmi((f) => f + 1);
      setFeedback("false_alarm");
      setTimeout(() => setFeedback(null), 600);
    }
  }

  function startGame() {
    setFase("running");
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    tick();
  }

  // SVG orologio
  const cx = 110, cy = 110, r = 90;
  const rad = (angolo - 90) * (Math.PI / 180);
  const lancettaX = cx + r * 0.75 * Math.cos(rad);
  const lancettaY = cy + r * 0.75 * Math.sin(rad);

  const feedbackColor = feedback === "ok" ? COLORS.success : feedback === "false_alarm" ? "#EF4444" : COLORS.warning;
  const feedbackLabel = feedback === "ok" ? "✓ Corretto!" : feedback === "false_alarm" ? "✗ Falso allarme" : feedback === "miss" ? "Mancato!" : null;

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">🕐</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Vigilanza</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          La lancetta avanza di un passo regolare. Quando fa un salto doppio ({cfg.jumpDegrees}° invece di {TICK_DEGREES}°), tocca il bottone!
        </p>
        <button onClick={startGame} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-4">
      <div className="flex gap-4 text-sm font-medium" style={{ color: COLORS.inkMuted }}>
        <span>✓ {corretti}</span>
        <span>✗ {falsiAllarmi} falsi</span>
        <span>Mancati: {missati}</span>
      </div>

      {feedbackLabel && (
        <p className="text-base font-bold" style={{ color: feedbackColor }}>{feedbackLabel}</p>
      )}

      <svg width={220} height={220} viewBox="0 0 220 220">
        {/* Cerchio orologio */}
        <circle cx={cx} cy={cy} r={r} fill={COLORS.surfaceAlt} stroke={COLORS.border} strokeWidth={3} />
        {/* Tacche */}
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i * 6 - 90) * (Math.PI / 180);
          const isMajor = i % 5 === 0;
          const inner = r * (isMajor ? 0.82 : 0.88);
          return (
            <line key={i}
              x1={cx + r * Math.cos(a)} y1={cy + r * Math.sin(a)}
              x2={cx + inner * Math.cos(a)} y2={cy + inner * Math.sin(a)}
              stroke={COLORS.inkMuted} strokeWidth={isMajor ? 2 : 1} />
          );
        })}
        {/* Lancetta */}
        <line x1={cx} y1={cy} x2={lancettaX} y2={lancettaY} stroke={COLORS.primary} strokeWidth={4} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill={COLORS.primary} />
      </svg>

      <button onClick={handleReazione}
        className="rounded-3xl w-full font-extrabold active:scale-95 transition-transform"
        style={{
          height: 88, fontSize: 24,
          backgroundColor: COLORS.accent3Light,
          border: `3px solid ${COLORS.accent3}`,
          color: COLORS.accent3,
        }}>
        ⚡ SALTO DOPPIO!
      </button>

      <p className="text-xs text-center" style={{ color: COLORS.inkMuted }}>
        Tocca solo quando la lancetta fa un salto di {cfg.jumpDegrees}°
      </p>
    </div>
  );
}
