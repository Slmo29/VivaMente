"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { mockProgressiSettimanali } from "@/lib/mock-data";
import { COLORS, CATEGORIA_COLORS } from "@/lib/design-tokens";

const GIORNO_INDEX: Record<string, number> = { Lun: 1, Mar: 2, Mer: 3, Gio: 4, Ven: 5, Sab: 6, Dom: 7 };
const jsDay = new Date().getDay();
const oggiIndex = jsDay === 0 ? 7 : jsDay;

const MEM_COLOR  = CATEGORIA_COLORS["memoria"]?.text    ?? "#7C3AED";
const ATT_COLOR  = CATEGORIA_COLORS["attenzione"]?.text ?? "#DB2777";
const LIN_COLOR  = CATEGORIA_COLORS["linguaggio"]?.text ?? "#16A34A";

// Azzera i valori dei giorni futuri così le barre non appaiono
const dati = mockProgressiSettimanali.map((g) => {
  const isFuturo = GIORNO_INDEX[g.giorno] > oggiIndex;
  return isFuturo
    ? { giorno: g.giorno, memoria: 0, attenzione: 0, linguaggio: 0, futuro: true }
    : { giorno: g.giorno, memoria: g.memoria, attenzione: g.attenzione, linguaggio: g.linguaggio, futuro: false };
});

function CustomTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  if (!payload) return null;
  const isFuturo = GIORNO_INDEX[payload.value] > oggiIndex;
  return (
    <text x={x} y={(y ?? 0) + 12} textAnchor="middle" fontSize={14} fontWeight={600}
      fill={isFuturo ? "#D1D5DB" : COLORS.inkMuted}>
      {payload.value}
    </text>
  );
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string
}) {
  if (!active || !payload?.length) return null;
  const items = payload.filter((p) => p.value > 0);
  if (!items.length) return null;
  const LABEL: Record<string, string> = { memoria: "Memoria", attenzione: "Attenzione", linguaggio: "Linguaggio" };
  return (
    <div className="bg-surface rounded-md shadow-card-md px-3 py-2 border border-border">
      <p className="text-sm font-bold text-ink mb-1">{label}</p>
      {items.map((p) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {LABEL[p.name] ?? p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function GraficoSettimanale() {
  return (
    <>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={dati} margin={{ top: 10, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="giorno" axisLine={false} tickLine={false} tick={<CustomTick />} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: COLORS.inkMuted }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: `${COLORS.primaryLight}44`, radius: 8 }} />
          <Bar dataKey="memoria"    stackId="a" fill={MEM_COLOR} radius={[0, 0, 0, 0]} maxBarSize={40} />
          <Bar dataKey="attenzione" stackId="a" fill={ATT_COLOR} radius={[0, 0, 0, 0]} maxBarSize={40} />
          <Bar dataKey="linguaggio" stackId="a" fill={LIN_COLOR} radius={[8, 8, 4, 4]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 mt-2">
        {[
          { color: MEM_COLOR, label: "Memoria" },
          { color: ATT_COLOR, label: "Attenzione" },
          { color: LIN_COLOR, label: "Linguaggio" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-xs" style={{ color: COLORS.inkMuted }}>{l.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
