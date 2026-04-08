// ─── Mock User ───────────────────────────────────────────────────────────────
export const mockUser = {
  nome: "Maria",
  anno_nascita: 1958,
  streak: 5,
  esercizi_totali: 23,
  score_settimana: 4,
};

// ─── Mock Categorie ───────────────────────────────────────────────────────────
export const mockCategorie = [
  { id: "memoria", nome: "Memoria", icona: "brain", colore: "#2563EB", descrizione: "Ricorda, memorizza, richiama" },
  { id: "attenzione", nome: "Attenzione", icona: "target", colore: "#7C3AED", descrizione: "Concentrati, osserva, reagisci" },
  { id: "linguaggio", nome: "Linguaggio", icona: "chat", colore: "#16A34A", descrizione: "Parole, frasi, significati" },
];

// ─── Mock Esercizi ────────────────────────────────────────────────────────────
export const mockEsercizi = [
  {
    id: "ricorda-parole",
    categoria_id: "memoria",
    titolo: "Ricorda le Parole",
    descrizione: "Memorizza le parole e poi riordinale nell'ordine giusto.",
    difficolta: "facile",
    livello: 1,
    durata_stimata: 90,
    beneficio: "Stimola la memoria di lavoro e la capacità di richiamare informazioni recenti.",
    tipo: "memoria_parole",
    config: {
      parole: ["CASA", "LUNA", "PANE", "FIORE"],
      tempo_visualizzazione: 5,
      tempo_risposta: 30,
    },
  },
  {
    id: "stroop-test",
    categoria_id: "attenzione",
    titolo: "Test Stroop",
    descrizione: "Di che colore è scritto questo testo? Tocca il colore giusto!",
    difficolta: "medio",
    livello: 2,
    durata_stimata: 60,
    beneficio: "Potenzia il controllo cognitivo e l'inibizione delle risposte automatiche.",
    tipo: "stroop",
    config: {
      domande: 8,
      tempo_per_domanda: 4,
    },
  },
  {
    id: "anagramma",
    categoria_id: "linguaggio",
    titolo: "Anagramma",
    descrizione: "Riordina le lettere per trovare la parola nascosta.",
    difficolta: "facile",
    livello: 1,
    durata_stimata: 45,
    beneficio: "Stimola le capacità linguistiche e il pensiero flessibile.",
    tipo: "anagramma",
    config: {
      parole: ["AMORE", "TAVOLO", "FIORE"],
      suggerimento: true,
      tempo: 45,
    },
  },
  {
    id: "sequenza-colori",
    categoria_id: "memoria",
    titolo: "Sequenza di Colori",
    descrizione: "Osserva la sequenza e ripetila nell'ordine giusto.",
    difficolta: "facile",
    livello: 2,
    durata_stimata: 60,
    beneficio: "Allena la memoria sequenziale e il coordinamento visivo-motorio.",
    tipo: "sequenza_colori",
    config: {
      lunghezza_sequenza: 4,
      tempo_per_colore: 800,
    },
  },
  {
    id: "completa-parola",
    categoria_id: "linguaggio",
    titolo: "Completa la Parola",
    descrizione: "Trova le lettere mancanti per completare la parola.",
    difficolta: "facile",
    livello: 1,
    durata_stimata: 30,
    beneficio: "Mantiene il vocabolario attivo e la memoria delle parole.",
    tipo: "completa_parola",
    config: {
      parole: ["CA__", "F__RE", "LU__"],
      soluzioni: ["CASA", "FIORE", "LUNA"],
    },
  },
];

export const mockEsercizioDelGiorno = mockEsercizi[0];

// ─── Mock Medaglie ────────────────────────────────────────────────────────────
export const mockMedaglie = [
  { id: "prima-sfida", nome: "Prima Sfida", icona: "star", descrizione: "Hai completato il tuo primo esercizio!", guadagnata: true, guadagnata_at: "2024-03-20" },
  { id: "tre-giorni", nome: "3 Giorni di Fila", icona: "flame", descrizione: "Ti alleni da 3 giorni consecutivi!", guadagnata: true, guadagnata_at: "2024-03-22" },
  { id: "sette-giorni", nome: "Una Settimana!", icona: "gym", descrizione: "Sette giorni di allenamento consecutivo!", guadagnata: false },
  { id: "dieci-esercizi", nome: "Allenatore", icona: "target", descrizione: "Hai completato 10 esercizi in totale", guadagnata: true, guadagnata_at: "2024-03-23" },
  { id: "maestro-memoria", nome: "Maestro della Memoria", icona: "brain", descrizione: "10 esercizi di memoria completati", guadagnata: false },
  { id: "trenta-giorni", nome: "Un Mese Intero", icona: "trophy", descrizione: "Trenta giorni consecutivi!", guadagnata: false },
];

// ─── Mock Progressi ───────────────────────────────────────────────────────────
export const mockProgressiSettimanali = [
  { giorno: "Lun", esercizi: 2, memoria: 1, attenzione: 1, linguaggio: 0 },
  { giorno: "Mar", esercizi: 1, memoria: 0, attenzione: 0, linguaggio: 1 },
  { giorno: "Mer", esercizi: 3, memoria: 1, attenzione: 1, linguaggio: 1 },
  { giorno: "Gio", esercizi: 0, memoria: 0, attenzione: 0, linguaggio: 0 },
  { giorno: "Ven", esercizi: 2, memoria: 1, attenzione: 0, linguaggio: 1 },
  { giorno: "Sab", esercizi: 1, memoria: 1, attenzione: 0, linguaggio: 0 },
  { giorno: "Dom", esercizi: 1, memoria: 0, attenzione: 0, linguaggio: 1 },
];

export const mockScoreCategorie = [
  {
    categoria: "Memoria", icona: "brain", colore: "#2563EB", score: 74,
    trend: "crescita" as const, livello: 3, sessioni: 8,
    descrizione: "La tua memoria è al 74%",
    storico: [
      { label: "6 Mar",  score: 52 }, { label: "10 Mar", score: 56 },
      { label: "14 Mar", score: 59 }, { label: "18 Mar", score: 62 },
      { label: "22 Mar", score: 64 }, { label: "25 Mar", score: 67 },
      { label: "27 Mar", score: 68 }, { label: "29 Mar", score: 70 },
      { label: "31 Mar", score: 71 }, { label: "1 Apr",  score: 72 },
      { label: "2 Apr",  score: 73 }, { label: "3 Apr",  score: 74 },
    ],
  },
  {
    categoria: "Attenzione", icona: "target", colore: "#7C3AED", score: 61,
    trend: "stabile" as const, livello: 2, sessioni: 5,
    descrizione: "La tua attenzione è al 61%",
    storico: [
      { label: "6 Mar",  score: 58 }, { label: "10 Mar", score: 62 },
      { label: "14 Mar", score: 59 }, { label: "18 Mar", score: 63 },
      { label: "22 Mar", score: 60 }, { label: "25 Mar", score: 64 },
      { label: "27 Mar", score: 59 }, { label: "29 Mar", score: 63 },
      { label: "31 Mar", score: 60 }, { label: "1 Apr",  score: 62 },
      { label: "2 Apr",  score: 60 }, { label: "3 Apr",  score: 61 },
    ],
  },
  {
    categoria: "Linguaggio", icona: "chat", colore: "#16A34A", score: 88,
    trend: "calo" as const, livello: 4, sessioni: 6,
    descrizione: "Il tuo linguaggio è all'88%",
    storico: [
      { label: "6 Mar",  score: 96 }, { label: "10 Mar", score: 94 },
      { label: "14 Mar", score: 95 }, { label: "18 Mar", score: 93 },
      { label: "22 Mar", score: 92 }, { label: "25 Mar", score: 91 },
      { label: "27 Mar", score: 92 }, { label: "29 Mar", score: 90 },
      { label: "31 Mar", score: 90 }, { label: "1 Apr",  score: 89 },
      { label: "2 Apr",  score: 89 }, { label: "3 Apr",  score: 88 },
    ],
  },
];

export const mockSessioniRecenti = [
  { titolo: "Ricorda le Parole", categoria: "Memoria", score: 80, data: "Oggi", icona: "brain", trend: "crescita" as const },
  { titolo: "Test Stroop", categoria: "Attenzione", score: 70, data: "Ieri", icona: "target", trend: "stabile" as const },
  { titolo: "Anagramma", categoria: "Linguaggio", score: 100, data: "Ieri", icona: "chat", trend: "calo" as const },
  { titolo: "Sequenza di Colori", categoria: "Memoria", score: 60, data: "2 giorni fa", icona: "brain", trend: "stabile" as const },
];

// ─── Mock Storico Giornaliero ─────────────────────────────────────────────────
export const mockTotaleSettimanaScorsa = 7;

export const mockStoricoGiornaliero = [
  {
    data: "2026-04-03",
    sessioni: [
      { categoria: "Memoria",    icona: "brain",  livello: 3, score: 74 },
      { categoria: "Linguaggio", icona: "chat",   livello: 4, score: 88 },
    ],
  },
  {
    data: "2026-04-02",
    sessioni: [],
  },
  {
    data: "2026-04-01",
    sessioni: [
      { categoria: "Memoria",    icona: "brain",  livello: 3, score: 70 },
      { categoria: "Attenzione", icona: "target", livello: 2, score: 61 },
      { categoria: "Linguaggio", icona: "chat",   livello: 4, score: 89 },
    ],
  },
  {
    data: "2026-03-31",
    sessioni: [
      { categoria: "Linguaggio", icona: "chat", livello: 4, score: 88 },
    ],
  },
  {
    data: "2026-03-30",
    sessioni: [
      { categoria: "Memoria",    icona: "brain",  livello: 3, score: 68 },
      { categoria: "Attenzione", icona: "target", livello: 2, score: 58 },
    ],
  },
];
