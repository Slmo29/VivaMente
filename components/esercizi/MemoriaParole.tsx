"use client";

import { useState, useEffect } from "react";
import Btn from "@/components/ui/btn";

interface Props {
  config: {
    parole: string[];
    tempo_visualizzazione: number;
    tempo_risposta: number;
  };
  onComplete: (score: number) => void;
}

type Fase = "pronto" | "mostra" | "rispondi" | "fine";

export default function MemoriaParole({ config, onComplete }: Props) {
  const { parole, tempo_visualizzazione, tempo_risposta } = config;
  const [fase, setFase] = useState<Fase>("pronto");
  const [countdown, setCountdown] = useState(tempo_visualizzazione);
  const [tempoRisposta, setTempoRisposta] = useState(tempo_risposta);
  const [paroleMischiate, setParoleMischiate] = useState<string[]>([]);
  const [selezionate, setSelezionate] = useState<string[]>([]);

  // Timer visualizzazione
  useEffect(() => {
    if (fase !== "mostra") return;
    if (countdown === 0) {
      setParoleMischiate([...parole].sort(() => Math.random() - 0.5));
      setFase("rispondi");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [fase, countdown, parole]);

  // Timer risposta
  useEffect(() => {
    if (fase !== "rispondi") return;
    if (tempoRisposta === 0 || selezionate.length === parole.length) {
      if (selezionate.length < parole.length) {
        // Tempo scaduto — riempi con parole rimanenti
        const mancanti = paroleMischiate.filter((p) => !selezionate.includes(p));
        const tutte = [...selezionate, ...mancanti];
        const score = Math.round(
          (tutte.filter((p, i) => p === parole[i]).length / parole.length) * 100
        );
        onComplete(score);
      }
      return;
    }
    const t = setTimeout(() => setTempoRisposta((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [fase, tempoRisposta, selezionate, parole, paroleMischiate, onComplete]);

  // Auto-submit quando tutte le parole sono selezionate
  useEffect(() => {
    if (fase === "rispondi" && selezionate.length === parole.length) {
      const score = Math.round(
        (selezionate.filter((p, i) => p === parole[i]).length / parole.length) * 100
      );
      setTimeout(() => onComplete(score), 500);
    }
  }, [selezionate, parole, fase, onComplete]);

  function selezionaParola(parola: string) {
    if (selezionate.includes(parola)) {
      setSelezionate((s) => s.filter((p) => p !== parola));
    } else {
      setSelezionate((s) => [...s, parola]);
    }
  }

  if (fase === "pronto") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <span className="text-6xl">🧠</span>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Come funziona</h2>
          <div className="mt-4 flex flex-col gap-3 text-left">
            {[
              `Vedrai ${parole.length} parole per ${tempo_visualizzazione} secondi`,
              "Poi le parole scompaiono",
              "Devi ricordare l'ordine esatto",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-base flex items-center justify-center flex-shrink-0 font-bold">
                  {i + 1}
                </span>
                <p className="text-lg text-gray-700">{s}</p>
              </div>
            ))}
          </div>
        </div>
        <Btn
          size="lg"
          onClick={() => {
            setCountdown(tempo_visualizzazione);
            setFase("mostra");
          }}
        >
          Inizia! ▶
        </Btn>
      </div>
    );
  }

  if (fase === "mostra") {
    const pct = (countdown / tempo_visualizzazione) * 100;
    return (
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="text-center">
          <p className="text-lg text-gray-500">Memorizza queste parole!</p>
          <div className="flex items-center gap-2 justify-center mt-2">
            <div className="w-48 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-primary font-bold text-lg w-6">{countdown}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {parole.map((parola, i) => (
            <div
              key={parola}
              className="bg-white rounded-2xl p-5 text-center shadow-card border-2 border-primary/10"
            >
              <span className="text-sm text-gray-400 block mb-1">#{i + 1}</span>
              <span className="text-2xl font-bold text-primary">{parola}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (fase === "rispondi") {
    const pct = (tempoRisposta / tempo_risposta) * 100;
    return (
      <div className="flex flex-col gap-5 py-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Riesci a ricordarle?</h2>
          <p className="text-gray-500 mt-1">Tocca le parole nell'ordine in cui le hai viste</p>
          <div className="flex items-center gap-2 justify-center mt-3">
            <div className="w-48 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-warm rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-warm font-bold text-lg w-6">{tempoRisposta}</span>
          </div>
        </div>

        {/* Slots risposta */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: parole.length }).map((_, i) => (
            <div
              key={i}
              className={`h-14 rounded-xl flex items-center justify-center text-base font-bold transition-all ${
                selezionate[i]
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-300"
              }`}
            >
              {selezionate[i] ?? (i + 1)}
            </div>
          ))}
        </div>

        {/* Parole disponibili */}
        <div className="grid grid-cols-2 gap-3">
          {paroleMischiate.map((parola) => {
            const usata = selezionate.includes(parola);
            return (
              <button
                key={parola}
                onClick={() => selezionaParola(parola)}
                className={`min-h-[56px] rounded-2xl text-xl font-bold transition-all active:scale-95 ${
                  usata
                    ? "bg-gray-100 text-gray-300"
                    : "bg-white text-gray-900 shadow-card border-2 border-gray-100 hover:border-primary/30"
                }`}
              >
                {parola}
              </button>
            );
          })}
        </div>

        {selezionate.length > 0 && (
          <button
            onClick={() => setSelezionate([])}
            className="text-gray-400 text-base underline text-center"
          >
            Ricomincia
          </button>
        )}
      </div>
    );
  }

  return null;
}
