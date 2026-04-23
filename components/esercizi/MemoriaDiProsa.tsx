"use client";

import { useState, useEffect, useRef } from "react";
import { COLORS } from "@/lib/design-tokens";

type TextType = "narrativi" | "descrittivi" | "procedurali";
type TipoRisposta = "riconoscimento" | "richiamo_parziale" | "richiamo_libero";

type LivelloConfig = {
  nFrasi: number;
  delayS: number;
  tipo: TipoRisposta;
};

function getLivello(lv: number): LivelloConfig {
  const idx = Math.min(Math.max(lv - 1, 0), 19);
  if (idx <= 0)  return { nFrasi: 2, delayS: 0, tipo: "riconoscimento" };
  if (idx <= 3)  return { nFrasi: 3, delayS: 0, tipo: "riconoscimento" };
  if (idx <= 4)  return { nFrasi: 4, delayS: 0, tipo: "riconoscimento" };
  if (idx <= 7)  return { nFrasi: 5, delayS: 0, tipo: "riconoscimento" };
  if (idx <= 9)  return { nFrasi: 6, delayS: 120, tipo: "richiamo_parziale" };
  if (idx <= 12) return { nFrasi: 7, delayS: 150, tipo: "richiamo_parziale" };
  if (idx <= 14) return { nFrasi: 9, delayS: 240, tipo: "richiamo_libero" };
  if (idx <= 17) return { nFrasi: 9, delayS: 240, tipo: "richiamo_libero" };
  return { nFrasi: 10, delayS: 300, tipo: "richiamo_libero" };
}

interface Domanda {
  testo: string;
  opzioni: string[];
  corretta: number;
}

interface Testo {
  frasi: string[];
  domande: Domanda[];
}

const TESTI: Record<TextType, Testo[]> = {
  narrativi: [
    {
      frasi: [
        "Maria si svegliò presto quella mattina di primavera.",
        "Aprì la finestra e sentì il profumo dei fiori del giardino.",
        "Scese in cucina e preparò il caffè come ogni giorno.",
        "Il gatto arancione la aspettava seduto sul tavolo.",
        "Dopo colazione, Maria uscì per andare al mercato del paese.",
        "Comprò pomodori, pane fresco e un mazzo di margherite.",
        "Sulla strada del ritorno, incontrò la sua amica Lucia.",
        "Le due donne si fermarono a chiacchierare per mezz'ora.",
        "Lucia le raccontò che suo figlio si sarebbe sposato in giugno.",
        "Maria tornò a casa felice, con il cuore pieno di gioia.",
      ],
      domande: [
        { testo: "In quale stagione si svolge la storia?", opzioni: ["Estate", "Autunno", "Primavera", "Inverno"], corretta: 2 },
        { testo: "Cosa comprò Maria al mercato?", opzioni: ["Carote e latte", "Pomodori, pane e margherite", "Frutta e verdura", "Caffè e zucchero"], corretta: 1 },
        { testo: "Chi incontrò Maria sulla strada del ritorno?", opzioni: ["Il marito", "La sorella", "Lucia", "Il vicino"], corretta: 2 },
        { testo: "Cosa fece Maria per prima cosa al mattino?", opzioni: ["Preparò il caffè", "Aprì la finestra", "Andò in giardino", "Chiamò il gatto"], corretta: 1 },
        { testo: "Di che colore era il gatto?", opzioni: ["Nero", "Bianco", "Grigio", "Arancione"], corretta: 3 },
      ],
    },
    {
      frasi: [
        "Giovanni aveva sempre amato la montagna fin da bambino.",
        "Ogni estate, partiva con lo zaino in spalla per lunghe escursioni.",
        "Quel giorno scelse un sentiero che non aveva mai percorso prima.",
        "Il cielo era limpido e l'aria fresca profumava di pino.",
        "Dopo tre ore di cammino, raggiunse un piccolo lago di montagna.",
        "L'acqua era così trasparente da sembrare uno specchio.",
        "Si sedette su una roccia e mangiò un panino al salame.",
        "Un'aquila volteggiava lentamente sopra di lui.",
        "Giovanni pensò che non avrebbe scambiato quel momento con niente al mondo.",
        "Prima di scendere, fotografò il paesaggio con il suo vecchio telefono.",
      ],
      domande: [
        { testo: "Cosa trovò Giovanni dopo tre ore di cammino?", opzioni: ["Un rifugio", "Un piccolo lago", "Un paese", "Una cascata"], corretta: 1 },
        { testo: "Cosa mangiò Giovanni seduto sulla roccia?", opzioni: ["Una mela", "Un panino al salame", "Della frutta", "Del cioccolato"], corretta: 1 },
        { testo: "Cosa volava sopra Giovanni?", opzioni: ["Una rondine", "Un falco", "Un'aquila", "Un corvo"], corretta: 2 },
        { testo: "Come era il cielo quel giorno?", opzioni: ["Nuvoloso", "Limpido", "Grigio", "Piovoso"], corretta: 1 },
        { testo: "Con cosa fotografò il paesaggio?", opzioni: ["Una macchina fotografica", "Un vecchio telefono", "Una reflex", "Non fotografò"], corretta: 1 },
      ],
    },
    {
      frasi: [
        "La piccola Sofia ricevette in regalo una bicicletta rossa per il suo compleanno.",
        "Era la cosa che desiderava da tanto tempo.",
        "Il padre la aiutò a montarci sopra per la prima volta.",
        "Sofia aveva un po' paura di cadere.",
        "Ma dopo pochi tentativi, cominciò a pedalare da sola.",
        "La madre la guardava dalla finestra e sorrideva.",
        "Sofia percorse tutta la via davanti a casa in bicicletta.",
        "Era così contenta che urlò di gioia.",
        "Il nonno, che era venuto per il compleanno, la applaudì forte.",
        "Quella sera Sofia si addormentò felice, sognando nuove avventure.",
      ],
      domande: [
        { testo: "Di che colore era la bicicletta di Sofia?", opzioni: ["Blu", "Verde", "Rossa", "Gialla"], corretta: 2 },
        { testo: "Chi aiutò Sofia a montare in bicicletta?", opzioni: ["La madre", "Il nonno", "Il fratello", "Il padre"], corretta: 3 },
        { testo: "Come si sentiva Sofia all'inizio?", opzioni: ["Eccitata", "Arrabbiata", "Un po' spaventata", "Indifferente"], corretta: 2 },
        { testo: "Chi guardava Sofia dalla finestra?", opzioni: ["Il padre", "La madre", "Il nonno", "Una sorella"], corretta: 1 },
        { testo: "Dove era il nonno quel giorno?", opzioni: ["A casa sua", "Al lavoro", "Era venuto per il compleanno", "In viaggio"], corretta: 2 },
      ],
    },
  ],
  descrittivi: [
    {
      frasi: [
        "Il vecchio borgo di Castelmonaco sorge su una collina tra i vigneti.",
        "Le sue mura medievali sono ancora in ottimo stato di conservazione.",
        "Entrando dal portone principale, si percorre una stradina acciottolata.",
        "Ai lati ci sono case di pietra con finestre fiorite di gerani rossi.",
        "Al centro del paese si trova la piazza con la fontana del cinquecento.",
        "L'acqua della fontana scorre sempre, anche d'estate.",
        "La chiesa romanica domina la piazza con il suo campanile snello.",
        "All'interno conserva affreschi del quattordicesimo secolo.",
        "Nei vicoli laterali si trovano piccole botteghe artigiane.",
        "La vista dalla torre panoramica abbraccia tutta la valle sottostante.",
      ],
      domande: [
        { testo: "Dove sorge il borgo di Castelmonaco?", opzioni: ["In pianura", "Su una collina tra i vigneti", "Vicino al mare", "In una valle"], corretta: 1 },
        { testo: "Di che colore sono i gerani alle finestre?", opzioni: ["Bianchi", "Rossi", "Gialli", "Rosa"], corretta: 1 },
        { testo: "Cosa si trova al centro del paese?", opzioni: ["Una chiesa", "Un castello", "La piazza con la fontana", "Un mercato"], corretta: 2 },
        { testo: "Di che stile è la chiesa?", opzioni: ["Barocca", "Gotica", "Romanica", "Moderna"], corretta: 2 },
        { testo: "Da dove si vede tutta la valle?", opzioni: ["Dal campanile", "Dalla torre panoramica", "Dalle mura", "Dalla piazza"], corretta: 1 },
      ],
    },
    {
      frasi: [
        "Il mercato del lunedì mattina è uno degli appuntamenti più amati del paese.",
        "I banchi si dispongono lungo il viale principale già dalle sette di mattina.",
        "Il banco della frutta di Enzo è sempre il più colorato.",
        "Ci sono pesche, prugne, meloni e frutta di stagione.",
        "Accanto, la signora Rosa vende le sue verdure dell'orto.",
        "All'angolo, un fornaio porta pane fresco e focacce profumate.",
        "I clienti arrivano a piedi o in bicicletta da tutto il circondario.",
        "Le anziane signore si fermano a chiacchierare tra i banchi.",
        "L'odore di pane, spezie e frutta si mescola nell'aria.",
        "Verso mezzogiorno i banchi si smontano e il viale torna silenzioso.",
      ],
      domande: [
        { testo: "Quando si svolge il mercato?", opzioni: ["Mercoledì pomeriggio", "Lunedì mattina", "Sabato mattina", "Venerdì sera"], corretta: 1 },
        { testo: "Chi ha il banco della frutta?", opzioni: ["La signora Rosa", "Enzo", "Il fornaio", "Marco"], corretta: 1 },
        { testo: "Cosa vende la signora Rosa?", opzioni: ["Frutta", "Spezie", "Verdure dell'orto", "Pane"], corretta: 2 },
        { testo: "Come arrivano i clienti al mercato?", opzioni: ["In auto", "A piedi o in bicicletta", "In treno", "In scooter"], corretta: 1 },
        { testo: "Quando si smontano i banchi?", opzioni: ["All'alba", "Verso mezzogiorno", "Nel pomeriggio", "La sera"], corretta: 1 },
      ],
    },
    {
      frasi: [
        "La cucina della nonna è il cuore caldo della casa.",
        "Le pareti sono color crema, con piastrelle dipinte a mano.",
        "Un grande tavolo di legno occupa il centro della stanza.",
        "Sopra il tavolo c'è sempre una tovaglia a quadri rossi e bianchi.",
        "I fornelli sono di ghisa, sempre lucidati.",
        "Dalla finestra si vede il giardino con il ciliegio.",
        "Appese alle pareti ci sono fotografie di famiglia.",
        "Un orologio a pendolo ticchetta silenzioso in un angolo.",
        "L'odore di ragù e cannella è sempre nell'aria.",
        "La cucina della nonna è il posto dove la famiglia si riunisce.",
      ],
      domande: [
        { testo: "Di che colore sono le pareti della cucina?", opzioni: ["Bianche", "Color crema", "Azzurre", "Gialle"], corretta: 1 },
        { testo: "Di che colore è la tovaglia sul tavolo?", opzioni: ["Blu e bianca", "Verde e gialla", "Rossa e bianca", "Arancione"], corretta: 2 },
        { testo: "Cosa si vede dalla finestra?", opzioni: ["La strada", "Il giardino con il ciliegio", "Il cortile", "I vicini"], corretta: 1 },
        { testo: "Cosa c'è appeso alle pareti?", opzioni: ["Quadri", "Fotografie di famiglia", "Calendari", "Piatti decorativi"], corretta: 1 },
        { testo: "Che odore c'è nella cucina?", opzioni: ["Pane e burro", "Ragù e cannella", "Aglio e rosmarino", "Caffè e cioccolato"], corretta: 1 },
      ],
    },
  ],
  procedurali: [
    {
      frasi: [
        "Per preparare una buona pasta al pomodoro, inizia mettendo una pentola d'acqua sul fuoco.",
        "Aggiungi sale quando l'acqua comincia a bollire.",
        "Nel frattempo, scalda un filo d'olio in una padella.",
        "Aggiungi uno spicchio d'aglio e fallo dorare.",
        "Versa i pomodori pelati schiacciati con la forchetta.",
        "Aggiungi un pizzico di sale e qualche foglia di basilico.",
        "Lascia cuocere il sugo a fuoco basso per venti minuti.",
        "Butta la pasta nell'acqua bollente e cuoci al dente.",
        "Scola la pasta e versala nella padella con il sugo.",
        "Mescola bene, aggiungi parmigiano e servi subito.",
      ],
      domande: [
        { testo: "Quando si aggiunge il sale all'acqua?", opzioni: ["Prima che bolle", "Dopo aver messo la pasta", "Quando comincia a bollire", "Non si aggiunge"], corretta: 2 },
        { testo: "Cosa si fa dorare nell'olio?", opzioni: ["La cipolla", "Il peperoncino", "Lo spicchio d'aglio", "Le erbe aromatiche"], corretta: 2 },
        { testo: "Per quanto tempo si cuoce il sugo?", opzioni: ["Cinque minuti", "Dieci minuti", "Mezz'ora", "Venti minuti"], corretta: 3 },
        { testo: "Come si cuoce la pasta?", opzioni: ["Molto cotta", "Cruda", "Al dente", "Sfatta"], corretta: 2 },
        { testo: "Cosa si aggiunge alla fine?", opzioni: ["Olio di oliva", "Parmigiano", "Burro", "Pepe"], corretta: 1 },
      ],
    },
    {
      frasi: [
        "Per piantare un fiore in vaso, scegli prima un vaso adatto con il foro di drenaggio.",
        "Metti uno strato di ghiaia sul fondo per far scolare l'acqua.",
        "Riempi il vaso a metà con la terra per piante.",
        "Estrai la pianta dal contenitore originale con delicatezza.",
        "Elimina la terra in eccesso dalle radici.",
        "Posiziona la pianta al centro del vaso.",
        "Aggiungi altra terra intorno alle radici.",
        "Premi leggermente la terra con le dita.",
        "Annaffia abbondantemente subito dopo.",
        "Metti il vaso in un posto luminoso ma non sotto il sole diretto.",
      ],
      domande: [
        { testo: "Perché si mette la ghiaia sul fondo?", opzioni: ["Per decorare", "Per far scolare l'acqua", "Per far crescere meglio", "Non serve"], corretta: 1 },
        { testo: "Come si estrae la pianta dal vecchio contenitore?", opzioni: ["Con forza", "Con delicatezza", "Scuotendola", "Tagliando le radici"], corretta: 1 },
        { testo: "Dove si posiziona la pianta nel vaso?", opzioni: ["Di lato", "Al bordo", "Al centro", "Dove vuoi"], corretta: 2 },
        { testo: "Cosa si fa subito dopo aver piantato?", opzioni: ["Si concima", "Si taglia", "Si annaffia abbondantemente", "Si aspetta"], corretta: 2 },
        { testo: "Dove si mette il vaso?", opzioni: ["In cantina", "Al sole diretto", "In un posto luminoso non a sole diretto", "Al buio"], corretta: 2 },
      ],
    },
    {
      frasi: [
        "Per fare il pane in casa, inizia sciogliendo il lievito in acqua tiepida.",
        "Aggiungi un cucchiaino di zucchero e lascia riposare cinque minuti.",
        "In una ciotola grande metti la farina e fai un buco al centro.",
        "Versa il lievito sciolto e aggiungi sale e olio.",
        "Impasta per almeno dieci minuti fino ad avere un composto liscio.",
        "Copri con un panno umido e lascia lievitare due ore.",
        "Riprendi l'impasto, dallo la forma che preferisci.",
        "Mettilo in una teglia unta e lascia riposare altri trenta minuti.",
        "Scalda il forno a duecento gradi.",
        "Cuoci per venticinque minuti fino a doratura.",
      ],
      domande: [
        { testo: "Dove si scioglie il lievito?", opzioni: ["In acqua fredda", "In acqua tiepida", "Nel latte", "Nell'olio"], corretta: 1 },
        { testo: "Per quanto si impasta?", opzioni: ["Due minuti", "Cinque minuti", "Almeno dieci minuti", "Mezz'ora"], corretta: 2 },
        { testo: "Per quanto tempo lievita la prima volta?", opzioni: ["Mezz'ora", "Un'ora", "Due ore", "Tutta la notte"], corretta: 2 },
        { testo: "A che temperatura si scalda il forno?", opzioni: ["Cento gradi", "Centocinquanta gradi", "Duecento gradi", "Duecentocinquanta gradi"], corretta: 2 },
        { testo: "Per quanto si cuoce il pane?", opzioni: ["Dieci minuti", "Venticinque minuti", "Un'ora", "Quindici minuti"], corretta: 1 },
      ],
    },
  ],
};

type Fase = "intro" | "lettura" | "countdown" | "domande" | "feedback";

interface Props {
  textType: TextType;
  livello: number;
  tempoScaduto: boolean;
  onComplete: (score: number, acc: number) => void;
  onReady?: () => void;
}

const MAX_BRANI = 3;

export default function MemoriaDiProsa({ textType, livello, tempoScaduto, onComplete, onReady }: Props) {
  const cfg = getLivello(livello);
  const completato = useRef(false);
  const onReadyCalled = useRef(false);
  const poolRef = useRef([...TESTI[textType]].sort(() => Math.random() - 0.5));
  const branoIdxRef = useRef(0);

  const [testo, setTesto] = useState<Testo>(() => poolRef.current[0]);
  const [branoCorrente, setBranoCorrente] = useState(1);

  const frasi = testo.frasi.slice(0, cfg.nFrasi);
  const domande = testo.domande.slice(0, Math.min(3, testo.domande.length));

  const [fase, setFase] = useState<Fase>("intro");
  const [countdown, setCountdown] = useState(cfg.delayS);
  const [domandaIdx, setDomandaIdx] = useState(0);
  const [corretti, setCorretti] = useState(0);
  const [totaleRisposte, setTotaleRisposte] = useState(0);
  const [rispostaData, setRispostaData] = useState(false);
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (fase !== "countdown") return;
    if (countdown <= 0) {
      setFase("domande");
      if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [fase, countdown]);

  useEffect(() => {
    if (!tempoScaduto || completato.current) return;
    completato.current = true;
    const score = totaleRisposte > 0 ? Math.round((corretti / totaleRisposte) * 100) : 0;
    onComplete(score, score);
  }, [tempoScaduto, corretti, totaleRisposte, onComplete]);

  function handleLetto() {
    if (cfg.delayS > 0) {
      setCountdown(cfg.delayS);
      setFase("countdown");
    } else {
      setFase("domande");
      if (!onReadyCalled.current) { onReadyCalled.current = true; onReady?.(); }
    }
  }

  function handleRisposta(idx: number) {
    if (rispostaData) return;
    setRispostaData(true);
    const ok = idx === domande[domandaIdx].corretta;
    setLastOk(ok);
    const nuoviC = corretti + (ok ? 1 : 0);
    const nuoviT = totaleRisposte + 1;
    setCorretti(nuoviC);
    setTotaleRisposte(nuoviT);
    setTimeout(() => {
      const next = domandaIdx + 1;
      if (next < domande.length) {
        setDomandaIdx(next);
        setRispostaData(false);
        setLastOk(null);
      } else {
        setFase("feedback");
        setTimeout(() => {
          if (completato.current) return;
          const nextBrano = branoIdxRef.current + 1;
          if (nextBrano < MAX_BRANI && nextBrano < poolRef.current.length) {
            branoIdxRef.current = nextBrano;
            setTesto(poolRef.current[nextBrano]);
            setBranoCorrente(nextBrano + 1);
            setFase("intro");
            setDomandaIdx(0);
            setRispostaData(false);
            setLastOk(null);
            setCountdown(cfg.delayS);
          } else {
            completato.current = true;
            const score = nuoviT > 0 ? Math.round((nuoviC / nuoviT) * 100) : 0;
            onComplete(score, score);
          }
        }, 1200);
      }
    }, 900);
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center">
        <span className="text-6xl">📖</span>
        <p className="text-xl font-bold" style={{ color: COLORS.ink }}>Leggi con attenzione</p>
        <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Brano {branoCorrente} / {Math.min(MAX_BRANI, poolRef.current.length)}</p>
        <p className="text-base" style={{ color: COLORS.inkMuted }}>Leggi il testo, poi risponderai a {domande.length} domande.</p>
        <button onClick={() => setFase("lettura")} className="rounded-2xl font-bold text-white px-8 py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Inizia a leggere
        </button>
      </div>
    );
  }

  if (fase === "lettura") {
    return (
      <div className="flex flex-col gap-4 py-4 px-3">
        <div className="rounded-2xl p-4" style={{ backgroundColor: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}` }}>
          {frasi.map((f, i) => (
            <p key={i} className="text-base leading-relaxed mb-2" style={{ color: COLORS.ink }}>{f}</p>
          ))}
        </div>
        <button onClick={handleLetto} className="rounded-2xl font-bold text-white py-4 text-lg active:scale-95" style={{ backgroundColor: COLORS.primary }}>
          Ho finito di leggere →
        </button>
      </div>
    );
  }

  if (fase === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
        <p className="text-base font-bold" style={{ color: COLORS.ink }}>Attendi prima delle domande…</p>
        <div className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-extrabold" style={{ backgroundColor: COLORS.primaryLight, border: `3px solid ${COLORS.primary}`, color: COLORS.primary }}>
          {countdown}s
        </div>
      </div>
    );
  }

  if (fase === "domande") {
    const dom = domande[domandaIdx];
    return (
      <div className="flex flex-col gap-4 py-4 px-3">
        <p className="text-sm font-medium" style={{ color: COLORS.inkMuted }}>Domanda {domandaIdx + 1} / {domande.length}</p>
        <div className="rounded-2xl p-4" style={{ backgroundColor: COLORS.primaryLight, border: `1px solid ${COLORS.primary}` }}>
          <p className="text-base font-bold" style={{ color: COLORS.ink }}>{dom.testo}</p>
        </div>
        <div className="flex flex-col gap-3">
          {dom.opzioni.map((opt, i) => {
            let bg: string = COLORS.surfaceAlt;
            let border: string = COLORS.border;
            if (rispostaData && lastOk !== null) {
              if (i === dom.corretta) { bg = COLORS.successLight; border = COLORS.success; }
            }
            return (
              <button key={i} onClick={() => handleRisposta(i)} disabled={rispostaData}
                className="rounded-2xl flex items-center px-4 font-semibold active:scale-95 transition-transform text-left"
                style={{ height: 56, fontSize: 16, backgroundColor: bg, border: `2px solid ${border}`, color: COLORS.ink, opacity: rispostaData ? 0.85 : 1 }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (fase === "feedback") {
    const pct = Math.round((corretti / domande.length) * 100);
    return (
      <div className="flex flex-col items-center gap-5 py-16 px-4 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl" style={{ backgroundColor: pct >= 70 ? COLORS.successLight : "#FEE2E2" }}>
          {pct >= 70 ? "✓" : "✗"}
        </div>
        <p className="text-2xl font-extrabold" style={{ color: pct >= 70 ? COLORS.success : "#EF4444" }}>{pct}%</p>
        <p className="text-sm" style={{ color: COLORS.inkMuted }}>{corretti} / {domande.length} risposte corrette</p>
      </div>
    );
  }

  return null;
}
