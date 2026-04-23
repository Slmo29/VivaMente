"use client";

import { useState, useEffect, useRef } from "react";
import { COLORS } from "@/lib/design-tokens";

type Variant = "tower_of_london" | "brixton";

type TolConfig = {
  nDischi: number;
  movesMin: number;
  timeLimitMs: number | null;
};

function getTolConfig(lv: number): TolConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { nDischi: 2, movesMin: 1, timeLimitMs: null };
  if (idx <= 3) return { nDischi: 2, movesMin: 2, timeLimitMs: null };
  if (idx <= 4) return { nDischi: 3, movesMin: 2, timeLimitMs: null };
  if (idx <= 7) return { nDischi: 3, movesMin: 3, timeLimitMs: null };
  if (idx <= 9) return { nDischi: 3, movesMin: 4, timeLimitMs: 30000 };
  if (idx <= 12) return { nDischi: 3, movesMin: 5, timeLimitMs: 28000 };
  if (idx <= 14) return { nDischi: 4, movesMin: 5, timeLimitMs: 22000 };
  if (idx <= 17) return { nDischi: 4, movesMin: 6, timeLimitMs: 18000 };
  return { nDischi: 4, movesMin: 7, timeLimitMs: 10000 };
}

const DISCO_COLORS = ["#EF4444","#3B82F6","#22C55E","#EAB308"];
const DISCO_SIZES = [64,52,40,28];

type Peg = number[]; // stack di dischi (più grande = idx più alto)
type TolState = [Peg, Peg, Peg];

function generateTolProblem(nDischi: number): { inizio: TolState; fine: TolState } {
  const dischi = Array.from({ length: nDischi }, (_, i) => i); // 0=grande
  const inizio: TolState = [[], [], []];
  const fine: TolState = [[], [], []];
  // Inizia: tutti sul perno 0
  inizio[0] = [...dischi];
  // Fine: distribuzione casuale valida
  const shuffled = [...dischi].sort(() => Math.random() - 0.5);
  shuffled.forEach((d) => {
    const p = Math.floor(Math.random() * 3);
    fine[p].push(d);
  });
  // Ordina ogni perno per validità ToH (il grande sotto)
  (fine as Peg[]).forEach((peg) => peg.sort((a, b) => b - a));
  return { inizio, fine };
}

function cloneState(s: TolState): TolState {
  return [s[0].slice(), s[1].slice(), s[2].slice()];
}

function statesEqual(a: TolState, b: TolState): boolean {
  return a.every((peg, i) => peg.length === b[i].length && peg.every((d, j) => d === b[i][j]));
}

interface Props {
  variant: Variant;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

// ── Tower of London Component ────────────────────────────────────────────────
function TowerOfLondon({ livello, tempoScaduto, onComplete, onReady }: Omit<Props, "variant">) {
  const cfg = getTolConfig(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const problema = useRef(generateTolProblem(cfg.nDischi));

  const [stato, setStato] = useState<TolState>(() => cloneState(problema.current.inizio));
  const [selezionato, setSelezionato] = useState<{ peg: number; disco: number } | null>(null);
  const [mosse, setMosse] = useState(0);
  const [risolto, setRisolto] = useState(false);
  const [trialMs, setTrialMs] = useState(cfg.timeLimitMs ?? 0);

  useEffect(() => {
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cfg.timeLimitMs || risolto) return;
    if (trialMs <= 0) {
      if (!completato.current) { completato.current = true; onComplete(0, 0); }
      return;
    }
    const t = setTimeout(() => setTrialMs((m) => m - 100), 100);
    return () => clearTimeout(t);
  }, [trialMs, cfg.timeLimitMs, risolto, onComplete]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    onComplete(risolto ? 100 : 0, risolto ? 100 : 0);
  }, [tempoScaduto, risolto, onComplete]);

  function handlePegTap(pegIdx: number) {
    if (risolto) return;
    const peg = stato[pegIdx];
    if (!selezionato) {
      if (peg.length === 0) return;
      const topDisco = peg[peg.length - 1];
      setSelezionato({ peg: pegIdx, disco: topDisco });
    } else {
      if (selezionato.peg === pegIdx) { setSelezionato(null); return; }
      const destPeg = stato[pegIdx];
      const destTop = destPeg[destPeg.length - 1];
      if (destPeg.length > 0 && destTop < selezionato.disco) { setSelezionato(null); return; }
      const nuovoStato = cloneState(stato);
      nuovoStato[selezionato.peg].pop();
      nuovoStato[pegIdx].push(selezionato.disco);
      setStato(nuovoStato);
      setMosse((m) => m + 1);
      setSelezionato(null);
      if (statesEqual(nuovoStato, problema.current.fine)) {
        setRisolto(true);
        const score = mosse <= cfg.movesMin * 2 ? 100 : Math.max(40, 100 - (mosse - cfg.movesMin) * 8);
        if (!completato.current) {
          setTimeout(() => { completato.current = true; onComplete(score, score); }, 1200);
        }
      }
    }
  }

  function renderPeg(pegIdx: number, peg: Peg, isTarget = false) {
    const _nDischi = cfg.nDischi; void _nDischi;
    const isSelected = selezionato?.peg === pegIdx;
    return (
      <div key={pegIdx} onClick={() => !isTarget && handlePegTap(pegIdx)}
        className={`flex flex-col-reverse items-center justify-start gap-1 rounded-2xl pt-2 pb-1 cursor-pointer transition-all ${!isTarget ? "active:scale-95" : ""}`}
        style={{ width: 90, minHeight: 160, backgroundColor: isSelected ? COLORS.primaryLight : COLORS.surfaceAlt, border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}` }}>
        {peg.map((disco, _i) => (
          <div key={disco} className="rounded-lg flex items-center justify-center"
            style={{ width: DISCO_SIZES[disco], height: 20, backgroundColor: DISCO_COLORS[disco], border: `2px solid ${COLORS.border}88` }}>
          </div>
        ))}
        <div className="w-2 flex-1 rounded-full" style={{ backgroundColor: COLORS.border, minHeight: 20 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-3">
      {cfg.timeLimitMs && (
        <div className="w-full rounded-full overflow-hidden h-2" style={{ backgroundColor: COLORS.border }}>
          <div className="h-full rounded-full transition-all duration-100" style={{ width: `${(trialMs / cfg.timeLimitMs) * 100}%`, backgroundColor: trialMs / cfg.timeLimitMs > 0.3 ? COLORS.primary : "#EF4444" }} />
        </div>
      )}

      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Mosse: {mosse} | Minimo: {cfg.movesMin}</p>

      <p className="text-xs text-center" style={{ color: COLORS.inkMuted }}>Obiettivo:</p>
      <div className="flex gap-3 justify-center">
        {(problema.current.fine as Peg[]).map((peg, i) => renderPeg(i, peg, true))}
      </div>

      <p className="text-xs text-center" style={{ color: COLORS.inkMuted }}>Tocca un perno per prendere/appoggiare:</p>
      <div className="flex gap-3 justify-center">
        {(stato as Peg[]).map((peg, i) => renderPeg(i, peg, false))}
      </div>

      {risolto && <div className="text-5xl">✓</div>}
      {selezionato && (
        <p className="text-sm" style={{ color: COLORS.primary }}>Disco selezionato — tocca il perno di destinazione</p>
      )}
    </div>
  );
}

// ── Brixton Component (simplified) ───────────────────────────────────────────
function Brixton({ livello: _livello, tempoScaduto, onComplete, onReady }: Omit<Props, "variant">) {
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const COLS = 6;
  const ROWS = 4;

  function nextPos(pos: number): number {
    return (pos + COLS) % (COLS * ROWS);
  }

  const [pos, setPos] = useState(Math.floor(Math.random() * COLS * ROWS));
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [attesa, setAttesa] = useState(false);

  useEffect(() => {
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleTap(idx: number) {
    if (attesa) return;
    const correct = nextPos(pos);
    const ok = idx === correct;
    setCorretti((c) => c + (ok ? 1 : 0));
    setTotale((t) => t + 1);
    setLastOk(ok);
    setAttesa(true);
    setTimeout(() => {
      setPos(correct);
      setLastOk(null);
      setAttesa(false);
    }, 600);
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-3">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Corretti: {corretti} / {totale}</p>
      <p className="text-base font-bold text-center" style={{ color: COLORS.ink }}>Dove andrà il cerchio?</p>
      {lastOk !== null && <div className="text-3xl">{lastOk ? "✓" : "✗"}</div>}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 44px)` }}>
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <button key={i} onClick={() => handleTap(i)} disabled={attesa}
            className="rounded-xl flex items-center justify-center active:scale-95 transition-transform"
            style={{
              width: 44, height: 44,
              backgroundColor: i === pos ? COLORS.primary : COLORS.surfaceAlt,
              border: `2px solid ${i === pos ? COLORS.primaryDark : COLORS.border}`,
            }}>
            {i === pos && <span style={{ color: "white", fontSize: 20 }}>●</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Pianificazione({ variant, livello, tempoScaduto, onComplete, onReady }: Props) {
  if (variant === "brixton") return <Brixton livello={livello} tempoScaduto={tempoScaduto} onComplete={onComplete} onReady={onReady} />;
  return <TowerOfLondon livello={livello} tempoScaduto={tempoScaduto} onComplete={onComplete} onReady={onReady} />;
}
