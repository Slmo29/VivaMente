// ─── Design Tokens — BrainTrainer UI Redesign ────────────────────────────────
// Importa da qui — mai colori hardcoded nei componenti.

export const COLORS = {
  // Sfondi
  background: "#F4F7F8",
  surface: "#FFFFFF",
  surfaceAlt: "#E8F6FA",

  // Primario — blu/azzurro
  primary: "#1891B1",
  primaryLight: "#E8F6FA",
  primaryDark: "#1478A0",

  // Accenti
  accent1: "#7B4FA6",      // viola  — Memoria
  accent1Light: "#EDE0F5",
  accent2: "#2E7D52",      // verde  — Linguaggio
  accent2Light: "#D4EDDA",
  accent3: "#C2185B",      // rosa   — Attenzione
  accent3Light: "#FCE4EC",

  // Testo
  inkPrimary: "#1A1A2E",
  inkSecondary: "#5A5A72",
  inkMuted: "#5A5A72",

  // Feedback
  success: "#2E7D52",
  successLight: "#C8E6C9",
  warning: "#E06C2A",
  warningLight: "#FFE0B2",

  // Gamification
  streak: "#B45309",
  streakLight: "#FEF3C7",
  gold: "#E8A020",
  goldLight: "#FDE68A",

  // Alias di comodo
  border: "#E2E8F0",
  ink: "#1A1A2E",
} as const;

// Mappa colori per categoria esercizi
export const CATEGORIA_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  memoria:    { bg: "#EDE0F5", text: "#7B4FA6", border: "#7B4FA6" },
  attenzione: { bg: "#FCE4EC", text: "#C2185B", border: "#C2185B" },
  linguaggio: { bg: "#D4EDDA", text: "#2E7D52", border: "#2E7D52" },
};

// Difficoltà badge
export const DIFFICOLTA_STYLE: Record<string, { bg: string; text: string }> = {
  facile:    { bg: "#D4EDDA", text: "#1B5E20" },
  medio:     { bg: "#FEF3C7", text: "#B45309" },
  difficile: { bg: "#FCE4EC", text: "#C2185B" },
};
