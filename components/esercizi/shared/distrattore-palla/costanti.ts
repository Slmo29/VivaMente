/**
 * components/esercizi/shared/distrattore-palla/costanti.ts
 *
 * Parametri timing/dimensioni del componente BouncingBall (distrattore motorio
 * MLT). Esportati per calibrazione futura e test isolati. GDD non prescrive
 * valori specifici — vedi docs/gdd/shared/04-memory-types.md §22-39.
 */

/** Diametro palla in px (mobile-friendly, tap-target ≥48px). */
export const PALLA_DIAMETRO_PX = 64;

/**
 * Magnitudo velocità iniziale in px/ms (~300px/s). Valore conservativo
 * per essere percepibile su mobile senza causare affaticamento visivo.
 */
export const PALLA_VELOCITA_PX_MS = 0.3;

/** Colore palla (Tailwind blue-600). */
export const PALLA_COLORE = "#2563EB";

/** Colore sfondo stage (Tailwind white). */
export const STAGE_COLORE = "#FFFFFF";

/** Colore testo countdown (Tailwind gray-400, sub-discreto in alto). */
export const COUNTDOWN_COLORE = "#9CA3AF";
