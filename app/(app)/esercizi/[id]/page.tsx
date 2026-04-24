"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Btn from "@/components/ui/btn";
import { Timer, LightBulb, Star, CheckCircle } from "iconoir-react";
import { ICON_MAP } from "@/lib/icons";
import { mockEsercizi, mockCategorie } from "@/lib/mock-data";
import { CATEGORIA_COLORS, COLORS } from "@/lib/design-tokens";
import { useUserStore } from "@/lib/store";
import { salvaSessione, aggiornaStreak, controllaNuoveMedaglie, marcaEsercizioCompletato } from "@/lib/sync";

const DURATA_SESSIONE = 60; // 1 minuto

type Stato = "intro" | "esercizio" | "risultato";

export default function EsercizioPage() {
  const params = useParams();
  const router = useRouter();
  const [stato, setStato] = useState<Stato>("intro");
  const [score, setScore] = useState(0);
  const [accuratezza, setAccuratezza] = useState(0);
  const [tempoRimanente, setTempoRimanente] = useState(DURATA_SESSIONE);
  const [_tempoScaduto, setTempoScaduto] = useState(false);
  const [tempoImpiegato, setTempoImpiegato] = useState(0);
  const [timerAttivo, setTimerAttivo] = useState(false);

  const { userId, streak, lastActivityDate, medaglie, eserciziFattiOggi, eserciziDelGiorno, setUser, aggiungiMedaglia, setNavNascosta, marcaEsercizioDelGiornoCompletato } = useUserStore();

  const esercizio = mockEsercizi.find((e) => e.id === params.id);
  const categoria = mockCategorie.find((c) => c.id === esercizio?.categoria_id);
  const cc = categoria ? CATEGORIA_COLORS[categoria.id] : null;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    setNavNascosta(true);
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      setNavNascosta(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (stato !== "esercizio") return;
    setTempoRimanente(DURATA_SESSIONE);
    setTempoScaduto(false);
    setTimerAttivo(false);
  }, [stato]);

  useEffect(() => {
    if (stato !== "esercizio" || !timerAttivo) return;
    const interval = setInterval(() => {
      setTempoRimanente((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setTempoScaduto(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stato, timerAttivo]);

  function _handleReady() {
    setTimerAttivo(true);
  }

  function formatTempo(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  async function handleComplete(punteggio: number, acc: number) {
    setScore(punteggio);
    setAccuratezza(acc);
    setTempoImpiegato(DURATA_SESSIONE - tempoRimanente);
    setStato("risultato");

    if (!userId || !esercizio) return;

    await salvaSessione({
      userId,
      esercizioId: esercizio.id,
      categoriaId: esercizio.categoria_id ?? null,
      score: punteggio,
    });

    const nuovoStreak = await aggiornaStreak(userId, streak, lastActivityDate);
    const oggi = new Date().toISOString().split("T")[0];
    const nuoveMedaglie = await controllaNuoveMedaglie(userId, nuovoStreak, medaglie);

    const isDelGiorno = eserciziDelGiorno.some((e) => e.id === esercizio.id);
    if (isDelGiorno) {
      marcaEsercizioDelGiornoCompletato(esercizio.id);
      await marcaEsercizioCompletato(userId, esercizio.id);
    }

    setUser({ streak: nuovoStreak, lastActivityDate: oggi, eserciziFattiOggi: eserciziFattiOggi + 1 });
    nuoveMedaglie.forEach((id) => aggiungiMedaglia(id));
  }

  if (!esercizio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <span className="text-5xl">😕</span>
        <p className="text-base text-ink-muted text-center">Esercizio non trovato</p>
        <Link href="/esercizi"><Btn variant="outline">Torna agli esercizi</Btn></Link>
      </div>
    );
  }

  const scoreMsg = score >= 80 ? "Ottimo lavoro!" : score >= 60 ? "Buona prova!" : "Continua ad allenarti!";

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: COLORS.background }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-4 bg-surface border-b border-border sticky top-0 z-10">
        <button
          onClick={() => stato === "esercizio" ? setStato("intro") : router.back()}
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl active:scale-95"
          style={{ backgroundColor: COLORS.surfaceAlt, color: COLORS.inkSecondary }}
        >
          ←
        </button>
        <div className="flex-1">
          {stato === "intro" ? (
            <p className="text-base font-bold text-ink">Esercizi {categoria?.nome ?? ""}</p>
          ) : (
            <>
              <h2 className="text-base font-bold text-ink leading-tight">{esercizio.titolo}</h2>
              {categoria && (
                <p className="text-sm font-medium" style={{ color: cc?.text }}>
                  {categoria.nome}
                </p>
              )}
            </>
          )}
        </div>
        {stato === "esercizio" && (
          <div
            className="px-3 py-1 rounded-full text-sm font-bold tabular-nums"
            style={{
              backgroundColor: tempoRimanente <= 30 ? "#FEE2E2" : COLORS.primaryLight,
              color: tempoRimanente <= 30 ? "#EF4444" : COLORS.primary,
            }}
          >
            {formatTempo(tempoRimanente)}
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto pb-6">

        {/* ── INTRO ──────────────────────────────────────────────────────── */}
        {stato === "intro" && (
          <div className="flex flex-col gap-8 pt-4 pb-6">

            <div className="flex flex-col items-center gap-4">
              <div
                className="px-4 py-1.5 rounded-full flex items-center gap-1.5"
                style={{ backgroundColor: cc?.bg ?? COLORS.surfaceAlt }}
              >
                {categoria?.icona && ICON_MAP[categoria.icona] && (() => {
                  const Icon = ICON_MAP[categoria.icona];
                  return <Icon width={18} height={18} strokeWidth={2} color={cc?.text ?? COLORS.inkMuted} />;
                })()}
                <span className="text-sm font-bold" style={{ color: cc?.text ?? COLORS.inkMuted }}>
                  {categoria?.nome ?? ""}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-ink text-center leading-tight px-2">
                {esercizio.titolo}
              </h1>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-surface rounded-2xl p-4 flex flex-col items-center gap-3">
                <Timer width={24} height={24} strokeWidth={1.5} color={cc?.text ?? COLORS.primary} />
                <div className="text-center">
                  <p className="text-xs" style={{ color: COLORS.inkMuted }}>Durata</p>
                  <p className="text-base font-bold text-ink">1 minuto</p>
                </div>
              </div>
              <div className="flex-1 bg-surface rounded-2xl p-4 flex flex-col items-center gap-3">
                <div className="flex gap-1 items-center h-6">
                  {["facile","medio","difficile"].map((d) => {
                    const livelli = { facile: 1, medio: 2, difficile: 3 };
                    const diff = (esercizio as Record<string,unknown>).difficolta as string ?? "facile";
                    const attivo = livelli[d as keyof typeof livelli] <= (livelli[diff as keyof typeof livelli] ?? 1);
                    return (
                      <div key={d} className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: attivo ? (cc?.text ?? COLORS.primary) : COLORS.border }} />
                    );
                  })}
                </div>
                <div className="text-center">
                  <p className="text-xs" style={{ color: COLORS.inkMuted }}>Difficoltà</p>
                  <p className="text-base font-bold text-ink capitalize">
                    {(esercizio as Record<string,unknown>).difficolta as string ?? "facile"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: cc?.bg ?? COLORS.surfaceAlt }}>
              <div className="flex items-center gap-3">
                <LightBulb width={24} height={24} strokeWidth={1.5} color={cc?.text ?? COLORS.primary} />
                <p className="text-lg font-bold text-ink">Perché fa bene?</p>
              </div>
              <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
                {esercizio.beneficio}
              </p>
            </div>

            <Btn size="lg" onClick={() => setStato("esercizio")}>Inizia ora</Btn>
          </div>
        )}

        {/* ── ESERCIZIO ──────────────────────────────────────────────────── */}
        {stato === "esercizio" && (
          <div className="flex flex-col items-center justify-center gap-6 py-20 px-4 text-center">
            <span className="text-6xl">🚧</span>
            <p className="text-xl font-bold text-ink">Esercizio in arrivo</p>
            <p className="text-base" style={{ color: COLORS.inkMuted }}>
              Questo esercizio è in fase di sviluppo.
            </p>
            <Btn variant="outline" onClick={() => handleComplete(0, 0)}>Completa (test)</Btn>
          </div>
        )}

        {/* ── RISULTATO ──────────────────────────────────────────────────── */}
        {stato === "risultato" && (() => {
          const catColor = cc?.text ?? COLORS.primary;
          const catBg = cc?.bg ?? COLORS.primaryLight;
          const CatIcon = categoria?.icona ? ICON_MAP[categoria.icona] : null;

          return (
            <div className="flex flex-col gap-8 pt-4 pb-6">

              <div className="flex flex-col items-center gap-4">
                <Star width={48} height={48} strokeWidth={1.5} color={catColor} fill={catColor} />
                <h1 className="text-3xl font-extrabold text-ink text-center">{scoreMsg}</h1>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-surface rounded-2xl p-4 flex flex-col items-center gap-3">
                  <Timer width={24} height={24} strokeWidth={1.5} color={catColor} />
                  <div className="text-center">
                    <p className="text-xs" style={{ color: COLORS.inkMuted }}>Tempo</p>
                    <p className="text-base font-bold text-ink">{formatTempo(tempoImpiegato)}</p>
                  </div>
                </div>
                <div className="flex-1 bg-surface rounded-2xl p-4 flex flex-col items-center gap-3">
                  <CheckCircle width={24} height={24} strokeWidth={1.5} color={catColor} />
                  <div className="text-center">
                    <p className="text-xs" style={{ color: COLORS.inkMuted }}>Accuratezza</p>
                    <p className="text-base font-bold text-ink">{accuratezza}%</p>
                  </div>
                </div>
              </div>

              {CatIcon && (
                <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: catBg }}>
                  <CatIcon width={24} height={24} strokeWidth={1.5} color={catColor} />
                  <p className="text-base font-bold text-ink">{categoria?.nome}</p>
                </div>
              )}

              <Link href="/esercizi">
                <Btn size="lg" className="w-full">Prossimo esercizio</Btn>
              </Link>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
