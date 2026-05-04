/**
 * components/esercizi/families/verbal-fluency/levels.ts
 *
 * Livelli 1–10 per Verbal Fluency (Semantica + Fonemica). Modello B, 1 trial.
 * Timer per-trial gestito nella session; getSessionDurationMs → null.
 *
 * Micro-progressione: tLimMs −5 s per trial bonus (floor 30 s).
 * Promozione inter-livello: score ≥ scoreThreshold.
 */

export type VFBanda = "molto_ampia" | "media";

export interface VFLevelConfig {
  livello:         number;
  tLimMs:          number;    // durata trial in ms
  scoreThreshold:  number;    // parole valide minime per "corretto"
  bandaCategoria:  VFBanda;   // per semantica
  letterPool:      string[];  // per fonemica (lettere disponibili al livello)
  trialsPerSession: number;
}

export const VF_MICRO_DELTA    = -5_000;
export const VF_MICRO_MAX_OVER = 2;
export const VF_TLIM_FLOOR_MS  = 30_000;

export const VF_LEVELS: readonly VFLevelConfig[] = [
  { livello:  1, tLimMs: 60_000, scoreThreshold:  5, bandaCategoria: "molto_ampia", letterPool: ["A","E","S"],                trialsPerSession: 1 },
  { livello:  2, tLimMs: 60_000, scoreThreshold:  6, bandaCategoria: "molto_ampia", letterPool: ["A","E","S"],                trialsPerSession: 1 },
  { livello:  3, tLimMs: 60_000, scoreThreshold:  7, bandaCategoria: "molto_ampia", letterPool: ["A","E","S","C"],            trialsPerSession: 1 },
  { livello:  4, tLimMs: 55_000, scoreThreshold:  7, bandaCategoria: "molto_ampia", letterPool: ["A","E","S","C","R"],        trialsPerSession: 1 },
  { livello:  5, tLimMs: 55_000, scoreThreshold:  8, bandaCategoria: "molto_ampia", letterPool: ["A","E","S","C","R","P"],    trialsPerSession: 1 },
  { livello:  6, tLimMs: 55_000, scoreThreshold:  8, bandaCategoria: "media",       letterPool: ["A","E","S","C","R","P","M"],trialsPerSession: 1 },
  { livello:  7, tLimMs: 50_000, scoreThreshold:  9, bandaCategoria: "media",       letterPool: ["A","E","S","C","R","P","M"],trialsPerSession: 1 },
  { livello:  8, tLimMs: 50_000, scoreThreshold:  9, bandaCategoria: "media",       letterPool: ["B","D","F","G"],            trialsPerSession: 1 },
  { livello:  9, tLimMs: 50_000, scoreThreshold: 10, bandaCategoria: "media",       letterPool: ["B","D","F","G","L"],        trialsPerSession: 1 },
  { livello: 10, tLimMs: 50_000, scoreThreshold: 10, bandaCategoria: "media",       letterPool: ["B","D","F","G","L","T"],    trialsPerSession: 1 },
];

export function getVFLevel(livello: number): VFLevelConfig {
  return VF_LEVELS[Math.min(10, Math.max(1, livello)) - 1];
}
