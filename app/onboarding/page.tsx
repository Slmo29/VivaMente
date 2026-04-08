"use client";

import Link from "next/link";
import Btn from "@/components/ui/btn";
import { COLORS } from "@/lib/design-tokens";
import { Brain, Timer, StatsReport, Medal } from "iconoir-react";
import StepLines from "@/components/ui/step-lines";

const PUNTI = [
  {
    icona: <Brain width={20} height={20} strokeWidth={1.5} color={COLORS.primary} />,
    titolo: "Progettato con esperti di neuropsicologia",
  },
  {
    icona: <Timer width={20} height={20} strokeWidth={1.5} color={COLORS.primary} />,
    titolo: "Solo 5 minuti al giorno, ogni giorno",
  },
  {
    icona: <StatsReport width={20} height={20} strokeWidth={1.5} color={COLORS.primary} />,
    titolo: "Tieni traccia dei tuoi progressi nel tempo",
  },
  {
    icona: <Medal width={20} height={20} strokeWidth={1.5} color={COLORS.primary} />,
    titolo: "Sblocca medaglie e premi ogni giorno",
  },
];

export default function OnboardingPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 pt-6 pb-28 max-w-lg mx-auto"
      style={{ background: `linear-gradient(160deg, ${COLORS.primaryLight}88 0%, ${COLORS.surface} 55%)` }}
    >
      <StepLines current={0} />

      {/* Hero */}
      <div className="flex flex-col items-center w-full">
        <Brain width={80} height={80} strokeWidth={1.5} color={COLORS.primary} />

        <div className="text-center mt-6">
          <h1 className="text-2xl font-extrabold text-ink">BrainTrainer</h1>
          <p className="text-base text-ink-secondary mt-2 leading-relaxed">
            Allena la mente ogni giorno con esercizi semplici e divertenti
          </p>
        </div>

        {/* Lista verticale punti */}
        <div
          className="rounded-lg w-full flex flex-col border mt-6"
          style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 18, paddingRight: 18, backgroundColor: COLORS.surface, borderColor: `${COLORS.primary}22` }}
        >
          {PUNTI.map((p, i) => (
            <div key={p.titolo}>
              <div className="flex items-start gap-3" style={{ paddingTop: 18, paddingBottom: 18 }}>
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${COLORS.primaryLight}88` }}
                >
                  {p.icona}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">{p.titolo}</p>
                </div>
              </div>
              {i < PUNTI.length - 1 && (
                <div style={{ height: 1, backgroundColor: "#E5E7EB" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-lg mx-auto flex flex-col gap-3">
        <Link href="/onboarding/istruzioni" className="w-full">
          <Btn size="lg">Prova subito</Btn>
        </Link>
        <p className="text-center text-sm text-ink-secondary">
          Hai già un profilo?{" "}
          <Link href="/onboarding/accedi" style={{ color: COLORS.primary, fontWeight: 500 }}>
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
