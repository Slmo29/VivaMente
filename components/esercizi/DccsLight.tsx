"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "@/lib/design-tokens";

type CueType = "explicit" | "icon" | "none";
type LivelloConfig = {
  cue: CueType;
  trialsBeforeSwitch: number;
  timeLimitMs: number | null;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0) return { cue: "explicit", trialsBeforeSwitch: 2, timeLimitMs: null };
  if (idx <= 4) return { cue: "explicit", trialsBeforeSwitch: 2, timeLimitMs: null };
  if (idx <= 6) return { cue: "explicit", trialsBeforeSwitch: 1, timeLimitMs: null };
  if (idx <= 9) return { cue: "icon",     trialsBeforeSwitch: 1, timeLimitMs: 5000 };
  if (idx <= 12) return { cue: "icon",    trialsBeforeSwitch: 1, timeLimitMs: 4000 };
  if (idx <= 13) return { cue: "none",    trialsBeforeSwitch: 1, timeLimitMs: 3500 };
  if (idx <= 17) return { cue: "none",    trialsBeforeSwitch: 1, timeLimitMs: 3000 };
  return { cue: "none",                   trialsBeforeSwitch: 1, timeLimitMs: 2000 };
}

const COLORI = ["Rosso", "Blu", "Verde"];
const FORME = ["Cerchio", "Quadrato", "Triangolo"];
const NUMERI = ["1", "2", "3"];
const COLORI_HEX: Record<string, string> = { "Rosso": "#EF4444", "Blu": "#3B82F6", "Verde": "#22C55E" };

type RegolaCorrente = "colore" | "forma" | "numero";
const REGOLA_ORDER: RegolaCorrente[] = ["colore", "forma", "numero"];

interface Carta {
  colore: string;
  forma: string;
  numero: string;
}

function generateCarta(): Carta {
  return {
    colore: COLORI[Math.floor(Math.random() * COLORI.length)],
    forma: FORME[Math.floor(Math.random() * FORME.length)],
    numero: NUMERI[Math.floor(Math.random() * NUMERI.length)],
  };
}

// Genera carta target casuale
function pickDiverso(arr: string[], escludi: string): string {
  const filtrati = arr.filter((v) => v !== escludi);
  return filtrati[Math.floor(Math.random() * filtrati.length)];
}

// Genera una carta rispettando i vincoli DCCS:
// - dimensione rilevante: uguale al target se correct=true, diversa se false
// - dimensioni non rilevanti: sempre diverse dal target
function generateCartaVincolata(target: Carta, regola: RegolaCorrente, correct: boolean): Carta {
  if (regola === "colore") return {
    colore: correct ? target.colore : pickDiverso(COLORI, target.colore),
    forma:  pickDiverso(FORME,  target.forma),
    numero: pickDiverso(NUMERI, target.numero),
  };
  if (regola === "forma") return {
    colore: pickDiverso(COLORI, target.colore),
    forma:  correct ? target.forma : pickDiverso(FORME, target.forma),
    numero: pickDiverso(NUMERI, target.numero),
  };
  return {
    colore: pickDiverso(COLORI, target.colore),
    forma:  pickDiverso(FORME,  target.forma),
    numero: correct ? target.numero : pickDiverso(NUMERI, target.numero),
  };
}

function generateOpzioni(carta: Carta, regola: RegolaCorrente): Carta[] {
  const corretta = generateCartaVincolata(carta, regola, true);
  const opzioni: Carta[] = [corretta];
  while (opzioni.length < 3) {
    const c = generateCartaVincolata(carta, regola, false);
    const duplicato = opzioni.some((o) => o.colore === c.colore && o.forma === c.forma && o.numero === c.numero);
    if (!duplicato) opzioni.push(c);
  }
  return opzioni.sort(() => Math.random() - 0.5);
}

type Fase = "intro" | "mostra" | "feedback" | "timeout";

interface Props {
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

export default function DccsLight({ livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [regolaIdx, setRegolaIdx] = useState(0);
  const regolaIdxRef = useRef(0); // ref per evitare stale closure in avanzaTrial
  const [consecutivi, setConsecutivi] = useState(0);
  const [cartaTarget, setCartaTarget] = useState<Carta>(() => generateCarta());
  const [opzioni, setOpzioni] = useState<Carta[]>([]);
  const [fase, setFase] = useState<Fase>("intro");
  const [corretti, setCorretti] = useState(0);
  const [totale, setTotale] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [trialMs, setTrialMs] = useState<number>(cfg.timeLimitMs ?? 0);

  const regolaCorrente = REGOLA_ORDER[regolaIdx % 3];

  const avanzaTrial = useCallback(() => {
    const carta = generateCarta();
    setCartaTarget(carta);
    // Usa il ref per leggere il regolaIdx aggiornato (evita stale closure)
    setOpzioni(generateOpzioni(carta, REGOLA_ORDER[regolaIdxRef.current % 3]));
    setLastOk(null);
    setFase("mostra");
    if (cfg.timeLimitMs) setTrialMs(cfg.timeLimitMs);
    if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
  }, [cfg.timeLimitMs]);

  useEffect(() => {
    if (fase !== "mostra" || !cfg.timeLimitMs) return;
    if (trialMs <= 0) {
      setTotale((t) => t + 1);
      setLastOk(false);
      setFase("timeout");
      timerRef.current = setTimeout(avanzaTrial, 600);
      return;
    }
    const t = setTimeout(() => setTrialMs((m) => m - 100), 100);
    return () => clearTimeout(t);
  }, [fase, trialMs, cfg.timeLimitMs, avanzaTrial]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const score = totale > 0 ? Math.round((corretti / totale) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totale, onComplete]);

  function handleScelta(carta: Carta) {
    if (fase !== "mostra") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const ok = regolaCorrente === "colore" ? carta.colore === cartaTarget.colore
      : regolaCorrente === "forma" ? carta.forma === cartaTarget.forma
      : carta.numero === cartaTarget.numero;
    const nuoviCorretti = corretti + (ok ? 1 : 0);
    const nuoviConsecutivi = ok ? consecutivi + 1 : 0;
    setCorretti(nuoviCorretti);
    setTotale((t) => t + 1);
    setLastOk(ok);
    setConsecutivi(nuoviConsecutivi);
    if (nuoviConsecutivi >= cfg.trialsBeforeSwitch) {
      const nextIdx = regolaIdxRef.current + 1;
      regolaIdxRef.current = nextIdx;
      setRegolaIdx(nextIdx);
      setConsecutivi(0);
    }
    setFase("feedback");
    timerRef.current = setTimeout(avanzaTrial, 600);
  }

  const REGOLA_LABEL: Record<RegolaCorrente, string> = {
    colore: "Classifica per COLORE",
    forma: "Classifica per FORMA",
    numero: "Classifica per NUMERO",
  };

  function renderCarta(carta: Carta, small = false) {
    const formaEmoji: Record<string, string> = { Cerchio: "●", Quadrato: "■", Triangolo: "▲" };
    return (
      <div className="rounded-xl flex flex-col items-center justify-center gap-1" style={{
        width: small ? 80 : 100, height: small ? 80 : 100,
        backgroundColor: COLORI_HEX[carta.colore] + "33",
        border: `2px solid ${COLORI_HEX[carta.colore]}`,
      }}>
        <span style={{ fontSize: small ? 28 : 36, color: COLORI_HEX[carta.colore] }}>{formaEmoji[carta.forma]}</span>
        <span className="font-extrabold" style={{ fontSize: small ? 16 : 20, color: COLORI_HEX[carta.colore] }}>{carta.numero}</span>
      </div>
    );
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">🃏</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Classifica le Carte</p>
        <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
          Classifica le carte prima per colore, poi per forma, poi per numero — la regola cambierà.
        </p>
        <button onClick={() => avanzaTrial()} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4 px-3">
      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Corretti: {corretti} / {totale}</p>

      {(cfg.cue === "explicit" || cfg.cue === "icon") && (
        <div className="rounded-xl px-4 py-2" style={{ backgroundColor: COLORS.primaryLight, border: `1px solid ${COLORS.primary}` }}>
          <p className="text-sm font-bold" style={{ color: COLORS.primary }}>
            {cfg.cue === "icon" ? "🔤 " : ""}{REGOLA_LABEL[regolaCorrente]}
          </p>
        </div>
      )}

      {cfg.timeLimitMs && fase === "mostra" && (
        <div className="w-full rounded-full overflow-hidden h-2" style={{ backgroundColor: COLORS.border }}>
          <div className="h-full rounded-full transition-all duration-100" style={{ width: `${(trialMs / cfg.timeLimitMs) * 100}%`, backgroundColor: trialMs / cfg.timeLimitMs > 0.4 ? COLORS.primary : "#EF4444" }} />
        </div>
      )}

      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Carta target:</p>
      {renderCarta(cartaTarget)}

      {fase === "feedback" && <div className="text-4xl">{lastOk ? "✓" : "✗"}</div>}

      <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Scegli la carta corrispondente:</p>
      <div className="flex gap-3 justify-center flex-wrap">
        {opzioni.map((opt, i) => (
          <button key={i} onClick={() => handleScelta(opt)} disabled={fase !== "mostra"}
            className="active:scale-95 transition-transform rounded-xl"
            style={{ opacity: fase !== "mostra" ? 0.6 : 1 }}>
            {renderCarta(opt, true)}
          </button>
        ))}
      </div>
    </div>
  );
}
