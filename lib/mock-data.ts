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
  { id: "memoria",    nome: "Memoria",    icona: "brain",  colore: "#2563EB", descrizione: "Ricorda, memorizza, richiama" },
  { id: "attenzione", nome: "Attenzione", icona: "target", colore: "#7C3AED", descrizione: "Concentrati, osserva, reagisci" },
  { id: "linguaggio", nome: "Linguaggio", icona: "chat",   colore: "#16A34A", descrizione: "Parole, frasi, significati" },
  { id: "esecutive",     nome: "Esecutive",     icona: "puzzle", colore: "#D97706", descrizione: "Pianifica, organizza, decidi" },
  { id: "visuospaziali", nome: "Visuospaziali", icona: "eye",    colore: "#0F766E", descrizione: "Percepisci, orienta, visualizza" },
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
  {
    id: "torre-hanoi",
    categoria_id: "esecutive",
    titolo: "Torre di Hanoi",
    descrizione: "Sposta i dischi da un piolo all'altro seguendo le regole.",
    difficolta: "medio",
    livello: 1,
    durata_stimata: 120,
    beneficio: "Allena la pianificazione, la flessibilità cognitiva e il problem solving.",
    tipo: "torre_hanoi",
    config: { dischi: 3 },
  },
  {
    id: "ordina-sequenza",
    categoria_id: "esecutive",
    titolo: "Ordina la Sequenza",
    descrizione: "Rimetti in ordine logico i passaggi di un'azione quotidiana.",
    difficolta: "facile",
    livello: 2,
    durata_stimata: 90,
    beneficio: "Stimola la pianificazione e l'organizzazione delle azioni.",
    tipo: "ordina_sequenza",
    config: { sequenze: 4 },
  },
  {
    id: "rotazione-mentale",
    categoria_id: "visuospaziali",
    titolo: "Rotazione Mentale",
    descrizione: "Identifica la forma ruotata tra le opzioni proposte.",
    difficolta: "medio",
    livello: 1,
    durata_stimata: 90,
    beneficio: "Potenzia la capacità di manipolare mentalmente oggetti nello spazio.",
    tipo: "rotazione_mentale",
    config: { forme: 6, tempo_per_domanda: 10 },
  },
  {
    id: "trova-percorso",
    categoria_id: "visuospaziali",
    titolo: "Trova il Percorso",
    descrizione: "Individua il percorso più breve per raggiungere la destinazione.",
    difficolta: "facile",
    livello: 2,
    durata_stimata: 75,
    beneficio: "Sviluppa l'orientamento spaziale e la memoria topografica.",
    tipo: "trova_percorso",
    config: { griglia: 4 },
  },
];

export const mockEsercizioDelGiorno = mockEsercizi[2]; // "anagramma" — primo non completato oggi

// TODO: da Supabase — SELECT * FROM esercizi_del_giorno WHERE data = TODAY() JOIN sessioni
export const mockEserciziDelGiornoList = [
  {
    id: "ricorda-parole",
    titolo: "Ricorda le Parole",
    categoria_id: "memoria",
    livello: 1,
    durata_stimata: 90,
    completato: true,
    risultato: { tempo_secondi: 108, accuratezza: 92 },
  },
  {
    id: "stroop-test",
    titolo: "Test Stroop",
    categoria_id: "attenzione",
    livello: 2,
    durata_stimata: 60,
    completato: true,
    risultato: { tempo_secondi: 130, accuratezza: 48 },
  },
  {
    id: "anagramma",
    titolo: "Anagramma",
    categoria_id: "linguaggio",
    livello: 1,
    durata_stimata: 120,
    completato: true,
    risultato: null,
  },
  {
    id: "torre-hanoi",
    titolo: "Torre di Hanoi",
    categoria_id: "esecutive",
    livello: 2,
    durata_stimata: 120,
    completato: true,
    risultato: null,
  },
  {
    id: "rotazione-mentale",
    titolo: "Rotazione Mentale",
    categoria_id: "visuospaziali",
    livello: 2,
    durata_stimata: 90,
    completato: true,
    risultato: null,
  },
] as const;

// TODO: in futuro questo verrà da Supabase (sessioni di oggi)
// TODO: sostituire con query Supabase — SELECT count(*) FROM sessioni WHERE utente_id = ? AND data = TODAY()
// La logica di blocco è: se sessioni_oggi >= LIMITE_ESERCIZI_GIORNO (5) → mostra modale pausa attiva
export const mockEserciziOggi = mockEserciziDelGiornoList.filter((e) => e.completato).length;

// ─── Mock Medaglie ────────────────────────────────────────────────────────────
// Ogni medaglia si ottiene completando 5 esercizi al giorno per X giorni consecutivi.
// guadagnata_at: valorizzato solo per le medaglie già sbloccate (streak mock = 7)
export const mockMedaglie = [
  { id: "giorno-1",   nome: "Primo giorno",     giorni: 1,   guadagnata_at: "2026-04-13" },
  { id: "giorni-2",   nome: "2 giorni attivi",  giorni: 2,   guadagnata_at: "2026-04-14" },
  { id: "giorni-3",   nome: "3 giorni attivi",  giorni: 3,   guadagnata_at: "2026-04-15" },
  { id: "giorni-7",   nome: "7 giorni attivi",  giorni: 7,   guadagnata_at: "2026-04-19" },
  { id: "giorni-10",  nome: "10 giorni attivi", giorni: 10 },
  { id: "giorni-14",  nome: "14 giorni attivi", giorni: 14 },
  { id: "giorni-28",  nome: "28 giorni attivi", giorni: 28 },
  { id: "giorni-50",  nome: "50 giorni attivi", giorni: 50 },
  { id: "giorni-100", nome: "100 giorni attivi",giorni: 100 },
  { id: "giorni-200", nome: "200 giorni attivi",giorni: 200 },
  { id: "giorni-365", nome: "365 giorni attivi",giorni: 365 },
];

// ─── Mock Progressi ───────────────────────────────────────────────────────────
// TODO: aggiungere dati reali per tipo4/tipo5 quando i nomi sono definiti
export const mockProgressiSettimanali = [
  { giorno: "Lun", esercizi: 3, memoria: 1, attenzione: 1, linguaggio: 0, esecutive: 1, visuospaziali: 0 },
  { giorno: "Mar", esercizi: 2, memoria: 0, attenzione: 0, linguaggio: 1, esecutive: 0, visuospaziali: 1 },
  { giorno: "Mer", esercizi: 5, memoria: 1, attenzione: 1, linguaggio: 1, esecutive: 1, visuospaziali: 1 },
  { giorno: "Gio", esercizi: 0, memoria: 0, attenzione: 0, linguaggio: 0, esecutive: 0, visuospaziali: 0 },
  { giorno: "Ven", esercizi: 4, memoria: 1, attenzione: 0, linguaggio: 1, esecutive: 1, visuospaziali: 1 },
  { giorno: "Sab", esercizi: 2, memoria: 1, attenzione: 0, linguaggio: 0, esecutive: 0, visuospaziali: 1 },
  { giorno: "Dom", esercizi: 2, memoria: 0, attenzione: 0, linguaggio: 1, esecutive: 1, visuospaziali: 0 },
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
    // TODO: sostituire con query Supabase — SELECT data, livello FROM sessioni WHERE categoria = 'memoria' ORDER BY data
    storicoLivello: [
      { label: "6 Mar",  livello: 1 }, { label: "10 Mar", livello: 1 },
      { label: "14 Mar", livello: 1 }, { label: "18 Mar", livello: 2 },
      { label: "22 Mar", livello: 2 }, { label: "25 Mar", livello: 2 },
      { label: "27 Mar", livello: 2 }, { label: "29 Mar", livello: 2 },
      { label: "31 Mar", livello: 3 }, { label: "1 Apr",  livello: 3 },
      { label: "2 Apr",  livello: 3 }, { label: "3 Apr",  livello: 3 },
      { label: "6 Apr",  livello: 3 }, { label: "7 Apr",  livello: 3 },
      { label: "8 Apr",  livello: 3 }, { label: "9 Apr",  livello: 4 },
      { label: "10 Apr", livello: 4 },
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
    // TODO: sostituire con query Supabase — SELECT data, livello FROM sessioni WHERE categoria = 'attenzione' ORDER BY data
    storicoLivello: [
      { label: "6 Mar",  livello: 2 }, { label: "10 Mar", livello: 2 },
      { label: "14 Mar", livello: 2 }, { label: "18 Mar", livello: 2 },
      { label: "22 Mar", livello: 2 }, { label: "25 Mar", livello: 2 },
      { label: "27 Mar", livello: 2 }, { label: "29 Mar", livello: 2 },
      { label: "31 Mar", livello: 2 }, { label: "1 Apr",  livello: 2 },
      { label: "2 Apr",  livello: 2 }, { label: "3 Apr",  livello: 2 },
      { label: "6 Apr",  livello: 2 }, { label: "7 Apr",  livello: 2 },
      { label: "8 Apr",  livello: 3 }, { label: "9 Apr",  livello: 3 },
      { label: "10 Apr", livello: 3 },
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
    // TODO: sostituire con query Supabase — SELECT data, livello FROM sessioni WHERE categoria = 'linguaggio' ORDER BY data
    storicoLivello: [
      { label: "6 Mar",  livello: 5 }, { label: "10 Mar", livello: 5 },
      { label: "14 Mar", livello: 5 }, { label: "18 Mar", livello: 5 },
      { label: "22 Mar", livello: 4 }, { label: "25 Mar", livello: 4 },
      { label: "27 Mar", livello: 4 }, { label: "29 Mar", livello: 4 },
      { label: "31 Mar", livello: 4 }, { label: "1 Apr",  livello: 4 },
      { label: "2 Apr",  livello: 4 }, { label: "3 Apr",  livello: 4 },
      { label: "6 Apr",  livello: 4 }, { label: "7 Apr",  livello: 4 },
      { label: "8 Apr",  livello: 4 }, { label: "9 Apr",  livello: 5 },
      { label: "10 Apr", livello: 5 },
    ],
  },
  {
    categoria: "Esecutive", icona: "puzzle", colore: "#D97706", score: 68,
    trend: "crescita" as const, livello: 2, sessioni: 7,
    descrizione: "Le tue funzioni esecutive sono al 68%",
    storico: [
      { label: "6 Mar",  score: 48 }, { label: "10 Mar", score: 52 },
      { label: "14 Mar", score: 54 }, { label: "18 Mar", score: 57 },
      { label: "22 Mar", score: 59 }, { label: "25 Mar", score: 61 },
      { label: "27 Mar", score: 62 }, { label: "29 Mar", score: 63 },
      { label: "31 Mar", score: 64 }, { label: "1 Apr",  score: 65 },
      { label: "2 Apr",  score: 66 }, { label: "3 Apr",  score: 68 },
    ],
    storicoLivello: [
      { label: "6 Mar",  livello: 1 }, { label: "14 Mar", livello: 1 },
      { label: "22 Mar", livello: 1 }, { label: "29 Mar", livello: 1 },
      { label: "31 Mar", livello: 2 }, { label: "1 Apr",  livello: 2 },
      { label: "2 Apr",  livello: 2 }, { label: "3 Apr",  livello: 2 },
      { label: "6 Apr",  livello: 2 }, { label: "7 Apr",  livello: 2 },
      { label: "8 Apr",  livello: 2 }, { label: "9 Apr",  livello: 3 },
      { label: "10 Apr", livello: 3 },
    ],
  },
  {
    categoria: "Visuospaziali", icona: "eye", colore: "#0F766E", score: 57,
    trend: "stabile" as const, livello: 1, sessioni: 6,
    descrizione: "Le tue abilità visuospaziali sono al 57%",
    storico: [
      { label: "6 Mar",  score: 54 }, { label: "10 Mar", score: 56 },
      { label: "14 Mar", score: 55 }, { label: "18 Mar", score: 58 },
      { label: "22 Mar", score: 56 }, { label: "25 Mar", score: 57 },
      { label: "27 Mar", score: 58 }, { label: "29 Mar", score: 57 },
      { label: "31 Mar", score: 56 }, { label: "1 Apr",  score: 57 },
      { label: "2 Apr",  score: 58 }, { label: "3 Apr",  score: 57 },
    ],
    storicoLivello: [
      { label: "6 Mar",  livello: 1 }, { label: "14 Mar", livello: 1 },
      { label: "22 Mar", livello: 1 }, { label: "29 Mar", livello: 1 },
      { label: "31 Mar", livello: 1 }, { label: "1 Apr",  livello: 1 },
      { label: "2 Apr",  livello: 1 }, { label: "3 Apr",  livello: 1 },
      { label: "6 Apr",  livello: 1 }, { label: "7 Apr",  livello: 1 },
      { label: "8 Apr",  livello: 1 }, { label: "9 Apr",  livello: 1 },
      { label: "10 Apr", livello: 1 },
    ],
  },
];

export const mockSessioniRecenti = [
  { titolo: "Ricorda le Parole",  categoria: "Memoria",       score: 80,  data: "Oggi",        icona: "brain",  trend: "crescita" as const },
  { titolo: "Test Stroop",        categoria: "Attenzione",    score: 70,  data: "Ieri",         icona: "target", trend: "stabile"  as const },
  { titolo: "Anagramma",          categoria: "Linguaggio",    score: 100, data: "Ieri",         icona: "chat",   trend: "calo"     as const },
  { titolo: "Torre di Hanoi",     categoria: "Esecutive",     score: 72,  data: "Ieri",         icona: "puzzle", trend: "crescita" as const },
  { titolo: "Rotazione Mentale",  categoria: "Visuospaziali", score: 58,  data: "2 giorni fa",  icona: "eye",    trend: "stabile"  as const },
  { titolo: "Sequenza di Colori", categoria: "Memoria",       score: 60,  data: "2 giorni fa",  icona: "brain",  trend: "stabile"  as const },
];

// ─── Mock Messaggi Famigliari ─────────────────────────────────────────────────
// TODO: sostituire con dati reali da Supabase (tabella messaggi_familiari)
export const mockMessaggiFamiliari = [
  { id: "1", mittente: "Marco", relazione: "Figlio",  data: "8 Apr 2026",  testo: "Ciao mamma! Brava, continua così! Sono così orgoglioso di te.", letto: false },
  { id: "2", mittente: "Marco", relazione: "Figlio",  data: "6 Apr 2026",  testo: "Ricordati di fare l'esercizio oggi! Ti voglio bene.", letto: true },
  { id: "3", mittente: "Sara",  relazione: "Figlia",  data: "4 Apr 2026",  testo: "Mamma hai fatto 3 giorni di fila! 🎉 Bravissima!", letto: true },
  { id: "4", mittente: "Marco", relazione: "Figlio",  data: "2 Apr 2026",  testo: "Come stai oggi? Hai fatto l'esercizio di oggi?", letto: true },
  { id: "5", mittente: "Luca",  relazione: "Nipote",  data: "31 Mar 2026", testo: "Nonna sei fortissima! Vai avanti così 🌟", letto: true },
];

// ─── Mock Storico Giornaliero ─────────────────────────────────────────────────
export const mockTotaleSettimanaScorsa = 7;

// TODO: sostituire con dati reali da Supabase (tabella sessioni)
// Struttura: { data: string (YYYY-MM-DD), sessioni: SessioneStorico[] }
// SessioneStorico: { nome_esercizio, categoria, icona, livello, score }
const S5 = [
  { nome_esercizio: "Ricorda le parole",   categoria: "Memoria",    icona: "brain",  livello: 3, score: 78 },
  { nome_esercizio: "Trova le differenze", categoria: "Attenzione", icona: "target", livello: 2, score: 65 },
  { nome_esercizio: "Anagramma",           categoria: "Linguaggio", icona: "chat",   livello: 1, score: 84 },
  { nome_esercizio: "Torre di Hanoi",      categoria: "Esecutive",  icona: "puzzle", livello: 2, score: 72 },
  { nome_esercizio: "Rotazione Mentale",   categoria: "Visuospaziali", icona: "eye", livello: 2, score: 69 },
];

export const mockStoricoGiornaliero = [
  { data: "2026-04-15", sessioni: S5 },
  { data: "2026-04-14", sessioni: S5 },
  { data: "2026-04-13", sessioni: S5 },
  { data: "2026-04-12", sessioni: S5 },
  { data: "2026-04-11", sessioni: S5 },
  { data: "2026-04-10", sessioni: S5 },
  {
    data: "2026-04-09",
    sessioni: [
      { nome_esercizio: "Ricorda le parole",   categoria: "Memoria",    icona: "brain",  livello: 3, score: 78 },
      { nome_esercizio: "Trova le differenze", categoria: "Attenzione", icona: "target", livello: 2, score: 65 },
    ],
  },
  {
    data: "2026-04-08",
    sessioni: S5,
  },
  {
    data: "2026-04-07",
    sessioni: S5,
  },
  {
    data: "2026-04-06",
    sessioni: [
      { nome_esercizio: "Ricorda le parole",   categoria: "Memoria",    icona: "brain",  livello: 3, score: 74 },
      { nome_esercizio: "Completa la frase",   categoria: "Linguaggio", icona: "chat",   livello: 4, score: 86 },
    ],
  },
  {
    data: "2026-04-03",
    sessioni: S5,
  },
  {
    data: "2026-04-02",
    sessioni: [],
  },
  {
    data: "2026-04-01",
    sessioni: S5,
  },
  {
    data: "2026-03-31",
    sessioni: S5,
  },
  {
    data: "2026-03-30",
    sessioni: [
      { nome_esercizio: "Memoria visiva",      categoria: "Memoria",    icona: "brain",  livello: 3, score: 68 },
      { nome_esercizio: "Trova l'intruso",     categoria: "Attenzione", icona: "target", livello: 2, score: 58 },
    ],
  },
];
