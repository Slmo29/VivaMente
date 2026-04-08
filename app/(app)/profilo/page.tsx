"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Btn from "@/components/ui/btn";
import Toggle from "@/components/ui/toggle";
import Modal from "@/components/ui/modal";
import { useUserStore, type CanalNotifica, type Familiare } from "@/lib/store";
import { mockMedaglie } from "@/lib/mock-data";
import { COLORS } from "@/lib/design-tokens";
import { AppIcon } from "@/lib/icons";
import {
  User, EditPencil, CheckCircle, Calendar, Phone, Mail, Bell, Timer,
  ChatBubble, Medal, Group, Link as LinkIcon, Copy, FireFlame,
} from "iconoir-react";

const ORE = ["07:00","08:00","09:00","10:00","11:00","12:00","14:00","16:00","18:00","20:00","21:00"];
const ANNI = Array.from({ length: 61 }, (_, i) => 1990 - i);
const CANALI: { id: CanalNotifica; label: string; icona: string }[] = [
  { id: "whatsapp", label: "WhatsApp", icona: "chat" },
  { id: "sms",      label: "SMS",      icona: "phone" },
  { id: "email",    label: "Email",    icona: "mail" },
];

// ─── Helper: input style ─────────────────────────────────────────────────────
const inputCls = `w-full min-h-[56px] rounded-md px-4 text-base text-ink bg-background border-2 border-border
  focus:outline-none focus:border-primary transition-colors`;

// ─── Helper: sezione header ───────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: COLORS.primary }}>
      {children}
    </p>
  );
}

// ─── Sezione Informazioni ─────────────────────────────────────────────────────
function SezioneInfo() {
  const { nome, cognome, telefono, email, anno_nascita, setUser } = useUserStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ nome, cognome, telefono, email, anno_nascita });
  const [saved, setSaved] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [nuovoTelefono, setNuovoTelefono] = useState("");
  const [otpStep, setOtpStep] = useState<"phone"|"code"|"done">("phone");
  const [otpCode, setOtpCode] = useState("");

  function handleSave() {
    setUser(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleOTP() {
    if (otpStep === "phone" && nuovoTelefono) { setOtpStep("code"); return; }
    if (otpStep === "code" && otpCode.length >= 4) {
      setUser({ telefono: nuovoTelefono });
      setDraft((d) => ({ ...d, telefono: nuovoTelefono }));
      setOtpStep("done");
      setTimeout(() => { setShowOTP(false); setOtpStep("phone"); setNuovoTelefono(""); setOtpCode(""); }, 1800);
    }
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <SectionTitle>
          <User width={18} height={18} strokeWidth={1.5} color={COLORS.primary} />
          Le mie informazioni
        </SectionTitle>
        {!editing ? (
          <button
            onClick={() => { setDraft({ nome, cognome, telefono, email, anno_nascita }); setEditing(true); }}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-md transition-colors"
            style={{ color: COLORS.primary, backgroundColor: `${COLORS.primaryLight}55` }}
          >
            <EditPencil width={16} height={16} strokeWidth={1.5} color={COLORS.primary} />
            Modifica
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: COLORS.primary }}
          >
            <CheckCircle width={16} height={16} strokeWidth={1.5} color="white" />
            Salva
          </button>
        )}
      </div>

      {saved && (
        <div className="mb-3 px-4 py-3 rounded-md text-sm font-semibold text-center flex items-center justify-center gap-2"
          style={{ backgroundColor: COLORS.successLight, color: COLORS.success }}>
          <CheckCircle width={16} height={16} strokeWidth={1.5} color={COLORS.success} />
          Salvato con successo!
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Nome */}
        <InfoField
          label={<><User width={14} height={14} strokeWidth={1.5} color={COLORS.inkMuted} /> Nome</>}
          editing={editing}
        >
          {editing
            ? <input className={inputCls} value={draft.nome} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} />
            : <InfoValue>{nome || "—"}</InfoValue>}
        </InfoField>

        {/* Anno */}
        <InfoField
          label={<><Calendar width={14} height={14} strokeWidth={1.5} color={COLORS.inkMuted} /> Anno di nascita</>}
          editing={editing}
        >
          {editing
            ? <select className={inputCls} value={draft.anno_nascita} onChange={(e) => setDraft({ ...draft, anno_nascita: +e.target.value })}>
                {ANNI.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            : <InfoValue>{anno_nascita}</InfoValue>}
        </InfoField>

        {/* Telefono */}
        <InfoField
          label={<><Phone width={14} height={14} strokeWidth={1.5} color={COLORS.inkMuted} /> Telefono</>}
          editing={false}
        >
          <div className="flex items-center gap-3">
            <InfoValue>{telefono || "—"}</InfoValue>
            <button
              onClick={() => setShowOTP(true)}
              className="text-sm font-bold px-3 py-1.5 rounded-md"
              style={{ color: COLORS.primary, backgroundColor: `${COLORS.primaryLight}55` }}
            >
              Cambia
            </button>
          </div>
        </InfoField>

        {/* Email */}
        <InfoField
          label={<><Mail width={14} height={14} strokeWidth={1.5} color={COLORS.inkMuted} /> Email</>}
          editing={editing}
        >
          {editing
            ? <input className={inputCls} type="email" value={draft.email} placeholder="tua@email.it" onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            : <InfoValue>{email || <span className="text-ink-muted">non inserita</span>}</InfoValue>}
        </InfoField>
      </div>

      {/* Modal OTP cambio numero */}
      <Modal open={showOTP} onClose={() => { setShowOTP(false); setOtpStep("phone"); }} title="Cambia numero">
        {otpStep === "phone" && (
          <div className="flex flex-col gap-4">
            <p className="text-base text-ink-secondary">Nuovo numero di telefono</p>
            <input type="tel" value={nuovoTelefono} onChange={(e) => setNuovoTelefono(e.target.value)}
              placeholder="+39 333 000 0000" className={inputCls} />
            <Btn size="lg" onClick={handleOTP} disabled={!nuovoTelefono}>Invia codice SMS →</Btn>
          </div>
        )}
        {otpStep === "code" && (
          <div className="flex flex-col gap-4">
            <p className="text-base text-ink-secondary">Codice ricevuto su <strong>{nuovoTelefono}</strong></p>
            <input type="number" value={otpCode} onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
              placeholder="000000"
              className="w-full min-h-[64px] rounded-md px-4 text-2xl text-center bg-background border-2 border-border focus:outline-none focus:border-primary font-bold tracking-widest" />
            <Btn size="lg" onClick={handleOTP} disabled={otpCode.length < 4}>Verifica ✓</Btn>
          </div>
        )}
        {otpStep === "done" && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-3">
              <CheckCircle width={56} height={56} strokeWidth={1.5} color={COLORS.success} />
            </div>
            <p className="text-xl font-bold" style={{ color: COLORS.success }}>Numero aggiornato!</p>
          </div>
        )}
      </Modal>
    </Card>
  );
}

// ─── Sezione Notifiche ────────────────────────────────────────────────────────
function SezioneNotifiche() {
  const { consenso_notifiche, orario_notifica, canale_notifica, setUser } = useUserStore();
  const [saved, setSaved] = useState(false);

  function save(updates: Parameters<typeof setUser>[0]) {
    setUser(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card padding="md">
      <SectionTitle>
        <Bell width={18} height={18} strokeWidth={1.5} color={COLORS.primary} />
        Notifiche
      </SectionTitle>
      {saved && (
        <div className="mb-3 px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2"
          style={{ backgroundColor: COLORS.successLight, color: COLORS.success }}>
          <CheckCircle width={16} height={16} strokeWidth={1.5} color={COLORS.success} />
          Preferenze salvate!
        </div>
      )}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-ink">Promemoria giornaliero</p>
            <p className="text-sm text-ink-muted">Ricevi il reminder per allenarti</p>
          </div>
          <Toggle checked={consenso_notifiche} onChange={(v) => save({ consenso_notifiche: v })} />
        </div>

        {consenso_notifiche && (
          <>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-secondary mb-2">
                <Timer width={14} height={14} strokeWidth={1.5} color={COLORS.inkMuted} />
                Orario
              </p>
              <select value={orario_notifica} onChange={(e) => save({ orario_notifica: e.target.value })} className={inputCls}>
                {ORE.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-secondary mb-2">Canale preferito</p>
              <div className="grid grid-cols-3 gap-2">
                {CANALI.map((c) => (
                  <button key={c.id} onClick={() => save({ canale_notifica: c.id })}
                    className="min-h-[60px] rounded-md flex flex-col items-center justify-center gap-1 text-sm font-semibold border-2 transition-all"
                    style={{
                      borderColor: canale_notifica === c.id ? COLORS.primary : COLORS.border,
                      backgroundColor: canale_notifica === c.id ? `${COLORS.primaryLight}55` : COLORS.surface,
                      color: canale_notifica === c.id ? COLORS.primary : COLORS.inkMuted,
                    }}>
                    <AppIcon
                      name={c.icona}
                      size={22}
                      color={canale_notifica === c.id ? COLORS.primary : COLORS.inkMuted}
                    />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

// ─── Sezione Medaglie ─────────────────────────────────────────────────────────
function SezioneMedaglie() {
  const medaglieIds = useUserStore((s) => s.medaglie);
  const guadagnate = mockMedaglie.filter((m) => medaglieIds.includes(m.id)).slice(-3);

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <SectionTitle>
          <Medal width={18} height={18} strokeWidth={1.5} color={COLORS.primary} />
          Le mie medaglie
        </SectionTitle>
        <Link href="/progressi?tab=medaglie" className="text-sm font-semibold" style={{ color: COLORS.primary }}>
          Vedi tutte →
        </Link>
      </div>
      {guadagnate.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-3">Completa il primo esercizio!</p>
      ) : (
        <div className="flex flex-col gap-2">
          {guadagnate.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-md p-3"
              style={{ backgroundColor: COLORS.goldLight }}>
              <AppIcon name={m.icona} size={24} color={COLORS.gold} />
              <div>
                <p className="text-sm font-bold text-ink">{m.nome}</p>
                <p className="text-xs text-ink-muted">{m.descrizione}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Sezione Famiglia ─────────────────────────────────────────────────────────
function SezioneFamiglia() {
  const { familiari, aggiornaFamiliare, rimuoviFamiliare } = useUserStore();
  const [showInvita, setShowInvita] = useState(false);
  const [invitaInput, setInvitaInput] = useState("");
  const [linkGenerato, setLinkGenerato] = useState("");
  const [linkCopiato, setLinkCopiato] = useState(false);
  const [confirmRimuovi, setConfirmRimuovi] = useState<string | null>(null);

  function generaLink() {
    const token = Math.random().toString(36).slice(2, 10).toUpperCase();
    setLinkGenerato(`https://braintrainer.app/invito?token=${token}`);
  }

  function copiaLink() {
    navigator.clipboard.writeText(linkGenerato).catch(() => {});
    setLinkCopiato(true);
    setTimeout(() => setLinkCopiato(false), 2500);
  }

  const AVATAR_COLORS = ["#7B4FA6", "#2E7D52", "#C2185B", "#1891B1", "#B45309"];

  return (
    <>
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>
            <Group width={18} height={18} strokeWidth={1.5} color={COLORS.primary} />
            La mia famiglia
          </SectionTitle>
          <Link href="/famiglia/dashboard" className="text-sm font-semibold" style={{ color: COLORS.primary }}>
            Vista familiare →
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {familiari.map((f, i) => (
            <FamiliareCard
              key={f.id}
              familiare={f}
              avatarColor={AVATAR_COLORS[i % AVATAR_COLORS.length]}
              onAggiorna={(data) => aggiornaFamiliare(f.id, data)}
              onRimuovi={() => setConfirmRimuovi(f.id)}
            />
          ))}
          {familiari.length === 0 && (
            <p className="text-sm text-ink-muted text-center py-2">Nessun familiare collegato.</p>
          )}
        </div>

        <div className="mt-4">
          <Btn variant="outline" size="default" onClick={() => { setShowInvita(true); setLinkGenerato(""); setInvitaInput(""); }}>
            + Invita un familiare
          </Btn>
        </div>
      </Card>

      {/* Modal invita */}
      <Modal open={showInvita} onClose={() => setShowInvita(false)} title="Invita un familiare">
        <div className="flex flex-col gap-4">
          <p className="text-base text-ink-secondary">Numero di telefono o email del familiare</p>
          <input type="text" value={invitaInput} onChange={(e) => setInvitaInput(e.target.value)}
            placeholder="+39 333 ... oppure email@..." className={inputCls} />

          {!linkGenerato ? (
            <Btn size="lg" onClick={generaLink} disabled={!invitaInput}>
              <LinkIcon width={18} height={18} strokeWidth={1.5} color="white" className="inline mr-2" />
              Genera link di invito
            </Btn>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="rounded-md p-4 border-2" style={{ backgroundColor: COLORS.surfaceAlt, borderColor: COLORS.primaryLight }}>
                <p className="text-xs text-ink-muted mb-1 font-semibold uppercase tracking-wide">Link di invito</p>
                <p className="text-sm font-semibold break-all" style={{ color: COLORS.primary }}>{linkGenerato}</p>
              </div>
              <div className="rounded-md p-4" style={{ backgroundColor: COLORS.successLight }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: COLORS.success }}>Messaggio pronto</p>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.success }}>
                  "Ciao! Ti invito a seguire i miei progressi su BrainTrainer → {linkGenerato}"
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Btn variant={linkCopiato ? "success" : "outline"} size="default" onClick={copiaLink}>
                  <Copy width={16} height={16} strokeWidth={1.5} color={linkCopiato ? "white" : COLORS.primary} className="inline mr-1.5" />
                  {linkCopiato ? "Copiato!" : "Copia link"}
                </Btn>
                <Btn size="default" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Ciao! Seguimi su BrainTrainer → ${linkGenerato}`)}`, "_blank")}
                  className="bg-[#25D366] text-white border-0">
                  <ChatBubble width={16} height={16} strokeWidth={1.5} color="white" className="inline mr-1.5" />
                  WhatsApp
                </Btn>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal conferma rimozione */}
      <Modal open={confirmRimuovi !== null} onClose={() => setConfirmRimuovi(null)} title="Rimuovi familiare">
        <div className="flex flex-col gap-4">
          <p className="text-base text-ink-secondary leading-relaxed">
            Sei sicuro di voler rimuovere{" "}
            <strong>{familiari.find((f) => f.id === confirmRimuovi)?.nome}</strong>?
            Non potrà più vedere i tuoi progressi.
          </p>
          <Btn variant="danger" size="lg" onClick={() => { if (confirmRimuovi) rimuoviFamiliare(confirmRimuovi); setConfirmRimuovi(null); }}>
            Sì, rimuovi
          </Btn>
          <Btn variant="ghost" size="default" onClick={() => setConfirmRimuovi(null)}>Annulla</Btn>
        </div>
      </Modal>
    </>
  );
}

// ─── Card familiare ───────────────────────────────────────────────────────────
function FamiliareCard({ familiare, avatarColor, onAggiorna, onRimuovi }: {
  familiare: Familiare;
  avatarColor: string;
  onAggiorna: (data: Partial<Familiare>) => void;
  onRimuovi: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-md border-2 overflow-hidden" style={{ borderColor: COLORS.border }}>
      <button className="w-full flex items-center gap-3 p-4 bg-surface text-left" onClick={() => setExpanded(!expanded)}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black text-white flex-shrink-0"
          style={{ backgroundColor: avatarColor }}>
          {familiare.nome[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-ink">{familiare.nome}</p>
            <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-xs font-semibold text-[#16A34A]">Collegato</span>
          </div>
          <p className="text-sm text-ink-muted">{familiare.relazione} · da {familiare.collegato_da}</p>
        </div>
        <span className="text-ink-muted text-lg">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: COLORS.border, backgroundColor: COLORS.background }}>
          <p className="text-sm font-semibold text-ink-muted mb-3 uppercase tracking-wide">Permessi di accesso</p>
          <div className="flex flex-col gap-3">
            {(["attivita", "medaglie", "progressi"] as const).map((perm) => (
              <div key={perm} className="flex items-center justify-between">
                <span className="text-base text-ink capitalize">{perm}</span>
                <Toggle checked={familiare.permessi[perm]} onChange={(v) => onAggiorna({ permessi: { ...familiare.permessi, [perm]: v } })} />
              </div>
            ))}
          </div>
          <button onClick={onRimuovi} className="mt-3 text-sm font-semibold underline" style={{ color: "#C62828" }}>
            Rimuovi familiare
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Helper fields ────────────────────────────────────────────────────────────
function InfoField({ label, editing, children }: { label: React.ReactNode; editing: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: COLORS.inkMuted }}>
        {label}
      </p>
      {children}
      {!editing && <div className="mt-3 border-b border-border" />}
    </div>
  );
}

function InfoValue({ children }: { children: React.ReactNode }) {
  return <p className="text-base font-medium text-ink">{children}</p>;
}

// ─── Pagina principale ────────────────────────────────────────────────────────
export default function ProfiloPage() {
  const { nome, streak, medaglie: medaglieIds } = useUserStore();
  const medaglieCount = mockMedaglie.filter((m) => medaglieIds.includes(m.id)).length;
  const membroDal = "20 marzo 2025";

  return (
    <div className="flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-surface px-5 pt-8 pb-6 border-b border-border">
        <h1 className="text-2xl font-extrabold text-ink mb-5">Profilo</h1>
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-card-md flex-shrink-0"
            style={{ backgroundColor: COLORS.primary }}
          >
            {nome[0]?.toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-ink">{nome}</h2>
            <p className="text-sm text-ink-muted mt-0.5">Membro dal {membroDal}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: COLORS.streak }}>
                <FireFlame width={16} height={16} strokeWidth={1.5} color={COLORS.streak} />
                {streak} giorni
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: COLORS.gold }}>
                <Medal width={16} height={16} strokeWidth={1.5} color={COLORS.gold} />
                {medaglieCount} medaglie
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sezioni ───────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 flex flex-col gap-4">
        <SezioneInfo />
        <SezioneNotifiche />
        <SezioneMedaglie />
        <SezioneFamiglia />
      </div>
    </div>
  );
}
