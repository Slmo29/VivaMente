"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Btn from "@/components/ui/btn";
import { Timer, LightBulb, Star, CheckCircle } from "iconoir-react";
import { ICON_MAP } from "@/lib/icons";
import OddOneOut from "@/components/esercizi/OddOneOut";
import StroopColorWord from "@/components/esercizi/StroopColorWord";
import SequenzaTap from "@/components/esercizi/SequenzaTap";
import RecallGrid from "@/components/esercizi/RecallGrid";
import SortIt from "@/components/esercizi/SortIt";
import PasatLight from "@/components/esercizi/PasatLight";
import UpdatingWm from "@/components/esercizi/UpdatingWm";
import MemoriaLista from "@/components/esercizi/MemoriaLista";
import MemoriaDiProsa from "@/components/esercizi/MemoriaDiProsa";
import Sart from "@/components/esercizi/Sart";
import GoNoGo from "@/components/esercizi/GoNoGo";
import Flanker from "@/components/esercizi/Flanker";
import TaskSwitching from "@/components/esercizi/TaskSwitching";
import DccsLight from "@/components/esercizi/DccsLight";
import MentalRotation from "@/components/esercizi/MentalRotation";
import FigureGround from "@/components/esercizi/FigureGround";
import BlockDesign from "@/components/esercizi/BlockDesign";
import Pianificazione from "@/components/esercizi/Pianificazione";
import VerbalFluency from "@/components/esercizi/VerbalFluency";
import Linguaggio from "@/components/esercizi/Linguaggio";
import MemoriaProspettica from "@/components/esercizi/MemoriaProspettica";
import DualTask from "@/components/esercizi/DualTask";
import Vigilance from "@/components/esercizi/Vigilance";
import Hayling from "@/components/esercizi/Hayling";
import { mockEsercizi, mockCategorie } from "@/lib/mock-data";
import { CATEGORIA_COLORS, COLORS } from "@/lib/design-tokens";
import { useUserStore } from "@/lib/store";
import { salvaSessione, aggiornaStreak, controllaNuoveMedaglie, marcaEsercizioCompletato, aggiornaUserLevel } from "@/lib/sync";

const DURATA_SESSIONE = 60; // 1 minuto

type Stato = "intro" | "esercizio" | "risultato";

export default function EsercizioPage() {
  const params = useParams();
  const router = useRouter();
  const [stato, setStato] = useState<Stato>("intro");
  const [score, setScore] = useState(0);
  const [accuratezza, setAccuratezza] = useState(0);
  const [tempoRimanente, setTempoRimanente] = useState(DURATA_SESSIONE);
  const [tempoScaduto, setTempoScaduto] = useState(false);
  const [tempoImpiegato, setTempoImpiegato] = useState(0);
  const [livelloPrima, setLivelloPrima] = useState(1); // TODO: leggere da user_levels
  const [timerAttivo, setTimerAttivo] = useState(false);

  const { userId, streak, lastActivityDate, medaglie, eserciziFattiOggi, eserciziDelGiorno, setUser, aggiungiMedaglia, setNavNascosta, marcaEsercizioDelGiornoCompletato } = useUserStore();

  const esercizio = mockEsercizi.find((e) => e.id === params.id);
  const categoria = mockCategorie.find((c) => c.id === esercizio?.categoria_id);
  const cc = categoria ? CATEGORIA_COLORS[categoria.id] : null;

  // Blocca scroll e nasconde navbar per tutta la durata della pagina esercizio
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    setNavNascosta(true);
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      setNavNascosta(false);
    };
  }, []);

  // Reset timer quando l'esercizio inizia
  useEffect(() => {
    if (stato !== "esercizio") return;
    setTempoRimanente(DURATA_SESSIONE);
    setTempoScaduto(false);
    setTimerAttivo(false);
    setLivelloPrima(1); // TODO: leggere da user_levels per categoria
  }, [stato]);

  // Timer parte solo quando onReady viene chiamato dal componente esercizio
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

  function handleReady() {
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

    // Marca come completato se è un esercizio del giorno
    const isDelGiorno = eserciziDelGiorno.some((e) => e.id === esercizio.id);
    if (isDelGiorno) {
      marcaEsercizioDelGiornoCompletato(esercizio.id);
      await marcaEsercizioCompletato(userId, esercizio.id);
    }

    setUser({ streak: nuovoStreak, lastActivityDate: oggi, eserciziFattiOggi: eserciziFattiOggi + 1 });
    nuoveMedaglie.forEach((id) => aggiungiMedaglia(id));

    // Aggiorna livello categoria
    if (esercizio.categoria_id) {
      const nuovoLivello = await aggiornaUserLevel(userId, esercizio.categoria_id, punteggio);
      setUser({ userLevels: { ...useUserStore.getState().userLevels, [esercizio.categoria_id]: nuovoLivello } });
    }
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

  const game = (esercizio.config as Record<string, unknown>)?.game as string | undefined;
  const esCfg = esercizio.config as unknown as Record<string, string>;
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

            {/* Badge + Titolo */}
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

            {/* Info cards */}
            <div className="flex gap-4">
              {/* Durata */}
              <div className="flex-1 bg-surface rounded-2xl p-4 flex flex-col items-center gap-3">
                <Timer width={24} height={24} strokeWidth={1.5} color={cc?.text ?? COLORS.primary} />
                <div className="text-center">
                  <p className="text-xs" style={{ color: COLORS.inkMuted }}>Durata</p>
                  <p className="text-base font-bold text-ink">1 minuto</p>
                </div>
              </div>
              {/* Difficoltà */}
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

            {/* Perché fa bene */}
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: cc?.bg ?? COLORS.surfaceAlt }}>
              <div className="flex items-center gap-3">
                <LightBulb width={24} height={24} strokeWidth={1.5} color={cc?.text ?? COLORS.primary} />
                <p className="text-lg font-bold text-ink">Perché fa bene?</p>
              </div>
              <p className="text-base leading-relaxed" style={{ color: COLORS.inkMuted }}>
                {esercizio.beneficio}
              </p>
            </div>

            {/* CTA */}
            <Btn size="lg" onClick={() => setStato("esercizio")}>Inizia ora</Btn>
          </div>
        )}

        {/* ── ESERCIZIO ──────────────────────────────────────────────────── */}
        {stato === "esercizio" && (
          <>
            {game === "sequence_tap" && (
              <SequenzaTap
                stimulusType={esCfg.stimulusType as "numeri" | "parole" | "immagini"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "recall_grid" && (
              <RecallGrid
                stimulusType={esCfg.stimulusType as "numeri" | "parole"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "sort_it" && (
              <SortIt
                stimulusType={esCfg.stimulusType as "colore" | "forma" | "numero" | "texture" | "dimensione"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "pasat_light" && (
              <PasatLight
                digitType={esCfg.digitType as "single" | "double"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "updating_wm" && (
              <UpdatingWm
                stimulusType={esCfg.stimulusType as "numerici" | "parole_living" | "parole_non_living" | "parole_miste" | "misti"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "memoria_lista" && (
              <MemoriaLista
                stimulusType={esCfg.stimulusType as "parole_semantiche" | "parole_non_correlate" | "numeri" | "parole_living" | "parole_non_living" | "immagini"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "memoria_di_prosa" && (
              <MemoriaDiProsa
                textType={esCfg.textType as "narrativi" | "descrittivi" | "procedurali"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "sart" && (
              <Sart
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "go_nogo" && (
              <GoNoGo
                stimulusType={esCfg.stimulusType as "cromatico" | "semantico" | "multimodale" | "lessicale"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "flanker" && (
              <Flanker
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "task_switching" && (
              <TaskSwitching
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "dccs_light" && (
              <DccsLight
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "mental_rotation" && (
              <MentalRotation
                stimulusType={esCfg.stimulusType as "forme" | "oggetti_3d"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "figure_ground" && (
              <FigureGround
                stimulusType={esCfg.stimulusType as "forme" | "oggetti"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "block_design" && (
              <BlockDesign
                stimulusType={esCfg.stimulusType as "colori" | "bw"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "pianificazione" && (
              <Pianificazione
                variant={esCfg.variant as "tower_of_london" | "brixton"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "verbal_fluency" && (
              <VerbalFluency
                variant={esCfg.variant as "alternata" | "categoriale" | "fonemica"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "linguaggio" && (
              <Linguaggio
                variant={esCfg.variant as "naming" | "lexical_decision" | "sentence_anagram" | "semantic_relatedness" | "proverb_completion"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "memoria_prospettica" && (
              <MemoriaProspettica
                cueType={esCfg.cueType as "visivo_saliente" | "semantico" | "time_based"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "dual_task" && (
              <DualTask
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "vigilance" && (
              <Vigilance
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "hayling" && (
              <Hayling
                sentenceType={esCfg.sentenceType as "frasi_quotidiane" | "frasi_narrative" | "frasi_tecnico_scientifiche"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "odd_one_out" && (
              <OddOneOut
                stimulusType={esCfg.stimulusType as "numeri_lettere" | "parole" | "forme"}
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "stroop_color_word" && (
              <StroopColorWord
                variant="color_word"
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
            {game === "spatial_stroop" && (
              <StroopColorWord
                variant="spatial"
                livello={(esercizio as Record<string, unknown>).livello as number ?? 1}
                tempoScaduto={tempoScaduto}
                onReady={handleReady}
                onComplete={handleComplete}
              />
            )}
          </>
        )}

        {/* ── RISULTATO ──────────────────────────────────────────────────── */}
        {stato === "risultato" && (() => {
          const livelloDopo = score > 80
            ? Math.min(20, livelloPrima + 1)
            : score < 70
            ? Math.max(1, livelloPrima - 1)
            : livelloPrima;
          const catColor = cc?.text ?? COLORS.primary;
          const catBg = cc?.bg ?? COLORS.primaryLight;
          const CatIcon = categoria?.icona ? ICON_MAP[categoria.icona] : null;

          return (
            <div className="flex flex-col gap-8 pt-4 pb-6">

              {/* Stella + Titolo */}
              <div className="flex flex-col items-center gap-4">
                <Star width={48} height={48} strokeWidth={1.5} color={catColor} fill={catColor} />
                <h1 className="text-3xl font-extrabold text-ink text-center">{scoreMsg}</h1>
              </div>

              {/* Info cards: Tempo + Accuratezza */}
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

              {/* Livello categoria */}
              <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ backgroundColor: catBg }}>
                <div className="flex items-center gap-3">
                  {CatIcon && <CatIcon width={24} height={24} strokeWidth={1.5} color={catColor} />}
                  <p className="text-lg font-bold text-ink">Il tuo livello {categoria?.nome}</p>
                </div>

                {/* Prima */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-base">
                    <span style={{ color: COLORS.inkMuted }}>Prima</span>
                    <span className="font-bold" style={{ color: catColor }}>{livelloPrima}/20</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${catColor}33` }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(livelloPrima / 20) * 100}%`, backgroundColor: catColor }} />
                  </div>
                </div>

                {/* Dopo */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-base">
                    <span style={{ color: COLORS.inkMuted }}>Dopo</span>
                    <span className="font-bold" style={{ color: catColor }}>{livelloDopo}/20</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${catColor}33` }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(livelloDopo / 20) * 100}%`, backgroundColor: catColor }} />
                  </div>
                </div>
              </div>

              {/* CTA */}
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
