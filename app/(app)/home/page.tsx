"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/card";
import Btn from "@/components/ui/btn";
import { useUserStore } from "@/lib/store";
import { mockEsercizioDelGiorno, mockEserciziDelGiornoList, mockCategorie, mockProgressiSettimanali, mockSessioniRecenti, mockMessaggiFamiliari } from "@/lib/mock-data";
import { CATEGORIA_COLORS, COLORS } from "@/lib/design-tokens";
import { AppIcon } from "@/lib/icons";
import { Timer, Running, Phone, Palette, Leaf, Lock, ChatLines, Check } from "iconoir-react";
import { PausaAttivaModal, CheckCircles } from "@/components/ui/pausa-attiva-modal";

const GIORNO_INDEX: Record<string, number> = { Lun: 1, Mar: 2, Mer: 3, Gio: 4, Ven: 5, Sab: 6, Dom: 7 };
const OFFSET_DA_LUNEDI: Record<string, number> = { Lun: 0, Mar: 1, Mer: 2, Gio: 3, Ven: 4, Sab: 5, Dom: 6 };
const LIMITE_ESERCIZI_GIORNO = 5;
const PAUSA_DURATA_S = 24 * 60 * 60; // 24h in secondi


const ATTIVITA_PAUSA = [
  { label: "Socialità",  desc: "Chiama un amico o scrivi un messaggio", icon: <Phone width={28} height={28} strokeWidth={1.5} color="#FFFFFF" /> },
  { label: "Movimento",  desc: "Fai una passeggiata di 10 minuti",       icon: <Running width={28} height={28} strokeWidth={1.5} color="#FFFFFF" /> },
  { label: "Creatività", desc: "Ascolta musica o disegna qualcosa",       icon: <Palette width={28} height={28} strokeWidth={1.5} color="#FFFFFF" /> },
  { label: "Riposo",     desc: "Respira profondamente e rilassati",       icon: <Leaf width={28} height={28} strokeWidth={1.5} color="#FFFFFF" /> },
];

function StreakCircles({ isGuest }: { isGuest?: boolean }) {
  const GIORNI = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const now = new Date();
  const jsDay = now.getDay();
  const oggi = GIORNI[jsDay];
  const oggiIndex = jsDay === 0 ? 7 : jsDay;
  const daysFromMonday = jsDay === 0 ? 6 : jsDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);

  return (
    <div className="flex justify-between mt-4">
      {mockProgressiSettimanali.map((g) => {
        const isOggi = g.giorno === oggi;
        const isFuturo = GIORNO_INDEX[g.giorno] > oggiIndex;
        const completato = g.esercizi > 0 && !isFuturo;
        const d = new Date(monday);
        d.setDate(monday.getDate() + OFFSET_DA_LUNEDI[g.giorno]);
        const dayNumber = d.getDate();

        const locked = isGuest && !completato;

        let circleBg = "transparent";
        let circleBorder = "2px solid #D1D5DB";
        let letterColor = "#9CA3AF";
        let labelColor = "#9CA3AF";

        if (completato) {
          circleBg = COLORS.primary;
          circleBorder = "none";
          labelColor = isOggi ? COLORS.primary : "#6B7280";
        } else if (isOggi && !locked) {
          circleBorder = `2px solid ${COLORS.primary}`;
          letterColor = COLORS.primary;
          labelColor = COLORS.primary;
        } else if (isFuturo && !locked) {
          circleBorder = "2px solid #E5E7EB";
          letterColor = "#D1D5DB";
          labelColor = "#D1D5DB";
        }

        return (
          <div key={g.giorno} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: circleBg, border: circleBorder }}>
              {completato ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              ) : locked ? (
                <Lock width={20} height={20} strokeWidth={1.5} color="#9CA3AF" />
              ) : (
                <span style={{ color: letterColor, fontSize: 14, fontWeight: 700 }}>{g.giorno[0]}</span>
              )}
            </div>
            <span style={{ fontSize: 12, color: labelColor, fontWeight: isOggi ? 700 : 500 }}>{g.giorno}</span>
            <span style={{ fontSize: 11, color: labelColor, fontWeight: 400 }}>{dayNumber}</span>
          </div>
        );
      })}
    </div>
  );
}


function PausaAttivaView({ secondiRimasti }: { secondiRimasti: number }) {
  const hh = String(Math.floor(secondiRimasti / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secondiRimasti % 3600) / 60)).padStart(2, "0");
  const ss = String(secondiRimasti % 60).padStart(2, "0");
  const timerLabel = secondiRimasti > 0 ? `Riprendi tra ${hh}:${mm}:${ss}` : "Pronto a riprendere!";

  return (
    <>
      {/* Pausa attiva card */}
      <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ backgroundColor: COLORS.primary }}>
        <span
          className="self-start text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.25)", color: "#FFFFFF" }}
        >
          Pausa attiva
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-white">Ottimo allenamento</h2>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.85)" }}>
            Hai completato 5 esercizi.<br />
            La mente ha bisogno di una pausa<br />
            per consolidare ciò che ha imparato.
          </p>
        </div>
        <div className="rounded-xl py-3 flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
          <span className="text-base font-bold text-white">{timerLabel}</span>
        </div>
      </div>

      {/* Cosa fare adesso */}
      <div>
        <h2 className="text-lg font-bold text-ink mb-3">Cosa fare adesso?</h2>
        <div className="grid grid-cols-2 gap-3">
          {ATTIVITA_PAUSA.map(({ label, desc, icon }) => (
            <div
              key={label}
              className="rounded-xl p-4 flex flex-col items-center text-center gap-3"
              style={{ backgroundColor: "#FFFFFF", border: `1px solid ${COLORS.primary}18` }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.inkSecondary }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}


export default function HomePage() {
  const router = useRouter();
  const { nome, isGuest, eserciziFattiOggi, pausaAttivaRichiesta, setPausaAttivaRichiesta, pausaAttivaInizio, setPausaAttivaInizio } = useUserStore();
  const [mostraPausa, setMostraPausa] = useState(false);
  const [secondiRimasti, setSecondiRimasti] = useState(0);

  const pausaAttiva = pausaAttivaInizio !== null && secondiRimasti > 0;

  // Attiva la pausa impostando il timestamp nello store
  useEffect(() => {
    if (pausaAttivaRichiesta) {
      setPausaAttivaInizio(Date.now());
      setPausaAttivaRichiesta(false);
    }
  }, [pausaAttivaRichiesta, setPausaAttivaRichiesta, setPausaAttivaInizio]);

  // Countdown calcolato dal timestamp persistente
  useEffect(() => {
    if (pausaAttivaInizio === null) { setSecondiRimasti(0); return; }
    const calcola = () => {
      const rimasti = PAUSA_DURATA_S - Math.floor((Date.now() - pausaAttivaInizio) / 1000);
      if (rimasti <= 0) { setPausaAttivaInizio(null); setSecondiRimasti(0); } else { setSecondiRimasti(rimasti); }
    };
    calcola();
    const t = setInterval(calcola, 1000);
    return () => clearInterval(t);
  }, [pausaAttivaInizio, setPausaAttivaInizio]);

  const jsDay = new Date().getDay();
  const oggiIndex = jsDay === 0 ? 7 : jsDay;

  const completatiOggi = mockEserciziDelGiornoList.filter((e) => e.completato).length;
  const totaleEsercizi = mockEserciziDelGiornoList.length;

  function formatTempo(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <>
      <div className="flex flex-col gap-8 px-4 pt-12">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{isGuest ? "Ciao Ospite," : `Ciao${nome ? ` ${nome}` : ""},`}</h1>
          </div>
          {/* Campanella notifiche */}
          <div className="relative mt-1">
            <Link href="/messaggi">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}>
                <ChatLines width={22} height={22} strokeWidth={1.5} color={COLORS.primary} />
              </div>
            </Link>
            {!isGuest && mockMessaggiFamiliari.some((m) => !m.letto) && (
              <span className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white pointer-events-none" style={{ backgroundColor: "#DC2626" }} />
            )}
          </div>
        </div>

        {/* Streak */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg font-bold" style={{ color: COLORS.primary }}>Attività</span>
            {isGuest ? (
              <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#9CA3AF" }}>
                <Lock width={15} height={15} strokeWidth={1.5} color="#9CA3AF" />
                Vedi storico
              </span>
            ) : (
              <Link href="/progressi?tab=storico" className="text-sm font-semibold" style={{ color: COLORS.primary }}>
                Vedi storico
              </Link>
            )}
          </div>
          <StreakCircles isGuest={isGuest} />
        </div>

        {/* ── Vista condizionale ─────────────────────────────────────── */}
        {pausaAttiva ? (
          <PausaAttivaView secondiRimasti={secondiRimasti} />
        ) : (
          <>
            {/* Esercizi del Giorno */}
            <div>
              <h2 className="text-lg font-bold text-ink mb-3">Esercizi del giorno</h2>

              {/* Counter + progress bar */}
              <div className="rounded-2xl px-4 py-3 mb-2 flex flex-col gap-2" style={{ backgroundColor: "#FFFFFF", boxShadow: "0px 0px 2px rgba(0,0,0,0.12)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Completati oggi</span>
                  <span className="text-sm font-bold" style={{ color: COLORS.primary }}>{completatiOggi}/{totaleEsercizi}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${COLORS.primary}33` }}>
                  <div className="h-full rounded-full transition-all" style={{ backgroundColor: COLORS.primary, width: `${(completatiOggi / totaleEsercizi) * 100}%` }} />
                </div>
              </div>

              {/* Lista esercizi */}
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", boxShadow: "0px 0px 2px rgba(0,0,0,0.12)" }}>
                {mockEserciziDelGiornoList.map((esercizio, i) => {
                  const cat = mockCategorie.find((c) => c.id === esercizio.categoria_id);
                  const cc = cat ? CATEGORIA_COLORS[cat.id] : null;
                  const isFirstNonCompleted = !esercizio.completato && mockEserciziDelGiornoList.slice(0, i).every((e) => e.completato);
                  const isLast = i === mockEserciziDelGiornoList.length - 1;

                  const row = (
                    <div
                      className="flex items-center justify-between px-3 py-3"
                      style={{ backgroundColor: isFirstNonCompleted ? `${COLORS.primary}08` : "transparent" }}
                    >
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0 mr-3">
                        {/* Category pill */}
                        {cc && cat && (
                          <span className="self-start text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: cc.bg, color: cc.text }}>
                            {cat.nome}
                          </span>
                        )}
                        {/* Name */}
                        <span
                          className={`text-sm font-semibold leading-snug ${esercizio.completato ? "line-through" : ""}`}
                          style={{ color: esercizio.completato ? COLORS.inkMuted : COLORS.inkPrimary }}
                        >
                          {esercizio.titolo}
                        </span>
                        {/* Meta */}
                        <div className="flex items-center gap-1 text-xs font-medium">
                          {esercizio.completato && isGuest ? (
                            <button
                              className="inline-flex items-center gap-1 text-xs font-semibold underline whitespace-nowrap"
                              style={{ color: COLORS.primary, textDecorationColor: COLORS.primary }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push("/onboarding/registrati"); }}
                            >
                              <Lock width={16} height={16} strokeWidth={1.5} color={COLORS.primary} className="flex-shrink-0" />
                              Registrati per sbloccare i risultati
                            </button>
                          ) : esercizio.completato && esercizio.risultato ? (
                            <span style={{ color: COLORS.inkMuted }}>
                              {formatTempo(esercizio.risultato.tempo_secondi)} minuti · {esercizio.risultato.accuratezza}% accuratezza
                            </span>
                          ) : (
                            <span style={{ color: COLORS.inkMuted }}>
                              {Math.ceil((esercizio.durata_stimata ?? 60) / 60)} minuti · Livello {esercizio.livello}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Right icon */}
                      {esercizio.completato && !isGuest ? (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: COLORS.primaryLight }}>
                          <Check width={14} height={14} strokeWidth={2} color={COLORS.primary} />
                        </div>
                      ) : !esercizio.completato ? (
                        <span className="text-lg font-bold flex-shrink-0" style={{ color: COLORS.primary }}>›</span>
                      ) : null}
                    </div>
                  );

                  return (
                    <div key={esercizio.id}>
                      <Link href={esercizio.completato ? "#" : `/esercizi/${esercizio.id}`}>{row}</Link>
                      {!isLast && <div style={{ height: 1, backgroundColor: COLORS.border }} />}
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Categorie */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-ink">Allena la mente</h2>
                <Link href="/esercizi" className="text-sm font-semibold" style={{ color: COLORS.primary }}>
                  Vedi tutti
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {[...mockCategorie].sort((a, b) => {
                  const TREND_ORDER: Record<string, number> = { calo: 0, stabile: 1, crescita: 2 };
                  const trendA = mockSessioniRecenti.find((s) => s.categoria === a.nome)?.trend ?? "stabile";
                  const trendB = mockSessioniRecenti.find((s) => s.categoria === b.nome)?.trend ?? "stabile";
                  return (TREND_ORDER[trendA] ?? 1) - (TREND_ORDER[trendB] ?? 1);
                }).map((cat) => {
                  const cc = CATEGORIA_COLORS[cat.id];
                  const ultimaSessione = mockSessioniRecenti.find((s) => s.categoria === cat.nome);
                  const trendConfig = {
                    crescita: { icon: "↑",  label: "In crescita", color: "#16A34A" },
                    stabile:  { icon: "→",  label: "Stabile",     color: COLORS.primary },
                    calo:     { icon: "↓",  label: "In calo",     color: "#DC2626" },
                  };
                  const trend = ultimaSessione?.trend ? trendConfig[ultimaSessione.trend] : null;
                  const row = (
                    <div className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ backgroundColor: cc.bg }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cc.text + "22" }}>
                        <AppIcon name={cat.icona} size={22} color={cc.text} />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold" style={{ color: cc.text }}>{cat.nome}</p>
                        {isGuest ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold mt-1" style={{ color: "#9CA3AF" }}>
                            <Lock width={14} height={14} strokeWidth={1.5} color="#9CA3AF" />
                            Registrati
                          </span>
                        ) : trend && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: "#FFFFFF", color: trend.color }}>
                            {trend.icon}{" "}{trend.label}
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-bold" style={{ color: cc.text }}>›</span>
                    </div>
                  );
                  return isGuest ? (
                    <Link key={cat.id} href="/onboarding/registrati">{row}</Link>
                  ) : (
                    <Link key={cat.id} href={`/esercizi?categoria=${cat.id}`}>{row}</Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal pausa */}
      {mostraPausa && (
        <PausaAttivaModal
          nome={nome ?? ""}
          isGuest={isGuest}
          onVaiPausa={() => { setMostraPausa(false); setPausaAttivaInizio(Date.now()); }}
          onContinua={() => { setMostraPausa(false); window.location.href = `/esercizi/${mockEsercizioDelGiorno.id}`; }}
          onClose={() => setMostraPausa(false)}
        />
      )}
    </>
  );
}
