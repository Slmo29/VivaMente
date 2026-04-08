"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import { mockEsercizi, mockCategorie } from "@/lib/mock-data";
import { CATEGORIA_COLORS, COLORS } from "@/lib/design-tokens";
import { AppIcon } from "@/lib/icons";
import { Timer } from "iconoir-react";

const TABS = [
  { id: "tutti",      label: "Tutti" },
  { id: "memoria",    label: "Memoria" },
  { id: "attenzione", label: "Attenzione" },
  { id: "linguaggio", label: "Linguaggio" },
];

export default function EserciziPage() {
  const [tab, setTab] = useState("tutti");

  const eserciziFiltrati =
    tab === "tutti" ? mockEsercizi : mockEsercizi.filter((e) => e.categoria_id === tab);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header + Tabs ────────────────────────────────────────────── */}
      <div className="bg-surface px-4 pt-6 pb-0 sticky top-0 z-10 shadow-card">
        <h1 className="text-2xl font-extrabold text-ink">I tuoi esercizi</h1>

        {/* Tab bar */}
        <div className="flex mt-4 overflow-x-auto scrollbar-none -mx-4 px-4">
          {TABS.map((t) => {
            const active = tab === t.id;
            const cc = t.id !== "tutti" ? CATEGORIA_COLORS[t.id] : null;
            const cat = t.id !== "tutti" ? mockCategorie.find((c) => c.id === t.id) : null;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-base font-semibold border-b-2 transition-all mr-1"
                style={{
                  borderColor: active ? COLORS.primary : "transparent",
                  color: active ? COLORS.primary : COLORS.inkMuted,
                }}
              >
                {cat && (
                  <AppIcon
                    name={cat.icona}
                    size={18}
                    color={active ? COLORS.primary : COLORS.inkMuted}
                  />
                )}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Lista esercizi ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-4 pt-4">
        {eserciziFiltrati.map((esercizio) => {
          const cat = mockCategorie.find((c) => c.id === esercizio.categoria_id);
          const cc = cat ? CATEGORIA_COLORS[cat.id] : null;

          return (
            <Link key={esercizio.id} href={`/esercizi/${esercizio.id}`}>
              <Card
                padding="md"
                className="active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-4">
                  {/* Icona */}
                  <div
                    className="w-14 h-14 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cc?.bg ?? COLORS.surfaceAlt }}
                  >
                    <AppIcon
                      name={cat?.icona ?? "brain"}
                      size={32}
                      color={cc?.text ?? COLORS.primary}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-ink leading-snug">{esercizio.titolo}</h3>
                    <div className="flex items-center gap-1 text-xs" style={{ color: COLORS.inkMuted }}>
                      <Timer width={14} height={14} strokeWidth={1.5} color={COLORS.inkMuted} />
                      <span>{Math.ceil((esercizio.durata_stimata ?? 60) / 60)} minuti</span>
                      <span>·</span>
                      <span>Livello {esercizio.livello}/6</span>
                    </div>
                  </div>

                  {/* Freccia centrata verticalmente */}
                  <span className="text-ink-muted text-xl flex-shrink-0">›</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
