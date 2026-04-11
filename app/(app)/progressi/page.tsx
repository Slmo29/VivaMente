"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/card";
import { mockMedaglie, mockProgressiSettimanali, mockScoreCategorie, mockStoricoGiornaliero, mockTotaleSettimanaScorsa, mockEsercizioDelGiorno, mockCategorie } from "@/lib/mock-data";
import { useUserStore } from "@/lib/store";
import { COLORS, CATEGORIA_COLORS } from "@/lib/design-tokens";
import { AppIcon } from "@/lib/icons";
import { Lock, Calendar } from "iconoir-react";
import AppSelect from "@/components/ui/app-select";
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

function getAllCompletatiDates(): Set<string> {
  const set = new Set<string>();
  for (const g of mockStoricoGiornaliero) {
    if (g.sessioni.length > 0) set.add(g.data);
  }
  return set;
}

function buildStreakFromStorico(): number {
  const now = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (mockStoricoGiornaliero.some((g) => g.data === dateStr && g.sessioni.length > 0)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function CalendarioMensile({
  streak,
  selectedDate,
  onDaySelect,
  children,
}: {
  streak: number;
  selectedDate: string | null;
  onDaySelect: (date: string) => void;
  children?: React.ReactNode;
}) {
  const [meseOffset, setMeseOffset] = useState(0);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  const displayDate = new Date(currentYear, currentMonth + meseOffset, 1);
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const isCurrentMonth = year === currentYear && month === currentMonth;

  const completatiSet = getAllCompletatiDates();
  const cells = buildCalendarCells(year, month);
  const HEADER = ["L", "M", "M", "G", "V", "S", "D"];

  return (
    <Card padding="md">
      {/* Titolo + streak */}
      <div className="mb-4">
        <p className="text-base font-bold text-ink">Storico allenamenti</p>
        <p className="text-sm font-bold" style={{ color: COLORS.primary }}>{streak} giorni consecutivi</p>
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
          const isSelected = selectedDate === dateStr;

          let bg = "transparent";
          let border = "1.5px solid #D1D5DB";
          let color = "#6B7280";

          if (isSelected) {
            bg = COLORS.primary;
            border = "none";
            color = "#FFFFFF";
          } else if (isToday) {
            border = `1.5px solid ${COLORS.primary}`;
            color = COLORS.primary;
          } else if (completato) {
            bg = COLORS.primary;
            border = "none";
            color = "#FFFFFF";
          } else if (isFuture) {
            border = "none";
            color = "#D1D5DB";
          }

          return (
            <div key={i} className="flex justify-center py-0.5">
              <button
                disabled={isFuture}
                onClick={() => onDaySelect(isSelected ? "" : dateStr)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: bg, border, color, cursor: isFuture ? "default" : "pointer" }}
              >
                {day}
              </button>
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
const SLICE: Record<Periodo, number> = { settimana: 7, mese: 30, anno: 365 };
const PERIODO_LABEL: Record<Periodo, string> = { settimana: "Settimana", mese: "Mese", anno: "Anno" };

// Today fixed to mock context: Apr 10, 2026 (Venerdì)
const MOCK_TODAY = new Date(2026, 3, 10);
const MESI_IT_MAP: Record<string, number> = {
  "Gen":0,"Feb":1,"Mar":2,"Apr":3,"Mag":4,"Giu":5,
  "Lug":6,"Ago":7,"Set":8,"Ott":9,"Nov":10,"Dic":11,
};
const MESI_IT_SHORT = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
const DAY_LABELS = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];

function parseStoricoLabel(label: string): Date {
  const [d, m] = label.split(" ");
  return new Date(2026, MESI_IT_MAP[m], parseInt(d));
}

type StoricoEntry = { label: string; livello: number };

function buildPeriodData(storico: StoricoEntry[], periodo: Periodo): { label: string; livello: number | null }[] {
  const today = MOCK_TODAY;

  if (periodo === "settimana") {
    const day = today.getDay(); // Ven = 5
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    return DAY_LABELS.map((dayLabel, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      if (d > today) return { label: dayLabel, livello: null };
      const dateLabel = `${d.getDate()} ${MESI_IT_SHORT[d.getMonth()]}`;
      const match = storico.find((s) => s.label === dateLabel);
      return { label: dayLabel, livello: match?.livello ?? null };
    });
  }

  if (periodo === "mese") {
    const currentMonth = today.getMonth();
    return storico
      .filter((s) => parseStoricoLabel(s.label).getMonth() === currentMonth)
      .map((s) => ({ label: s.label, livello: s.livello }));
  }

  // anno: raggruppa per mese, media livello
  const byMonth = new Map<string, number[]>();
  for (const s of storico) {
    const key = MESI_IT_SHORT[parseStoricoLabel(s.label).getMonth()];
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(s.livello);
  }
  return [...byMonth.entries()].map(([label, levels]) => ({
    label,
    livello: Math.round(levels.reduce((a, b) => a + b, 0) / levels.length),
  }));
}

const TREND_TEXTS: Record<string, Record<string, string>> = {
  Memoria: {
    crescita: "Stai ricordando sempre più cose correttamente. Continua ad allenarti e vedrai ancora più miglioramenti!",
    stabile:  "La tua capacità di ricordare è stabile. Prova a fare qualche esercizio in più per portarla al livello successivo!",
    calo:     "Stai ricordando meno cose rispetto a prima. Non preoccuparti, riprendi gli esercizi e tornerà a salire!",
  },
  Attenzione: {
    crescita: "La tua concentrazione sta migliorando. La tua capacità di focalizzarti sui dettagli sta crescendo!",
    stabile:  "La tua concentrazione è stabile. Prova a fare qualche esercizio in più per migliorare ancora!",
    calo:     "La tua concentrazione ha bisogno di un po' di allenamento. Riprendi gli esercizi e tornerà a salire!",
  },
  Linguaggio: {
    crescita: "Il tuo linguaggio sta migliorando. Stai migliorando sempre più con le parole!",
    stabile:  "Il tuo linguaggio è stabile. Prova a fare qualche esercizio in più per portarlo al livello successivo!",
    calo:     "Il tuo linguaggio ha bisogno di un po' di allenamento. Riprendi gli esercizi e tornerà a salire!",
  },
  Esecutive: {
    crescita: "Le tue funzioni esecutive stanno migliorando. Stai pianificando e organizzando sempre meglio!",
    stabile:  "Le tue funzioni esecutive sono stabili. Qualche esercizio in più le porterà al livello successivo!",
    calo:     "Le tue funzioni esecutive hanno bisogno di allenamento. Riprendi gli esercizi e torneranno a salire!",
  },
  Visuospaziali: {
    crescita: "Le tue abilità visuospaziali stanno migliorando. Stai percependo e orientandoti sempre meglio!",
    stabile:  "Le tue abilità visuospaziali sono stabili. Continua ad allenarti per migliorare ancora!",
    calo:     "Le tue abilità visuospaziali hanno bisogno di allenamento. Riprendi gli esercizi!",
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

function DettaglioGiorno({ dateStr }: { dateStr: string }) {
  // TODO: sostituire con fetch da Supabase — SELECT * FROM sessioni WHERE data = dateStr
  const sessioni = mockStoricoGiornaliero.find((g) => g.data === dateStr)?.sessioni ?? [];
  const d = new Date(dateStr);
  const label = `${NOMI_GIORNO_IT[d.getDay()]} ${d.getDate()} ${MESI_SHORT_IT[d.getMonth()]}`;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = dateStr === todayStr;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base font-bold text-ink">{isToday ? "Oggi" : label}</p>
      {sessioni.length === 0 ? (
        isToday ? (
          <div className="flex flex-col">
            <p className="text-base" style={{ color: COLORS.inkSecondary }}>
              Ancora nessuna attività oggi
            </p>
            <Link
              href={`/esercizi/${mockEsercizioDelGiorno.id}`}
              className="text-base font-semibold underline"
              style={{ color: COLORS.primary }}
            >
              Vai all'esercizio del giorno
            </Link>
          </div>
        ) : (
          <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.surfaceAlt }}>
            <p className="text-sm font-semibold" style={{ color: COLORS.inkSecondary }}>
              Nessuna attività in questo giorno
            </p>
          </div>
        )
      ) : (
        <div className="flex flex-col">
          {sessioni.map((s, i) => {
            const cc = CATEGORIA_COLORS[s.categoria.toLowerCase()];
            const catLabel = s.categoria.charAt(0).toUpperCase() + s.categoria.slice(1);
            return (
              <div key={i} className="flex items-center gap-3 py-3" style={{ borderTop: i > 0 ? `1px solid ${COLORS.border}` : undefined }}>
                <div
                  className="w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cc?.bg ?? COLORS.background }}
                >
                  <AppIcon name={s.icona} size={24} color={cc?.text ?? COLORS.primary} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-normal text-ink truncate">{s.nome_esercizio}</p>
                  <p className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>{catLabel} · Livello {s.livello}/6</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
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

// ── Tab Attività ─────────────────────────────────────────────────────────────

type FiltroAttivita = "tutti" | "memoria" | "attenzione" | "linguaggio" | "esecutive" | "visuospaziali";
const FILTRO_LABEL: Record<FiltroAttivita, string> = {
  tutti: "Tutti", memoria: "Memoria", attenzione: "Attenzione", linguaggio: "Linguaggio",
  esecutive: "Esecutive", visuospaziali: "Visuospaziali",
};

const FILTRO_ICONA: Record<string, string> = Object.fromEntries(
  mockCategorie.map((c) => [c.id, c.icona])
);

function FiltroPills({ filtro, setFiltro }: { filtro: FiltroAttivita; setFiltro: (f: FiltroAttivita) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {(["tutti", "memoria", "attenzione", "linguaggio", "esecutive", "visuospaziali"] as FiltroAttivita[]).map((f) => {
        const isActive = filtro === f;
        const cc = f !== "tutti" ? CATEGORIA_COLORS[f] : null;
        const icona = FILTRO_ICONA[f];
        const iconColor = isActive ? "#FFFFFF" : (cc?.text ?? COLORS.inkMuted);
        return (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold flex-shrink-0 transition-all"
            style={{
              backgroundColor: isActive ? (cc?.text ?? COLORS.primary) : "#E6E7EB",
              color: isActive ? "#FFFFFF" : COLORS.inkMuted,
            }}
          >
            {icona && <AppIcon name={icona} size={17} color={iconColor} />}
            {FILTRO_LABEL[f]}
          </button>
        );
      })}
    </div>
  );
}

function AttivitaTab({ filtro: filtroExt, setFiltro: setFiltroExt, hidePills }: {
  filtro?: FiltroAttivita;
  setFiltro?: (f: FiltroAttivita) => void;
  hidePills?: boolean;
} = {}) {
  const [filtroInt, setFiltroInt] = useState<FiltroAttivita>("tutti");
  const filtro    = filtroExt    ?? filtroInt;
  const setFiltro = setFiltroExt ?? setFiltroInt;
  const [periodo, setPeriodo] = useState<Periodo>("settimana");

  // TODO: sostituire con query Supabase — SELECT categoria, livello, trend, sessioni FROM progressi WHERE utente_id = ?
  const filteredCats = filtro === "tutti"
    ? mockScoreCategorie
    : mockScoreCategorie.filter((c) => c.categoria.toLowerCase() === filtro);

  const activeColor = filtro === "tutti"
    ? COLORS.primary
    : (CATEGORIA_COLORS[filtro]?.text ?? COLORS.primary);

  // Build chart data
  const chartData = filtro === "tutti"
    ? (() => {
        const refData = buildPeriodData(mockScoreCategorie[0].storicoLivello, periodo);
        return refData.map((point, i) => {
          const obj: Record<string, unknown> = { label: point.label };
          mockScoreCategorie.forEach((cat) => {
            const catData = buildPeriodData(cat.storicoLivello, periodo);
            obj[cat.categoria] = catData[i]?.livello ?? undefined;
          });
          return obj;
        });
      })()
    : buildPeriodData(
        mockScoreCategorie.find((c) => c.categoria.toLowerCase() === filtro)?.storicoLivello ?? [],
        periodo
      ).map((d) => ({ label: d.label, livello: d.livello ?? undefined }));

  // Stats
  const livelloMedio       = Math.round(filteredCats.reduce((s, c) => s + c.livello, 0) / filteredCats.length);
  const dominiInCrescita   = filteredCats.filter((c) => c.trend === "crescita").length;
  const sessioniTotali     = filteredCats.reduce((s, c) => s + c.sessioni, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter pills — nascoste se gestite esternamente */}
      {!hidePills && <FiltroPills filtro={filtro} setFiltro={setFiltro} />}

      {/* Chart card */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-ink">Andamento generale</span>
          {/* Dropdown periodo */}
          <AppSelect
            size="sm"
            direction="down"
            value={periodo}
            onChange={(v) => setPeriodo(v as Periodo)}
            options={(["settimana", "mese", "anno"] as Periodo[]).map((p) => ({ value: p, label: PERIODO_LABEL[p] }))}
          />
        </div>

        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: COLORS.inkMuted }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[1, 10]}
                ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                tickFormatter={(v) => `L.${v}`}
                tick={{ fontSize: 9, fill: COLORS.inkMuted }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: 8, fontSize: 12 }}
                formatter={(v, name) => [v != null ? `L.${v}` : "", name]}
              />
              {filtro === "tutti"
                ? mockScoreCategorie.map((cat) => {
                    const cc = CATEGORIA_COLORS[cat.categoria.toLowerCase()];
                    return (
                      <Line
                        key={cat.categoria}
                        type="monotone"
                        dataKey={cat.categoria}
                        stroke={cc?.text ?? COLORS.primary}
                        strokeWidth={2}
                        dot={{ fill: cc?.text ?? COLORS.primary, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    );
                  })
                : (
                  <Line
                    type="monotone"
                    dataKey="livello"
                    stroke={activeColor}
                    strokeWidth={2}
                    dot={{ fill: activeColor, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                )
              }
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.surface }}>
        {filtro === "tutti" ? (
          <>
            <div className="grid grid-cols-2" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <div className="p-4" style={{ borderRight: `1px solid ${COLORS.border}` }}>
                <p className="text-2xl font-extrabold" style={{ color: activeColor }}>{livelloMedio}</p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>Livello medio</p>
              </div>
              <div className="p-4">
                <p className="text-2xl font-extrabold" style={{ color: activeColor }}>{dominiInCrescita}/{filteredCats.length}</p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>Domini in crescita</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-2xl font-extrabold" style={{ color: activeColor }}>{sessioniTotali}</p>
              <p className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>Sessioni totali</p>
            </div>
          </>
        ) : (() => {
          const cat = filteredCats[0];
          const trendArrow = { crescita: "↑", stabile: "→", calo: "↓" }[cat.trend];
          return (
            <div className="grid grid-cols-2">
              <div className="p-4" style={{ borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
                <p className="text-2xl font-extrabold" style={{ color: activeColor }}>{cat.score}%</p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>Accuratezza</p>
              </div>
              <div className="p-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <p className="text-2xl font-extrabold" style={{ color: activeColor }}>{cat.livello}</p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>Livello attuale</p>
              </div>
              <div className="p-4" style={{ borderRight: `1px solid ${COLORS.border}` }}>
                <p className="text-2xl font-extrabold" style={{ color: activeColor }}>{cat.sessioni}</p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>Sessioni totali</p>
              </div>
              <div className="p-4">
                <p className="text-2xl font-extrabold" style={{ color: activeColor }}>{trendArrow}</p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>Andamento</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Testo discorsivo */}
      {filtro === "tutti" ? (
        <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSecondary }}>
          Stai andando molto bene! Hai risposto correttamente alla maggior parte delle domande. Continua così, ogni giorno fa la differenza.
        </p>
      ) : filteredCats.length === 1 && (
        <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSecondary }}>
          {TREND_TEXTS[filteredCats[0].categoria]?.[filteredCats[0].trend] ?? ""}
        </p>
      )}
    </div>
  );
}

type Tab = "attivita" | "storico" | "medaglie";

export default function ProgressiPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) ?? "attivita");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filtroGuest, setFiltroGuest] = useState<FiltroAttivita>("tutti");
  const { medaglie: medaglieIds, isGuest } = useUserStore();

  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null;
    if (t) setTab(t);
  }, [searchParams]);

  useEffect(() => {
    if (isGuest) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isGuest]);
  const medaglieGuadagnate = mockMedaglie.filter((m) => medaglieIds.includes(m.id));

  return (
    <div className="flex flex-col" style={isGuest ? { overflow: "hidden", height: "100dvh" } : undefined}>
      {/* ── Header + Tabs ────────────────────────────────────────────── */}
      <div className="bg-surface px-4 pt-6 pb-0 sticky top-0 z-10 shadow-card">
        <div className="flex items-center gap-2 mb-0">
          <h1 className="text-2xl font-extrabold text-ink">I tuoi progressi</h1>
        </div>
        <div className="flex mt-4">
          {([["attivita", "Attività"], ["storico", "Storico"], ["medaglie", "Medaglie"]] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-base font-semibold border-b-2 transition-all"
              style={{
                borderColor: tab === t ? COLORS.primary : "transparent",
                color: tab === t ? COLORS.primary : COLORS.inkMuted,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter pills per guest — visibili sopra il blur nel tab Attività */}
      {isGuest && tab === "attivita" && (
        <div className="px-4 pt-3 pb-2 flex-shrink-0" style={{ backgroundColor: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}>
          <FiltroPills filtro={filtroGuest} setFiltro={setFiltroGuest} />
        </div>
      )}

      <div className="relative flex flex-col gap-4 px-4 pt-4 flex-1">
        {/* ── Tab: Attività ────────────────────────────────────────── */}
        {tab === "attivita" && (
          isGuest
            ? <AttivitaTab filtro={filtroGuest} setFiltro={setFiltroGuest} hidePills={true} />
            : <AttivitaTab />
        )}

        {/* ── Tab: Storico ──────────────────────────────────────────── */}
        {tab === "storico" && (() => {
          // TODO: sostituire con query Supabase — SELECT count(*) FROM sessioni WHERE data >= inizio_settimana / settimana_scorsa
          const diff = totaleSettimana - mockTotaleSettimanaScorsa;
          const stato: "meglio" | "stabile" | "peggio" =
            diff > 0 ? "meglio" : diff === 0 ? "stabile" : "peggio";

          const stateConfig = {
            meglio: {
              bg: COLORS.successLight,
              color: COLORS.success,
              icon: "↑",
              label: "In crescita",
              txt: `Questa settimana hai fatto +${diff} esercizi rispetto alla settimana scorsa.`,
            },
            stabile: {
              bg: "#F5F5F5",
              color: "#6B7280",
              icon: "→",
              label: "Stabile",
              txt: `Questa settimana hai fatto lo stesso numero di esercizi della settimana scorsa.`,
            },
            peggio: {
              bg: "#FEF2F2",
              color: "#DC2626",
              icon: "↓",
              label: "In calo",
              txt: `Questa settimana hai fatto ${Math.abs(diff)} esercizi in meno rispetto alla settimana scorsa.`,
            },
          }[stato];

          return (
            <>
              <CalendarioMensile
                streak={buildStreakFromStorico()}
                selectedDate={selectedDate}
                onDaySelect={(d) => setSelectedDate(d || null)}
              >
                <div className="rounded-xl p-4 flex flex-col gap-1" style={{ backgroundColor: stateConfig.bg }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold" style={{ color: stateConfig.color }}>{stateConfig.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: stateConfig.color }}>{stateConfig.label}</span>
                  </div>
                  <p className="text-xs" style={{ color: stateConfig.color }}>{stateConfig.txt}</p>
                </div>
              </CalendarioMensile>
              {(() => {
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                return <DettaglioGiorno dateStr={selectedDate ?? todayStr} />;
              })()}
            </>
          );
        })()}

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

        {/* ── Overlay upsell — solo ospite ─────────────────────────── */}
        {isGuest && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 py-12"
            style={{ backdropFilter: "blur(10px)", background: "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1))", zIndex: 20 }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <p className="text-lg font-bold text-ink text-center">
              Sblocca la tua esperienza completa
            </p>
            <Link href="/onboarding/registrati" className="w-full max-w-xs">
              <button
                className="w-full py-3 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: COLORS.primary }}
              >
                Registrati gratuitamente
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
