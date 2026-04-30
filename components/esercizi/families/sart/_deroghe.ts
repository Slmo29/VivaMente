/**
 * components/esercizi/families/sart/_deroghe.ts
 *
 * DEROGHE GDD UX-DRIVEN per la famiglia SART numerico.
 *
 * Questo file isola tutte le deviazioni dal GDD letterale
 * (docs/gdd/families/sart.md, docs/gdd/shared/02-trial-flow.md)
 * adottate per migliorare l'UX su utenti senior 60+.
 *
 * Per tornare al comportamento GDD strict (validità clinica massima):
 *   - SART_DEROGA_LUNGHEZZA_BLOCCO = 1.0
 *   - SART_DEROGA_FEEDBACK_VERDE   = false
 *
 * Le deroghe sono motivate dal trade-off MVP: validità statistica delle
 * metriche aggregate non è compromessa su volume di sessioni multiple,
 * mentre l'aderenza dell'utente al protocollo cresce significativamente.
 * Da rivalutare con dati clinici reali post-pilot.
 */

/**
 * Moltiplicatore applicato a sequenceLength di ogni livello.
 * 1.0 = GDD letterale (lv 1: 50 stimoli, lv 20: 200).
 * 0.4 = riduzione 60% (lv 1: 20 stimoli/30s, lv 20: 80 stimoli/56s).
 *
 * GDD §Tabella livelli prescrive lunghezze esatte calibrate per sustained
 * attention. Riduzione MVP per ridurre frustrazione del primo blocco lungo.
 */
export const SART_DEROGA_LUNGHEZZA_BLOCCO = 0.4;

/**
 * Abilita feedback visivo positivo (cifra verde 100ms) sul tap corretto
 * di un non-target. true = deroga; false = GDD strict (error-only).
 *
 * GDD shared/02-trial-flow.md §Feedback risposta + sart.md §Eccezioni
 * prescrivono "no feedback su corretto" per non interrompere il flusso
 * di sustained attention (Robertson 1997). Deroga MVP per supporto
 * cognitivo senior — il pulse motorio da solo è troppo discreto.
 */
export const SART_DEROGA_FEEDBACK_VERDE = true;

/** Colore tinta cifra su tap corretto (gated da SART_DEROGA_FEEDBACK_VERDE). */
export const SART_FEEDBACK_VERDE_COLORE = "#16A34A";

/** Durata tinta verde in ms (gated da SART_DEROGA_FEEDBACK_VERDE). */
export const SART_FEEDBACK_VERDE_DURATA_MS = 100;
