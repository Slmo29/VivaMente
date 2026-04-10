"use client";

import { useEffect, useRef } from "react";
import { MessageText, Mail, Whatsapp } from "iconoir-react";
import { COLORS } from "@/lib/design-tokens";

export type MagicLinkCanale = "sms" | "whatsapp" | "email";

const WHATSAPP_GREEN = "#25D366";
const WHATSAPP_DARK  = "#128C7E";

function channelConfig(canale: MagicLinkCanale) {
  switch (canale) {
    case "whatsapp": return {
      headerBg:        "#E8F9ED",
      headerLabel:     "WhatsApp - ORA",
      headerIcon:      <Whatsapp width={28} height={28} strokeWidth={1.5} color={WHATSAPP_GREEN} />,
      bubbleBg:        "#DCF8C6",
      bubbleBorder:    WHATSAPP_GREEN,
      linkColor:       WHATSAPP_DARK,
      messagePrefix:   "BrainTrainer:",
      messageLinkText: "clicca qui per accedere →",
    };
    case "email": return {
      headerBg:        `${COLORS.primary}18`,
      headerLabel:     "Email - ORA",
      headerIcon:      <Mail width={28} height={28} strokeWidth={1.5} color={COLORS.primary} />,
      bubbleBg:        "#FFFFFF",
      bubbleBorder:    COLORS.primary,
      linkColor:       COLORS.primary,
      messagePrefix:   "",
      messageLinkText: "Il tuo link di accesso è pronto →",
    };
    default: return {
      headerBg:        `${COLORS.primary}18`,
      headerLabel:     "SMS - ORA",
      headerIcon:      <MessageText width={28} height={28} strokeWidth={1.5} color={COLORS.primary} />,
      bubbleBg:        "#FFFFFF",
      bubbleBorder:    COLORS.primary,
      linkColor:       COLORS.primary,
      messagePrefix:   "BrainTrainer:",
      messageLinkText: "clicca qui per accedere →",
    };
  }
}

export function MagicLinkAnimation({ canale }: { canale: MagicLinkCanale }) {
  const cfg = channelConfig(canale);
  const msgRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.style.animation = "none";
      void msgRef.current.offsetHeight; // reflow
      msgRef.current.style.animation = "";
    }
  }, [canale]);

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .magic-message {
          animation: fade-in-up 0.4s ease-out both;
        }
      `}</style>

      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            backgroundColor: cfg.bubbleBg,
            border: `2px solid ${cfg.bubbleBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "12px 14px 12px 12px",
            gap: 14,
          }}
        >
          {/* Icona grande a sinistra — quadrato con lati visibili */}
          <div style={{
            width: 52,
            height: 52,
            flexShrink: 0,
            borderRadius: 10,
            backgroundColor: cfg.headerBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {cfg.headerIcon}
          </div>

          {/* Testo a destra */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF" }}>
              {cfg.headerLabel}
            </span>
            <p ref={msgRef} className="magic-message" style={{ fontSize: 13, color: "#1A1A2E", margin: 0, lineHeight: 1.5 }}>
              {cfg.messagePrefix && <>{cfg.messagePrefix}{" "}</>}
              <span style={{ color: cfg.linkColor, textDecoration: "underline", fontWeight: 600 }}>
                {cfg.messageLinkText}
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
