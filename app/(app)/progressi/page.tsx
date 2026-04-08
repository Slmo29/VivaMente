"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import { mockMedaglie, mockProgressiSettimanali, mockScoreCategorie, mockStoricoGiornaliero, mockTotaleSettimanaScorsa } from "@/lib/mock-data";
import { useUserStore } from "@/lib/store";
import { COLORS, CATEGORIA_COLORS } from "@/lib/design-tokens";
import { AppIcon } from "@/lib/icons";
import { Lock, Calendar } from "iconoir-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// ── Calendario ────────────────────────────────────────────────────────────────

const MESI_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function buildCalendarCells(year: number, month: number): (number | null)[] {
  const firstDayItalian = (new Date(year, month, 1).getDay() + 6) % 7; // Lun=0…Dom=6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDayItalian).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function getCompletatiDates(): Set<string> {
  const set = new Set<string>();
  const now = new Date();
  const jsDay = now.getDay();
  const daysFromMonday = jsDay === 0 ? 6 : jsDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  const OFFSET: Record<string, number> = { Lun: 0, Mar: 1, Mer: 2, Gio: 3, Ven: 4, Sab: 5, Dom: 6 };
  for (const g of mockProgressiSettimanali) {
    if (g.esercizi > 0) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + OFFSET[g.giorno]);
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    }
  }
  return set;
}

function CalendarioMensile({ streak, children }: { streak: number; children?: React.ReactNode }) {
  const [meseOffset, setMeseOffset] = useState(0);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  const displayDate = new Date(currentYear, currentMonth + meseOffset, 1);
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const isCurrentMonth = year === currentYear && month === currentMonth;

  const completatiSet = getCompletatiDates();
  const cells = buildCalendarCells(year, month);
  const HEADER = ["L", "M", "M", "G", "V", "S", "D"];

  return (
    <Card padding="md">
      {/* Titolo + streak */}
      <div className="mb-4">
        <p className="text-base font-bold text-ink">Storico allenamenti</p>
        <p className="text-sm font-bold" style={{ color: "#1891B1" }}>{streak}/7 giorni consecutivi</p>
      </div>

      {/* Header mese */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMeseOffset((o) => o - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-lg"
          style={{ color: COLORS.primary }}
        >
          ←
        </button>
        <span className="text-base font-bold text-ink">
          {MESI_IT[month]} {year}
        </span>
        <button
          onClick={() => { if (!isCurrentMonth) setMeseOffset((o) => o + 1); }}
          className="w-8 h-8 flex items-center justify-center rounded-full text-lg"
          style={{ color: isCurrentMonth ? "#D1D5DB" : COLORS.primary, cursor: isCurrentMonth ? "default" : "pointer" }}
        >
          →
        </button>
      </div>

      {/* Intestazione giorni settimana */}
      <div className="grid grid-cols-7 mb-2">
        {HEADER.map((g, i) => (
          <div key={i} className="text-center text-xs font-semibold" style={{ color: COLORS.inkMuted }}>
            {g}
          </div>
        ))}
      </div>

      {/* Griglia giorni */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = isCurrentMonth && day === todayDate;
          const isFuture = isCurrentMonth && day > todayDate;
          const completato = completatiSet.has(dateStr);

          let bg = "transparent";
          let border = "1.5px solid #D1D5DB";
          let color = "#6B7280";

          if (isToday) {
            border = `1.5px solid #1891B1`;
            color = "#1891B1";
          } else if (completato) {
            bg = "#1891B1";
            border = "none";
            color = "#FFFFFF";
          } else if (isFuture) {
            border = "none";
            color = "#D1D5DB";
          }

          return (
            <div key={i} className="flex justify-center py-0.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: bg, border, color }}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </Card>
  );
}

// ── Card area cerebrale ──────────────────────────────────────────────────────

type Periodo = "settimana" | "mese" | "anno";
const SLICE: Record<Periodo, number> = { settimana: 4, mese: 8, anno: Infinity };
const PERIODO_LABEL: Record<Periodo, string> = { settimana: "Settimana", mese: "Mese", anno: "Anno" };

const TREND_TEXTS: Record<string, Record<string, string>> = {
  Memoria: {
    crescita: "Stai ricordando sempre più cose correttamente. Continua ad allenarti e vedrai ancora più miglioramenti!",
    stabile:  "La tua capacità di ricordare è stabile. Prova a fare qualche esercizio in più per portarla al livello successivo!",
    calo:     "Stai ricordando meno cose rispetto a prima. Non preoccuparti, riprendi gli esercizi e tornerà a salire!",
  },
  Attenzione: {
    crescita: "La tua concentrazione sta migliorando. Stai diventando sempre più bravo a focalizzarti sui dettagli!",
    stabile:  "La tua concentrazione è stabile. Prova a fare qualche esercizio in più per migliorare ancora!",
    calo:     "La tua concentrazione ha bisogno di un po' di allenamento. Riprendi gli esercizi e tornerà a salire!",
  },
  Linguaggio: {
    crescita: "Il tuo linguaggio sta migliorando. Stai diventando sempre più bravo con le parole!",
    stabile:  "Il tuo linguaggio è stabile. Prova a fare qualche esercizio in più per portarlo al livello successivo!",
    calo:     "Il tuo linguaggio ha bisogno di un po' di allenamento. Riprendi gli esercizi e tornerà a salire!",
  },
};

function AreaCerebraleCard({ cat }: { cat: typeof mockScoreCategorie[0] }) {
  const [periodo, setPeriodo] = useState<Periodo>("settimana");
  const cc = CATEGORIA_COLORS[cat.categoria.toLowerCase()];
  const trendLabel = { crescita: "↑ In crescita", stabile: "→ Stabile", calo: "↓ In calo" }[cat.trend];
  const testoTrend = TREND_TEXTS[cat.categoria]?.[cat.trend] ?? "";
  const dati = cat.storico.slice(-SLICE[periodo]);
  const PERIODI: Periodo[] = ["settimana", "mese", "anno"];

  return (
    <div className="rounded-2xl" style={{ backgroundColor: cc?.bg, padding: 16 }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <AppIcon name={cat.icona} size={24} color={cc?.text ?? COLORS.primary} />
        <span className="text-base font-semibold text-ink">{cat.categoria}</span>
      </div>

      {/* Griglia 2x2 statistiche */}
      <div className="flex gap-2 mb-3">
        <StatCell value={`${cat.score}%`} label="Precisione media" color={cc?.text ?? COLORS.primary} />
        <StatCell value={TREND_ARROW[cat.trend]} label={TREND_TEXT[cat.trend]} color={cc?.text ?? COLORS.primary} />
      </div>
      <div className="flex gap-2 mb-3">
        <StatCell value={String(cat.sessioni)} label="Sessioni" color={cc?.text ?? COLORS.primary} />
        <StatCell value={`${cat.livello}/6`} label="Livello" color={cc?.text ?? COLORS.primary} />
      </div>

      {/* Box bianco con grafico (sempre visibile) */}
      <div className="rounded-xl mb-3" style={{ backgroundColor: "#FFFFFF", padding: 16 }}>
        {/* Filtri periodo — pill */}
        <div className="flex items-center gap-2 mb-3">
          {PERIODI.map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
              style={{
                backgroundColor: periodo === p ? (cc?.text ?? COLORS.primary) : "#F0F0F0",
                color: periodo === p ? "#FFFFFF" : "#6B7280",
              }}
            >
              {PERIODO_LABEL[p]}
            </button>
          ))}
        </div>

        {/* Grafico */}
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dati} margin={{ top: 5, right: 5, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: COLORS.inkMuted }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 9, fill: COLORS.inkMuted }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [v != null ? `${v}%` : "", cat.categoria]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={cc?.text ?? COLORS.primary}
                strokeWidth={2}
                dot={{ fill: cc?.text ?? COLORS.primary, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Testo discorsivo */}
      <p className="text-sm leading-relaxed" style={{ color: COLORS.ink }}>
        {testoTrend}
      </p>
    </div>
  );
}

const NOMI_GIORNO_IT = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const MESI_SHORT_IT  = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

// mockStoricoGiornaliero è ordinato dal più recente al più vecchio
function getPreviousScore(data: string, categoria: string): number | null {
  const idx = mockStoricoGiornaliero.findIndex((g) => g.data === data);
  const start = idx === -1 ? mockStoricoGiornaliero.length : idx + 1;
  for (let i = start; i < mockStoricoGiornaliero.length; i++) {
    const found = mockStoricoGiornaliero[i].sessioni.find((s) => s.categoria === categoria);
    if (found) return found.score;
  }
  return null;
}

function TrendArrow({ data, categoria, score }: { data: string; categoria: string; score: number }) {
  const prev = getPreviousScore(data, categoria);
  if (prev === null) return null;
  const symbol = score > prev ? "↑" : score < prev ? "↓" : "→";
  const color  = score > prev ? COLORS.success : score < prev ? "#DC2626" : COLORS.inkMuted;
  return <span className="text-xs font-semibold" style={{ color }}>{symbol}</span>;
}

function StoricoGiornaliero() {
  const now = new Date();
  const jsDay = now.getDay();
  const daysFromMonday = jsDay === 0 ? 6 : jsDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const isFuture = dateStr > todayStr;
    const sessioni = isFuture ? [] : (mockStoricoGiornaliero.find((g) => g.data === dateStr)?.sessioni ?? []);
    const label = `${NOMI_GIORNO_IT[d.getDay()]} ${d.getDate()} ${MESI_SHORT_IT[d.getMonth()]}`;
    return { dateStr, label, isFuture, sessioni };
  });

  return (
    <div className="divide-y" style={{ borderColor: "#E5E7EB" }}>
        {days.map(({ dateStr, label, isFuture, sessioni }, idx) => (
          <div key={dateStr} className={idx === 0 ? "pb-3" : idx === 6 ? "pt-3" : "py-3"}>
            {isFuture ? (
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: COLORS.inkMuted }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color: COLORS.inkMuted }}>—</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-ink mb-2">{label}</p>
                {sessioni.length === 0 ? (
                  <p className="text-xs" style={{ color: COLORS.inkMuted }}>Nessuna sessione completata</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {sessioni.map((s, i) => {
                      const cc = CATEGORIA_COLORS[s.categoria.toLowerCase()];
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cc?.text ?? COLORS.primary }} />
                          <span className="text-sm font-medium text-ink flex-1">{s.categoria}</span>
                          <span className="text-xs font-semibold" style={{ color: cc?.text ?? COLORS.primary }}>{s.score}%</span>
                          <TrendArrow data={dateStr} categoria={s.categoria} score={s.score} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
  );
}

const totaleSettimana = mockProgressiSettimanali.reduce((a, g) => a + g.esercizi, 0);

// ── Dati globali cervello ─────────────────────────────────────────────────────
const globalScore = Math.round(
  mockScoreCategorie.reduce((sum, c) => sum + c.score, 0) / mockScoreCategorie.length
);
const globalSessioni = mockScoreCategorie.reduce((sum, c) => sum + c.sessioni, 0);
const globalStorico = mockScoreCategorie[0].storico.map((entry, i) => ({
  label: entry.label,
  score: Math.round(
    mockScoreCategorie.reduce((sum, c) => sum + (c.storico[i]?.score ?? 0), 0) / mockScoreCategorie.length
  ),
}));
const globalTrend: "crescita" | "stabile" | "calo" = (() => {
  const first = globalStorico[0]?.score ?? 0;
  const last = globalStorico[globalStorico.length - 1]?.score ?? 0;
  if (last > first + 2) return "crescita";
  if (last < first - 2) return "calo";
  return "stabile";
})();

const sfereCrescita = mockScoreCategorie.filter((c) => c.trend === "crescita").length;

const TREND_ARROW: Record<string, string> = { crescita: "↑", stabile: "→", calo: "↓" };
const TREND_TEXT:  Record<string, string> = { crescita: "In crescita", stabile: "Stabile", calo: "In calo" };

function StatCell({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: "#FFFFFF" }}>
      <p className="text-base font-bold leading-tight" style={{ color }}>{value}</p>
      <p className="text-xs mt-0.5 leading-tight" style={{ color: COLORS.inkMuted }}>{label}</p>
    </div>
  );
}

const CERVELLO_COLOR = "#1891B1";
const CERVELLO_BG = "#E8F6FA";
const CERVELLO_TEXTS: Record<string, string> = {
  crescita: "Stai andando molto bene! Hai risposto correttamente alla maggior parte delle domande. Continua così, ogni giorno fa la differenza.",
  stabile:  "Stai andando bene! Continua ad allenarti ogni giorno per migliorare ancora di più!",
  calo:     "Hai bisogno di un po' di allenamento. Non preoccuparti, riprendi gli esercizi e i risultati arriveranno!",
};

function CervelloGlobaleCard() {
  const [periodo, setPeriodo] = useState<Periodo>("settimana");
  const trendLabel = { crescita: "↑ In crescita", stabile: "→ Stabile", calo: "↓ In calo" }[globalTrend];
  const dati = globalStorico.slice(-SLICE[periodo]);
  const PERIODI: Periodo[] = ["settimana", "mese", "anno"];

  return (
    <div className="rounded-2xl" style={{ backgroundColor: CERVELLO_BG, padding: 16 }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <AppIcon name="brain" size={24} color={CERVELLO_COLOR} />
        <span className="text-base font-semibold text-ink">Riassunto</span>
      </div>

      {/* Griglia 2x2 statistiche */}
      <div className="flex gap-2 mb-3">
        <StatCell value={`${globalScore}%`} label="Precisione media" color={CERVELLO_COLOR} />
        <StatCell value={TREND_ARROW[globalTrend]} label={TREND_TEXT[globalTrend]} color={CERVELLO_COLOR} />
      </div>
      <div className="flex gap-2 mb-3">
        <StatCell value={String(globalSessioni)} label="Sessioni totali" color={CERVELLO_COLOR} />
        <StatCell value={`${sfereCrescita}/3`} label="Sfere in crescita" color={CERVELLO_COLOR} />
      </div>

      {/* Box bianco con grafico */}
      <div className="rounded-xl mb-3" style={{ backgroundColor: "#FFFFFF", padding: 16 }}>
        {/* Filtri periodo — pill */}
        <div className="flex items-center gap-2 mb-3">
          {PERIODI.map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
              style={{
                backgroundColor: periodo === p ? CERVELLO_COLOR : "#F0F0F0",
                color: periodo === p ? "#FFFFFF" : "#6B7280",
              }}
            >
              {PERIODO_LABEL[p]}
            </button>
          ))}
        </div>

        {/* Grafico */}
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dati} margin={{ top: 5, right: 5, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: COLORS.inkMuted }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 9, fill: COLORS.inkMuted }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [v != null ? `${v}%` : "", "Cervello"]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={CERVELLO_COLOR}
                strokeWidth={2}
                dot={{ fill: CERVELLO_COLOR, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Testo discorsivo */}
      <p className="text-sm leading-relaxed" style={{ color: COLORS.ink }}>
        {CERVELLO_TEXTS[globalTrend]}
      </p>
    </div>
  );
}

type Tab = "attivita" | "medaglie";

export default function ProgressiPage() {
  const [tab, setTab] = useState<Tab>("attivita");
  const { medaglie: medaglieIds } = useUserStore();
  const medaglieGuadagnate = mockMedaglie.filter((m) => medaglieIds.includes(m.id));

  const jsDay = new Date().getDay();
  const oggiIndex = jsDay === 0 ? 7 : jsDay;
  const GIORNO_IDX: Record<string, number> = { Lun: 1, Mar: 2, Mer: 3, Gio: 4, Ven: 5, Sab: 6, Dom: 7 };
  const giorniCompletati = mockProgressiSettimanali.filter(
    (g) => g.esercizi > 0 && GIORNO_IDX[g.giorno] <= oggiIndex
  ).length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header + Tabs ────────────────────────────────────────────── */}
      <div className="bg-surface px-4 pt-6 pb-0 sticky top-0 z-10 shadow-card">
        <div className="flex items-center gap-2 mb-0">
          <h1 className="text-2xl font-extrabold text-ink">I tuoi progressi</h1>
        </div>
        <div className="flex mt-4">
          {(["attivita", "medaglie"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-base font-semibold border-b-2 transition-all capitalize"
              style={{
                borderColor: tab === t ? COLORS.primary : "transparent",
                color: tab === t ? COLORS.primary : COLORS.inkMuted,
              }}
            >
              {t === "attivita" ? "Attività" : "Medaglie"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4">
        {/* ── Tab: Attività ────────────────────────────────────────── */}
        {tab === "attivita" && (
          <>
            {/* 1 — Card cervello globale */}
            <CervelloGlobaleCard />

            {/* 2-4 — Aree cerebrali */}
            <div className="flex flex-col gap-3">
              {mockScoreCategorie.map((cat) => (
                <AreaCerebraleCard key={cat.categoria} cat={cat} />
              ))}
            </div>

            {/* 5 — Storico unificato */}
            {(() => {
              const diff  = totaleSettimana - mockTotaleSettimanaScorsa;
              const bg    = diff > 0 ? COLORS.successLight : diff === 0 ? "#F5F5F5" : "#FEF2F2";
              const color = diff > 0 ? COLORS.success      : diff === 0 ? "#6B7280" : "#DC2626";
              const txt   = diff > 0
                ? `Questa settimana hai fatto +${diff} esercizi rispetto alla settimana scorsa.`
                : diff === 0
                ? "Questa settimana hai fatto lo stesso numero di esercizi della settimana scorsa."
                : `Questa settimana hai fatto ${diff} esercizi rispetto alla settimana scorsa.`;
              return (
                <CalendarioMensile streak={giorniCompletati}>
                  <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: bg }}>
                    <p className="text-sm font-semibold" style={{ color }}>{txt}</p>
                  </div>
                  <StoricoGiornaliero />
                </CalendarioMensile>
              );
            })()}


          </>
        )}

        {/* ── Tab: Medaglie ─────────────────────────────────────────── */}
        {tab === "medaglie" && (
          <>
            <div className="flex items-center justify-between py-1">
              <p className="text-base text-ink-muted">
                <strong className="text-ink">{medaglieGuadagnate.length}</strong> di {mockMedaglie.length} medaglie sbloccate
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {mockMedaglie.map((medaglia) => {
                const guadagnata = medaglieIds.includes(medaglia.id);
                return (
                  <div
                    key={medaglia.id}
                    className="rounded-lg p-4 text-center transition-all"
                    style={{
                      backgroundColor: guadagnata ? COLORS.goldLight : "#F5F5F5",
                      border: guadagnata ? `1.5px solid ${COLORS.gold}55` : "1.5px solid #E2E8F0",
                      opacity: guadagnata ? 1 : 0.55,
                    }}
                  >
                    <div className="flex justify-center mb-2">
                      {guadagnata ? (
                        <AppIcon name={medaglia.icona} size={40} color={COLORS.gold} />
                      ) : (
                        <Lock width={40} height={40} strokeWidth={1.5} color={COLORS.inkMuted} />
                      )}
                    </div>
                    <p className="text-sm font-bold mt-2" style={{ color: guadagnata ? COLORS.ink : COLORS.inkMuted }}>
                      {medaglia.nome}
                    </p>
                    <p className="text-xs mt-1 leading-snug" style={{ color: COLORS.inkMuted }}>
                      {medaglia.descrizione}
                    </p>
                    {guadagnata && medaglia.guadagnata_at && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Calendar width={12} height={12} strokeWidth={1.5} color={COLORS.gold} />
                        <p className="text-xs font-semibold" style={{ color: COLORS.gold }}>
                          {new Date(medaglia.guadagnata_at).toLocaleDateString("it-IT")}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
