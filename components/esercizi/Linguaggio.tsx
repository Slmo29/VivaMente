"use client";

import { useState, useEffect, useRef } from "react";
import { COLORS } from "@/lib/design-tokens";

type Variant = "naming" | "lexical_decision" | "sentence_anagram" | "semantic_relatedness" | "proverb_completion";

interface Props {
  variant: Variant;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

// ── Naming data ────────────────────────────────────────────────────────────
interface NamingItem { emoji: string; corretto: string; opzioni: string[]; }
const NAMING_ITEMS: NamingItem[] = [
  { emoji: "🐶", corretto: "CANE",   opzioni: ["CANE","GATTO","ORSO","LUPO"] },
  { emoji: "🍎", corretto: "MELA",   opzioni: ["PERA","MELA","UVA","FICO"] },
  { emoji: "🚗", corretto: "AUTO",   opzioni: ["MOTO","TRENO","AUTO","BARCA"] },
  { emoji: "🏠", corretto: "CASA",   opzioni: ["PORTA","CASA","TETTO","MURO"] },
  { emoji: "🌸", corretto: "FIORE",  opzioni: ["ERBA","FOGLIA","FIORE","PIANTA"] },
  { emoji: "📚", corretto: "LIBRO",  opzioni: ["LIBRO","PENNA","FOGLIO","QUADERNO"] },
  { emoji: "🌙", corretto: "LUNA",   opzioni: ["SOLE","LUNA","STELLA","NUVOLA"] },
  { emoji: "🐱", corretto: "GATTO",  opzioni: ["TOPO","CANE","GATTO","CONIGLIO"] },
  { emoji: "☀️", corretto: "SOLE",   opzioni: ["LUNA","SOLE","NUVOLA","VENTO"] },
  { emoji: "🐟", corretto: "PESCE",  opzioni: ["GRANCHIO","DELFINO","PESCE","MEDUSA"] },
];

// ── Lexical decision data ─────────────────────────────────────────────────
const PAROLE_REALI = ["CASA","PANE","LUNA","MARE","SOLE","MANO","ROSA","FIORE","GATTO","LIBRO"];
const NON_PAROLE   = ["BATRO","SELMO","CRUNTO","FOLPE","DASTI","MILVO","TRECA","SNOPE","CLURNO","BASTE"];

// ── Semantic relatedness data ─────────────────────────────────────────────
interface SemanticItem { parola1: string; parola2: string; correlate: boolean; }
const SEMANTIC_ITEMS: SemanticItem[] = [
  { parola1: "CANE",    parola2: "GATTO",      correlate: true  },
  { parola1: "MARE",    parola2: "OCEANO",     correlate: true  },
  { parola1: "PANE",    parola2: "ACQUA",      correlate: false },
  { parola1: "SEDIA",   parola2: "TAVOLO",     correlate: true  },
  { parola1: "LUNA",    parola2: "SOLE",       correlate: true  },
  { parola1: "SCARPA",  parola2: "CAVALLO",    correlate: false },
  { parola1: "PENNA",   parola2: "QUADERNO",   correlate: true  },
  { parola1: "FIORE",   parola2: "MARTELLO",   correlate: false },
  { parola1: "MEDICO",  parola2: "INFERMIERE", correlate: true  },
  { parola1: "PIZZA",   parola2: "PASTA",      correlate: true  },
  { parola1: "TRENO",   parola2: "BICICLETTA", correlate: true  },
  { parola1: "NUVOLA",  parola2: "SCARPA",     correlate: false },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

// ── Sentence Anagram data ─────────────────────────────────────────────────
interface AnagramItem { parole: string[]; corretta: string[] }
const ANAGRAM_ITEMS: AnagramItem[] = [
  { parole: ["il","gatto","beve","il","latte"],              corretta: ["il","gatto","beve","il","latte"] },
  { parole: ["la","mamma","cucina","la","pasta"],            corretta: ["la","mamma","cucina","la","pasta"] },
  { parole: ["il","sole","splende","nel","cielo"],           corretta: ["il","sole","splende","nel","cielo"] },
  { parole: ["i","bambini","giocano","nel","parco"],         corretta: ["i","bambini","giocano","nel","parco"] },
  { parole: ["il","cane","corre","veloce"],                  corretta: ["il","cane","corre","veloce"] },
  { parole: ["la","nonna","legge","un","libro"],             corretta: ["la","nonna","legge","un","libro"] },
  { parole: ["il","treno","arriva","in","stazione"],         corretta: ["il","treno","arriva","in","stazione"] },
  { parole: ["maria","compra","il","pane","fresco"],         corretta: ["maria","compra","il","pane","fresco"] },
  { parole: ["la","pioggia","cade","sulle","strade"],        corretta: ["la","pioggia","cade","sulle","strade"] },
  { parole: ["il","medico","visita","il","paziente"],        corretta: ["il","medico","visita","il","paziente"] },
  { parole: ["gli","uccelli","cantano","al","mattino"],      corretta: ["gli","uccelli","cantano","al","mattino"] },
  { parole: ["la","rosa","profuma","nel","giardino"],        corretta: ["la","rosa","profuma","nel","giardino"] },
];

// ── Proverb Completion data ───────────────────────────────────────────────
interface ProverbItem { inizio: string; fine: string; opzioni: string[] }
const PROVERB_ITEMS: ProverbItem[] = [
  { inizio: "Chi dorme non piglia",      fine: "pesci",    opzioni: ["pesci","pane","soldi","fiori"] },
  { inizio: "L'abito non fa il",         fine: "monaco",   opzioni: ["monaco","prete","saggio","re"] },
  { inizio: "Non tutte le ciambelle riescono col", fine: "buco", opzioni: ["buco","foro","centro","vuoto"] },
  { inizio: "Meglio tardi che",          fine: "mai",      opzioni: ["mai","presto","prima","dopo"] },
  { inizio: "Chi va piano va sano e va", fine: "lontano",  opzioni: ["lontano","forte","bene","sicuro"] },
  { inizio: "Il lupo perde il pelo ma non il",     fine: "vizio",   opzioni: ["vizio","dente","pelo","occhio"] },
  { inizio: "A caval donato non si guarda in",     fine: "bocca",   opzioni: ["bocca","occhio","dente","faccia"] },
  { inizio: "Can che abbaia non",        fine: "morde",    opzioni: ["morde","dorme","mangia","fugge"] },
  { inizio: "Paese che vai usanza che",  fine: "trovi",    opzioni: ["trovi","segui","impari","rispetti"] },
  { inizio: "Chi troppo vuole nulla",    fine: "stringe",  opzioni: ["stringe","ottiene","prende","guadagna"] },
  { inizio: "Il mattino ha l'oro in",    fine: "bocca",    opzioni: ["bocca","mano","tasca","cuore"] },
  { inizio: "Non è tutto oro quel che",  fine: "luccica",  opzioni: ["luccica","brilla","splende","risplende"] },
];

// ── Naming Subgame ─────────────────────────────────────────────────────────
function NamingGame({ onAnswer, onReady }: { onAnswer: (ok: boolean) => void; onReady?: () => void }) {
  const items = useRef(shuffle(NAMING_ITEMS));
  const [idx, setIdx] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [attesa, setAttesa] = useState(false);

  useEffect(() => { onReady?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRisposta(opt: string) {
    if (attesa) return;
    const ok = opt === items.current[idx].corretto;
    onAnswer(ok);
    setLastOk(ok);
    setAttesa(true);
    setTimeout(() => {
      const next = idx + 1;
      if (next >= items.current.length) {
        items.current = shuffle(NAMING_ITEMS);
        setIdx(0);
      } else {
        setIdx(next);
      }
      setLastOk(null);
      setAttesa(false);
    }, 700);
  }

  const item = items.current[idx];
  return (
    <div className="flex flex-col items-center gap-5 py-4 px-4">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>{idx + 1} / {items.current.length}</p>
      <div className="w-44 h-44 rounded-3xl flex items-center justify-center"
        style={{ backgroundColor: lastOk === true ? COLORS.successLight : lastOk === false ? "#FEE2E2" : COLORS.primaryLight, border: `3px solid ${lastOk === true ? COLORS.success : lastOk === false ? "#EF4444" : COLORS.primary}` }}>
        <span style={{ fontSize: 96 }}>{item.emoji}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {item.opzioni.map((opt, i) => (
          <button key={i} onClick={() => handleRisposta(opt)} disabled={attesa}
            className="rounded-2xl font-bold active:scale-95 transition-transform"
            style={{ height: 56, fontSize: 16, backgroundColor: COLORS.surfaceAlt, border: `2px solid ${COLORS.border}`, color: COLORS.ink, opacity: attesa ? 0.7 : 1 }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Lexical Decision Subgame ───────────────────────────────────────────────
function LexicalDecisionGame({ onAnswer, onReady }: { onAnswer: (ok: boolean) => void; onReady?: () => void }) {
  const makeItems = () => shuffle([
    ...PAROLE_REALI.map((p) => ({ testo: p, isParola: true })),
    ...NON_PAROLE.map((p) => ({ testo: p, isParola: false })),
  ]);
  const items = useRef(makeItems());
  const [idx, setIdx] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  useEffect(() => { onReady?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [attesa, setAttesa] = useState(false);

  function handleRisposta(isParola: boolean) {
    if (attesa) return;
    const ok = isParola === items.current[idx].isParola;
    onAnswer(ok);
    setLastOk(ok);
    setAttesa(true);
    setTimeout(() => {
      const next = idx + 1;
      if (next >= items.current.length) {
        items.current = makeItems();
        setIdx(0);
      } else {
        setIdx(next);
      }
      setLastOk(null);
      setAttesa(false);
    }, 600);
  }

  const item = items.current[idx];
  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>{idx + 1} / {items.current.length}</p>
      <div className="w-full rounded-3xl flex items-center justify-center py-10"
        style={{ backgroundColor: lastOk === true ? COLORS.successLight : lastOk === false ? "#FEE2E2" : COLORS.primaryLight, border: `3px solid ${lastOk === true ? COLORS.success : lastOk === false ? "#EF4444" : COLORS.primary}` }}>
        <span className="font-extrabold tracking-widest" style={{ fontSize: 40, color: COLORS.ink }}>{item.testo}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <button onClick={() => handleRisposta(true)} disabled={attesa}
          className="rounded-2xl font-bold active:scale-95" style={{ height: 64, fontSize: 18, backgroundColor: COLORS.successLight, border: `2px solid ${COLORS.success}`, color: COLORS.success, opacity: attesa ? 0.7 : 1 }}>
          Parola reale
        </button>
        <button onClick={() => handleRisposta(false)} disabled={attesa}
          className="rounded-2xl font-bold active:scale-95" style={{ height: 64, fontSize: 18, backgroundColor: "#FEE2E2", border: `2px solid #EF4444`, color: "#EF4444", opacity: attesa ? 0.7 : 1 }}>
          Non parola
        </button>
      </div>
    </div>
  );
}

// ── Semantic Relatedness Subgame ──────────────────────────────────────────
function SemanticRelatednessGame({ onAnswer, onReady }: { onAnswer: (ok: boolean) => void; onReady?: () => void }) {
  const items = useRef(shuffle(SEMANTIC_ITEMS));
  const [idx, setIdx] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [attesa, setAttesa] = useState(false);
  const [pronto, setPronto] = useState(false);

  if (!pronto) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">🔗</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Relazione Semantica</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Vedrai due parole. Il tuo obiettivo è capire se appartengono alla stessa categoria di significato.
        </p>
        <button
          onClick={() => { setPronto(true); onReady?.(); }}
          className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95"
          style={{ backgroundColor: COLORS.primary }}
        >
          Inizia
        </button>
      </div>
    );
  }

  function handleRisposta(correlate: boolean) {
    if (attesa) return;
    const ok = correlate === items.current[idx].correlate;
    onAnswer(ok);
    setLastOk(ok);
    setAttesa(true);
    setTimeout(() => {
      const next = idx + 1;
      if (next >= items.current.length) {
        items.current = shuffle(SEMANTIC_ITEMS);
        setIdx(0);
      } else {
        setIdx(next);
      }
      setLastOk(null);
      setAttesa(false);
    }, 600);
  }

  const item = items.current[idx];
  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>{idx + 1} / {items.current.length}</p>
      <div className="w-full rounded-3xl flex flex-col items-center justify-center gap-3 py-8"
        style={{ backgroundColor: lastOk === true ? COLORS.successLight : lastOk === false ? "#FEE2E2" : COLORS.primaryLight, border: `3px solid ${lastOk === true ? COLORS.success : lastOk === false ? "#EF4444" : COLORS.primary}` }}>
        <span className="font-extrabold" style={{ fontSize: 32, color: COLORS.ink }}>{item.parola1}</span>
        <span style={{ fontSize: 24, color: COLORS.inkMuted }}>—</span>
        <span className="font-extrabold" style={{ fontSize: 32, color: COLORS.ink }}>{item.parola2}</span>
      </div>
      <p className="text-sm" style={{ color: COLORS.inkMuted }}>Sono correlate semanticamente?</p>
      <div className="grid grid-cols-2 gap-4 w-full">
        <button onClick={() => handleRisposta(true)} disabled={attesa}
          className="rounded-2xl font-bold active:scale-95" style={{ height: 64, fontSize: 18, backgroundColor: COLORS.successLight, border: `2px solid ${COLORS.success}`, color: COLORS.success, opacity: attesa ? 0.7 : 1 }}>
          ✓ Correlate
        </button>
        <button onClick={() => handleRisposta(false)} disabled={attesa}
          className="rounded-2xl font-bold active:scale-95" style={{ height: 64, fontSize: 18, backgroundColor: "#FEE2E2", border: `2px solid #EF4444`, color: "#EF4444", opacity: attesa ? 0.7 : 1 }}>
          ✗ Non correlate
        </button>
      </div>
    </div>
  );
}

// ── Sentence Anagram Subgame ──────────────────────────────────────────────
function SentenceAnagramGame({ onAnswer, onReady }: { onAnswer: (ok: boolean) => void; onReady?: () => void }) {
  const makeItems = () => shuffle(ANAGRAM_ITEMS);
  const items = useRef(makeItems());
  const [idx, setIdx] = useState(0);
  const [paroleDisponibili, setParoleDisponibili] = useState<string[]>(() =>
    shuffle(items.current[0].parole)
  );
  const [paroleScelte, setParoleScelte] = useState<string[]>([]);
  const [attesa, setAttesa] = useState(false);
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  useEffect(() => { onReady?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function reset(nextIdx: number) {
    const nextItem = items.current[nextIdx];
    setParoleDisponibili(shuffle(nextItem.parole));
    setParoleScelte([]);
    setLastOk(null);
    setAttesa(false);
  }

  function handleAggiungi(parola: string, parIdx: number) {
    if (attesa) return;
    setParoleScelte((p) => [...p, parola]);
    setParoleDisponibili((p) => p.filter((_, i) => i !== parIdx));
  }

  function handleRimuovi(parola: string, scIdx: number) {
    if (attesa) return;
    setParoleScelte((p) => p.filter((_, i) => i !== scIdx));
    setParoleDisponibili((p) => [...p, parola]);
  }

  function handleConferma() {
    if (attesa || paroleScelte.length !== items.current[idx].corretta.length) return;
    const ok = paroleScelte.join(" ") === items.current[idx].corretta.join(" ");
    onAnswer(ok);
    setLastOk(ok);
    setAttesa(true);
    setTimeout(() => {
      const next = idx + 1;
      if (next >= items.current.length) {
        items.current = makeItems();
        setIdx(0);
        reset(0);
      } else {
        setIdx(next);
        reset(next);
      }
    }, 900);
  }

  const item = items.current[idx];
  const tutteScelte = paroleScelte.length === item.parole.length;
  return (
    <div className="flex flex-col gap-4 py-4 px-4">
      <p className="text-sm font-medium text-center" style={{ color: COLORS.inkMuted }}>
        Metti le parole nell&apos;ordine giusto
      </p>

      {/* Zona frase costruita */}
      <div className="min-h-[56px] rounded-2xl p-3 flex flex-wrap gap-2"
        style={{ backgroundColor: lastOk === true ? COLORS.successLight : lastOk === false ? "#FEE2E2" : COLORS.primaryLight, border: `2px solid ${lastOk === true ? COLORS.success : lastOk === false ? "#EF4444" : COLORS.primary}` }}>
        {paroleScelte.map((p, i) => (
          <button key={i} onClick={() => handleRimuovi(p, i)} disabled={attesa}
            className="px-3 py-1 rounded-xl font-semibold active:scale-95 transition-transform"
            style={{ backgroundColor: COLORS.primary, color: "#fff", fontSize: 15 }}>
            {p}
          </button>
        ))}
        {paroleScelte.length === 0 && (
          <span className="text-sm italic" style={{ color: COLORS.primary + "88" }}>Tocca le parole qui sotto…</span>
        )}
      </div>

      {/* Parole disponibili */}
      <div className="flex flex-wrap gap-2 justify-center min-h-[48px]">
        {paroleDisponibili.map((p, i) => (
          <button key={i} onClick={() => handleAggiungi(p, i)} disabled={attesa}
            className="px-3 py-2 rounded-xl font-semibold active:scale-95 transition-transform"
            style={{ backgroundColor: COLORS.surfaceAlt, border: `2px solid ${COLORS.border}`, color: COLORS.ink, fontSize: 15 }}>
            {p}
          </button>
        ))}
      </div>

      <button onClick={handleConferma} disabled={attesa || !tutteScelte}
        className="rounded-2xl font-bold text-white active:scale-95"
        style={{ height: 52, fontSize: 17, backgroundColor: tutteScelte ? COLORS.primary : COLORS.border }}>
        {lastOk === true ? "✓ Corretto!" : lastOk === false ? "✗ Riprova" : "Conferma"}
      </button>
    </div>
  );
}

// ── Proverb Completion Subgame ────────────────────────────────────────────
function ProverbCompletionGame({ onAnswer, onReady }: { onAnswer: (ok: boolean) => void; onReady?: () => void }) {
  const items = useRef(shuffle(PROVERB_ITEMS));
  const [idx, setIdx] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [attesa, setAttesa] = useState(false);
  const [opzioni, setOpzioni] = useState<string[]>(() => shuffle(items.current[0].opzioni));

  useEffect(() => { onReady?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRisposta(opt: string) {
    if (attesa) return;
    const ok = opt === items.current[idx].fine;
    onAnswer(ok);
    setLastOk(ok);
    setAttesa(true);
    setTimeout(() => {
      const next = idx + 1;
      if (next >= items.current.length) {
        items.current = shuffle(PROVERB_ITEMS);
        setIdx(0);
        setOpzioni(shuffle(items.current[0].opzioni));
      } else {
        setIdx(next);
        setOpzioni(shuffle(items.current[next].opzioni));
      }
      setLastOk(null);
      setAttesa(false);
    }, 800);
  }

  const item = items.current[idx];
  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>{idx + 1} / {items.current.length}</p>
      <div className="w-full rounded-3xl p-5 flex flex-col items-center gap-2"
        style={{ backgroundColor: lastOk === true ? COLORS.successLight : lastOk === false ? "#FEE2E2" : COLORS.primaryLight, border: `3px solid ${lastOk === true ? COLORS.success : lastOk === false ? "#EF4444" : COLORS.primary}` }}>
        <span className="text-lg font-bold text-center leading-snug" style={{ color: COLORS.ink }}>
          {item.inizio} <span style={{ color: COLORS.primary }}>___</span>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {opzioni.map((opt, i) => (
          <button key={i} onClick={() => handleRisposta(opt)} disabled={attesa}
            className="rounded-2xl font-bold active:scale-95 transition-transform"
            style={{ height: 56, fontSize: 16, backgroundColor: COLORS.surfaceAlt, border: `2px solid ${COLORS.border}`, color: COLORS.ink, opacity: attesa ? 0.7 : 1 }}>
            {opt}
          </button>
        ))}
      </div>
      {lastOk === false && (
        <p className="text-sm font-semibold" style={{ color: COLORS.success }}>
          Risposta: «{item.fine}»
        </p>
      )}
    </div>
  );
}

// ── Parent ─────────────────────────────────────────────────────────────────
export default function Linguaggio({ variant, livello: _livello, tempoScaduto, onComplete, onReady }: Props) {
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const completato = useRef(false);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleAnswer(ok: boolean) {
    setCorretti((c) => c + (ok ? 1 : 0));
    setTotale((t) => t + 1);
  }

  if (variant === "naming") return <NamingGame onAnswer={handleAnswer} onReady={onReady} />;
  if (variant === "lexical_decision") return <LexicalDecisionGame onAnswer={handleAnswer} onReady={onReady} />;
  if (variant === "semantic_relatedness") return <SemanticRelatednessGame onAnswer={handleAnswer} onReady={onReady} />;
  if (variant === "sentence_anagram") return <SentenceAnagramGame onAnswer={handleAnswer} onReady={onReady} />;
  if (variant === "proverb_completion") return <ProverbCompletionGame onAnswer={handleAnswer} onReady={onReady} />;
  return null;
}
