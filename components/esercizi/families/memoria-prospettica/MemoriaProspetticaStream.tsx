"use client";

/**
 * MemoriaProspetticaStream — sub-componente che scorre la sequenza di un
 * TrialMP, renderizza l'emoji corrente, gestisce i tap sul distrattore
 * (categoria target) ed emette gli eventi cue per la variante event-based.
 *
 * Pattern allineato a SartStream:
 *   - Auto-schedula via setTimeout (niente useEffect ricorsivo su currentIndex).
 *   - Tutti i timer raccolti in `timersRef` + cleanup completo su unmount.
 *   - phaseRef + currentIndexRef mirror sincroni di state per evitare race tra
 *     callback e setState.
 *   - Idempotenza tap per stimolo via `tappatiRef: Set<number>`.
 *   - Idempotenza completamento via `completatoRef`.
 *
 * Differenze chiave vs SartStream:
 *   - Nessun masking phase (lo stream MP è continuo senza mask intermedi).
 *   - Eventi cue separati (onCueAttivo / onCueScaduto) per le finestre
 *     event-based: lo Stream apre la finestra al passaggio di sequenza[i]
 *     con isCue=true e schedula la chiusura dopo K*ISI ms.
 *   - Tap classifica target/non-target invece che commission/omission.
 *
 * Riferimento: docs/gdd/families/memoria-prospettica.md §Distrattore (riga 20)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { StimoloMP } from "./sequence";

// ── Props ─────────────────────────────────────────────────────────────────────

export type MemoriaProspetticaStreamProps = {
  /** Sequenza pre-generata di stimoli del trial. */
  sequenza: StimoloMP[];
  /** ISI distrattore in ms — quanto resta visibile ogni stimolo. */
  distractorISIMs: number;
  /** Categoria del distrattore che l'utente deve tappare. */
  categoriaTarget: string;
  /**
   * Callback al tap su uno stimolo del distrattore.
   *   - "target_corretto":   stimolo era della categoriaTarget e tap arrivato.
   *   - "non_target_falso":  stimolo non era target (o era cue) ma utente ha tappato.
   */
  onTapDistrattore: (
    tipo: "target_corretto" | "non_target_falso",
    tempoMs: number,
  ) => void;
  /** Event-based: notifica apertura finestra cue. */
  onCueAttivo?: (finestraId: number) => void;
  /** Event-based: notifica chiusura finestra cue. */
  onCueScaduto?: (finestraId: number) => void;
  /** Event-based: numero di ISI durante cui la finestra resta aperta. Default 3. */
  finestraEventKIsi?: number;
  /** Notifica completamento dello stream (raggiunto fine sequenza). */
  onStreamCompleto: () => void;
};

// ── Componente ────────────────────────────────────────────────────────────────

export function MemoriaProspetticaStream({
  sequenza,
  distractorISIMs,
  categoriaTarget,
  onTapDistrattore,
  onCueAttivo,
  onCueScaduto,
  finestraEventKIsi = 3,
  onStreamCompleto,
}: MemoriaProspetticaStreamProps) {

  // ── State (solo per render) ────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const phaseRef            = useRef<"streaming" | "done">("streaming");
  const currentIndexRef     = useRef<number>(0);
  const timersRef           = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const finestreApertoRef   = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const tappatiRef          = useRef<Set<number>>(new Set<number>());
  const presentStartedAtRef = useRef<number>(0);
  const completatoRef       = useRef<boolean>(false);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) clearTimeout(id);
    timersRef.current = [];
    finestreApertoRef.current.forEach((id) => clearTimeout(id));
    finestreApertoRef.current.clear();
  }, []);

  // ── Handler tap (idempotente per stimolo) ─────────────────────────────────

  const handleTap = useCallback(() => {
    if (phaseRef.current !== "streaming") return;
    const i = currentIndexRef.current;
    if (tappatiRef.current.has(i)) return;
    tappatiRef.current.add(i);

    const stim = sequenza[i];
    if (!stim) return; // safety: out-of-bounds dopo done

    const tempoMs = performance.now() - presentStartedAtRef.current;

    // I cue NON sono target distrattore — se l'utente tappa il cue, lo
    // conteggia come falso tap distrattore (è uno stimolo della categoria
    // del cue, tipicamente diversa da categoriaTarget per salianza alta).
    const isTarget = !stim.isCue && stim.categoria === categoriaTarget;
    onTapDistrattore(
      isTarget ? "target_corretto" : "non_target_falso",
      tempoMs,
    );
  }, [sequenza, categoriaTarget, onTapDistrattore]);

  // ── Stream runner (mount-only) ────────────────────────────────────────────

  useEffect(() => {
    const completaStream = () => {
      phaseRef.current = "done";
      setCurrentIndex(sequenza.length); // nasconde l'ultimo stimolo
      if (completatoRef.current) return;
      completatoRef.current = true;
      onStreamCompleto();
    };

    const processStimolo = (i: number) => {
      currentIndexRef.current = i;
      setCurrentIndex(i);
      presentStartedAtRef.current = performance.now();

      const stim = sequenza[i];

      // Apertura finestra cue (event-based).
      if (stim.isCue && stim.finestraId !== undefined && onCueAttivo) {
        const finestraId = stim.finestraId;
        onCueAttivo(finestraId);

        const idChiusura = setTimeout(() => {
          finestreApertoRef.current.delete(finestraId);
          if (onCueScaduto) onCueScaduto(finestraId);
        }, finestraEventKIsi * distractorISIMs);
        finestreApertoRef.current.set(finestraId, idChiusura);
      }

      // Avanza al prossimo stimolo o completa.
      const idAvanza = setTimeout(() => {
        if (i + 1 < sequenza.length) {
          processStimolo(i + 1);
        } else {
          completaStream();
        }
      }, distractorISIMs);
      timersRef.current.push(idAvanza);
    };

    if (sequenza.length === 0) {
      completaStream();
      return () => clearAllTimers();
    }

    processStimolo(0);
    return () => {
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  // Tap zone full-area, emoji al centro. Stesso pattern font-emoji di
  // OddOneOutStimulus per coerenza visiva cross-famiglia.

  const stimoloDaMostrare =
    phaseRef.current === "done" || currentIndex >= sequenza.length
      ? null
      : sequenza[currentIndex] ?? null;

  return (
    <div
      onClick={handleTap}
      className="flex items-center justify-center w-full cursor-pointer select-none"
      style={{
        minHeight:       "200px",
        backgroundColor: "#FFFFFF",
        borderRadius:    "1rem",
        border:          "1px solid #E5E7EB",
      }}
      aria-label="Area tap stream Memoria Prospettica"
      role="button"
    >
      <span
        style={{
          fontSize:    "5rem",
          fontFamily:  'system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
          lineHeight:  1,
        }}
      >
        {stimoloDaMostrare !== null ? stimoloDaMostrare.emoji : ""}
      </span>
    </div>
  );
}
