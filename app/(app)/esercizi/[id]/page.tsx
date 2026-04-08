"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/card";
import Btn from "@/components/ui/btn";
import MemoriaParole from "@/components/esercizi/MemoriaParole";
import StroopTest from "@/components/esercizi/StroopTest";
import { mockEsercizi, mockCategorie } from "@/lib/mock-data";
import { CATEGORIA_COLORS, COLORS, DIFFICOLTA_STYLE } from "@/lib/design-tokens";

type Stato = "intro" | "esercizio" | "risultato";

export default function EsercizioPage() {
  const params = useParams();
  const router = useRouter();
  const [stato, setStato] = useState<Stato>("intro");
  const [score, setScore] = useState(0);

  const esercizio = mockEsercizi.find((e) => e.id === params.id);
  const categoria = mockCategorie.find((c) => c.id === esercizio?.categoria_id);
  const cc = categoria ? CATEGORIA_COLORS[categoria.id] : null;
  const ds = esercizio ? DIFFICOLTA_STYLE[esercizio.difficolta] : null;

  if (!esercizio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <span className="text-5xl">😕</span>
        <p className="text-base text-ink-muted text-center">Esercizio non trovato</p>
        <Link href="/esercizi"><Btn variant="outline">Torna agli esercizi</Btn></Link>
      </div>
    );
  }

  function handleComplete(punteggio: number) { setScore(punteggio); setStato("risultato"); }

  const scoreColor = score >= 80 ? COLORS.success : score >= 50 ? COLORS.streak : "#C62828";
  const scoreMsg = score === 100 ? "Perfetto!" : score >= 80 ? "Ottimo lavoro!" : score >= 60 ? "Bravo!" : "Continua ad allenarti!";
  const scoreEmoji = score === 100 ? "🎉" : score >= 80 ? "🌟" : score >= 60 ? "👍" : "💪";

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-4 bg-surface border-b border-border sticky top-0 z-10">
        <button
          onClick={() => stato === "esercizio" ? setStato("intro") : router.back()}
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl active:scale-95"
          style={{ backgroundColor: COLORS.surfaceAlt, color: COLORS.inkSecondary }}
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="text-base font-bold text-ink leading-tight">{esercizio.titolo}</h2>
          {categoria && (
            <p className="text-sm font-medium" style={{ color: cc?.text }}>
              {categoria.icona} {categoria.nome}
            </p>
          )}
        </div>
        {stato === "esercizio" && cc && (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: cc.bg }}>
            {categoria?.icona}
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto pb-6">
        {/* ── INTRO ──────────────────────────────────────────────────── */}
        {stato === "intro" && (
          <div className="flex flex-col gap-4">
            {/* Hero card */}
            <div className="rounded-lg p-8 text-center"
              style={{ background: cc ? `linear-gradient(135deg, ${cc.bg}, ${COLORS.surface})` : COLORS.surfaceAlt }}>
              <span className="text-6xl block mb-3">{categoria?.icona ?? "🧩"}</span>
              <h1 className="text-xl font-extrabold text-ink">{esercizio.titolo}</h1>
              <p className="text-sm text-ink-secondary mt-2 leading-relaxed">{esercizio.descrizione}</p>
            </div>

            {/* Dettagli */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icona: "⏱", label: "Durata", valore: `~${Math.ceil((esercizio.durata_stimata ?? 60) / 60)} min` },
                { icona: "📊", label: "Livello", valore: esercizio.difficolta },
                { icona: "🧩", label: "Categoria", valore: categoria?.nome ?? "—" },
              ].map((d) => (
                <Card key={d.label} padding="sm" className="text-center">
                  <span className="text-2xl block">{d.icona}</span>
                  <p className="text-sm font-bold text-ink mt-1">{d.valore}</p>
                  <p className="text-xs text-ink-muted">{d.label}</p>
                </Card>
              ))}
            </div>

            {/* Beneficio */}
            <Card padding="md" style={{ backgroundColor: COLORS.surfaceAlt }}>
              <div className="flex gap-3 items-start">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-sm font-bold text-ink mb-1">Perché fa bene</p>
                  <p className="text-sm text-ink-secondary leading-relaxed">{esercizio.beneficio}</p>
                </div>
              </div>
            </Card>

            <Btn size="lg" onClick={() => setStato("esercizio")}>Inizia l'esercizio →</Btn>
          </div>
        )}

        {/* ── ESERCIZIO ─────────────────────────────────────────────── */}
        {stato === "esercizio" && (
          <>
            {esercizio.tipo === "memoria_parole" && (
              <MemoriaParole config={esercizio.config as { parole: string[]; tempo_visualizzazione: number; tempo_risposta: number }} onComplete={handleComplete} />
            )}
            {esercizio.tipo === "stroop" && (
              <StroopTest config={esercizio.config as { domande: number; tempo_per_domanda: number }} onComplete={handleComplete} />
            )}
            {esercizio.tipo !== "memoria_parole" && esercizio.tipo !== "stroop" && (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <span className="text-5xl">🚧</span>
                <p className="text-base text-ink-muted">Questo esercizio è in arrivo!</p>
                <Btn variant="outline" onClick={() => router.back()}>Torna indietro</Btn>
              </div>
            )}
          </>
        )}

        {/* ── RISULTATO ─────────────────────────────────────────────── */}
        {stato === "risultato" && (
          <div className="flex flex-col gap-4 py-2">
            {/* Score */}
            <Card padding="lg" className="text-center">
              <p className="text-5xl mb-3">{scoreEmoji}</p>
              <h2 className="text-xl font-extrabold text-ink">{scoreMsg}</h2>
              <p className="text-3xl font-extrabold mt-3" style={{ color: scoreColor }}>{score}%</p>
              <p className="text-sm text-ink-muted mt-1">punteggio</p>

              {/* Barra */}
              <div className="h-3 rounded-full mt-4 overflow-hidden" style={{ backgroundColor: COLORS.border }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: scoreColor }} />
              </div>
            </Card>

            {/* Beneficio */}
            <Card padding="md" style={{ backgroundColor: COLORS.successLight, border: `1px solid ${COLORS.success}33` }}>
              <div className="flex gap-3">
                <span className="text-xl">🌱</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: COLORS.success }}>Hai allenato la tua mente!</p>
                  <p className="text-sm leading-relaxed mt-0.5" style={{ color: COLORS.success }}>{esercizio.beneficio}</p>
                </div>
              </div>
            </Card>

            {/* Medaglia nuova */}
            {score >= 60 && (
              <Card padding="md" className="text-center" style={{ backgroundColor: COLORS.goldLight, border: `1px solid ${COLORS.gold}44` }}>
                <span className="text-4xl block">🌟</span>
                <p className="text-base font-bold mt-2" style={{ color: COLORS.gold }}>Medaglia sbloccata!</p>
                <p className="text-sm text-ink-muted">"Prima Sfida" — primo esercizio completato</p>
              </Card>
            )}

            <div className="flex flex-col gap-3 mt-1">
              <Btn size="lg" onClick={() => setStato("intro")}>Riprova</Btn>
              <Link href="/esercizi"><Btn variant="outline">Altri esercizi</Btn></Link>
              <Link href="/home"><Btn variant="ghost">Torna alla Home</Btn></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
