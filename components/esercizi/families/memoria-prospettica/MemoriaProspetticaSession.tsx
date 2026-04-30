"use client";

/**
 * MemoriaProspetticaSession — mini-engine top-level di una sessione MP.
 *
 * Orchestra le 2 fasi GDD:
 *   - Fase 1 — Istruzione prospettica: schermata di 5s con cue (event-based)
 *     o intervallo (time-based) + bottone "Ho capito" per saltare.
 *   - Fase 2 — Task continuo: stream distrattore + bottone "Ricordami" +
 *     orologio (solo time-based). Timer interno = durationMs del livello.
 *
 * Tracking finestre prospettiche:
 *   - event-based: lo Stream emette onCueAttivo / onCueScaduto, l'Engine
 *     mantiene `finestreAperteRef: Set<number>`. Tap "Ricordami" copre la
 *     prima finestra aperta nel set.
 *   - time-based:  l'Engine schedula `setTimeout` per ogni intervallo (da
 *     `intervalliMs[i] - toleranceMs` a `+ toleranceMs`), aprendo/chiudendo
 *     finestre in `finestreAperteRef`. Stesso pattern di tap.
 *
 * Idempotenza completamento via `completatoRef`. Cleanup completo timer su
 * unmount.
 *
 * Fix UX (deploy 2026-04-29):
 *   - Barra di progresso intra-trial (4px in alto, gray-400 su gray-200):
 *     supporto UX, il counter X/Y a livello pagina resta 0/1 per tutta
 *     la sessione (single trial continuo). La barra si riempie in base
 *     al tempo trascorso, neutra clinicamente (no info su performance).
 *
 * Riferimento: docs/gdd/families/memoria-prospettica.md §Struttura sessione
 */

import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import type { TrialMP, RispostaMP } from "./sequence";
import { MemoriaProspetticaStream } from "./MemoriaProspetticaStream";
import { OrologioMP } from "./OrologioMP";

// ── Props ─────────────────────────────────────────────────────────────────────

export type MemoriaProspetticaSessionProps = {
  /** Trial pre-generato (event-based o time-based, discriminato da .tipo). */
  stimolo: TrialMP;
  /** Callback chiamata UNA SOLA VOLTA al termine con esito aggregato. */
  onRisposta: (esito: RispostaMP) => void;
};

// ── Tipi interni ─────────────────────────────────────────────────────────────

type FasePhase = "istruzione" | "task" | "completata";

// ── Stile bottone Ricordami ──────────────────────────────────────────────────

const styleBottoneBase: CSSProperties = {
  padding:        "1rem",
  borderRadius:   "1rem",
  border:         "1px solid #D1D5DB",
  fontSize:       "1.25rem",
  fontWeight:     700,
  color:          "#111827",
  width:          "100%",
  cursor:         "pointer",
  transition:     "background-color 200ms ease-out, transform 60ms ease-out",
};

function colorBottoneRicordami(feedback: "corretto" | "falso" | null): string {
  if (feedback === "corretto") return "#86EFAC"; // green-300
  if (feedback === "falso")    return "#FCA5A5"; // red-300
  return "#F3F4F6";                                // gray-100
}

// ── FaseIstruzione (componente inline) ──────────────────────────────────────

function FaseIstruzione({
  trial,
  onConferma,
}: {
  trial: TrialMP;
  onConferma: () => void;
}) {
  // Auto-conferma dopo 5s (GDD §Struttura sessione, riga 18).
  useEffect(() => {
    const id = setTimeout(onConferma, 5000);
    return () => clearTimeout(id);
  }, [onConferma]);

  const isEvent = trial.tipo === "event";
  const intervalSec =
    trial.tipo === "time" ? Math.round(trial.intervalliMs[0] / 1000) : 0;

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 py-8 px-4 w-full"
      role="region"
      aria-label="Istruzione prospettica"
    >
      <p
        className="text-center"
        style={{ fontSize: "1.125rem", color: "#374151", maxWidth: "32rem", lineHeight: 1.5 }}
      >
        {isEvent
          ? `Durante l'esercizio vedrai questo simbolo. Quando appare, tocca subito il tasto Ricordami.`
          : `Devi toccare il tasto Ricordami ogni ${intervalSec} secondi.`}
      </p>

      {isEvent && (
        <span
          style={{
            fontSize:    "5rem",
            fontFamily:  'system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
            lineHeight:  1,
          }}
          aria-label={`Cue prospettico ${trial.cueEmoji}`}
        >
          {trial.cueEmoji}
        </span>
      )}

      <button
        onClick={onConferma}
        style={{
          ...styleBottoneBase,
          backgroundColor: "#2563EB",  // blue-600
          color:           "#FFFFFF",
          maxWidth:        "20rem",
        }}
        aria-label="Ho capito, inizia"
      >
        Ho capito
      </button>
    </div>
  );
}

// ── MemoriaProspetticaSession ────────────────────────────────────────────────

export function MemoriaProspetticaSession({
  stimolo,
  onRisposta,
}: MemoriaProspetticaSessionProps) {

  // ── State ──────────────────────────────────────────────────────────────────
  const [fase, setFase] = useState<FasePhase>("istruzione");
  const [feedbackRicordami, setFeedbackRicordami] =
    useState<"corretto" | "falso" | null>(null);
  // Tick ogni 1000ms durante fase "task" — alimenta la barra di progresso.
  const [tickNow, setTickNow] = useState<number>(() => performance.now());

  // ── Refs ───────────────────────────────────────────────────────────────────
  const taskStartedAtRef          = useRef<number>(0);
  const finestreAperteRef         = useRef<Set<number>>(new Set<number>());
  const finestreCorretteRef       = useRef<Set<number>>(new Set<number>());
  const ricordamiFalsiTapRef      = useRef<number>(0);
  const distrattoriTargetTotaliRef    = useRef<number>(0);
  const distrattoriTargetTappatiRef   = useRef<number>(0);
  const distrattoriFalsiTapRef        = useRef<number>(0);
  const tempoTotaleDistrattoreMsRef   = useRef<number>(0);
  const completatoRef             = useRef<boolean>(false);
  const timersRef                 = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const intervalliTimeBasedRef    = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  // ── Pre-mount: calcolo target distrattore totali ──────────────────────────
  useEffect(() => {
    distrattoriTargetTotaliRef.current = stimolo.sequenza
      .filter((s) => !s.isCue && s.categoria === stimolo.categoriaTarget)
      .length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cleanup unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      intervalliTimeBasedRef.current.forEach(clearTimeout);
      timersRef.current = [];
      intervalliTimeBasedRef.current = [];
    };
  }, []);

  // ── Tick interval per barra di progresso (solo durante fase "task") ───────
  useEffect(() => {
    if (fase !== "task") return;
    const id = setInterval(() => setTickNow(performance.now()), 1000);
    return () => clearInterval(id);
  }, [fase]);

  // ── completaSessione ──────────────────────────────────────────────────────

  const completaSessione = useCallback(() => {
    if (completatoRef.current) return;
    completatoRef.current = true;
    setFase("completata");

    const esito: RispostaMP = {
      finestreTotali:           stimolo.nWindows,
      finestreCorrette:         finestreCorretteRef.current.size,
      ricordamiFalsiTap:        ricordamiFalsiTapRef.current,
      distrattoriTargetTotali:  distrattoriTargetTotaliRef.current,
      distrattoriTargetTappati: distrattoriTargetTappatiRef.current,
      distrattoriFalsiTap:      distrattoriFalsiTapRef.current,
      tempoTotaleDistrattoreMs: tempoTotaleDistrattoreMsRef.current,
    };
    onRisposta(esito);
  }, [stimolo.nWindows, onRisposta]);

  // ── iniziaFase2 ───────────────────────────────────────────────────────────

  const iniziaFase2 = useCallback(() => {
    taskStartedAtRef.current = performance.now();
    setFase("task");

    // Time-based: schedula apertura/chiusura finestre.
    if (stimolo.tipo === "time") {
      stimolo.intervalliMs.forEach((targetMs, idx) => {
        const aperturaMs = Math.max(0, targetMs - stimolo.toleranceMs);
        const chiusuraMs = Math.max(0, targetMs + stimolo.toleranceMs);

        const idApri = setTimeout(() => {
          finestreAperteRef.current.add(idx);
        }, aperturaMs);
        intervalliTimeBasedRef.current.push(idApri);

        const idChiudi = setTimeout(() => {
          finestreAperteRef.current.delete(idx);
        }, chiusuraMs);
        intervalliTimeBasedRef.current.push(idChiudi);
      });
    }

    // Timer di fine sessione (= durationMs).
    const idFine = setTimeout(completaSessione, stimolo.durationMs);
    timersRef.current.push(idFine);
  }, [stimolo, completaSessione]);

  // ── handleRicordami ───────────────────────────────────────────────────────

  const handleRicordami = useCallback(() => {
    if (fase !== "task") return;

    const aperteIds = Array.from(finestreAperteRef.current);
    if (aperteIds.length > 0) {
      // Tap valido: copre la prima finestra aperta (FIFO).
      const finestraId = aperteIds[0];
      finestreAperteRef.current.delete(finestraId);
      finestreCorretteRef.current.add(finestraId);
      setFeedbackRicordami("corretto");
    } else {
      ricordamiFalsiTapRef.current += 1;
      setFeedbackRicordami("falso");
    }
    const id = setTimeout(() => setFeedbackRicordami(null), 200);
    timersRef.current.push(id);
  }, [fase]);

  // ── Stream callbacks ──────────────────────────────────────────────────────

  const handleTapDistrattore = useCallback(
    (tipo: "target_corretto" | "non_target_falso", tempoMs: number) => {
      if (tipo === "target_corretto") {
        distrattoriTargetTappatiRef.current += 1;
        tempoTotaleDistrattoreMsRef.current += tempoMs;
      } else {
        distrattoriFalsiTapRef.current += 1;
      }
    },
    [],
  );

  const handleCueAttivo = useCallback((finestraId: number) => {
    finestreAperteRef.current.add(finestraId);
  }, []);

  const handleCueScaduto = useCallback((finestraId: number) => {
    finestreAperteRef.current.delete(finestraId);
  }, []);

  const handleStreamCompleto = useCallback(() => {
    // Lo stream è terminato ma la sessione potrebbe avere durata residua
    // (time-based con buffer post-ultima finestra). NON termina qui — la
    // sessione termina sul timer durationMs schedulato in iniziaFase2.
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (fase === "completata") {
    // Sessione conclusa, niente da renderizzare (TrialFlow gestirà la
    // transizione successiva — onRisposta è già stata chiamata).
    return null;
  }

  if (fase === "istruzione") {
    return <FaseIstruzione trial={stimolo} onConferma={iniziaFase2} />;
  }

  // fase === "task"
  const progressoTempoMs = Math.max(0, tickNow - taskStartedAtRef.current);
  const progressoPct = Math.min(100, (progressoTempoMs / stimolo.durationMs) * 100);

  return (
    <div className="flex flex-col gap-4 w-full px-4 py-4">
      {/* ── Barra di progresso intra-trial (periferica, neutra) ───────────── */}
      {/* Si riempie in base al tempo trascorso vs durationMs. Non rivela     */}
      {/* info clinica (counter finestre nascosto): solo "dove sei nella     */}
      {/* sessione". Stesso pattern di SartStream barra progresso.            */}
      <div
        className="w-full pointer-events-none"
        style={{ height: "4px", backgroundColor: "#E5E7EB" }}
        aria-hidden="true"
      >
        <div
          style={{
            height:          "100%",
            width:           `${progressoPct}%`,
            backgroundColor: "#9CA3AF",
            transition:      "width 1000ms linear",
          }}
        />
      </div>

      {/* Header: orologio per time-based */}
      {stimolo.tipo === "time" && (
        <div className="flex justify-end">
          <OrologioMP
            startedAtMs={taskStartedAtRef.current}
            visibility={stimolo.clockVisibility}
          />
        </div>
      )}

      {/* Stream distrattore */}
      <MemoriaProspetticaStream
        sequenza={stimolo.sequenza}
        distractorISIMs={stimolo.distractorISIMs}
        categoriaTarget={stimolo.categoriaTarget}
        onTapDistrattore={handleTapDistrattore}
        onCueAttivo={stimolo.tipo === "event" ? handleCueAttivo : undefined}
        onCueScaduto={stimolo.tipo === "event" ? handleCueScaduto : undefined}
        onStreamCompleto={handleStreamCompleto}
      />

      {/* Bottone Ricordami (sempre visibile, distinto dal tap distrattore) */}
      <button
        onClick={handleRicordami}
        className="active:scale-95"
        style={{
          ...styleBottoneBase,
          backgroundColor: colorBottoneRicordami(feedbackRicordami),
        }}
        aria-label="Tasto Ricordami"
      >
        Ricordami
      </button>
    </div>
  );
}
