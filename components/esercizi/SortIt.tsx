"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type FeedbackType = "full" | "reduced" | "none";
type LivelloConfig = {
  nCat: number;
  stimPerCat: number;
  switchEvery: number | "sempre";
  feedback: FeedbackType;
};

function getLivelloConfig(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0)  return { nCat: 2, stimPerCat: 8, switchEvery: "sempre", feedback: "full" };
  if (idx <= 3)  return { nCat: 2, stimPerCat: 7, switchEvery: "sempre", feedback: "full" };
  if (idx <= 4)  return { nCat: 2, stimPerCat: 6, switchEvery: "sempre", feedback: "reduced" };
  if (idx <= 7)  return { nCat: 2, stimPerCat: 5, switchEvery: 7, feedback: "reduced" };
  if (idx <= 9)  return { nCat: 3, stimPerCat: 4, switchEvery: 5, feedback: "none" };
  if (idx <= 12) return { nCat: 3, stimPerCat: 3, switchEvery: 4, feedback: "none" };
  if (idx <= 14) return { nCat: 4, stimPerCat: 3, switchEvery: 3, feedback: "none" };
  if (idx <= 17) return { nCat: 4, stimPerCat: 2, switchEvery: 2, feedback: "none" };
  return { nCat: 4, stimPerCat: 1, switchEvery: 1, feedback: "none" };
}

type StimulusType = "colore" | "forma" | "numero" | "texture" | "dimensione";

interface Card {
  label: string;
  color: string;
}

const COLORI_LABELS = ["Rosso", "Blu", "Verde", "Giallo"];
const COLORI_HEX = ["#EF4444", "#3B82F6", "#22C55E", "#EAB308"];
const FORME = ["Cerchio", "Quadrato", "Triangolo", "Stella"];
const NUMERI = ["1", "2", "3", "4", "5", "6", "7", "8"];
const TEXTURE = ["Righe", "Puntini", "Zigzag", "Onde"];
const DIM = ["Piccolo", "Medio", "Grande", "Enorme"];

function generateCard(stimulusType: StimulusType): Card {
  let pool: string[];
  if (stimulusType === "colore") pool = COLORI_LABELS;
  else if (stimulusType === "forma") pool = FORME;
  else if (stimulusType === "numero") pool = NUMERI;
  else if (stimulusType === "texture") pool = TEXTURE;
  else pool = DIM;
  const label = pool[Math.floor(Math.random() * pool.length)];
  const color = COLORI_HEX[Math.floor(Math.random() * COLORI_HEX.length)];
  return { label, color };
}

const CAT_COLORS = [COLORS.primary, COLORS.accent1, COLORS.accent2, COLORS.accent3];

type Fase = "trial" | "feedback" | "rule_change";

interface Props {
  stimulusType: StimulusType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function SortIt({ stimulusType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivelloConfig(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);

  const [fase, setFase] = useState<Fase>("trial");
  const [carta, setCarta] = useState<Card>(() => generateCard(stimulusType));
  const [regola, setRegola] = useState(0); // index regola attiva (cicla su nCat)
  const [consecutivi, setConsecutivi] = useState(0);
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  const avanzaTrial = useCallback(() => {
    setCarta(generateCard(stimulusType));
    setFase("trial");
  }, [stimulusType]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  useEffect(() => {
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCategoria(catIdx: number) {
    if (fase !== "trial") return;
    const nuoveTotale = totale + 1;
    const ok = catIdx === regola % cfg.nCat;
    const nuoviCorretti = corretti + (ok ? 1 : 0);
    const nuoviConsecutivi = ok ? consecutivi + 1 : 0;

    setCorretti(nuoviCorretti);
    setTotale(nuoveTotale);
    setLastOk(ok);
    setConsecutivi(nuoviConsecutivi);

    if (cfg.feedback !== "none") {
      setFase("feedback");
      const shouldSwitch = cfg.switchEvery === "sempre" ? ok : nuoviConsecutivi >= cfg.switchEvery;
      if (shouldSwitch) {
        const nuovaRegola = (regola + 1) % cfg.nCat;
        setRegola(nuovaRegola);
        setConsecutivi(0);
        setTimeout(() => { setFase("rule_change"); setTimeout(avanzaTrial, 1200); }, 800);
        return;
      }
      setTimeout(avanzaTrial, 700);
    } else {
      const shouldSwitch = cfg.switchEvery === "sempre" ? ok : nuoviConsecutivi >= cfg.switchEvery;
      if (shouldSwitch) {
        setRegola((r) => (r + 1) % cfg.nCat);
        setConsecutivi(0);
      }
      avanzaTrial();
    }
  }

  const catLabels = Array.from({ length: cfg.nCat }, (_, i) => `Categoria ${i + 1}`);

  return (
    <div className="flex flex-col gap-4 py-4 px-3">
      {cfg.feedback === "full" && (
        <div className="rounded-xl px-4 py-2 text-center" style={{ backgroundColor: COLORS.primaryLight, border: `1px solid ${COLORS.primary}` }}>
          <p className="text-sm font-bold" style={{ color: COLORS.primary }}>
            Regola attiva: metti in <strong>{catLabels[regola % cfg.nCat]}</strong>
          </p>
        </div>
      )}

      {fase === "rule_change" && (
        <div className="rounded-xl px-4 py-3 text-center animate-pulse" style={{ backgroundColor: COLORS.warningLight }}>
          <p className="text-base font-bold" style={{ color: COLORS.warning }}>La regola è cambiata!</p>
        </div>
      )}

      <div
        className="rounded-3xl flex flex-col items-center justify-center gap-2 mx-auto"
        style={{
          width: 180, height: 180,
          backgroundColor: carta.color + "22",
          border: `3px solid ${carta.color}`,
        }}
      >
        <span className="text-5xl font-extrabold" style={{ color: carta.color }}>{carta.label}</span>
        {cfg.feedback !== "none" && lastOk !== null && fase === "feedback" && (
          <span className="text-3xl">{lastOk ? "✓" : "✗"}</span>
        )}
      </div>

      <div className={`grid gap-3 mt-2`} style={{ gridTemplateColumns: `repeat(${Math.min(cfg.nCat, 2)}, 1fr)` }}>
        {catLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => handleCategoria(i)}
            disabled={fase !== "trial"}
            className="rounded-2xl flex items-center justify-center font-bold active:scale-95 transition-transform"
            style={{
              height: 60,
              fontSize: 16,
              backgroundColor: CAT_COLORS[i] + "22",
              border: `2px solid ${CAT_COLORS[i]}`,
              color: CAT_COLORS[i],
              opacity: fase !== "trial" ? 0.6 : 1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-center text-sm font-medium mt-1" style={{ color: COLORS.inkMuted }}>
        {corretti} / {totale} corretti
      </p>
    </div>
  );
}
