"use client";

import { useState, useEffect, useCallback } from "react";
import Btn from "@/components/ui/btn";

const COLORI = [
  { nome: "ROSSO", hex: "#EF4444" },
  { nome: "BLU", hex: "#3B82F6" },
  { nome: "VERDE", hex: "#22C55E" },
  { nome: "GIALLO", hex: "#EAB308" },
];

interface Domanda {
  parola: string;
  coloreParola: string;   // colore inchiostro (risposta corretta)
  coloreParolaHex: string;
  coloreTestoHex: string; // colore con cui è scritto (può essere diverso)
}

function generaDomande(n: number): Domanda[] {
  return Array.from({ length: n }, () => {
    const inchiostro = COLORI[Math.floor(Math.random() * COLORI.length)];
    // La parola scritta è diversa dal colore dell'inchiostro (effetto Stroop)
    const altriColori = COLORI.filter((c) => c.nome !== inchiostro.nome);
    const parolaColore = altriColori[Math.floor(Math.random() * altriColori.length)];
    return {
      parola: parolaColore.nome,
      coloreParola: inchiostro.nome,
      coloreParolaHex: inchiostro.hex,
      coloreTestoHex: inchiostro.hex,
    };
  });
}

interface Props {
  config: { domande: number; tempo_per_domanda: number };
  onComplete: (score: number) => void;
}

type Fase = "pronto" | "gioco" | "transizione";

export default function StroopTest({ config, onComplete }: Props) {
  const { domande: numDomande, tempo_per_domanda } = config;
  const [fase, setFase] = useState<Fase>("pronto");
  const [domande, setDomande] = useState<Domanda[]>([]);
  const [indice, setIndice] = useState(0);
  const [corrette, setCorrette] = useState(0);
  const [tempoRimasto, setTempoRimasto] = useState(tempo_per_domanda);
  const [feedback, setFeedback] = useState<"corretta" | "sbagliata" | null>(null);

  const prossimaDomanda = useCallback(
    (isCorretta: boolean) => {
      if (isCorretta) setCorrette((c) => c + 1);
      setFeedback(isCorretta ? "corretta" : "sbagliata");
      setTimeout(() => {
        setFeedback(null);
        if (indice + 1 >= domande.length) {
          const score = Math.round(((corrette + (isCorretta ? 1 : 0)) / domande.length) * 100);
          onComplete(score);
        } else {
          setIndice((i) => i + 1);
          setTempoRimasto(tempo_per_domanda);
        }
      }, 600);
    },
    [indice, corrette, domande.length, tempo_per_domanda, onComplete]
  );

  // Timer per domanda
  useEffect(() => {
    if (fase !== "gioco" || feedback !== null) return;
    if (tempoRimasto === 0) {
      prossimaDomanda(false);
      return;
    }
    const t = setTimeout(() => setTempoRimasto((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [fase, tempoRimasto, feedback, prossimaDomanda]);

  function avvia() {
    setDomande(generaDomande(numDomande));
    setIndice(0);
    setCorrette(0);
    setTempoRimasto(tempo_per_domanda);
    setFase("gioco");
  }

  if (fase === "pronto") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <span className="text-6xl">🎯</span>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Test Stroop</h2>
          <p className="text-gray-500 text-lg mt-2 leading-relaxed">
            Vedrai una parola colorata. Il trucco? La parola dice un colore,
            ma l'inchiostro è un altro colore.
          </p>
          <div className="mt-4 bg-blue-50 rounded-2xl p-4 text-left">
            <p className="font-semibold text-gray-800 mb-2">Esempio:</p>
            <p className="text-4xl font-bold" style={{ color: "#3B82F6" }}>
              ROSSO
            </p>
            <p className="text-gray-500 mt-2 text-base">
              La parola dice "ROSSO" ma è scritta in blu — tocca BLU!
            </p>
          </div>
        </div>
        <Btn size="lg" onClick={avvia}>
          Inizia! ▶
        </Btn>
      </div>
    );
  }

  const domanda = domande[indice];
  const pct = (tempoRimasto / tempo_per_domanda) * 100;
  const timerColore = pct > 50 ? "bg-primary" : pct > 25 ? "bg-warm" : "bg-red-400";

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Progresso */}
      <div className="flex items-center justify-between text-base text-gray-500">
        <span>
          Domanda {indice + 1} di {domande.length}
        </span>
        <span className="font-semibold text-success">✓ {corrette} corrette</span>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${timerColore} rounded-full transition-all duration-1000`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-bold text-lg w-5 text-gray-700">{tempoRimasto}</span>
      </div>

      {/* Parola */}
      <div
        className={`rounded-3xl p-8 text-center shadow-card transition-all ${
          feedback === "corretta"
            ? "bg-green-50 scale-95"
            : feedback === "sbagliata"
            ? "bg-red-50 scale-95"
            : "bg-white"
        }`}
      >
        {feedback ? (
          <div className="text-6xl">{feedback === "corretta" ? "✅" : "❌"}</div>
        ) : (
          <>
            <p className="text-gray-400 text-base mb-2">Di che colore è scritto?</p>
            <p
              className="text-5xl font-black"
              style={{ color: domanda.coloreTestoHex }}
            >
              {domanda.parola}
            </p>
          </>
        )}
      </div>

      {/* Bottoni colore */}
      <div className="grid grid-cols-2 gap-3">
        {COLORI.map((colore) => (
          <button
            key={colore.nome}
            onClick={() => prossimaDomanda(colore.nome === domanda.coloreParola)}
            disabled={feedback !== null}
            className="min-h-[64px] rounded-2xl text-white text-xl font-bold active:scale-95 transition-transform disabled:opacity-50 shadow-md"
            style={{ backgroundColor: colore.hex }}
          >
            {colore.nome}
          </button>
        ))}
      </div>
    </div>
  );
}
