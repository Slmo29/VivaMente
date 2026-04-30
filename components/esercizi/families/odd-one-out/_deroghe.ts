/**
 * components/esercizi/families/odd-one-out/_deroghe.ts
 *
 * DEROGHE GDD UX-DRIVEN per Odd One Out (decisione 2026-04-30).
 *
 * 1. Timer sessione 60s fisso. GDD prescrive 90/120/180s decrescenti per
 *    livello (riga 75-78). Deroga: timer fisso 60s per ogni livello.
 *    Motivazione: sessione corta = engagement alto per senior.
 *
 * 2. T.Lim default per lv 1-12. GDD prescrive tLimMs=null per lv 1-12,
 *    introduce T.Lim solo da lv 13. Senza T.Lim, se l'utente non tappa
 *    durante un trial e il timer pagina scade, il trial resta bloccato
 *    (TrialFlow non forza il timeout senza tLimMs). Deroga: T.Lim 8s
 *    default per lv 1-12, evita blocco e dà tempo ragionevole.
 *    Lv 13-20 mantiene il T.Lim GDD (10000→5000ms).
 *
 * Per tornare al GDD strict:
 *   - ODD_ONE_OUT_TIMER_MS = 0 (delega a getOddOneOutLevel().sessionDurationMs)
 *   - ODD_ONE_OUT_TLIM_DEFAULT_MS = null
 */

/** Durata sessione in ms. Sostituisce sessionDurationMs della tabella levels. */
export const ODD_ONE_OUT_TIMER_MS = 60_000;

/**
 * T.Lim default per livelli con `tLimMs=null` nella tabella GDD (lv 1-12).
 * I lv 13+ hanno T.Lim esplicito GDD e questo default non si applica.
 */
export const ODD_ONE_OUT_TLIM_DEFAULT_MS = 8_000;

/**
 * Soglia gating beta per `numeri_lettere`. Lv ≥ 11 richiederebbe regole
 * astratte (range numerico, divisibilità, gruppo fonologico) clinicamente
 * non giocabili per senior senza display esplicito del criterio. Decisione
 * UX-driven 2026-04-30: limitiamo `numeri_lettere` a lv 1-10 (categoriale).
 * Per lv 11+ utente passa a `odd_one_out_immagini` (ricche di regole
 * semantico/astratto su 8 categorie + tag visivi/astratti).
 *
 * Per rimuovere il gating: SOGLIA_GATING_NUMERI_LETTERE = 21 (= mai gating).
 */
export const SOGLIA_GATING_NUMERI_LETTERE = 11;
