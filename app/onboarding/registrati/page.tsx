"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Btn from "@/components/ui/btn";
import { useUserStore, type CanalNotifica } from "@/lib/store";
import { COLORS } from "@/lib/design-tokens";
import { MessageText, Mail, Whatsapp, ArrowLeft } from "iconoir-react";
import StepLines from "@/components/ui/step-lines";
import { MagicLinkAnimation } from "@/components/ui/magic-link-animation";

const ORE = ["07:00","08:00","09:00","10:00","11:00","12:00","14:00","16:00","18:00","20:00","21:00"];
const CANALI: { id: CanalNotifica; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "sms",      label: "SMS" },
  { id: "email",    label: "Email" },
];

const inputCls = `w-full min-h-[56px] rounded-md px-4 text-base bg-white text-ink border-2 border-[#E2E8F0]
  focus:outline-none focus:border-[#1891B1] transition-colors placeholder-[#5A5A72]`;

type ToggleBtn = { id: string; label: string };

function ToggleGroup({ options, value, onChange }: {
  options: ToggleBtn[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="flex-1 min-h-[48px] rounded-full text-sm font-semibold border-2 transition-all"
            style={{
              backgroundColor: active ? COLORS.primary : "transparent",
              borderColor: active ? COLORS.primary : "#D1D5DB",
              color: active ? "#FFFFFF" : COLORS.inkMuted,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function OrarioSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [aperto, setAperto] = useState(false);

  useEffect(() => {
    document.body.style.overflow = aperto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [aperto]);

  return (
    <div style={{ position: "relative" }}>
      {aperto && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
          onPointerDown={() => setAperto(false)}
        />
      )}
      <button
        type="button"
        onPointerDown={() => setAperto((v) => !v)}
        className="w-full min-h-[56px] rounded-md px-4 text-base bg-white text-ink border-2 transition-colors text-left flex items-center justify-between"
        style={{ borderColor: aperto ? "#1891B1" : "#E2E8F0", color: value ? "#1A1A2E" : "#5A5A72", position: "relative", zIndex: 41 }}
      >
        <span>{value || "Seleziona un orario"}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transition: "transform 0.2s", transform: aperto ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M4 6l4 4 4-4" stroke="#5A5A72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {aperto && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 4px)", left: 0, right: 0,
          backgroundColor: "#fff", border: "2px solid #1891B1", borderRadius: 10,
          boxShadow: "0 -4px 24px rgba(0,0,0,0.12)", zIndex: 50,
          maxHeight: 240, overflowY: "auto",
        }}>
          {ORE.map((o) => (
            <button
              key={o}
              type="button"
              onPointerDown={() => { onChange(o); setAperto(false); }}
              className="w-full px-4 text-left text-base"
              style={{
                minHeight: 48,
                backgroundColor: value === o ? `${COLORS.primary}12` : "transparent",
                color: value === o ? COLORS.primary : "#1A1A2E",
                fontWeight: value === o ? 600 : 400,
                borderBottom: "1px solid #F1F5F9",
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OnboardingRegistratiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromLogin = searchParams.get("from") === "login";
  const { setUser, isGuest } = useUserStore();

  const [nome, setNome]         = useState("");
  const [telefono, setTel]      = useState("");
  const [email, setEmail]       = useState("");
  const [emailToccata, setEmailToccata] = useState(false);
  const [promemoria, setPromemoria] = useState<"si" | "no" | null>(null);
  const [canale, setCanale]     = useState<CanalNotifica | null>(null);
  const [orario, setOrario]     = useState("");
  const [step, setStep]         = useState<"form" | "magic">("form");

  const vuolePromemoria = promemoria === "si";
  const canaleScelto = canale ?? "sms";

  function isEmailValida(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  const emailObbligatoria = vuolePromemoria && canale === "email";
  const orarioObbligatorio = vuolePromemoria;
  const emailErrore = emailObbligatoria && emailToccata && email && !isEmailValida(email);
  const formValido =
    !!nome &&
    !!telefono &&
    (!emailObbligatoria || (!!email && isEmailValida(email))) &&
    (!orarioObbligatorio || !!orario);

  function handleContinua() {
    if (!formValido) return;
    setUser({
      nome,
      telefono,
      email: email || undefined,
      canale_notifica: vuolePromemoria ? canaleScelto : undefined,
      orario_notifica: vuolePromemoria ? orario : undefined,
      consenso_notifiche: vuolePromemoria,
    });
    setStep("magic");
  }

  function handleSenzaRegistrazione() {
    setUser({ nome: nome || "Mario", canale_notifica: "whatsapp", orario_notifica: "09:00", isGuest: true });
    router.push("/home");
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto px-5 pt-6 pb-56" style={{ backgroundColor: COLORS.background }}>
      {isGuest ? (
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 mb-4 text-sm font-semibold"
          style={{ color: COLORS.primary }}
        >
          <ArrowLeft width={20} height={20} strokeWidth={1.5} color={COLORS.primary} />
          Torna alla home
        </button>
      ) : (
        !fromLogin && <StepLines current={4} />
      )}

      {step === "form" ? (
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">Crea il tuo profilo per salvare i tuoi progressi</h1>
          </div>

          {/* Nome */}
          <div>
            <label className="text-sm font-bold text-ink-secondary block mb-2">Nome *</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
              placeholder="Il tuo nome" className={inputCls} />
          </div>

          {/* Telefono */}
          <div>
            <label className="text-sm font-bold text-ink-secondary block mb-2">Numero di telefono *</label>
            <input type="tel" value={telefono} onChange={(e) => setTel(e.target.value.replace(/[^\d\s+\-()]/g, ""))}
              placeholder="+39 333 123 4567" className={inputCls} inputMode="tel" />
          </div>

          {/* Promemoria toggle */}
          <div>
            <label className="text-sm font-bold text-ink-secondary block mb-2">Vuoi un promemoria giornaliero?</label>
            <ToggleGroup
              options={[{ id: "si", label: "Sì" }, { id: "no", label: "No" }]}
              value={promemoria}
              onChange={(v) => setPromemoria(v as "si" | "no")}
            />
          </div>

          {/* Sezione promemoria condizionale */}
          {vuolePromemoria && (
            <>
              {/* Canale */}
              <div>
                <label className="text-sm font-bold text-ink-secondary block mb-2">Come vuoi essere avvisato?</label>
                <ToggleGroup
                  options={CANALI}
                  value={canale}
                  onChange={(v) => setCanale(v as CanalNotifica)}
                />
              </div>

              {/* Email condizionale */}
              {canale === "email" && (
                <div>
                  <label className="text-sm font-bold text-ink-secondary block mb-2">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailToccata(true)}
                    placeholder="tua@email.it"
                    className={inputCls}
                    style={emailErrore ? { borderColor: "#C62828" } : undefined}
                  />
                  {emailErrore && (
                    <p style={{ fontSize: 12, color: "#C62828", marginTop: 4 }}>Inserisci un indirizzo email valido</p>
                  )}
                </div>
              )}

              {/* Orario */}
              <div>
                <label className="text-sm font-bold text-ink-secondary block mb-2">A che ora? *</label>
                <OrarioSelect value={orario} onChange={setOrario} />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center" style={{ flex: 1 }}>
          {canale === "email"
            ? <Mail     width={64} height={64} strokeWidth={1.5} color={COLORS.primary} />
            : canale === "whatsapp"
            ? <Whatsapp width={64} height={64} strokeWidth={1.5} color="#25D366" />
            : <MessageText width={64} height={64} strokeWidth={1.5} color={COLORS.primary} />
          }
          <div className="flex flex-col items-center" style={{ gap: "1rem" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E" }}>
              {canale === "email" ? "Controlla la tua email!" : "Controlla il tuo telefono!"}
            </h1>
            <p style={{ fontSize: 18, color: "#5A5A72", lineHeight: 1.7 }}>
              {canale === "email"
                ? <>Ti abbiamo inviato un link all'indirizzo<br /><strong style={{ color: "#1A1A2E" }}>{email}</strong>.<br />Clicca il link per entrare.</>
                : canale === "whatsapp"
                ? <>Ti abbiamo inviato un link su WhatsApp<br />al numero <strong style={{ color: "#1A1A2E" }}>{telefono}</strong>.<br />Clicca il link per entrare.</>
                : <>Ti abbiamo inviato un link via SMS<br />al numero <strong style={{ color: "#1A1A2E" }}>{telefono}</strong>.<br />Clicca il link per entrare.</>
              }
            </p>
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 48 }}>
            <div style={{ backgroundColor: `${COLORS.primary}12`, borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ fontSize: 13, color: "#5A5A72", margin: 0 }}>
                {canale === "email"
                  ? "Ecco come apparirà la tua mail:"
                  : canale === "whatsapp"
                  ? "Ecco come apparirà il messaggio sul tuo telefono:"
                  : "Ecco come apparirà il messaggio sul tuo telefono:"}
              </p>
            </div>
            <MagicLinkAnimation canale={canaleScelto} />
          </div>
        </div>
      )}

      {/* Link fissi — solo nella fase magic */}
      {step === "magic" && (
        <div className="fixed bottom-6 left-0 right-0 px-5 max-w-lg mx-auto flex flex-col items-center gap-3">
          <p style={{ fontSize: 18, color: "#1A1A2E" }}>
            Non hai ricevuto nulla?{" "}
            <button style={{ color: COLORS.primary, fontWeight: 500, fontSize: 18 }}>
              Invia di nuovo
            </button>
          </p>
          <button onClick={() => setStep("form")} style={{ color: COLORS.primary, fontWeight: 500, fontSize: 18 }}>
            Cambia contatto
          </button>
        </div>
      )}

      {/* Bottone fisso — solo nella fase form */}
      {step === "form" && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto" style={{ zIndex: 60 }}>
          {/* Fade gradient sopra il box */}
          <div
            className="pointer-events-none"
            style={{
              height: 60,
              background: `linear-gradient(to bottom, transparent, ${COLORS.background})`,
            }}
          />
          {/* Box footer opaco */}
          <div className="flex flex-col gap-3 items-center px-5 pb-8 pt-3" style={{ backgroundColor: COLORS.background }}>
          <Btn size="lg" onClick={handleContinua} disabled={!formValido}>
            Registrati
          </Btn>
          {vuolePromemoria && (
            <p className="text-center" style={{ fontSize: 13, color: COLORS.inkMuted }}>
              Registrandoti accetti di ricevere il promemoria.<br />Puoi disattivarlo quando vuoi.
            </p>
          )}
          {!fromLogin && !isGuest && (
            <button onClick={handleSenzaRegistrazione} className="text-sm text-center" style={{ color: COLORS.primary }}>
              Continua senza registrarti
            </button>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
