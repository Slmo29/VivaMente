"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Btn from "@/components/ui/btn";
import { useUserStore } from "@/lib/store";
import { COLORS } from "@/lib/design-tokens";
import { LightBulb } from "iconoir-react";
import StepLines from "@/components/ui/step-lines";

export default function OnboardingRewardPage() {
  const router = useRouter();
  const aggiungiMedaglia = useUserStore((s) => s.aggiungiMedaglia);
  const [animato, setAnimato] = useState(false);

  useEffect(() => {
    aggiungiMedaglia("prima-sfida");
    const t = setTimeout(() => setAnimato(true), 200);
    return () => clearTimeout(t);
  }, [aggiungiMedaglia]);

  return (
    <div className="h-screen flex flex-col px-6 pt-4 pb-6 max-w-lg mx-auto"
      style={{ background: "linear-gradient(180deg, #B2D8D8 0%, #F4F7F8 100%)" }}>
      <StepLines current={3} />

      {/* Medaglia + testo */}
      <div className={`flex flex-col items-center text-center -mt-5 transition-all duration-700 ${animato ? "opacity-100" : "opacity-0"}`}>
        <div style={{ animation: animato ? "pulse 2s ease-in-out infinite" : "none" }}>
          <svg width="160" height="158" viewBox="0 0 160 158" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="medalBody" cx="38%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#FFE55C"/>
                <stop offset="55%" stopColor="#F5C518"/>
                <stop offset="100%" stopColor="#C8960C"/>
              </radialGradient>
            </defs>
            <polygon points="61,115 80,115 74,154 55,154" fill="#0A5C5F"/>
            <polygon points="72,115 80,115 74,154 66,154" fill="#1891B1" opacity="0.55"/>
            <polygon points="80,115 99,115 105,154 86,154" fill="#0A5C5F"/>
            <polygon points="80,115 88,115 94,154 86,154" fill="#1891B1" opacity="0.55"/>
            <circle cx="80" cy="84" r="44" fill="#A07010"/>
            <circle cx="80" cy="84" r="41" fill="#C8960C"/>
            <circle cx="80" cy="84" r="37" fill="url(#medalBody)"/>
            <circle cx="80" cy="84" r="30" fill="none" stroke="#E8A020" strokeWidth="1.5" opacity="0.5"/>
            <polygon points="80,63 85.29,76.72 100,77.5 88.56,86.78 92.34,101 80,93 67.66,101 71.44,86.78 60,77.5 74.71,76.72" fill="#FFF0A0"/>
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mt-1">Hai guadagnato la medaglia</p>
        <h1 className="text-xl font-extrabold text-ink mt-0.5">"Prima Sfida"</h1>
        <p className="text-sm text-ink-secondary mt-0.5">La tua memoria è più forte di quanto pensi!</p>
      </div>

      {/* Card Lo sapevi */}
      <div
        className={`rounded-lg p-4 w-full mt-3 transition-all duration-700 delay-300 ${animato ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundColor: COLORS.surfaceAlt, border: `1px solid ${COLORS.primary}22` }}
      >
        <p className="text-xs font-bold text-ink">Lo sapevi?</p>
        <p className="text-xs text-ink-secondary mt-1">10 minuti al giorno migliorano memoria e concentrazione a qualsiasi età.</p>
      </div>

      {/* Benefit grid */}
      <div className={`w-full mt-3 transition-all duration-700 delay-500 ${animato ? "opacity-100" : "opacity-0"}`}>
        <p className="text-sm font-bold text-ink mb-2">Con il tuo account ottieni:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Sblocca tutti gli esercizi",
            "Traccia i tuoi progressi",
            "Accumula medaglie e livelli",
            "Promemoria personalizzati",
          ].map((label) => (
            <div key={label} className="rounded-lg p-3 flex flex-col gap-2" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.primary}22` }}>
              <div className="w-7 h-7 rounded-full" style={{ backgroundColor: COLORS.primary }} />
              <p className="text-xs font-semibold text-ink leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col mt-auto pt-4">
        <Btn size="lg" className="text-base leading-tight" onClick={() => router.push("/onboarding/registrati")}>
          Registrati e salva<br />i miei progressi
        </Btn>
        <button onClick={() => router.push("/home")} className="text-sm text-center mt-2" style={{ color: COLORS.primary, fontWeight: 500 }}>
          Continua senza registrarti
        </button>
      </div>
    </div>
  );
}
