"use client";

/**
 * SartStream — mini-engine per lo scorrimento di un singolo blocco SART.
 *
 * Riceve un SartBlock pre-generato (sequenza + target + soaMs + maskingMs),
 * lo presenta stimolo-per-stimolo con timing proprio, accumula
 * commission/omission/RT, e al termine consegna un SartBlockEsito aggregato
 * via onRisposta. NON è un componente "stimolo" passivo: è un mini-engine
 * che vive un blocco intero.
 *
 * TrialFlow lo monta una volta per ogni trial valutativo (e per il bonus).
 * Cleanup completo dei timer su unmount: TrialFlow rimonta ad ogni blocco,
 * un timer pendente del blocco precedente sporcherebbe il successivo.
 *
 * Asimmetria di nomenclatura GDD ↔ runtime:
 *   - GDD §Tabella livelli usa "isiMs" per il SOA per-stimolo.
 *   - Lato runtime SartBlock espone "soaMs" per evitare il name-clash con
 *     l'isiMs di TrialFlow (= pausa 2s tra blocchi). Il rename avviene
 *     nell'Engine al momento di costruire SartBlock.
 *
 * Timing per-stimolo:
 *   durata_cifra = soaMs - maskingMs        (lv 10+, maskingMs !== null)
 *   durata_cifra = soaMs                    (lv 1–9, maskingMs === null)
 *
 *   Boundary lv 20: SOA 700, masking 350 → cifra 350ms + maschera 350ms.
 *
 * Tap window = solo fase "presenting". Durante "masking" il tap è ignorato:
 * clinicamente il trial è perceptually chiuso, lo stimolo non è più visibile.
 *
 * Flash rosso (error-only feedback, deroga GDD shared/02-trial-flow.md):
 *   - Commission (tap su target): flash immediato al tap, 150ms.
 *   - Omission  (mancato tap su non-target): flash a fine fase "presenting"
 *     (= momento in cui sappiamo che l'utente non ha tappato), 150ms.
 *     Si sovrappone alla fase "masking" se attiva (lv 10+); per lv 1–9
 *     si estende brevemente sullo stimolo successivo (overlay non bloccante).
 *
 * Fix UX (deploy 2026-04-29):
 *   - Reminder target sticky: banda inferiore "Tocca se NON è {target}"
 *     per supporto cognitivo continuo (utente senior, target facile da
 *     dimenticare nei blocchi lunghi).
 *   - Flash rosso ridisegnato come vignetta radiale (gradient da centro
 *     trasparente a rosso periferico 0.55 alpha): più visibile delle barre
 *     laterali, sguardo al centro non viene mai coperto.
 *   - Pulse motorio 60ms sul tap (scale 1→1.05→1): conferma di input,
 *     non di correttezza (GDD strict).
 *   - Barra di progresso intra-blocco (4px in alto, gray-400 su gray-200):
 *     supporto UX senior, il counter X/Y a livello pagina avanza solo a
 *     fine blocco — troppo "fermo" per il senior. Colore neutro.
 *   - Deroga GDD: feedback verde 100ms su tap corretto di non-target.
 *     Isolata in _deroghe.ts (SART_DEROGA_FEEDBACK_VERDE), gated. GDD strict
 *     prescrive error-only — deroga MVP per supporto cognitivo senior.
 *
 * Riferimenti:
 *   docs/gdd/families/sart.md §Meccanica core, §Masking (lv 10+),
 *                              §Eccezioni alle regole comuni
 *   docs/gdd/shared/02-trial-flow.md §Feedback risposta (eccezione SART)
 *   ./_deroghe.ts (tutte le deroghe UX-driven, gated)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { SartBlock, SartBlockEsito } from "./sequence";
import {
  SART_DEROGA_FEEDBACK_VERDE,
  SART_FEEDBACK_VERDE_COLORE,
  SART_FEEDBACK_VERDE_DURATA_MS,
} from "./_deroghe";

// ── Props ─────────────────────────────────────────────────────────────────────
// Nomi allineati al contratto renderStimolo di TrialFlow (stimolo, onRisposta).
// L'Engine tipizza TStimulus = SartBlock e TResponse = SartBlockEsito.

export type SartStreamProps = {
  stimolo:    SartBlock;
  onRisposta: (esito: SartBlockEsito) => void;
};

// ── Stato fase ────────────────────────────────────────────────────────────────

type Phase = "presenting" | "masking" | "done";

// ── Costanti ──────────────────────────────────────────────────────────────────

/** Durata flash rosso 150ms (error-only feedback SART, vignetta radiale). */
const FLASH_DURATION_MS = 150;
/** Durata pulse motorio della cifra al tap (conferma input, non correttezza). */
const TAP_PULSE_DURATION_MS = 60;

// ── Componente ────────────────────────────────────────────────────────────────

export function SartStream({ stimolo, onRisposta }: SartStreamProps) {
  const { sequenza, target, soaMs, maskingMs } = stimolo;

  // ── State (solo per render) ────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("presenting");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [flashAttivo, setFlashAttivo] = useState<boolean>(false);
  const [tapPulse, setTapPulse] = useState<boolean>(false);
  const [tapColore, setTapColore] = useState<string | null>(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  // I contatori vivono in useRef per evitare race tra closures e setState.
  // phaseRef e currentIndexRef sono mirror sincroni di phase/currentIndex,
  // aggiornati inline nelle callback dei timer (NON via auto-sync da render),
  // così handleTap legge sempre lo stato corrente senza dipendere dal commit.

  const timersRef            = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const phaseRef             = useRef<Phase>("presenting");
  const currentIndexRef      = useRef<number>(0);
  const tappatiRef           = useRef<Set<number>>(new Set<number>());
  const presentStartedAtRef  = useRef<number>(0);
  const commissionRef        = useRef<number>(0);
  const omissionRef          = useRef<number>(0);
  const tempoNontargetRef    = useRef<number>(0);
  const riportatoRef         = useRef<boolean>(false);

  // ── Helper timer ───────────────────────────────────────────────────────────

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) clearTimeout(id);
    timersRef.current = [];
  }, []);

  const triggerFlash = useCallback(() => {
    setFlashAttivo(true);
    const id = setTimeout(() => setFlashAttivo(false), FLASH_DURATION_MS);
    timersRef.current.push(id);
  }, []);

  // ── Handler tap ────────────────────────────────────────────────────────────
  // Idempotente per stimolo: tappatiRef.current.add(i) garantisce che ulteriori
  // tap nello stesso trial vengano ignorati (un solo evento per stimolo).

  const handleTap = useCallback(() => {
    if (phaseRef.current !== "presenting") return; // tap fuori finestra → ignora
    const i = currentIndexRef.current;
    if (tappatiRef.current.has(i)) return;          // doppio tap → ignora
    tappatiRef.current.add(i);

    // ── Pulse motorio sul tap (conferma input, non di correttezza) ──────────
    // Scatta SOLO in fase "presenting" (guard sopra). Coerente con GDD: nessun
    // feedback di correttezza, solo conferma motoria che il tap è stato accolto.
    setTapPulse(true);
    const pulseId = setTimeout(() => setTapPulse(false), TAP_PULSE_DURATION_MS);
    timersRef.current.push(pulseId);

    const stim = sequenza[i];
    if (stim === target) {
      // Commission: tap su target = failure of inhibition
      commissionRef.current += 1;
      triggerFlash();
    } else {
      // Non-target tappato correttamente: accumula RT
      tempoNontargetRef.current += performance.now() - presentStartedAtRef.current;

      // ── Deroga GDD: feedback verde su tap corretto ─────────────────────
      // Gated da SART_DEROGA_FEEDBACK_VERDE (vedi _deroghe.ts).
      // GDD strict prescrive error-only — la deroga è UX-driven per senior.
      if (SART_DEROGA_FEEDBACK_VERDE) {
        setTapColore(SART_FEEDBACK_VERDE_COLORE);
        const id = setTimeout(
          () => setTapColore(null),
          SART_FEEDBACK_VERDE_DURATA_MS,
        );
        timersRef.current.push(id);
      }
    }
  }, [sequenza, target, triggerFlash]);

  // ── Sequence runner ────────────────────────────────────────────────────────
  // Definito dentro useEffect mount-only. La sequenza è il blocco intero,
  // non cambia durante la vita del componente (TrialFlow rimonta su nuovo blocco).
  // Niente useEffect ricorsivo basato su currentIndex — il flusso si auto-schedula
  // via setTimeout. Cleanup su unmount svuota tutti i timer.

  useEffect(() => {
    const durataCifra = maskingMs !== null ? soaMs - maskingMs : soaMs;

    const completeBlock = () => {
      phaseRef.current = "done";
      setPhase("done");
      if (riportatoRef.current) return;
      riportatoRef.current = true;

      const targetTotali = sequenza.reduce(
        (acc, v) => (v === target ? acc + 1 : acc),
        0,
      );
      const nontargetTotali = sequenza.length - targetTotali;

      onRisposta({
        commissionErrori:        commissionRef.current,
        omissionErrori:          omissionRef.current,
        targetTotali,
        nontargetTotali,
        tempoTotaleNontargetMs:  tempoNontargetRef.current,
      });
    };

    const advanceOrDone = (i: number) => {
      if (i + 1 < sequenza.length) {
        startStimolo(i + 1);
      } else {
        completeBlock();
      }
    };

    const handleEndOfPresenting = (i: number) => {
      // Omission check al termine della finestra di accettazione: se non-target
      // e non tappato → omission + flash. Il flash si sovrappone alla fase
      // masking quando attiva, non blocca lo stimolo successivo.
      if (sequenza[i] !== target && !tappatiRef.current.has(i)) {
        omissionRef.current += 1;
        triggerFlash();
      }

      if (maskingMs !== null) {
        phaseRef.current = "masking";
        setPhase("masking");
        const id = setTimeout(() => advanceOrDone(i), maskingMs);
        timersRef.current.push(id);
      } else {
        advanceOrDone(i);
      }
    };

    const startStimolo = (i: number) => {
      currentIndexRef.current = i;
      phaseRef.current = "presenting";
      setCurrentIndex(i);
      setPhase("presenting");
      presentStartedAtRef.current = performance.now();

      const id = setTimeout(() => handleEndOfPresenting(i), durataCifra);
      timersRef.current.push(id);
    };

    startStimolo(0);

    // Cleanup difensivo: TrialFlow rimonta SartStream ad ogni blocco.
    return () => {
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  // Tap zone full-area (deroga vs Go/No-Go): il flusso è troppo veloce per
  // puntare un bottone discreto. L'intera area cliccabile è il "tap target".
  // Vedi §3 design doc.

  const progressoBlocco = ((currentIndex + 1) / sequenza.length) * 100;

  return (
    <div
      onClick={handleTap}
      className="flex items-center justify-center w-full h-full min-h-[400px] cursor-pointer select-none relative"
      style={{ backgroundColor: "#FFFFFF" }}
      aria-label="Area tap SART"
      role="button"
    >
      <span
        className="font-mono font-bold tabular-nums"
        style={{
          fontSize:    "8rem",
          color:       tapColore !== null ? tapColore : "#111827",   // gray-900 / verde su deroga
          fontFamily:  'ui-monospace, "JetBrains Mono", monospace',
          lineHeight:  1,
          transform:   tapPulse ? "scale(1.05)" : "scale(1)",
          transition:  "transform 30ms ease-out, color 60ms ease-out",
        }}
      >
        {phase === "presenting"
          ? sequenza[currentIndex]
          : phase === "masking"
            ? "#######"
            : ""}
      </span>

      {/* ── Barra di progresso intra-blocco (periferica, non emotiva) ─────── */}
      {/* Supporta UX senior: il counter X/Y in alto avanza solo a fine     */}
      {/* blocco (75s al lv 1), troppo "fermo" senza segnale di progresso.   */}
      {/* Colore neutro gray-400 per non sembrare feedback positivo o timer. */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: "4px", backgroundColor: "#E5E7EB" }}
        aria-hidden="true"
      >
        <div
          style={{
            height:          "100%",
            width:           `${progressoBlocco}%`,
            backgroundColor: "#9CA3AF",
            transition:      "width 300ms ease-out",
          }}
        />
      </div>

      {/* ── Flash rosso (vignetta radiale, error-only feedback) ───────────── */}
      {/* Sostituisce le barre laterali con un radial-gradient da centro      */}
      {/* trasparente a rosso periferico (0.55 alpha): più visibile,          */}
      {/* sguardo al centro mai coperto, transizione naturale.                */}
      {flashAttivo && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, transparent 30%, rgba(239, 68, 68, 0.55) 100%)",
          }}
          aria-hidden="true"
        />
      )}

      {/* ── Reminder target (banda inferiore) ────────────────────────────── */}
      {/* Supporto cognitivo continuo: il target è facile da dimenticare nei */}
      {/* blocchi lunghi. Wording allineato al tutorial ("Tocca tutti i      */}
      {/* numeri TRANNE il N"). Stile neutro non aggressivo. Pointer-events  */}
      {/* ereditati dal contenitore: il banner partecipa al tap zone.        */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
        style={{
          height:          "60px",
          paddingBottom:   "env(safe-area-inset-bottom, 0)",
          backgroundColor: "#F3F4F6",   // gray-100
          color:           "#374151",   // gray-700
          fontFamily:      'ui-monospace, "JetBrains Mono", monospace',
          fontSize:        "1.125rem",  // 18px
          fontWeight:      600,
        }}
        aria-label={`Reminder: tocca se non è ${target}`}
      >
        Tocca se NON è{" "}
        <span
          style={{
            fontSize:    "1.5rem",
            fontWeight:  700,
            color:       "#111827",
            marginLeft:  "0.5rem",
          }}
        >
          {target}
        </span>
      </div>
    </div>
  );
}
