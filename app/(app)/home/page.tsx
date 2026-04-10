"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Btn from "@/components/ui/btn";
import { useUserStore } from "@/lib/store";
import { mockEsercizioDelGiorno, mockEsercizioDelGiornoCompletato, mockEsercizioDelGiornoRisultato, mockCategorie, mockProgressiSettimanali, mockSessioniRecenti, mockMessaggiFamiliari } from "@/lib/mock-data";
import { CATEGORIA_COLORS, COLORS } from "@/lib/design-tokens";
import { AppIcon } from "@/lib/icons";
import { Timer, Running, Phone, Palette, Leaf, Lock, User, StatsReport, Calendar, Medal, Bell, ChatLines } from "iconoir-react";
import { PausaAttivaModal, CheckCircles } from "@/components/ui/pausa-attiva-modal";

const GIORNO_INDEX: Record<string, number> = { Lun: 1, Mar: 2, Mer: 3, Gio: 4, Ven: 5, Sab: 6, Dom: 7 };
const OFFSET_DA_LUNEDI: Record<string, number> = { Lun: 0, Mar: 1, Mer: 2, Gio: 3, Ven: 4, Sab: 5, Dom: 6 };
const LIMITE_ESERCIZI_GIORNO = 5;
const PAUSA_SECONDI = 15 * 60;


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
  const mm = String(Math.floor(secondiRimasti / 60)).padStart(2, "0");
  const ss = String(secondiRimasti % 60).padStart(2, "0");
  const timerLabel = secondiRimasti > 0 ? `Riprendi tra ${mm}:${ss}` : "Pronto a riprendere!";

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

const UPSELL_FEATURES = [
  { label: "Esercizi di diversi livelli",  icon: StatsReport },
  { label: "Traccia dei tuoi progressi",   icon: Calendar },
  { label: "Medaglie, trofei e molto altro", icon: Medal },
  { label: "Promemoria personalizzati",    icon: Bell },
];

export default function HomePage() {
  const { nome, isGuest, eserciziFattiOggi, pausaAttivaRichiesta, setPausaAttivaRichiesta } = useUserStore();
  const [mostraPausa, setMostraPausa] = useState(false);
  const [pausaAttiva, setPausaAttiva] = useState(false);
  const [secondiRimasti, setSecondiRimasti] = useState(PAUSA_SECONDI);

  // Risponde al flag impostato dalla pagina /esercizi quando il limite è raggiunto
  useEffect(() => {
    if (pausaAttivaRichiesta) {
      setPausaAttiva(true);
      setPausaAttivaRichiesta(false);
    }
  }, [pausaAttivaRichiesta, setPausaAttivaRichiesta]);

  useEffect(() => {
    if (!pausaAttiva || secondiRimasti <= 0) return;
    const t = setInterval(() => setSecondiRimasti((s) => {
      if (s <= 1) {
        clearInterval(t);
        setTimeout(() => setPausaAttiva(false), 1500);
        return 0;
      }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [pausaAttiva, secondiRimasti]);

  const jsDay = new Date().getDay();
  const oggiIndex = jsDay === 0 ? 7 : jsDay;
  const esercizioGiorno = mockEsercizioDelGiorno;
  const completato = mockEsercizioDelGiornoCompletato;
  const risultato = mockEsercizioDelGiornoRisultato;
  const catGiorno = mockCategorie.find((c) => c.id === esercizioGiorno.categoria_id);
  const catColors = catGiorno ? CATEGORIA_COLORS[catGiorno.id] : null;

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
            {/* Esercizio del Giorno */}
            <div>
              <h2 className="text-lg font-bold text-ink mb-3">Esercizio del Giorno</h2>
              <Card padding="md" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="flex items-center gap-2 mb-3">
                  {catColors && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: catColors.bg, color: catColors.text }}>
                      <AppIcon name={catGiorno?.icona ?? "brain"} size={14} color={catColors.text} />
                      {catGiorno?.nome}
                    </span>
                  )}
                  {completato && (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Completato
                    </span>
                  )}
                  {!completato && (
                    <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: COLORS.inkMuted }}>
                      <Timer width={14} height={14} strokeWidth={1.5} color={COLORS.inkMuted} />
                      <span>{Math.ceil((esercizioGiorno.durata_stimata ?? 60) / 60)} minuti</span>
                      <span>·</span>
                      {isGuest ? (
                        <span className="flex items-center gap-1"><Lock width={14} height={14} strokeWidth={1.5} color={COLORS.inkMuted} /> Livello</span>
                      ) : (
                        <span>Livello {esercizioGiorno.livello}/6</span>
                      )}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-ink">{esercizioGiorno.titolo}</h3>

                {completato ? (
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Tempo",       value: formatTempo(risultato.tempo_secondi), icon: <Timer width={18} height={18} strokeWidth={1.5} color={COLORS.primary} /> },
                        { label: "Accuratezza", value: `${risultato.precisione}%`,            icon: <StatsReport width={18} height={18} strokeWidth={1.5} color={COLORS.primary} /> },
                      ].map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center gap-1 rounded-xl py-2" style={{ backgroundColor: COLORS.primaryLight, border: `1px solid ${COLORS.primary}22` }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}18` }}>
                            {stat.icon}
                          </div>
                          <span className="text-base font-extrabold" style={{ color: COLORS.primary, filter: isGuest ? "blur(5px)" : "none", userSelect: isGuest ? "none" : "auto" }}>{stat.value}</span>
                          <span className="text-xs font-medium" style={{ color: COLORS.inkMuted }}>{stat.label}</span>
                        </div>
                      ))}
                    </div>
                    {isGuest && (
                      <Link href="/onboarding/registrati">
                        <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: `${COLORS.primary}10`, border: `1px solid ${COLORS.primary}40` }}>
                          <Lock width={22} height={22} strokeWidth={1.5} color={COLORS.primary} />
                          <div className="flex-1">
                            <p className="text-sm font-extrabold text-ink">Sblocca i tuoi risultati</p>
                            <p className="text-xs mt-0.5" style={{ color: COLORS.inkSecondary }}>Registrati per vedere tempo, precisione e livelli</p>
                          </div>
                          <span className="text-base font-bold" style={{ color: COLORS.primary }}>›</span>
                        </div>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    {eserciziFattiOggi >= LIMITE_ESERCIZI_GIORNO ? (
                      <button
                        className="w-full py-3 rounded-xl text-sm font-bold text-white"
                        style={{ backgroundColor: COLORS.primary }}
                        onClick={() => setMostraPausa(true)}
                      >
                        Inizia ora
                      </button>
                    ) : (
                      <Link href={`/esercizi/${esercizioGiorno.id}`}>
                        <button
                          className="w-full py-3 rounded-xl text-sm font-bold text-white"
                          style={{ backgroundColor: COLORS.primary }}
                        >
                          Inizia ora
                        </button>
                      </Link>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Card upsell — solo ospite che non ha ancora completato l'esercizio del giorno */}
            {isGuest && !completato && (
              <div className="rounded-xl p-4 flex flex-col gap-4" style={{ border: `1px solid ${COLORS.primary}`, backgroundColor: "#E8F1F3" }}>
                {/* Header */}
                <div className="flex flex-col gap-1">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: COLORS.primaryLight }}>
                    <User width={28} height={28} strokeWidth={1.5} color={COLORS.primary} />
                  </div>
                  <p className="text-sm font-bold text-ink whitespace-nowrap">Sblocca la tua esperienza completa</p>
                  <p className="text-sm" style={{ color: COLORS.inkSecondary }}>
                    Registrati e tieni traccia dei tuoi progressi, livelli e molto altro.
                  </p>
                </div>

                {/* Feature cards 2×2 */}
                <div className="grid grid-cols-2 gap-2">
                  {UPSELL_FEATURES.map(({ label, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-lg p-3 flex flex-col gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}>
                        <Icon width={13} height={13} strokeWidth={1.5} color={COLORS.primary} />
                      </div>
                      <p className="text-xs font-bold text-ink leading-tight">{label}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href="/onboarding/registrati">
                  <button className="w-full py-3 rounded-full text-sm font-bold text-white" style={{ backgroundColor: COLORS.primary }}>
                    Registrati gratuitamente
                  </button>
                </Link>
              </div>
            )}

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
          onVaiPausa={() => { setMostraPausa(false); setPausaAttiva(true); }}
          onContinua={() => { setMostraPausa(false); window.location.href = `/esercizi/${esercizioGiorno.id}`; }}
          onClose={() => setMostraPausa(false)}
        />
      )}
    </>
  );
}
