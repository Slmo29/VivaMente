"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type CueType = "visivo_saliente" | "semantico" | "time_based";

type LivelloConfig = {
  cueVisibility: "saliente" | "medio" | "sottile";
  secondaryLoad: "assente" | "medio" | "alto" | "massimo";
  cueEvery: number; // ogni N immagini
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { cueVisibility: "saliente", secondaryLoad: "assente", cueEvery: 8 };
  if (idx <= 3) return { cueVisibility: "saliente", secondaryLoad: "assente", cueEvery: 10 };
  if (idx <= 4) return { cueVisibility: "saliente", secondaryLoad: "medio", cueEvery: 10 };
  if (idx <= 7) return { cueVisibility: "saliente", secondaryLoad: "medio", cueEvery: 12 };
  if (idx <= 9) return { cueVisibility: "medio", secondaryLoad: "alto", cueEvery: 12 };
  if (idx <= 12) return { cueVisibility: "medio", secondaryLoad: "alto", cueEvery: 14 };
  if (idx <= 14) return { cueVisibility: "sottile", secondaryLoad: "alto", cueEvery: 14 };
  if (idx <= 17) return { cueVisibility: "sottile", secondaryLoad: "massimo", cueEvery: 15 };
  return { cueVisibility: "sottile", secondaryLoad: "massimo", cueEvery: 15 };
}

const ANIMALI_EMOJI = ["🐶","🐱","🐻","🦁","🐯","🦊","🐺","🐘","🦒","🦓"];
const NON_ANIMALI_EMOJI = ["🚗","📚","🏠","🌸","⭐","🎵","🍕","🌙","💻","🎸"];

const CUE_SALIENTE = "🌟"; // molto visibile
const CUE_MEDIO = "🔶";    // moderato
const CUE_SOTTILE = "🔸";  // sottile

function getCue(visibility: LivelloConfig["cueVisibility"]): string {
  if (visibility === "saliente") return CUE_SALIENTE;
  if (visibility === "medio") return CUE_MEDIO;
  return CUE_SOTTILE;
}

function generateImmagini(n: number, cueEvery: number, cue: string): { emoji: string; isCue: boolean; isAnimale: boolean }[] {
  return Array.from({ length: n }, (_, i) => {
    if ((i + 1) % cueEvery === 0) return { emoji: cue, isCue: true, isAnimale: false };
    const isAnimale = Math.random() < 0.5;
    const pool = isAnimale ? ANIMALI_EMOJI : NON_ANIMALI_EMOJI;
    return { emoji: pool[Math.floor(Math.random() * pool.length)], isCue: false, isAnimale };
  });
}

type Fase = "intro" | "running" | "fine";

interface Props {
  cueType: CueType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function MemoriaProspettica({ cueType: _cueType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cue = getCue(cfg.cueVisibility);

  const TOTAL_ITEMS = Math.min(cfg.cueEvery * 3, 30);
  const [immagini] = useState(() => generateImmagini(TOTAL_ITEMS, cfg.cueEvery, cue));
  const [idx, setIdx] = useState(0);
  const [fase, setFase] = useState<Fase>("intro");
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [cueReactions, setCueReactions] = useState<boolean[]>([]); // true = reagito correttamente
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [attivaRisposta, setAttivaRisposta] = useState(false);
  const respondedRef = useRef(false);

  const avanzaItem = useCallback((i: number) => {
    if (i >= immagini.length) {
      // lista finita: riparti dall'inizio per riempire i 3 minuti
      timerRef.current = setTimeout(() => avanzaItem(0), 500);
      return;
    }
    respondedRef.current = false;
    setIdx(i);
    setLastOk(null);
    setAttivaRisposta(true);
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    timerRef.current = setTimeout(() => {
      const item = immagini[i];
      if (item.isCue && !respondedRef.current) {
        setCueReactions((cr) => [...cr, false]);
      }
      setAttivaRisposta(false);
      setLastOk(null);
      timerRef.current = setTimeout(() => avanzaItem(i + 1), 300);
    }, 1200);
  }, [immagini]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const cueItems = immagini.filter((im) => im.isCue).length;
    const cueCorrette = cueReactions.filter(Boolean).length;
    const allCorrette = cueCorrette + corretti;
    const allTotale = cueItems + totale;
    const score = allTotale > 0 ? Math.round((allCorrette / allTotale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, immagini, cueReactions, corretti, totale, onComplete]);

  function handlePrimario(isAnimale: boolean) {
    if (!attivaRisposta) return;
    const item = immagini[idx];
    if (item.isCue) return; // non rispondere con il primario sul cue
    const ok = isAnimale === item.isAnimale;
    respondedRef.current = true;
    setCorretti((c) => c + (ok ? 1 : 0));
    setTotale((t) => t + 1);
    setLastOk(ok);
  }

  function handleCueTap() {
    if (!attivaRisposta) return;
    const item = immagini[idx];
    if (!item.isCue) return;
    respondedRef.current = true;
    setCueReactions((cr) => [...cr, true]);
    setLastOk(true);
  }

  const item = immagini[idx] ?? null;
  const isCueVisible = item?.isCue;

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-12 px-4 text-center">
        <span className="text-6xl">🎯</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Memoria Prospettica</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Classifica le immagini come ANIMALE o NON-ANIMALE. Ma quando vedi <span style={{ fontSize: 24 }}>{cue}</span>, tocca quel bottone speciale invece!
        </p>
        <div className="rounded-xl px-4 py-2" style={{ backgroundColor: COLORS.warningLight }}>
          <p className="text-sm font-bold" style={{ color: COLORS.warning }}>Ricorda: <span style={{ fontSize: 20 }}>{cue}</span> = tocca il bottone SPECIALE</p>
        </div>
        <button onClick={() => { setFase("running"); avanzaItem(0); }}
          className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4 px-4">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>{idx + 1} / {TOTAL_ITEMS} — Corretti: {corretti}/{totale}</p>

      <div
        className="w-44 h-44 rounded-3xl flex items-center justify-center transition-all"
        style={{
          backgroundColor: isCueVisible ? COLORS.warningLight : (lastOk === true ? COLORS.successLight : lastOk === false ? "#FEE2E2" : COLORS.primaryLight),
          border: `4px solid ${isCueVisible ? COLORS.warning : (lastOk === true ? COLORS.success : lastOk === false ? "#EF4444" : COLORS.primary)}`,
        }}
      >
        {item && <span style={{ fontSize: 88 }}>{item.emoji}</span>}
      </div>

      {isCueVisible ? (
        <button onClick={handleCueTap} disabled={!attivaRisposta}
          className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95 w-full animate-pulse"
          style={{ backgroundColor: COLORS.warning, opacity: attivaRisposta ? 1 : 0.5 }}>
          ★ SPECIALE! — Tocca qui!
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-4 w-full">
          <button onClick={() => handlePrimario(true)} disabled={!attivaRisposta || isCueVisible}
            className="rounded-2xl font-bold active:scale-95 transition-transform"
            style={{ height: 64, fontSize: 18, backgroundColor: COLORS.successLight, border: `2px solid ${COLORS.success}`, color: COLORS.success, opacity: attivaRisposta ? 1 : 0.5 }}>
            🐾 Animale
          </button>
          <button onClick={() => handlePrimario(false)} disabled={!attivaRisposta || isCueVisible}
            className="rounded-2xl font-bold active:scale-95 transition-transform"
            style={{ height: 64, fontSize: 18, backgroundColor: COLORS.surfaceAlt, border: `2px solid ${COLORS.border}`, color: COLORS.ink, opacity: attivaRisposta ? 1 : 0.5 }}>
            Non animale
          </button>
        </div>
      )}
    </div>
  );
}
