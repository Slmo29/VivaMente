/**
 * components/esercizi/shared/qwerty-input/costanti.ts
 *
 * Layout tastiera virtuale italiana per QwertyInput. Tastiera senior-friendly
 * con tasti grandi (~50px alti). Solo lettere lowercase + apostrofo, niente
 * accenti grafici (NVdB filtrato per Recall Grid/Memoria Lista esclude accenti).
 *
 * 3 righe layout QWERTY standard italiana (no Z/Y swap nordeuropeo).
 */

/** Riga 1 (top, 10 tasti). */
export const RIGA_1: readonly string[] = ["q","w","e","r","t","y","u","i","o","p"];
/** Riga 2 (middle, 9 tasti). */
export const RIGA_2: readonly string[] = ["a","s","d","f","g","h","j","k","l"];
/** Riga 3 (bottom, 7 lettere; backspace + apostrofo + invio aggiunti ai lati). */
export const RIGA_3: readonly string[] = ["z","x","c","v","b","n","m"];

/** Lunghezza massima parola di default (override via prop). */
export const MAX_LUNGHEZZA_DEFAULT = 8;

/** Stile tasto base (px). Tap-target ≥48px (Apple HIG / Material). */
export const TASTO_HEIGHT_PX = 50;
export const TASTO_FONT_SIZE_REM = 1.25;

/** Colori tasti. */
export const TASTO_BG           = "#FFFFFF";
export const TASTO_BG_ACTIVE    = "#E5E7EB";
export const TASTO_BORDER       = "#D1D5DB";
export const TASTO_INVIO_BG     = "#16A34A";   // green-600
export const TASTO_INVIO_TXT    = "#FFFFFF";
export const TASTO_BACKSPACE_BG = "#F3F4F6";   // gray-100
