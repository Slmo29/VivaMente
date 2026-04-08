"use client";

import { useRouter } from "next/navigation";
import Btn from "@/components/ui/btn";
import { COLORS } from "@/lib/design-tokens";
import StepLines from "@/components/ui/step-lines";

// SVG wave path: 4 complete periods across W=700px
function makePath(amplitude: number): string {
  const cy = 32;
  const period = 175;
  const k = 32;
  let d = `M 0,${cy}`;
  for (let i = 0; i < 4; i++) {
    const x = i * period;
    const xm = x + period / 2;
    const xe = x + period;
    d += ` C ${x + k},${cy - amplitude} ${xm - k},${cy - amplitude} ${xm},${cy}`;
    d += ` C ${xm + k},${cy + amplitude} ${xe - k},${cy + amplitude} ${xe},${cy}`;
  }
  return d;
}

function BrainWaveAnimation() {
  return (
    <div style={{ width: "70%", height: 64, overflow: "hidden", margin: "0 auto" }}>
      <style>{`
        @keyframes bw-a { 0% { transform: translateX(0px);   } 100% { transform: translateX(-350px); } }
        @keyframes bw-b { 0% { transform: translateX(-44px); } 100% { transform: translateX(-394px); } }
        @keyframes bw-c { 0% { transform: translateX(-88px); } 100% { transform: translateX(-438px); } }
      `}</style>
      <svg width={700} height={64} viewBox="0 0 700 64" style={{ display: "block" }}>
        {/* Onda superiore */}
        <path
          d={makePath(9)}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={1.8}
          opacity={0.5}
          style={{ animation: "bw-b 4.4s linear infinite" }}
        />
        {/* Onda centrale */}
        <path
          d={makePath(16)}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={2.2}
          opacity={1}
          style={{ animation: "bw-a 3.6s linear infinite" }}
        />
        {/* Onda inferiore */}
        <path
          d={makePath(9)}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={1.8}
          opacity={0.5}
          style={{ animation: "bw-c 3s linear infinite" }}
        />
      </svg>
    </div>
  );
}

export default function OnboardingIstruzioniPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col px-6 pt-6 pb-28 max-w-lg mx-auto"
      style={{ backgroundColor: COLORS.background }}
    >
      <StepLines current={1} total={5} />

      {/* Contenuto */}
      <div className="flex flex-col items-center gap-6 text-center">
        <BrainWaveAnimation />

        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E", lineHeight: 1.3 }}>
          Come funziona
        </h1>

        <p style={{ fontSize: 18, color: "#5A5A72", lineHeight: 1.7, marginTop: -8 }}>
          Ti mostreremo 4 parole da memorizzare.{"\n"}
          Hai 20 secondi per impararle bene.
          {"\n\n"}
          Poi dovrai riordinarle nell'ordine{"\n"}
          in cui le hai viste.
        </p>
      </div>

      {/* Bottone fisso */}
      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-lg mx-auto">
        <Btn size="lg" onClick={() => router.push("/onboarding/demo")}>
          Inizia
        </Btn>
      </div>
    </div>
  );
}
