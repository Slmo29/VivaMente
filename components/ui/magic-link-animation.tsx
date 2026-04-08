"use client";

import { MessageText, Mail, Whatsapp } from "iconoir-react";
import { COLORS } from "@/lib/design-tokens";

export type MagicLinkCanale = "sms" | "whatsapp" | "email";

const WHATSAPP_GREEN = "#25D366";
const WHATSAPP_DARK  = "#128C7E";

function channelConfig(canale: MagicLinkCanale) {
  switch (canale) {
    case "whatsapp": return {
      headerBg:        "#E8F9ED",
      headerLabel:     "WHATSAPP · ORA",
      headerIcon:      <Whatsapp width={14} height={14} strokeWidth={1.5} color={WHATSAPP_GREEN} />,
      bubbleBg:        "#DCF8C6",
      bubbleBorder:    WHATSAPP_GREEN,
      linkColor:       WHATSAPP_DARK,
      messagePrefix:   "BrainTrainer:",
      messageLinkText: "clicca qui per accedere →",
    };
    case "email": return {
      headerBg:        `${COLORS.primary}18`,
      headerLabel:     "EMAIL · ORA",
      headerIcon:      <Mail width={14} height={14} strokeWidth={1.5} color={COLORS.primary} />,
      bubbleBg:        "#DCF8C6",
      bubbleBorder:    COLORS.primary,
      linkColor:       COLORS.primary,
      messagePrefix:   "",
      messageLinkText: "Il tuo link di accesso è pronto →",
    };
    default: return {
      headerBg:        `${COLORS.primary}18`,
      headerLabel:     "SMS · ORA",
      headerIcon:      <MessageText width={14} height={14} strokeWidth={1.5} color={COLORS.primary} />,
      bubbleBg:        "#DCF8C6",
      bubbleBorder:    COLORS.primary,
      linkColor:       COLORS.primary,
      messagePrefix:   "BrainTrainer:",
      messageLinkText: "clicca qui per accedere →",
    };
  }
}

export function MagicLinkAnimation({ canale }: { canale: MagicLinkCanale }) {
  const cfg = channelConfig(canale);

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          backgroundColor: cfg.bubbleBg,
          border: `2px solid ${cfg.bubbleBorder}`,
          borderRadius: 16,
          padding: "12px 14px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: cfg.headerBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {cfg.headerIcon}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            {cfg.headerLabel}
          </span>
        </div>

        {/* Message */}
        <p style={{ fontSize: 13, color: "#1A1A2E", margin: 0, lineHeight: 1.5 }}>
          {cfg.messagePrefix && <>{cfg.messagePrefix}{" "}</>}
          <span style={{ color: cfg.linkColor, textDecoration: "underline", fontWeight: 600 }}>
            {cfg.messageLinkText}
          </span>
        </p>
      </div>
    </div>
  );
}
