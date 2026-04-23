"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type SentenceType = "frasi_quotidiane" | "frasi_narrative" | "frasi_tecnico_scientifiche";

type Parte = "A" | "B" | "AB";

function getParte(lv: number): Parte {
  if (lv <= 3) return "A";
  if (lv <= 12) return "AB";
  return "B";
}

interface Frase {
  testo: string;
  completamento: string;  // risposta naturale (Parte A)
  opzioniB: string[];     // opzioni per Parte B (non correlate)
}

const FRASI_QUOTIDIANE: Frase[] = [
  { testo: "Il gatto beve il ___", completamento: "LATTE", opzioniB: ["NEBBIA","MARTELLO","MUSICA","NUVOLA"] },
  { testo: "La mattina faccio la ___", completamento: "COLAZIONE", opzioniB: ["GARAGE","OCEANO","FIAMMA","BUSSOLA"] },
  { testo: "Accendo la luce con l'___", completamento: "INTERRUTTORE", opzioniB: ["ANCORA","FORESTA","COLTELLO","PUZZLE"] },
  { testo: "Metto il pane nel ___", completamento: "FORNO", opzioniB: ["TELESCOPIO","FIOCCO","ARMADIO","SASSO"] },
  { testo: "Apro la porta con la ___", completamento: "CHIAVE", opzioniB: ["MOLECOLA","VENTO","CIPOLLA","CANDELA"] },
  { testo: "Lavo i denti con lo ___", completamento: "SPAZZOLINO", opzioniB: ["VULCANO","ABACO","MAPPA","GHIACCIO"] },
  { testo: "Metto l'acqua nella ___", completamento: "BOTTIGLIA", opzioniB: ["STELLA","PRUGNA","FRECCIA","OMBRELLO"] },
  { testo: "Guardo la televisione sul ___", completamento: "DIVANO", opzioniB: ["TRATTORE","MANTELLO","CIPRESSO","DADO"] },
  { testo: "Vado a dormire nel ___", completamento: "LETTO", opzioniB: ["GALOPPO","FIOCCO","SCOGLIO","MARMOTTA"] },
  { testo: "Mi vesto dopo la ___", completamento: "DOCCIA", opzioniB: ["TARTARUGA","ABISSO","FRECCIA","TAMBURO"] },
];

const FRASI_NARRATIVE: Frase[] = [
  { testo: "Il cavaliere brandiva la sua ___", completamento: "SPADA", opzioniB: ["NUVOLA","PROFUMO","BANANA","MUSCHIO"] },
  { testo: "La principessa era rinchiusa nella ___", completamento: "TORRE", opzioniB: ["FARFALLA","MICROSCOPIO","POLVERE","SORGENTE"] },
  { testo: "Il drago soffiava fuoco dalle ___", completamento: "NARICI", opzioniB: ["ARCHIVIO","FISCHIO","GRANITO","LAVANDA"] },
  { testo: "Il mago lanciò un potente ___", completamento: "INCANTESIMO", opzioniB: ["TAPPETO","SALMONE","BUSSOLA","VIOLINO"] },
  { testo: "Il marinaio guardava le stelle per orientarsi nella ___", completamento: "NOTTE", opzioniB: ["PEDALE","CORTECCIA","ABITO","FIATO"] },
  { testo: "Il cacciatore tese una ___", completamento: "TRAPPOLA", opzioniB: ["RIVERBERO","MOLECOLA","ANATRA","SABBIA"] },
  { testo: "Il re sedeva sul suo ___", completamento: "TRONO", opzioniB: ["POLLINE","CASSETTO","FRECCIA","INCHIOSTRO"] },
  { testo: "Il contadino arò il ___", completamento: "CAMPO", opzioniB: ["VELIERO","COLLANA","MARMELLATA","SCALPELLO"] },
  { testo: "La fata agitava la sua magica ___", completamento: "BACCHETTA", opzioniB: ["ALVEARE","PIOMBO","CASCATA","DIPLOMA"] },
  { testo: "Il ladro fuggì nella ___", completamento: "NOTTE", opzioniB: ["CLORURO","TERZETTO","PALLADIO","BALSAMO"] },
];

const FRASI_TECNICO: Frase[] = [
  { testo: "Il medico misura la pressione con lo ___", completamento: "SFIGMOMANOMETRO", opzioniB: ["GALOPPO","SENTIERO","NUVOLA","CAPPELLO"] },
  { testo: "L'acqua bolle a cento gradi ___", completamento: "CELSIUS", opzioniB: ["MANTELLO","FARFALLA","CRAVATTA","SOFFITTO"] },
  { testo: "La luce si propaga in linea ___", completamento: "RETTA", opzioniB: ["CIPOLLA","VIOLINO","MATTONE","FIOCCO"] },
  { testo: "Il cuore pompa il sangue nelle ___", completamento: "ARTERIE", opzioniB: ["FUNGO","ANCORA","BICICLETTA","LAMPONE"] },
  { testo: "La forza si misura in ___", completamento: "NEWTON", opzioniB: ["MARMELLATA","CORTECCIA","TRAMONTO","NINFEA"] },
  { testo: "Il telescopio amplifica immagini ___", completamento: "LONTANE", opzioniB: ["PETROLIO","FISCHIO","BANDIERA","GELATO"] },
  { testo: "La fotosintesi produce ossigeno e ___", completamento: "GLUCOSIO", opzioniB: ["PERGOLA","PARACARRO","ALMANACCO","TRIVELLA"] },
  { testo: "L'atomo è composto da protoni, neutroni ed ___", completamento: "ELETTRONI", opzioniB: ["MANDIBOLA","RAGNATELA","CACIOTTA","FIOCINA"] },
  { testo: "La velocità della luce è circa trecentomila chilometri al ___", completamento: "SECONDO", opzioniB: ["BATTELLO","PIANURA","TORCHIO","LUMACA"] },
  { testo: "L'energia si misura in ___", completamento: "JOULE", opzioniB: ["CESPUGLIO","TRAMONTO","PATTINO","SMALTO"] },
];

function getFrasi(sentenceType: SentenceType): Frase[] {
  if (sentenceType === "frasi_narrative") return FRASI_NARRATIVE;
  if (sentenceType === "frasi_tecnico_scientifiche") return FRASI_TECNICO;
  return FRASI_QUOTIDIANE;
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

type Fase = "intro" | "risposta_A" | "risposta_B" | "feedback";
type Step = "A" | "B";

interface Props {
  sentenceType: SentenceType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function Hayling({ sentenceType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const parte = getParte(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const frasi = useRef(shuffle(getFrasi(sentenceType)).slice(0, 8));

  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<Step>(parte === "B" ? "B" : "A");
  const [fase, setFase] = useState<Fase>("intro");
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [opzioniB, setOpzioniB] = useState<string[]>([]);

  const avanzaTrial = useCallback((i: number, s: Step) => {
    const currentFrasi = frasi.current;
    if (i >= currentFrasi.length) {
      if (!completato.current) {
        completato.current = true;
        const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
        onComplete(score, score);
      }
      return;
    }
    const frase = currentFrasi[i];
    setIdx(i);
    setStep(s);
    setLastOk(null);
    if (s === "B") {
      const opts = shuffle([...frase.opzioniB, frase.completamento]).slice(0, 4);
      if (!opts.includes(frase.opzioniB[0])) opts[0] = frase.opzioniB[0];
      setOpzioniB(shuffle(opts));
    }
    setFase(s === "A" ? "risposta_A" : "risposta_B");
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
  }, [corretti, totale, onComplete]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleRispostaA(scelta: string) {
    if (fase !== "risposta_A") return;
    const frase = frasi.current[idx];
    const ok = scelta === frase.completamento;
    const nuoviCorretti = corretti + (ok ? 1 : 0);
    const nuoviTotale = totale + 1;
    setCorretti(nuoviCorretti);
    setTotale(nuoviTotale);
    setLastOk(ok);
    setFase("feedback");
    setTimeout(() => {
      if (parte === "AB") {
        avanzaTrial(idx, "B");
      } else {
        avanzaTrial(idx + 1, "A");
      }
    }, 800);
  }

  function handleRispostaB(scelta: string) {
    if (fase !== "risposta_B") return;
    const frase = frasi.current[idx];
    // In parte B, la risposta corretta è qualsiasi opzione NON correlata (non il completamento naturale)
    const ok = scelta !== frase.completamento;
    const nuoviCorretti = corretti + (ok ? 1 : 0);
    const nuoviTotale = totale + 1;
    setCorretti(nuoviCorretti);
    setTotale(nuoviTotale);
    setLastOk(ok);
    setFase("feedback");
    setTimeout(() => avanzaTrial(idx + 1, parte === "B" ? "B" : "A"), 800);
  }

  const frase = frasi.current[idx];

  function getOpzioniA(): string[] {
    const opts = new Set<string>([frase.completamento, ...frase.opzioniB.slice(0, 3)]);
    return shuffle(Array.from(opts)).slice(0, 4);
  }

  if (fase === "intro") {
    const parteLabel = parte === "A" ? "Completa naturalmente" : parte === "B" ? "Scegli parola NON correlata" : "Prima naturale, poi non correlata";
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">💬</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Hayling</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>{parteLabel}: completa la frase con la parola mancante.</p>
        {parte !== "A" && (
          <div className="rounded-xl px-4 py-2" style={{ backgroundColor: COLORS.warningLight }}>
            <p className="text-sm font-bold" style={{ color: COLORS.warning }}>Parte B: scegli una parola che NON c&apos;entra con la frase!</p>
          </div>
        )}
        <button onClick={() => avanzaTrial(0, parte === "B" ? "B" : "A")}
          className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 py-4 px-3">
      <p className="text-sm font-medium text-center" style={{ color: COLORS.inkMuted }}>
        {idx + 1} / {frasi.current.length} — Corretti: {corretti}/{totale}
      </p>

      {step === "B" && (
        <div className="rounded-xl px-3 py-2 text-center" style={{ backgroundColor: COLORS.warningLight }}>
          <p className="text-sm font-bold" style={{ color: COLORS.warning }}>Parte B: scegli una parola NON correlata!</p>
        </div>
      )}

      <div className="rounded-2xl p-5 text-center" style={{
        backgroundColor: fase === "feedback" ? (lastOk ? COLORS.successLight : "#FEE2E2") : COLORS.primaryLight,
        border: `2px solid ${fase === "feedback" ? (lastOk ? COLORS.success : "#EF4444") : COLORS.primary}`,
      }}>
        <p className="text-2xl font-bold" style={{ color: COLORS.ink }}>
          {frase.testo.replace("___", step === "A" ? "___" : "_ _ _")}
        </p>
      </div>

      {fase === "feedback" && <div className="text-3xl text-center">{lastOk ? "✓" : "✗"}</div>}

      <div className="grid grid-cols-2 gap-3">
        {(step === "A" ? getOpzioniA() : opzioniB).map((opt, i) => (
          <button key={i}
            onClick={() => step === "A" ? handleRispostaA(opt) : handleRispostaB(opt)}
            disabled={fase === "feedback"}
            className="rounded-2xl font-bold active:scale-95 transition-transform"
            style={{
              height: 58, fontSize: 15,
              backgroundColor: COLORS.surfaceAlt,
              border: `2px solid ${COLORS.border}`,
              color: COLORS.ink,
              opacity: fase === "feedback" ? 0.7 : 1,
            }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
