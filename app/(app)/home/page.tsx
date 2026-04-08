"use client";

import Link from "next/link";
import Card from "@/components/ui/card";
import Btn from "@/components/ui/btn";
import { useUserStore } from "@/lib/store";
import { mockEsercizioDelGiorno, mockCategorie, mockProgressiSettimanali, mockSessioniRecenti } from "@/lib/mock-data";
import { CATEGORIA_COLORS, COLORS } from "@/lib/design-tokens";
import { AppIcon } from "@/lib/icons";
import { Timer } from "iconoir-react";

const GIORNO_INDEX: Record<string, number> = { Lun: 1, Mar: 2, Mer: 3, Gio: 4, Ven: 5, Sab: 6, Dom: 7 };

// Mappa nome giorno → offset da lunedì (settimana italiana)
const OFFSET_DA_LUNEDI: Record<string, number> = { Lun: 0, Mar: 1, Mer: 2, Gio: 3, Ven: 4, Sab: 5, Dom: 6 };

// Cerchi streak settimanali
function StreakCircles() {
  const GIORNI = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const now = new Date();
  const jsDay = now.getDay();
  const oggi = GIORNI[jsDay];
  const oggiIndex = jsDay === 0 ? 7 : jsDay;

  // Lunedì della settimana corrente
  const daysFromMonday = jsDay === 0 ? 6 : jsDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);

  return (
    <div className="flex justify-between mt-4">
      {mockProgressiSettimanali.map((g) => {
        const isOggi = g.giorno === oggi;
        const isFuturo = GIORNO_INDEX[g.giorno] > oggiIndex;
        const completato = g.esercizi > 0 && !isFuturo;

        // Numero del giorno del mese per questo giorno
        const d = new Date(monday);
        d.setDate(monday.getDate() + OFFSET_DA_LUNEDI[g.giorno]);
        const dayNumber = d.getDate();

        // Stili per ogni stato
        let circleBg = "transparent";
        let circleBorder = "2px solid #D1D5DB";
        let letterColor = "#9CA3AF";
        let labelColor = "#9CA3AF";

        if (completato) {
          circleBg = COLORS.primary;
          circleBorder = "none";
          labelColor = isOggi ? COLORS.primary : "#6B7280";
        } else if (isOggi) {
          circleBorder = `2px solid ${COLORS.primary}`;
          letterColor = COLORS.primary;
          labelColor = COLORS.primary;
        } else if (isFuturo) {
          circleBorder = "2px solid #E5E7EB";
          letterColor = "#D1D5DB";
          labelColor = "#D1D5DB";
        }

        return (
          <div key={g.giorno} className="flex flex-col items-center gap-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: circleBg, border: circleBorder }}
            >
              {completato ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              ) : (
                <span style={{ color: letterColor, fontSize: 14, fontWeight: 700 }}>
                  {g.giorno[0]}
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: labelColor, fontWeight: isOggi ? 700 : 500 }}>
              {g.giorno}
            </span>
            <span style={{ fontSize: 11, color: labelColor, fontWeight: 400 }}>
              {dayNumber}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const { nome } = useUserStore();
  const jsDay = new Date().getDay();
  const oggiIndex = jsDay === 0 ? 7 : jsDay;
  const giorniCompletati = mockProgressiSettimanali.filter(
    (g) => g.esercizi > 0 && GIORNO_INDEX[g.giorno] <= oggiIndex
  ).length;
  const esercizioGiorno = mockEsercizioDelGiorno;
  const catGiorno = mockCategorie.find((c) => c.id === esercizioGiorno.categoria_id);
  const catColors = catGiorno ? CATEGORIA_COLORS[catGiorno.id] : null;

  return (
    <div className="flex flex-col gap-8 px-4 pt-12">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink">
          Ciao {nome},
        </h1>
      </div>

      {/* ── Card Streak ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between">
          <span style={{ color: "#1891B1", fontWeight: 700, lineHeight: 1.1, fontSize: 32 }}>
            {giorniCompletati}/7
          </span>
          <Link href="/progressi" className="text-sm font-semibold" style={{ color: "#1891B1" }}>
            Vedi storico
          </Link>
        </div>
        <StreakCircles />
      </div>

      {/* ── Esercizio del Giorno ─────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-ink mb-3">Esercizio del Giorno</h2>
        <Card padding="lg" style={{ backgroundColor: "#FFFFFF" }}>
          {/* ── Header row ── */}
          <div className="flex items-center justify-between mb-3">
            {catColors ? (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: catColors.bg, color: catColors.text }}
              >
                <AppIcon name={catGiorno?.icona ?? "brain"} size={14} color={catColors.text} />
                {catGiorno?.nome}
              </span>
            ) : <span />}
            <div className="flex items-center gap-1 text-xs" style={{ color: COLORS.inkMuted }}>
              <Timer width={14} height={14} strokeWidth={1.5} color={COLORS.inkMuted} />
              <span>{Math.ceil((esercizioGiorno.durata_stimata ?? 60) / 60)} minuti</span>
              <span>·</span>
              <span>Livello {esercizioGiorno.livello}/6</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-ink">{esercizioGiorno.titolo}</h3>
          <p className="text-sm text-ink-muted mt-1 leading-relaxed">{esercizioGiorno.descrizione}</p>
          <div className="mt-4">
            <Link href={`/esercizi/${esercizioGiorno.id}`}>
              <Btn size="default">Inizia ora</Btn>
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Categorie ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-ink">Allena la mente</h2>
          <Link href="/esercizi" className="text-sm font-semibold" style={{ color: COLORS.primary }}>
            Vedi tutti
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
          {mockCategorie.map((cat) => {
            const cc = CATEGORIA_COLORS[cat.id];
            const ultimaSessione = mockSessioniRecenti.find((s) => s.categoria === cat.nome);
            const trendConfig = {
              crescita: { icon: "↑", label: "In crescita" },
              stabile:  { icon: "→", label: "Stabile" },
              calo:     { icon: "↓", label: "In calo" },
            };
            const trend = ultimaSessione?.trend ? trendConfig[ultimaSessione.trend] : null;
            return (
              <Link key={cat.id} href={`/esercizi?categoria=${cat.id}`} className="flex-shrink-0">
                <div
                  className="w-36 rounded-lg p-4 flex flex-col gap-2"
                  style={{ backgroundColor: cc.bg }}
                >
                  <AppIcon name={cat.icona} size={40} color={cc.text} />
                  <p className="text-base font-bold" style={{ color: cc.text }}>{cat.nome}</p>
                  {trend && (
                    <p className="text-xs font-semibold" style={{ color: cc.text }}>
                      {trend.icon} {trend.label}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
