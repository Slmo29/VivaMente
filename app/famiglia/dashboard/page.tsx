"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Btn from "@/components/ui/btn";
import Modal from "@/components/ui/modal";
import GraficoAttivita from "@/components/famiglia/GraficoAttivita";
import { useUserStore } from "@/lib/store";
import { mockMedaglie } from "@/lib/mock-data";
import { COLORS } from "@/lib/design-tokens";
import { AppIcon } from "@/lib/icons";
import { Mail, CheckCircle, WarningTriangle, FireFlame, Gym, Medal, ChatBubble } from "iconoir-react";

const MESSAGGI_PRESET = [
  "❤️ Bravissimo, continua così!",
  "🏆 Sei il mio campione!",
  "🧠 Il tuo cervello ti ringrazia!",
  "🌟 Sono orgoglioso/a di te!",
  "💪 Non mollare, stai andando alla grande!",
];

function ModalIncoraggiamento({ open, onClose, nomeDestinatario }: {
  open: boolean; onClose: () => void; nomeDestinatario: string;
}) {
  const [selezionato, setSelezionato] = useState<string | null>(null);
  const [testo, setTesto] = useState("");
  const [inviato, setInviato] = useState(false);

  function handleInvia() {
    setInviato(true);
    setTimeout(() => { setInviato(false); setSelezionato(null); setTesto(""); onClose(); }, 2500);
  }

  if (inviato) {
    return (
      <Modal open={open} onClose={onClose}>
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Mail width={56} height={56} strokeWidth={1.5} color={COLORS.primary} />
          </div>
          <h3 className="text-xl font-extrabold text-ink mb-2">Messaggio inviato!</h3>
          <p className="flex items-center justify-center gap-2 text-base font-semibold" style={{ color: COLORS.success }}>
            <CheckCircle width={18} height={18} strokeWidth={1.5} color={COLORS.success} />
            {nomeDestinatario} ha ricevuto il tuo messaggio!
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={`Scrivi a ${nomeDestinatario}`}>
      <div className="flex flex-col gap-3">
        <p className="text-base text-ink-secondary">Scegli un messaggio o scrivine uno tu:</p>
        {MESSAGGI_PRESET.map((msg) => (
          <button
            key={msg}
            onClick={() => { setSelezionato(msg); setTesto(""); }}
            className="text-left min-h-[56px] px-4 py-3 rounded-md text-base font-medium border-2 transition-all active:scale-[0.98]"
            style={{
              borderColor: selezionato === msg && !testo ? COLORS.primary : COLORS.border,
              backgroundColor: selezionato === msg && !testo ? `${COLORS.primaryLight}44` : COLORS.surface,
              color: selezionato === msg && !testo ? COLORS.primary : COLORS.inkSecondary,
            }}
          >
            {msg}
          </button>
        ))}
        <textarea
          value={testo}
          onChange={(e) => { setTesto(e.target.value); setSelezionato(null); }}
          placeholder="Oppure scrivi qualcosa di tuo..."
          rows={3}
          className="w-full rounded-md px-4 py-3 text-base bg-background border-2 border-border text-ink resize-none focus:outline-none focus:border-primary"
        />
        <Btn size="lg" onClick={handleInvia} disabled={!testo && !selezionato}>
          Invia
        </Btn>
      </div>
    </Modal>
  );
}

export default function FamigliaDashboardPage() {
  const { nome, streak, esercizi_completati, medaglie: medaglieIds } = useUserStore();
  const [showIncoraggiamento, setShowIncoraggiamento] = useState(false);
  const medaglieGuadagnate = mockMedaglie.filter((m) => medaglieIds.includes(m.id));
  const ultimeTre = medaglieGuadagnate.slice(-3);
  const giorniSenza = 0;

  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col" style={{ backgroundColor: COLORS.background }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-surface px-4 pt-8 pb-5 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/profilo"
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl active:scale-95"
            style={{ backgroundColor: COLORS.surfaceAlt, color: COLORS.primary }}>
            ←
          </Link>
          <div>
            <p className="text-xs text-ink-muted font-medium uppercase tracking-wide">Vista familiare</p>
            <h1 className="text-xl font-extrabold text-ink">Il percorso di {nome}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4 pb-10">
        {/* Banner attività */}
        {giorniSenza > 2 ? (
          <div className="rounded-lg px-4 py-4 flex items-start gap-3 border-2"
            style={{ backgroundColor: COLORS.warningLight, borderColor: `${COLORS.warning}44` }}>
            <WarningTriangle width={24} height={24} strokeWidth={1.5} color={COLORS.warning} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-bold" style={{ color: COLORS.warning }}>
                {nome} non si allena da {giorniSenza} giorni.
              </p>
              <p className="text-sm" style={{ color: COLORS.warning }}>Mandagli un messaggio di incoraggiamento!</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg px-4 py-4 flex items-start gap-3 border-2"
            style={{ backgroundColor: COLORS.successLight, borderColor: `${COLORS.success}44` }}>
            <CheckCircle width={24} height={24} strokeWidth={1.5} color={COLORS.success} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-bold" style={{ color: COLORS.success }}>{nome} si è allenato oggi!</p>
              <p className="text-sm" style={{ color: COLORS.success }}>Ottimo, continua a supportarlo!</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <FireFlame width={32} height={32} strokeWidth={1.5} color={COLORS.streak} />, valore: streak, label: "streak", bg: COLORS.streakLight, color: COLORS.streak },
            { icon: <Gym width={32} height={32} strokeWidth={1.5} color={COLORS.primary} />, valore: esercizi_completati, label: "esercizi", bg: COLORS.primaryLight, color: COLORS.primary },
            { icon: <Medal width={32} height={32} strokeWidth={1.5} color={COLORS.gold} />, valore: medaglieGuadagnate.length, label: "medaglie", bg: COLORS.goldLight, color: COLORS.gold },
          ].map((s) => (
            <Card key={s.label} padding="sm" className="text-center" style={{ backgroundColor: s.bg, boxShadow: "none" }}>
              <div className="flex justify-center">{s.icon}</div>
              <p className="text-xl font-extrabold mt-1" style={{ color: s.color }}>{s.valore}</p>
              <p className="text-xs text-ink-muted">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Ultimo esercizio */}
        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: COLORS.successLight }}>
              <CheckCircle width={24} height={24} strokeWidth={1.5} color={COLORS.success} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-muted">Ultimo esercizio</p>
              <p className="text-base font-bold text-ink">Oggi alle 09:14</p>
              <p className="text-sm text-ink-muted">Ricorda le Parole — 80%</p>
            </div>
          </div>
        </Card>

        {/* Grafico */}
        <Card padding="md">
          <h3 className="text-base font-bold text-ink mb-4">Esercizi ultimi 7 giorni</h3>
          <GraficoAttivita />
        </Card>

        {/* Ultime medaglie */}
        {ultimeTre.length > 0 && (
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Medal width={18} height={18} strokeWidth={1.5} color={COLORS.gold} />
              <h3 className="text-base font-bold text-ink">Ultime medaglie</h3>
            </div>
            <div className="flex flex-col gap-2">
              {ultimeTre.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-md p-3"
                  style={{ backgroundColor: COLORS.goldLight }}>
                  <AppIcon name={(m as { icona?: string }).icona ?? "star"} size={24} color={COLORS.gold} />
                  <div>
                    <p className="text-sm font-bold text-ink">{m.nome}</p>
                    <p className="text-xs text-ink-muted">{(m as { descrizione?: string }).descrizione ?? ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CTA */}
        <Btn size="lg" onClick={() => setShowIncoraggiamento(true)}>
          <ChatBubble width={20} height={20} strokeWidth={1.5} color="white" className="inline mr-2" />
          Manda un incoraggiamento
        </Btn>
      </div>

      <ModalIncoraggiamento
        open={showIncoraggiamento}
        onClose={() => setShowIncoraggiamento(false)}
        nomeDestinatario={nome}
      />
    </div>
  );
}
