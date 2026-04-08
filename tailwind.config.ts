import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Tipografia ─────────────────────────────────────────────────────────
      fontSize: {
        xs:   ["16px", { lineHeight: "1.5" }],
        sm:   ["18px", { lineHeight: "1.6" }],
        base: ["20px", { lineHeight: "1.6" }],
        lg:   ["22px", { lineHeight: "1.5" }],
        xl:   ["26px", { lineHeight: "1.4" }],
        "2xl":["32px", { lineHeight: "1.3" }],
        "3xl":["40px", { lineHeight: "1.2" }],
      },

      // ── Colori ─────────────────────────────────────────────────────────────
      colors: {
        background: "#F4F7F8",
        surface:    "#FFFFFF",
        "surface-alt": "#E8F6FA",

        primary: {
          DEFAULT:    "#1891B1",
          light:      "#E8F6FA",
          dark:       "#1478A0",
          foreground: "#FFFFFF",
        },

        accent1: { DEFAULT: "#7B4FA6", light: "#EDE0F5" }, // Memoria
        accent2: { DEFAULT: "#2E7D52", light: "#D4EDDA" }, // Linguaggio
        accent3: { DEFAULT: "#C2185B", light: "#FCE4EC" }, // Attenzione

        ink: {
          DEFAULT:   "#1A1A2E",
          secondary: "#5A5A72",
          muted:     "#5A5A72",
        },

        success: {
          DEFAULT:    "#2E7D52",
          light:      "#C8E6C9",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#E06C2A",
          light:   "#FFE0B2",
        },
        streak: {
          DEFAULT: "#B45309",
          light:   "#FEF3C7",
        },
        gold: {
          DEFAULT: "#E8A020",
          light:   "#FDE68A",
        },

        border: "#E2E8F0",
      },

      // ── Border radius ──────────────────────────────────────────────────────
      borderRadius: {
        sm:   "12px",
        md:   "12px",
        lg:   "12px",
        xl:   "12px",
        full: "9999px",
      },

      // ── Ombre ─────────────────────────────────────────────────────────────
      boxShadow: {
        card:  "0 2px 12px 0 rgba(0,0,0,0.06)",
        "card-md": "0 4px 20px 0 rgba(0,0,0,0.08)",
        "card-lg": "0 8px 32px 0 rgba(24,145,177,0.12)",
        nav:   "0 -2px 24px rgba(0,0,0,0.08)",
        float: "0 8px 32px rgba(0,0,0,0.14)",
      },

      // ── Spacing touch target ───────────────────────────────────────────────
      minHeight: {
        touch: "60px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
