"use client";

import { useState } from "react";
import Link from "next/link";
import Btn from "@/components/ui/btn";
import { COLORS } from "@/lib/design-tokens";
import { MessageText, Mail } from "iconoir-react";
import StepLines from "@/components/ui/step-lines";
import { MagicLinkAnimation } from "@/components/ui/magic-link-animation";

const inputCls = `w-full min-h-[56px] rounded-md px-4 text-base bg-white text-ink border-2 border-[#E2E8F0]
  focus:outline-none focus:border-[#1891B1] transition-colors placeholder-[#5A5A72]`;

function isEmail(value: string) {
  return value.includes("@");
}

function isPhone(value: string) {
  return /^[\d\s+\-()]{6,}$/.test(value.trim());
}

export default function AccediPage() {
  const [contatto, setContatto] = useState("");
  const [inviato, setInviato] = useState(false);

  const tipo = isEmail(contatto) ? "email" : isPhone(contatto) ? "telefono" : null;
  const prontoPer = contatto.trim().length >= 6 && tipo !== null;
  const animCanale = tipo === "email" ? "email" : "sms";

  function handleInvia() {
    if (!prontoPer) return;
    setInviato(true);
  }

  return (
    <div
      className="min-h-screen flex flex-col px-5 pt-6 pb-36 max-w-lg mx-auto"
      style={{ backgroundColor: COLORS.background }}
    >

      {!inviato ? (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">Bentornato</h1>
            <p className="text-base mt-2 leading-relaxed" style={{ color: "#5A5A72" }}>
              Inserisci il numero di telefono o l'email con cui ti sei iscritto
              e ti invieremo un link per continuare il tuo allenamento.
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-ink-secondary block mb-2">
              Email o numero di telefono
            </label>
            <input
              type="text"
              value={contatto}
              onChange={(e) => setContatto(e.target.value)}
              placeholder="Email o numero di telefono"
              className={inputCls}
              inputMode={tipo === "email" || !tipo ? "email" : "tel"}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center" style={{ flex: 1 }}>
          {tipo === "email"
            ? <Mail width={64} height={64} strokeWidth={1.5} color={COLORS.primary} />
            : <MessageText width={64} height={64} strokeWidth={1.5} color={COLORS.primary} />
          }
          <div className="flex flex-col items-center" style={{ gap: "1rem" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E" }}>
              {tipo === "email" ? "Controlla la tua email!" : "Controlla il tuo telefono!"}
            </h1>
            <p style={{ fontSize: 18, color: "#5A5A72", lineHeight: 1.7 }}>
              {tipo === "email"
                ? <>Ti abbiamo inviato un link a<br /><strong style={{ color: "#1A1A2E" }}>{contatto}</strong>.<br />Clicca il link per entrare.</>
                : <>Ti abbiamo inviato un link al numero<br /><strong style={{ color: "#1A1A2E" }}>{contatto}</strong>.<br />Clicca il link per entrare.</>
              }
            </p>
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 48 }}>
            <div style={{ backgroundColor: `${COLORS.primary}12`, borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ fontSize: 13, color: "#5A5A72", margin: 0 }}>
                {tipo === "email"
                  ? "Ecco come apparirà la tua mail:"
                  : "Ecco come apparirà il messaggio sul tuo telefono:"}
              </p>
            </div>
            <MagicLinkAnimation canale={animCanale} />
          </div>
        </div>
      )}

      {/* Link fissi — magic link inviato */}
      {inviato && (
        <div className="fixed bottom-6 left-0 right-0 px-5 max-w-lg mx-auto flex flex-col items-center gap-3">
          <p style={{ fontSize: 18, color: "#1A1A2E" }}>
            Non hai ricevuto nulla?{" "}
            <button onClick={() => setInviato(false)} style={{ color: COLORS.primary, fontWeight: 500, fontSize: 18 }}>
              Invia di nuovo
            </button>
          </p>
          <button onClick={() => setInviato(false)} style={{ color: COLORS.primary, fontWeight: 500, fontSize: 18 }}>
            Cambia {tipo === "email" ? "email" : "numero"}
          </button>
        </div>
      )}

      {/* Bottone fisso — form */}
      {!inviato && (
        <div className="fixed bottom-6 left-0 right-0 px-5 max-w-lg mx-auto flex flex-col items-center gap-3">
          <Btn size="lg" onClick={handleInvia} disabled={!prontoPer}>
            Invia link
          </Btn>
          <p className="text-sm text-ink-secondary">
            Non hai ancora un profilo?{" "}
            <Link href="/onboarding/registrati?from=login" style={{ color: COLORS.primary, fontWeight: 500 }}>
              Registrati
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
