"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { mockProgressiSettimanali } from "@/lib/mock-data";
import { COLORS } from "@/lib/design-tokens";

const GIORNI = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const oggiNome = GIORNI[new Date().getDay()];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload?.length) {
    return (
      <div className="bg-surface rounded-md shadow-card px-3 py-2 border border-border">
        <p className="text-sm font-bold text-ink">{label}</p>
        <p className="text-base font-extrabold" style={{ color: COLORS.primary }}>
          {payload[0].value} esercizi
        </p>
      </div>
    );
  }
  return null;
}

export default function GraficoAttivita() {
  return (
    <>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={mockProgressiSettimanali} margin={{ top: 5, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="giorno" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: COLORS.inkMuted, fontWeight: 600 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: COLORS.inkMuted }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: `${COLORS.primaryLight}44`, radius: 8 }} />
          <Bar dataKey="esercizi" radius={[8, 8, 4, 4]} maxBarSize={40}>
            {mockProgressiSettimanali.map((entry) => (
              <Cell
                key={entry.giorno}
                fill={entry.giorno === oggiNome ? COLORS.streak : entry.esercizi > 0 ? COLORS.primary : "#E2E8F0"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 justify-center">
        {[
          { c: COLORS.primary, l: "Completato" },
          { c: COLORS.streak, l: "Oggi" },
          { c: "#E2E8F0", l: "Nessun esercizio" },
        ].map((x) => (
          <div key={x.l} className="flex items-center gap-1.5 text-xs" style={{ color: COLORS.inkMuted }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: x.c }} />
            {x.l}
          </div>
        ))}
      </div>
    </>
  );
}
