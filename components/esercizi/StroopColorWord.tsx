"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

// ── Color-Word Stroop ─────────────────────────────────────────────────────────
type Condizione = "congruente" | "mista" | "incongruente" | "mista_neutro";

type LivelloCW = {
  condizione: Condizione;
  timeLimitMs: number;
};

const LIVELLI_CW: LivelloCW[] = [
  { condizione: "congruente",   timeLimitMs: 5000 }, // 1
  { condizione: "congruente",   timeLimitMs: 4800 }, // 2
  { condizione: "congruente",   timeLimitMs: 4600 }, // 3
  { condizione: "mista",        timeLimitMs: 4400 }, // 4
  { condizione: "mista",        timeLimitMs: 4200 }, // 5
  { condizione: "mista",        timeLimitMs: 4000 }, // 6
  { condizione: "mista",        timeLimitMs: 3800 }, // 7
  { condizione: "mista",        timeLimitMs: 3600 }, // 8
  { condizione: "mista",        timeLimitMs: 3400 }, // 9
  { condizione: "mista",        timeLimitMs: 3200 }, // 10
  { condizione: "mista",        timeLimitMs: 3000 }, // 11
  { condizione: "mista",        timeLimitMs: 2800 }, // 12
  { condizione: "mista",        timeLimitMs: 2600 }, // 13
  { condizione: "mista",        timeLimitMs: 2400 }, // 14
  { condizione: "incongruente", timeLimitMs: 2000 }, // 15
  { condizione: "incongruente", timeLimitMs: 1900 }, // 16
  { condizione: "incongruente", timeLimitMs: 1800 }, // 17
  { condizione: "mista_neutro", timeLimitMs: 1700 }, // 18
  { condizione: "mista_neutro", timeLimitMs: 1600 }, // 19
  { condizione: "mista_neutro", timeLimitMs: 1500 }, // 20
];

const COLORI_CW = [
  { nome: "ROSSO",  hex: "#EF4444" },
  { nome: "VERDE",  hex: "#16A34A" },
  { nome: "BLU",    hex: "#2563EB" },
  { nome: "GIALLO", hex: "#CA8A04" },
];
const PAROLE_NEUTRALI = ["TAVOLO", "PANE", "CASA", "MARE", "SOLE", "LIBRO"];

function shuffleArr<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function generaTrialCW(cond: Condizione) {
  const sh = shuffleArr(COLORI_CW);
  const coloreInchiostro = sh[0];
  let parola: string;
  if (cond === "congruente") {
    parola = coloreInchiostro.nome;
  } else if (cond === "incongruente") {
    parola = sh[1].nome;
  } else if (cond === "mista_neutro" && Math.random() < 0.4) {
    parola = PAROLE_NEUTRALI[Math.floor(Math.random() * PAROLE_NEUTRALI.length)];
  } else {
    parola = Math.random() < 0.5 ? coloreInchiostro.nome : sh[1].nome;
  }
  return { parola, coloreInchiostro: coloreInchiostro.hex, nomeCorretto: coloreInchiostro.nome };
}

// ── Spatial Stroop (Simon Task) ───────────────────────────────────────────────
type LivelloSP = {
  incongruenteRatio: number; // 0–1
  isiMs: number;
  nFlanker: number;
};

const LIVELLI_SP: LivelloSP[] = [
  { incongruenteRatio: 0,    isiMs: 1500, nFlanker: 0 }, // 1
  { incongruenteRatio: 0,    isiMs: 1450, nFlanker: 0 }, // 2
  { incongruenteRatio: 0.1,  isiMs: 1400, nFlanker: 0 }, // 3
  { incongruenteRatio: 0.2,  isiMs: 1350, nFlanker: 0 }, // 4
  { incongruenteRatio: 0.3,  isiMs: 1300, nFlanker: 0 }, // 5
  { incongruenteRatio: 0.4,  isiMs: 1200, nFlanker: 0 }, // 6
  { incongruenteRatio: 0.5,  isiMs: 1100, nFlanker: 1 }, // 7
  { incongruenteRatio: 0.5,  isiMs: 1000, nFlanker: 1 }, // 8
  { incongruenteRatio: 0.5,  isiMs:  950, nFlanker: 1 }, // 9
  { incongruenteRatio: 0.5,  isiMs:  900, nFlanker: 1 }, // 10
  { incongruenteRatio: 0.6,  isiMs:  850, nFlanker: 2 }, // 11
  { incongruenteRatio: 0.6,  isiMs:  800, nFlanker: 2 }, // 12
  { incongruenteRatio: 0.6,  isiMs:  750, nFlanker: 2 }, // 13
  { incongruenteRatio: 0.7,  isiMs:  700, nFlanker: 2 }, // 14
  { incongruenteRatio: 0.7,  isiMs:  650, nFlanker: 3 }, // 15
  { incongruenteRatio: 0.7,  isiMs:  620, nFlanker: 3 }, // 16
  { incongruenteRatio: 0.8,  isiMs:  590, nFlanker: 3 }, // 17
  { incongruenteRatio: 0.8,  isiMs:  560, nFlanker: 3 }, // 18
  { incongruenteRatio: 0.8,  isiMs:  530, nFlanker: 3 }, // 19
  { incongruenteRatio: 0.8,  isiMs:  500, nFlanker: 3 }, // 20
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  variant: "color_word" | "spatial";
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, accuratezza: number) => void;
  onReady?: () => void;
}

// ── Color-Word Component ──────────────────────────────────────────────────────
function ColorWordStroop({ livello, tempoScaduto, onComplete, onReady }: Omit<Props, "variant">) {
  const cfg = LIVELLI_CW[Math.min(Math.max(livello - 1, 0), 19)];
  const [fase, setFase] = useState<"intro" | "gioco" | "feedback">("intro");
  const [parola, setParola] = useState("");
  const [coloreInchiostro, setColoreInchiostro] = useState("#000");
  const [nomeCorretto, setNomeCorretto] = useState("");
  const [selezionato, setSelezionato] = useState<string | null>(null);
  const [timerMs, setTimerMs] = useState(cfg.timeLimitMs);
  const [risultati, setRisultati] = useState<boolean[]>([]);
  const [opzioni, setOpzioni] = useState<typeof COLORI_CW>([]);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);

  const nuovoTrial = useCallback(() => {
    const t = generaTrialCW(cfg.condizione);
    setParola(t.parola);
    setColoreInchiostro(t.coloreInchiostro);
    setNomeCorretto(t.nomeCorretto);
    setSelezionato(null);
    setTimerMs(cfg.timeLimitMs);
    setOpzioni(shuffleArr(COLORI_CW));
    setFase("gioco");
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
  }, [cfg]);

  useEffect(() => { const t = setTimeout(nuovoTrial, 1500); return () => clearTimeout(t); }, [nuovoTrial]);

  useEffect(() => {
    if (fase !== "gioco") return;
    if (timerMs <= 0) { handleRisposta(""); return; }
    const t = setTimeout(() => setTimerMs((ms) => ms - 100), 100);
    return () => clearTimeout(t);
  });

  function handleRisposta(nome: string) {
    if (fase !== "gioco") return;
    const ok = nome === nomeCorretto;
    setSelezionato(nome || "__timeout__");
    setRisultati((r) => [...r, ok]);
    setFase("feedback");
  }

  useEffect(() => {
    if (fase !== "feedback") return;
    const t = setTimeout(nuovoTrial, 1000);
    return () => clearTimeout(t);
  }, [fase, nuovoTrial]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = risultati.length > 0 ? Math.round((risultati.filter(Boolean).length / risultati.length) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, risultati, onComplete]);

  if (fase === "intro") return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center px-4">
      <span className="text-6xl">🎨</span>
      <p className="text-xl font-bold text-ink">Che colore è l&apos;inchiostro?</p>
      <p className="text-base" style={{ color: COLORS.inkMuted }}>Ignora la parola scritta — tocca il colore dell&apos;inchiostro</p>
      <div className="flex gap-3 mt-2">
        {COLORI_CW.map((c) => (
          <div key={c.nome} className="w-10 h-10 rounded-full border-2 border-white shadow" style={{ backgroundColor: c.hex }} />
        ))}
      </div>
    </div>
  );

  const timerPct = (timerMs / cfg.timeLimitMs) * 100;

  return (
    <div className="flex flex-col gap-6 py-4 px-4">
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.border }}>
        <div className="h-full rounded-full transition-all duration-100"
          style={{ width: `${timerPct}%`, backgroundColor: timerPct > 40 ? COLORS.primary : "#EF4444" }} />
      </div>
      <div className="flex items-center justify-center py-10 rounded-3xl" style={{ backgroundColor: COLORS.surfaceAlt }}>
        <span className="text-5xl font-extrabold tracking-wide select-none" style={{ color: coloreInchiostro }}>
          {parola}
        </span>
      </div>
      <p className="text-sm text-center font-medium" style={{ color: COLORS.inkMuted }}>Tocca il colore dell&apos;inchiostro</p>
      <div className="grid grid-cols-2 gap-3">
        {opzioni.map((c) => {
          const isSel = selezionato === c.nome;
          const isCorr = c.nome === nomeCorretto;
          let border = "transparent";
          if (fase === "feedback" && isSel) border = isCorr ? COLORS.success : "#EF4444";
          else if (fase === "feedback" && isCorr) border = COLORS.success;
          return (
            <button key={c.nome} onClick={() => handleRisposta(c.nome)}
              className="h-16 rounded-2xl font-bold text-white text-lg active:scale-95 transition-all"
              style={{ backgroundColor: c.hex, border: `3px solid ${border}`, opacity: fase === "feedback" && !isSel && !isCorr ? 0.5 : 1 }}>
              {c.nome}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-center font-semibold" style={{ color: COLORS.inkMuted }}>
        {risultati.filter(Boolean).length} / {risultati.length} corretti
      </p>
    </div>
  );
}

// ── Spatial Stroop (Simon Task) Component ─────────────────────────────────────
function SpatialStroop({ livello, tempoScaduto, onComplete, onReady }: Omit<Props, "variant">) {
  const cfg = LIVELLI_SP[Math.min(Math.max(livello - 1, 0), 19)];
  const [fase, setFase] = useState<"intro" | "isi" | "gioco" | "feedback">("intro");
  const [direzione, setDirezione] = useState<"left" | "right">("left");
  const [posizione, setPosizione] = useState<"left" | "right">("left");
  const [flanker, setFlanker] = useState<string[]>([]);
  const [rispostaUtente, setRispostaUtente] = useState<"left" | "right" | null>(null);
  const [risultati, setRisultati] = useState<boolean[]>([]);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);

  const nuovoTrial = useCallback(() => {
    const congruente = Math.random() > cfg.incongruenteRatio;
    const dir: "left" | "right" = Math.random() > 0.5 ? "left" : "right";
    const pos: "left" | "right" = congruente ? dir : (dir === "left" ? "right" : "left");
    const flankerDir = Math.random() > 0.5 ? "←" : "→";
    const fl = Array(cfg.nFlanker).fill(flankerDir);
    setDirezione(dir);
    setPosizione(pos);
    setFlanker(fl);
    setRispostaUtente(null);
    setFase("isi");
  }, [cfg]);

  useEffect(() => { const t = setTimeout(nuovoTrial, 1500); return () => clearTimeout(t); }, [nuovoTrial]);

  useEffect(() => {
    if (fase !== "isi") return;
    const t = setTimeout(() => {
      setFase("gioco");
      if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    }, cfg.isiMs);
    return () => clearTimeout(t);
  }, [fase, cfg.isiMs]);

  // Timeout per risposta
  useEffect(() => {
    if (fase !== "gioco") return;
    const t = setTimeout(() => handleRisposta(direzione === "left" ? "right" : "left"), 2000);
    return () => clearTimeout(t);
  }, [fase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRisposta(r: "left" | "right") {
    if (fase !== "gioco") return;
    const ok = r === direzione;
    setRispostaUtente(r);
    setRisultati((prev) => [...prev, ok]);
    setFase("feedback");
  }

  useEffect(() => {
    if (fase !== "feedback") return;
    const t = setTimeout(nuovoTrial, 900);
    return () => clearTimeout(t);
  }, [fase, nuovoTrial]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = risultati.length > 0 ? Math.round((risultati.filter(Boolean).length / risultati.length) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, risultati, onComplete]);

  if (fase === "intro") return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center px-4">
      <span className="text-6xl">🏹</span>
      <p className="text-xl font-bold text-ink">In che direzione punta la freccia?</p>
      <p className="text-base" style={{ color: COLORS.inkMuted }}>Ignora la posizione — tocca la direzione della freccia centrale</p>
      <div className="flex gap-8 mt-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">←</span><span className="text-xs" style={{ color: COLORS.inkMuted }}>Sinistra</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">→</span><span className="text-xs" style={{ color: COLORS.inkMuted }}>Destra</span>
        </div>
      </div>
    </div>
  );

  const frecciaCentrale = direzione === "left" ? "←" : "→";
  const congruente = direzione === posizione;

  return (
    <div className="flex flex-col gap-6 py-4 px-4">
      {/* Stimolo */}
      <div className="relative h-40 rounded-3xl flex items-center" style={{ backgroundColor: COLORS.surfaceAlt }}>
        {/* Frecce flanker sopra/sotto la centrale */}
        {flanker.length > 0 && (
          <div
            className="absolute flex flex-col items-center gap-0"
            style={{ [posizione]: 40 }}
          >
            {flanker.slice(0, Math.ceil(flanker.length / 2)).map((f, i) => (
              <span key={`top-${i}`} className="text-2xl" style={{ color: COLORS.inkMuted }}>{f}</span>
            ))}
          </div>
        )}
        {/* Freccia centrale */}
        <div
          className="absolute flex items-center justify-center"
          style={{ [posizione]: flanker.length > 0 ? 40 : "50%", transform: posizione === "left" || flanker.length === 0 ? undefined : undefined }}
        >
          <span
            className="font-extrabold select-none transition-all duration-150"
            style={{ fontSize: 72, color: fase === "feedback" ? (rispostaUtente === direzione ? COLORS.success : "#EF4444") : COLORS.ink }}
          >
            {fase === "isi" ? "" : frecciaCentrale}
          </span>
        </div>
        {/* Indicatore congruenza (feedback) */}
        {fase === "feedback" && (
          <div className="absolute bottom-2 right-3 text-xs font-semibold" style={{ color: COLORS.inkMuted }}>
            {congruente ? "congruente" : "incongruente"}
          </div>
        )}
      </div>

      <p className="text-sm text-center font-medium" style={{ color: COLORS.inkMuted }}>
        Tocca la direzione della freccia
      </p>

      {/* Pulsanti risposta */}
      <div className="grid grid-cols-2 gap-4">
        {(["left", "right"] as const).map((dir) => {
          const isSel = rispostaUtente === dir;
          const isCorr = dir === direzione;
          let bg: string = COLORS.surfaceAlt;
          let border: string = COLORS.border;
          if (fase === "feedback" && isSel) { bg = isCorr ? COLORS.successLight : "#FEE2E2"; border = isCorr ? COLORS.success : "#EF4444"; }
          else if (fase === "feedback" && isCorr) { bg = COLORS.successLight; border = COLORS.success; }
          return (
            <button key={dir} onClick={() => handleRisposta(dir)}
              className="h-20 rounded-2xl flex items-center justify-center text-4xl active:scale-95 transition-all"
              style={{ backgroundColor: bg, border: `2px solid ${border}` }}>
              {dir === "left" ? "←" : "→"}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-center font-semibold" style={{ color: COLORS.inkMuted }}>
        {risultati.filter(Boolean).length} / {risultati.length} corretti
      </p>
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────────
export default function StroopColorWord({ variant, livello, tempoScaduto, onComplete, onReady }: Props) {
  if (variant === "spatial") {
    return <SpatialStroop livello={livello} tempoScaduto={tempoScaduto} onComplete={onComplete} onReady={onReady} />;
  }
  return <ColorWordStroop livello={livello} tempoScaduto={tempoScaduto} onComplete={onComplete} onReady={onReady} />;
}
