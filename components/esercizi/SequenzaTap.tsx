"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

// ── Configurazione livelli (dal documento) ────────────────────────────────────
type LivelloConfig = {
  sequenceLength: number;
  presentationSpeedMs: number;
  mode: "forward" | "backward" | "both";
  timeLimitMs: number | null;
};

const LIVELLI: LivelloConfig[] = [
  { sequenceLength: 3,  presentationSpeedMs: 2000, mode: "forward",  timeLimitMs: null },  // 1
  { sequenceLength: 3,  presentationSpeedMs: 1800, mode: "forward",  timeLimitMs: null },  // 2
  { sequenceLength: 4,  presentationSpeedMs: 1800, mode: "forward",  timeLimitMs: null },  // 3
  { sequenceLength: 4,  presentationSpeedMs: 1600, mode: "forward",  timeLimitMs: null },  // 4
  { sequenceLength: 5,  presentationSpeedMs: 1600, mode: "forward",  timeLimitMs: null },  // 5
  { sequenceLength: 5,  presentationSpeedMs: 1400, mode: "forward",  timeLimitMs: null },  // 6
  { sequenceLength: 5,  presentationSpeedMs: 1400, mode: "forward",  timeLimitMs: null },  // 7
  { sequenceLength: 6,  presentationSpeedMs: 1400, mode: "forward",  timeLimitMs: null },  // 8
  { sequenceLength: 6,  presentationSpeedMs: 1200, mode: "forward",  timeLimitMs: null },  // 9
  { sequenceLength: 6,  presentationSpeedMs: 1200, mode: "both",     timeLimitMs: null },  // 10
  { sequenceLength: 7,  presentationSpeedMs: 1200, mode: "both",     timeLimitMs: null },  // 11
  { sequenceLength: 7,  presentationSpeedMs: 1000, mode: "both",     timeLimitMs: null },  // 12
  { sequenceLength: 7,  presentationSpeedMs: 1000, mode: "both",     timeLimitMs: null },  // 13
  { sequenceLength: 8,  presentationSpeedMs:  950, mode: "both",     timeLimitMs: null },  // 14
  { sequenceLength: 8,  presentationSpeedMs:  900, mode: "both",     timeLimitMs: null },  // 15
  { sequenceLength: 8,  presentationSpeedMs:  900, mode: "backward", timeLimitMs: null },  // 16
  { sequenceLength: 9,  presentationSpeedMs:  900, mode: "backward", timeLimitMs: null },  // 17
  { sequenceLength: 9,  presentationSpeedMs:  800, mode: "backward", timeLimitMs: 8000 }, // 18
  { sequenceLength: 10, presentationSpeedMs:  800, mode: "backward", timeLimitMs: 7000 }, // 19
  { sequenceLength: 10, presentationSpeedMs:  700, mode: "backward", timeLimitMs: 6000 }, // 20
];

// ── Pool stimoli ──────────────────────────────────────────────────────────────
const POOL_NUMERI = ["1","2","3","4","5","6","7","8","9"];
const POOL_PAROLE = [
  "CASA","LUNA","PANE","SOLE","MARE","ROSA","GATTO","LIBRO",
  "PORTA","FIORE","ACQUA","NOTTE","MANO","ALBERO","PESCA","CUORE",
];
const POOL_IMMAGINI = ["🍎","🐱","🚗","🌸","⭐","🏠","🎵","🍕","🐶","🌙","🌊","🦋"];

// ── Tipi ──────────────────────────────────────────────────────────────────────
type Fase = "intro" | "mostra" | "pausa" | "rispondi" | "feedback";
type StimulusType = "numeri" | "parole" | "immagini";

interface Props {
  stimulusType: StimulusType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, accuratezza: number) => void;
  onReady?: () => void;
}

// ── Utilità ───────────────────────────────────────────────────────────────────
function campione<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function griglia(pool: string[], sequenza: string[], size: number): string[] {
  const extra = pool.filter((s) => !sequenza.includes(s));
  const riempimento = campione(extra, Math.max(0, size - sequenza.length));
  return [...sequenza, ...riempimento].sort(() => Math.random() - 0.5);
}

export default function SequenzaTap({ stimulusType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = LIVELLI[Math.min(Math.max(livello - 1, 0), 19)];
  const pool = stimulusType === "numeri" ? POOL_NUMERI : stimulusType === "parole" ? POOL_PAROLE : POOL_IMMAGINI;
  const gridSize = stimulusType === "numeri" ? 9 : 8;

  const [fase, setFase] = useState<Fase>("intro");
  const [trialIndex, setTrialIndex] = useState(0);
  const [sequenza, setSequenza] = useState<string[]>([]);
  const [modo, setModo] = useState<"forward" | "backward">("forward");
  const [stimoloIdx, setStimoloIdx] = useState(0);
  const [risposte, setRisposte] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"corretto" | "errato" | null>(null);
  const [risultati, setRisultati] = useState<boolean[]>([]);
  const [grigliaItems, setGrigliaItems] = useState<string[]>([]);
  const [trialMs, setTrialMs] = useState<number | null>(null);

  const completato = useRef(false);
  const onReadyCalled = useRef(false);

  const getModo = useCallback((idx: number): "forward" | "backward" => {
    if (cfg.mode === "both") return idx % 2 === 0 ? "forward" : "backward";
    return cfg.mode;
  }, [cfg.mode]);

  const iniziaTrial = useCallback((idx: number) => {
    const seq = campione(pool, cfg.sequenceLength);
    const m = getModo(idx);
    setSequenza(seq);
    setModo(m);
    setRisposte([]);
    setStimoloIdx(0);
    setFeedback(null);
    setGrigliaItems(griglia(pool, seq, gridSize));
    setFase("mostra");
  }, [pool, cfg.sequenceLength, getModo, gridSize]);

  // Intro → primo trial
  useEffect(() => {
    const t = setTimeout(() => iniziaTrial(0), 2200);
    return () => clearTimeout(t);
  }, [iniziaTrial]);

  // Avanzamento durante "mostra"
  useEffect(() => {
    if (fase !== "mostra") return;
    if (stimoloIdx >= sequenza.length) { setFase("pausa"); return; }
    const t = setTimeout(() => setStimoloIdx((i) => i + 1), cfg.presentationSpeedMs);
    return () => clearTimeout(t);
  }, [fase, stimoloIdx, sequenza.length, cfg.presentationSpeedMs]);

  // Pausa → rispondi
  useEffect(() => {
    if (fase !== "pausa") return;
    const t = setTimeout(() => {
      setFase("rispondi");
      if (cfg.timeLimitMs) setTrialMs(cfg.timeLimitMs);
      if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    }, 600);
    return () => clearTimeout(t);
  }, [fase, cfg.timeLimitMs]);

  // Timer trial durante rispondi
  useEffect(() => {
    if (fase !== "rispondi" || trialMs === null) return;
    if (trialMs <= 0) { valutaRisposta(risposte); return; }
    const t = setTimeout(() => setTrialMs((ms) => (ms ?? 0) - 100), 100);
    return () => clearTimeout(t);
  });

  const valutaRisposta = useCallback((r: string[]) => {
    const attesa = modo === "backward" ? [...sequenza].reverse() : sequenza;
    const ok = attesa.length > 0 && attesa.every((s, i) => s === r[i]);
    setFeedback(ok ? "corretto" : "errato");
    setRisultati((prev) => [...prev, ok]);
    setFase("feedback");
    setTrialMs(null);
  }, [modo, sequenza]);

  function handleTap(stimulus: string) {
    if (fase !== "rispondi") return;
    const nuove = [...risposte, stimulus];
    setRisposte(nuove);
    if (nuove.length === sequenza.length) valutaRisposta(nuove);
  }

  // Feedback → prossimo trial
  useEffect(() => {
    if (fase !== "feedback") return;
    const t = setTimeout(() => {
      const next = trialIndex + 1;
      setTrialIndex(next);
      iniziaTrial(next);
    }, 1400);
    return () => clearTimeout(t);
  }, [fase, trialIndex, iniziaTrial]);

  // Tempo scaduto
  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const corretti = risultati.filter(Boolean).length;
    const totale = risultati.length;
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, risultati, onComplete]);

  // ── Render ────────────────────────────────────────────────────────────────

  const labelStimulo = stimulusType === "numeri" ? "numeri" : stimulusType === "parole" ? "parole" : "immagini";

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
        <span className="text-6xl">👀</span>
        <p className="text-xl font-bold text-ink">Guarda la sequenza</p>
        <p className="text-base" style={{ color: COLORS.inkMuted }}>
          Poi tocca i {labelStimulo} nell&apos;ordine {cfg.mode === "forward" ? "giusto" : cfg.mode === "backward" ? "inverso" : "indicato"}
        </p>
        <div className="flex gap-2 mt-4">
          {[0,1,2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: COLORS.primary, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (fase === "mostra" || fase === "pausa") {
    const stimoloVisibile = fase === "mostra" && stimoloIdx < sequenza.length ? sequenza[stimoloIdx] : null;
    return (
      <div className="flex flex-col items-center gap-8 py-8 px-4">
        {/* Indicatore avanzamento */}
        <div className="flex gap-2">
          {sequenza.map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-all duration-200"
              style={{ backgroundColor: i <= stimoloIdx ? COLORS.primary : COLORS.border }}
            />
          ))}
        </div>

        {/* Stimolo corrente */}
        {stimulusType === "parole" ? (
          <div
            className="min-w-[8rem] px-8 py-6 rounded-3xl flex items-center justify-center transition-all duration-150"
            style={{
              backgroundColor: stimoloVisibile ? COLORS.primaryLight : "transparent",
              border: stimoloVisibile ? `3px solid ${COLORS.primary}` : "3px solid transparent",
              minHeight: 96,
            }}
          >
            {stimoloVisibile && (
              <span className="font-extrabold select-none text-4xl tracking-wide" style={{ color: COLORS.primary }}>
                {stimoloVisibile}
              </span>
            )}
          </div>
        ) : (
          <div
            className="w-36 h-36 rounded-3xl flex items-center justify-center transition-all duration-150"
            style={{
              backgroundColor: stimoloVisibile ? COLORS.primaryLight : "transparent",
              border: stimoloVisibile ? `3px solid ${COLORS.primary}` : "3px solid transparent",
            }}
          >
            {stimoloVisibile && (
              <span
                className="font-extrabold select-none"
                style={{ fontSize: stimulusType === "immagini" ? 64 : 56, color: COLORS.primary }}
              >
                {stimoloVisibile}
              </span>
            )}
          </div>
        )}

        <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Memorizza!</p>
      </div>
    );
  }

  if (fase === "rispondi") {
    const timerPct = cfg.timeLimitMs && trialMs !== null ? (trialMs / cfg.timeLimitMs) * 100 : null;
    const cols = stimulusType === "numeri" ? "grid-cols-3" : "grid-cols-4";

    return (
      <div className="flex flex-col gap-5 py-4 px-2">
        {/* Direzione */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">{modo === "backward" ? "↩" : "→"}</span>
          <p className="text-base font-bold text-ink">
            {modo === "backward" ? "Ordine inverso!" : "Stesso ordine"}
          </p>
        </div>

        {/* Slot risposta */}
        {stimulusType === "parole" ? (
          <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
            {sequenza.map((_, i) => (
              <div
                key={i}
                className="px-3 h-9 rounded-xl flex items-center justify-center border-2 font-bold text-sm transition-all"
                style={{
                  borderColor: risposte[i] ? COLORS.primary : COLORS.border,
                  backgroundColor: risposte[i] ? COLORS.primaryLight : COLORS.surfaceAlt,
                  color: COLORS.primary,
                  minWidth: 48,
                }}
              >
                {risposte[i] ?? <span style={{ color: COLORS.border }}>{i + 1}</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 justify-center min-h-[52px]">
            {sequenza.map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-xl flex items-center justify-center border-2 font-bold text-lg transition-all"
                style={{
                  borderColor: risposte[i] ? COLORS.primary : COLORS.border,
                  backgroundColor: risposte[i] ? COLORS.primaryLight : COLORS.surfaceAlt,
                  color: COLORS.primary,
                  fontSize: stimulusType === "immagini" ? 22 : undefined,
                }}
              >
                {risposte[i] ?? ""}
              </div>
            ))}
          </div>
        )}

        {/* Timer bar */}
        {timerPct !== null && (
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.border }}>
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{ width: `${timerPct}%`, backgroundColor: timerPct > 40 ? COLORS.primary : "#EF4444" }}
            />
          </div>
        )}

        {/* Griglia stimoli */}
        <div className={`grid ${cols} gap-3`}>
          {grigliaItems.map((s, i) => (
            <button
              key={i}
              onClick={() => handleTap(s)}
              className="rounded-2xl flex items-center justify-center font-bold active:scale-95 transition-transform"
              style={{
                height: stimulusType === "parole" ? 48 : 68,
                fontSize: stimulusType === "immagini" ? 36 : stimulusType === "numeri" ? 28 : 13,
                backgroundColor: COLORS.surfaceAlt,
                border: `2px solid ${COLORS.border}`,
                color: COLORS.ink,
                padding: stimulusType === "parole" ? "0 4px" : undefined,
                wordBreak: "break-word",
                lineHeight: 1.2,
                textAlign: "center",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Annulla ultimo */}
        {risposte.length > 0 && (
          <button
            className="text-sm underline"
            style={{ color: COLORS.inkMuted }}
            onClick={() => setRisposte((r) => r.slice(0, -1))}
          >
            ← Annulla ultimo
          </button>
        )}
      </div>
    );
  }

  if (fase === "feedback") {
    const ok = feedback === "corretto";
    const correnti = risultati.filter(Boolean).length;
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-16 px-4 text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{ backgroundColor: ok ? COLORS.successLight : "#FEE2E2" }}
        >
          {ok ? "✓" : "✗"}
        </div>
        <p className="text-xl font-extrabold" style={{ color: ok ? COLORS.success : "#EF4444" }}>
          {ok ? "Corretto!" : "Riprova!"}
        </p>
        {!ok && (
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            La sequenza era: {(modo === "backward" ? [...sequenza].reverse() : sequenza).join(" · ")}
          </p>
        )}
        <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>
          {correnti} / {risultati.length} corretti
        </p>
      </div>
    );
  }

  return null;
}
