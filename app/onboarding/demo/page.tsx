"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Btn from "@/components/ui/btn";
import { COLORS } from "@/lib/design-tokens";
import { Check, Xmark } from "iconoir-react";
import StepLines from "@/components/ui/step-lines";

const PAROLE = ["CASA", "LUNA", "PANE", "FIORE"];
const TEMPO = 20;
type Fase = "mostra" | "rispondi";

export default function OnboardingDemoPage() {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("mostra");
  const [countdown, setCountdown] = useState(TEMPO);
  const [mischiate, setMischiate] = useState<string[]>([]);
  const [selezionate, setSelezionate] = useState<string[]>([]);

  const tutteSelezionate = selezionate.length === PAROLE.length;
  const corrette = tutteSelezionate ? selezionate.filter((p, i) => p === PAROLE[i]).length : 0;

  function sottotitoloRisultato() {
    if (corrette === PAROLE.length) return "Ottimo lavoro!";
    if (corrette > 0) return "Ci siamo quasi!";
    return "Continua ad allenarti!";
  }

  useEffect(() => {
    if (fase !== "mostra") return;
    if (countdown === 0) {
      avanzaARispondi();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [fase, countdown]);

  function avanzaARispondi() {
    setMischiate([...PAROLE].sort(() => Math.random() - 0.5));
    setFase("rispondi");
  }

  function seleziona(parola: string) {
    if (tutteSelezionate) return;
    if (selezionate.includes(parola)) {
      setSelezionate((s) => s.filter((p) => p !== parola));
    } else if (selezionate.length < PAROLE.length) {
      setSelezionate((s) => [...s, parola]);
    }
  }

  const pct = (countdown / TEMPO) * 100;

  return (
    <div className="min-h-screen flex flex-col px-5 pt-6 pb-10 max-w-lg mx-auto" style={{ backgroundColor: COLORS.background }}>
      <StepLines current={2} />

      {/* ── Fase: MOSTRA ────────────────────────────────────────────── */}
      {fase === "mostra" && (
        <div className="flex-1 flex flex-col gap-6 pb-28">
          <div className="text-center">
            <h2 className="font-extrabold text-ink" style={{ fontSize: 22 }}>Memorizza queste parole!</h2>
            <p className="text-ink-muted mt-1" style={{ fontSize: 18 }}>
              Hai {countdown} secondi
            </p>
          </div>

          {/* Barra timer */}
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.border }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: COLORS.primary }} />
          </div>

          {/* Lista verticale parole */}
          <div className="flex flex-col gap-3 w-full">
            {PAROLE.map((parola) => (
              <div
                key={parola}
                className="rounded-lg px-5 py-4 flex items-center justify-center shadow-card"
                style={{ backgroundColor: COLORS.surface }}
              >
                <p className="font-extrabold" style={{ fontSize: 22, color: COLORS.primary }}>
                  {parola}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottone fisso "Sono pronto" */}
      {fase === "mostra" && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-lg mx-auto">
          <Btn size="lg" onClick={avanzaARispondi}>
            Sono pronto
          </Btn>
        </div>
      )}

      {/* ── Fase: RISPONDI (+ risultati inline) ─────────────────────── */}
      {fase === "rispondi" && (
        <div className="flex-1 flex flex-col gap-5 pb-28">
          <div className="text-center">
            <h2 className="font-extrabold text-ink" style={{ fontSize: 22 }}>Riesci a ricordarle?</h2>
            <p className="mt-1" style={{
              fontSize: 18,
              color: tutteSelezionate ? COLORS.primary : COLORS.inkMuted,
              fontWeight: tutteSelezionate ? 700 : 400,
            }}>
              {tutteSelezionate ? sottotitoloRisultato() : "Tocca le parole nell'ordine in cui le hai viste"}
            </p>
          </div>

          {/* Slot risposta */}
          <div className="grid grid-cols-4 gap-2">
            {PAROLE.map((parolaCorretta, i) => {
              const corretto = tutteSelezionate && selezionate[i] === parolaCorretta;
              const sbagliato = tutteSelezionate && selezionate[i] !== parolaCorretta;
              return (
                <div
                  key={i}
                  className="h-14 rounded-md flex items-center justify-center font-bold transition-all"
                  style={{
                    fontSize: 16,
                    backgroundColor: corretto
                      ? COLORS.primary
                      : sbagliato
                      ? "#D1D5DB"
                      : selezionate[i]
                      ? COLORS.primary
                      : COLORS.surface,
                    color: corretto
                      ? "#FFFFFF"
                      : sbagliato
                      ? "#1A1A2E"
                      : selezionate[i]
                      ? "#FFFFFF"
                      : COLORS.inkMuted,
                    border: `2px solid ${corretto || (selezionate[i] && !sbagliato) ? COLORS.primary : sbagliato ? "#D1D5DB" : COLORS.border}`,
                  }}
                >
                  {tutteSelezionate ? parolaCorretta : (selezionate[i] ?? (i + 1))}
                </div>
              );
            })}
          </div>

          {/* Lista verticale parole */}
          <div className="flex flex-col gap-3 w-full">
            {mischiate.map((parola) => {
              const posCorretta = PAROLE.indexOf(parola);
              const corretto = tutteSelezionate && selezionate[posCorretta] === parola;
              const _sbagliato = tutteSelezionate && selezionate[posCorretta] !== parola; void _sbagliato;
              const usata = selezionate.includes(parola);

              if (tutteSelezionate) {
                return (
                  <div
                    key={parola}
                    className="w-full rounded-lg relative flex items-center justify-center"
                    style={{
                      minHeight: 64,
                      backgroundColor: corretto ? "#E8F6FA" : "#FFFFFF",
                      border: "2px solid #E2E8F0",
                    }}
                  >
                    <p className="font-extrabold" style={{ fontSize: 22, color: corretto ? COLORS.primary : "#5A5A72" }}>
                      {parola}
                    </p>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                      {corretto
                        ? <Check width={28} height={28} strokeWidth={2} color={COLORS.primary} />
                        : <Xmark width={28} height={28} strokeWidth={2} color="#E06C2A" />
                      }
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={parola}
                  onClick={() => seleziona(parola)}
                  disabled={usata}
                  className="w-full rounded-lg flex items-center justify-center transition-all active:scale-[0.98]"
                  style={{
                    minHeight: 64,
                    backgroundColor: usata ? COLORS.border : COLORS.surface,
                    boxShadow: usata ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
                    border: `2px solid ${usata ? COLORS.border : COLORS.border}`,
                  }}
                >
                  <p className="font-extrabold" style={{ fontSize: 22, color: usata ? COLORS.inkMuted : COLORS.inkPrimary }}>
                    {parola}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Messaggio risultato */}
          {tutteSelezionate && (
            <p className="text-center" style={{ fontSize: 16, color: "#5A5A72" }}>
              Ogni esercizio rafforza la tua memoria.<br />Continua così!
            </p>
          )}
        </div>
      )}

      {/* Link fisso "Ricomincia" — solo durante la selezione, non a risultati mostrati */}
      {fase === "rispondi" && selezionate.length > 0 && !tutteSelezionate && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-6 max-w-lg mx-auto">
          <button onClick={() => setSelezionate([])} className="text-center" style={{ fontSize: 18, color: COLORS.primary, fontWeight: 500 }}>
            Ricomincia
          </button>
        </div>
      )}

      {/* Bottone fisso "Continua" — solo a selezione completata */}
      {fase === "rispondi" && tutteSelezionate && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-lg mx-auto">
          <Btn size="lg" onClick={() => router.push("/onboarding/reward")}>Continua</Btn>
        </div>
      )}
    </div>
  );
}
