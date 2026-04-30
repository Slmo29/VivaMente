"use client";

/**
 * BouncingBall — distrattore motorio MLT condiviso.
 *
 * Prima implementazione del distrattore prescritto da
 * `docs/gdd/shared/04-memory-types.md` §22-39:
 *   "Tapping ritmico su pallina rimbalzante. L'utente tocca lo schermo
 *    ogni volta che la pallina rimbalza. Vincoli: nessun contenuto cognitivo,
 *    nessun testo, nessuna categorizzazione, nessun punteggio mostrato."
 *
 * Consumer attuali e futuri:
 *   - Recall Grid Immagini MLT (Famiglia 2)
 *   - Memoria Lista delayed (Famiglia 9, futuro)
 *   - Memoria e Comprensione del Testo MLT (Famiglia 8, futuro)
 *   - Associative Memory (futuro)
 *
 * Implementazione:
 *   - Loop `requestAnimationFrame` per fisica (collisione bordi + flip
 *     velocità). Posizione mutata via DOM transform — niente state, niente
 *     re-render durante il movimento.
 *   - `setTimeout(durataMs)` invoca `onCompleto` (idempotente via ref).
 *   - Tap registrati come `onTap` opzionale (anti zone-out, no penalty).
 *   - Cleanup completo RAF + timer su unmount.
 *
 * Countdown numerico in alto: opzionale (`mostraCountdown`). Coerente con
 * GDD §Delay (riga 31 recall-grid.md per MBT). Per MLT è informativo neutro;
 * il vincolo "no testo cognitivo" del distrattore è rispettato — il countdown
 * mm:ss è puramente posizionale, non valutativo.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  PALLA_DIAMETRO_PX,
  PALLA_VELOCITA_PX_MS,
  PALLA_COLORE,
  STAGE_COLORE,
  COUNTDOWN_COLORE,
} from "./costanti";

// ── Props ─────────────────────────────────────────────────────────────────────

export type BouncingBallProps = {
  /** Durata totale del delay in ms. Allo zero → onCompleto. */
  durataMs: number;
  /** Callback al termine del delay. Chiamata UNA SOLA VOLTA. */
  onCompleto: () => void;
  /**
   * Callback opzionale: tap dell'utente in qualsiasi punto dello stage.
   * Utile per anti zone-out tracking (palla_tap_count metric).
   */
  onTap?: (tempoMs: number) => void;
  /**
   * Mostra countdown numerico mm:ss in alto allo stage. Default true.
   * Falso per uso isolato in dev/test futuro.
   */
  mostraCountdown?: boolean;
};

// ── Componente ────────────────────────────────────────────────────────────────

export function BouncingBall({
  durataMs,
  onCompleto,
  onTap,
  mostraCountdown = true,
}: BouncingBallProps) {

  // ── Refs (mutati senza re-render) ─────────────────────────────────────────
  const stageRef        = useRef<HTMLDivElement>(null);
  const pallaRef        = useRef<HTMLDivElement>(null);
  const posRef          = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velRef          = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const rafRef          = useRef<number | null>(null);
  const finalTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completatoRef   = useRef<boolean>(false);
  const startedAtRef    = useRef<number>(0);

  // ── State (solo per countdown rerender 1/sec) ────────────────────────────
  const [tickNow, setTickNow] = useState<number>(() => performance.now());

  // ── Loop RAF + timer fine delay (mount-only) ──────────────────────────────
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Init posizione/velocità random.
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    posRef.current = { x: w / 2, y: h / 2 };
    const angolo = Math.random() * Math.PI * 2;
    velRef.current = {
      vx: Math.cos(angolo) * PALLA_VELOCITA_PX_MS,
      vy: Math.sin(angolo) * PALLA_VELOCITA_PX_MS,
    };

    startedAtRef.current = performance.now();
    let lastT = startedAtRef.current;

    const loop = (now: number) => {
      const dt = now - lastT;
      lastT = now;

      const r = PALLA_DIAMETRO_PX / 2;
      posRef.current.x += velRef.current.vx * dt;
      posRef.current.y += velRef.current.vy * dt;

      // Collisione bordi: clamp + flip velocità.
      if (posRef.current.x - r < 0) {
        posRef.current.x = r;
        velRef.current.vx = Math.abs(velRef.current.vx);
      }
      if (posRef.current.x + r > w) {
        posRef.current.x = w - r;
        velRef.current.vx = -Math.abs(velRef.current.vx);
      }
      if (posRef.current.y - r < 0) {
        posRef.current.y = r;
        velRef.current.vy = Math.abs(velRef.current.vy);
      }
      if (posRef.current.y + r > h) {
        posRef.current.y = h - r;
        velRef.current.vy = -Math.abs(velRef.current.vy);
      }

      // Mutazione DOM diretta (no re-render).
      if (pallaRef.current) {
        pallaRef.current.style.transform =
          `translate3d(${posRef.current.x - r}px, ${posRef.current.y - r}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // Timer fine delay (idempotente).
    finalTimerRef.current = setTimeout(() => {
      if (completatoRef.current) return;
      completatoRef.current = true;
      onCompleto();
    }, durataMs);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (finalTimerRef.current !== null) clearTimeout(finalTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only: la palla non risponde a cambi prop runtime

  // ── Tick countdown (1 Hz, separato dal loop RAF) ──────────────────────────
  useEffect(() => {
    if (!mostraCountdown) return;
    const id = setInterval(() => setTickNow(performance.now()), 1000);
    return () => clearInterval(id);
  }, [mostraCountdown]);

  // ── Handler tap ───────────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    onTap?.(performance.now());
  }, [onTap]);

  // ── Calcolo countdown ─────────────────────────────────────────────────────
  const tempoTrascorsoMs = Math.max(0, tickNow - startedAtRef.current);
  const tempoResiduoMs   = Math.max(0, durataMs - tempoTrascorsoMs);
  const totSec = Math.ceil(tempoResiduoMs / 1000);
  const m = Math.floor(totSec / 60);
  const s = totSec % 60;
  const countdownTesto = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      ref={stageRef}
      onClick={handleTap}
      style={{
        position:        "relative",
        width:           "100%",
        minHeight:       "400px",
        backgroundColor: STAGE_COLORE,
        borderRadius:    "1rem",
        border:          "1px solid #E5E7EB",
        overflow:        "hidden",
        cursor:          "pointer",
        userSelect:      "none",
      }}
      aria-label="Distrattore: tocca lo schermo quando la pallina rimbalza"
      role="button"
    >
      {mostraCountdown && (
        <div
          style={{
            position:      "absolute",
            top:           "0.5rem",
            left:          "50%",
            transform:     "translateX(-50%)",
            color:         COUNTDOWN_COLORE,
            fontSize:      "0.875rem",
            fontFamily:    'ui-monospace, "JetBrains Mono", monospace',
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {countdownTesto}
        </div>
      )}
      <div
        ref={pallaRef}
        style={{
          position:        "absolute",
          width:           `${PALLA_DIAMETRO_PX}px`,
          height:          `${PALLA_DIAMETRO_PX}px`,
          borderRadius:    "50%",
          backgroundColor: PALLA_COLORE,
          willChange:      "transform",
          pointerEvents:   "none",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
