"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type Variant = "alternata" | "categoriale" | "fonemica";

type LivelloConfig = {
  timeLimitS: number;
  tipo: string;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0)  return { timeLimitS: 30, tipo: "cat/cat" };
  if (idx <= 4)  return { timeLimitS: 45, tipo: "cat/cat" };
  if (idx <= 6)  return { timeLimitS: 60, tipo: "cat/cat" };
  if (idx <= 9)  return { timeLimitS: 60, tipo: "cat/fon" };
  if (idx <= 10) return { timeLimitS: 60, tipo: "cat/fon" };
  if (idx <= 14) return { timeLimitS: 75, tipo: "fon/fon" };
  if (idx <= 16) return { timeLimitS: 75, tipo: "fon/fon" };
  if (idx <= 18) return { timeLimitS: 90, tipo: "fon/fon" };
  return { timeLimitS: 90, tipo: "fon/fon" };
}

const ANIMALI = ["CANE","GATTO","LEONE","TIGRE","ORSO","LUPO","VOLPE","AQUILA","RONDINE","CONIGLIO","CAPRA","DELFINO"];
const CITTA = ["ROMA","MILANO","NAPOLI","TORINO","VENEZIA","FIRENZE","GENOVA","BOLOGNA","PALERMO","BARI","PISA","SIENA"];
const FRUTTI = ["MELA","PERA","UVA","FICO","PRUGNA","LIMONE","ARANCIA","PESCA","CILIEGIA","BANANA","KIWI","MANGO"];
const NON_ANIMALI = ["TAVOLO","LIBRO","SEDIA","PENNA","PORTA","FINESTRA","LAMPADA","SCARPA"];
const NON_FRUTTI = ["CANE","PORTA","SEDIA","LIBRO","LUNA","PANE","MARE","NOTTE"];

const PAROLE_A = ["AQUA","AMICO","ANNO","ARTE","ALBA","ANIMA","AMORE","ARCO","ARCA","ASSE","ALGA","ABETE"];
const NON_PAROLE_A = ["BRAMA","CORVO","DENTE","FERRO","GRIDO","HOTEL","ISOLA","LETTO"];
const PAROLE_M = ["MARE","MANO","MELA","MENTE","MOTO","MURO","MONDO","MADRE","MAGIA","METRO","MEDAGLIA","MUSEO"];
const NON_PAROLE_M = ["CANE","SOLE","PANE","ROSA","LUNA","CASA","FIORE","GATTO"];

interface Parola { testo: string; isTarget: boolean; }

function buildParole(variant: Variant, tipo: string, round: number): { parole: Parola[]; istruzione: string } {
  if (variant === "categoriale") {
    const isAnimale = round % 2 === 0;
    const targets = isAnimale ? ANIMALI : FRUTTI;
    const distractors = isAnimale ? NON_ANIMALI : NON_FRUTTI;
    const pool: Parola[] = [
      ...targets.slice(0, 4).map((t) => ({ testo: t, isTarget: true })),
      ...distractors.slice(0, 4).map((d) => ({ testo: d, isTarget: false })),
    ].sort(() => Math.random() - 0.5);
    return { parole: pool, istruzione: `Tocca tutti gli ${isAnimale ? "ANIMALI" : "FRUTTI"}` };
  }
  if (variant === "fonemica") {
    const isA = round % 2 === 0;
    const targets = isA ? PAROLE_A : PAROLE_M;
    const distractors = isA ? NON_PAROLE_A : NON_PAROLE_M;
    const pool: Parola[] = [
      ...targets.slice(0, 4).map((t) => ({ testo: t, isTarget: true })),
      ...distractors.slice(0, 4).map((d) => ({ testo: d, isTarget: false })),
    ].sort(() => Math.random() - 0.5);
    return { parole: pool, istruzione: `Tocca le parole che iniziano con "${isA ? "A" : "M"}"` };
  }
  // alternata: sequenza alternata animale/città
  const expected = round % 2 === 0 ? ANIMALI : CITTA;
  const others = round % 2 === 0 ? CITTA : ANIMALI;
  const pool: Parola[] = [
    ...expected.slice(0, 4).map((t) => ({ testo: t, isTarget: true })),
    ...others.slice(0, 4).map((d) => ({ testo: d, isTarget: false })),
  ].sort(() => Math.random() - 0.5);
  return { parole: pool, istruzione: `Ora tocca ${round % 2 === 0 ? "un ANIMALE" : "una CITTÀ"}` };
}

type Fase = "intro" | "running" | "feedback";

interface Props {
  variant: Variant;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function VerbalFluency({ variant, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fase, setFase] = useState<Fase>("intro");
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(cfg.timeLimitS);
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [selezioni, setSelezioni] = useState<Set<number>>(new Set());
  const [{ parole, istruzione }, setRoundData] = useState<{ parole: Parola[]; istruzione: string }>({ parole: [], istruzione: "" });

  const startRound = useCallback((r: number) => {
    setRound(r);
    setRoundData(buildParole(variant, cfg.tipo, r));
    setSelezioni(new Set());
    setTimeLeft(cfg.timeLimitS);
    setFase("running");
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
  }, [variant, cfg]);

  useEffect(() => {
    if (fase !== "running") return;
    if (timeLeft <= 0) {
      evalRound();
      return;
    }
    const t = setTimeout(() => setTimeLeft((tl) => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [fase, timeLeft]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleToggle(idx: number) {
    setSelezioni((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  function evalRound() {
    let corr = 0;
    parole.forEach((p, i) => {
      const sel = selezioni.has(i);
      if (p.isTarget === sel) corr++;
    });
    setCorretti((c) => c + corr);
    setTotale((t) => t + parole.length);
    setFase("feedback");
    timerRef.current = setTimeout(() => startRound(round + 1), 1000);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (fase === "intro") {
    const varLabel = variant === "categoriale" ? "Categorie" : variant === "fonemica" ? "Fonemica" : "Alternata";
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">💬</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Fluenza Verbale — {varLabel}</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Tocca le parole che corrispondono all'istruzione. Hai {cfg.timeLimitS} secondi per ogni round.
        </p>
        <button onClick={() => startRound(0)} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 px-3">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Corretti: {corretti} / {totale}</p>
        <p className="text-lg font-extrabold" style={{ color: timeLeft <= 10 ? "#EF4444" : COLORS.primary }}>{timeLeft}s</p>
      </div>

      <div className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: COLORS.primaryLight, border: `1px solid ${COLORS.primary}` }}>
        <p className="text-base font-bold" style={{ color: COLORS.primary }}>{istruzione}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {parole.map((p, i) => (
          <button key={i} onClick={() => handleToggle(i)} disabled={fase !== "running"}
            className="rounded-2xl font-bold active:scale-95 transition-transform"
            style={{
              height: 58, fontSize: 16,
              backgroundColor: selezioni.has(i) ? COLORS.primaryLight : COLORS.surfaceAlt,
              border: `2px solid ${selezioni.has(i) ? COLORS.primary : COLORS.border}`,
              color: selezioni.has(i) ? COLORS.primary : COLORS.ink,
              opacity: fase !== "running" ? 0.7 : 1,
            }}>
            {p.testo}
          </button>
        ))}
      </div>

      <button onClick={evalRound} disabled={fase !== "running"} className="rounded-2xl font-bold text-white py-3 text-base active:scale-95" style={{ backgroundColor: COLORS.primary, opacity: fase !== "running" ? 0.5 : 1 }}>
        Conferma
      </button>
    </div>
  );
}
