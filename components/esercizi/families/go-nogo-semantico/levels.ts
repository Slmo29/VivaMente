/**
 * Livelli Go/No-Go Semantico (esercizio_id: go_nogo_semantico).
 *
 * Dominio cognitivo: Linguaggio + Funzioni Esecutive — accesso lessicale +
 * inibizione della risposta su categoria semantica.
 *
 * Progressione per distanza semantica tra categoria target e distrattori:
 *   Lv  1-5 : categorie molto distanti (Animali vs Oggetti di casa)
 *   Lv  6-10: categorie moderate      (Animali domestici vs selvatici)
 *   Lv 11-15: categorie vicine        (Mammiferi vs Rettili)
 *   Lv 16-20: massima difficoltà      (proprietà astratte)
 *
 * Timer sessione: 60s fisso (Modello A — stessa deroga del cromatico).
 * T.Lim più alto del cromatico: leggere + classificare > percepire un colore.
 */

// ── Coppia semantica ───────────────────────────────────────────────────────────

/**
 * Una coppia semantica definisce la regola di sessione:
 * - `etichetta`: mostrata in header ("Tocca solo gli [Animali]")
 * - `paroleGo`:  parole target che l'utente deve toccare
 * - `paroleNogo`: parole distrattore che l'utente deve ignorare
 */
export interface CoppiaSemantica {
  readonly etichetta:  string;
  readonly paroleGo:   readonly string[];
  readonly paroleNogo: readonly string[];
}

// ── Configurazione livello ─────────────────────────────────────────────────────

export interface GoNogoSemanticoLevelConfig {
  livello:        number;
  tLimMs:         number;
  coppieAmmesse:  readonly CoppiaSemantica[];
}

// ── Dataset coppie semantiche ──────────────────────────────────────────────────
//
// Regola: paroleNogo devono essere della stessa lunghezza/frequenza
// delle paroleGo per evitare bias percettivi (una parola molto rara
// o molto lunga sarebbe "strana" indipendentemente dalla categoria).

// — Lv 1-5: distanza massima —

const ANIMALI_VS_OGGETTI: CoppiaSemantica = {
  etichetta: "Animali",
  paroleGo:  ["cane", "gatto", "leone", "aquila", "rana", "orso", "tigre", "lupo", "cervo", "volpe", "topo", "coniglio", "capra", "pecora", "mucca", "cavallo", "elefante", "giraffa", "scimmia", "delfino"],
  paroleNogo:["sedia", "tavolo", "lampada", "porta", "finestra", "cuscino", "tappeto", "specchio", "scaffale", "armadio", "forbici", "martello", "chiave", "bottone", "moneta", "orologio", "borsa", "libro", "penna", "vaso"],
};

const CIBI_VS_VEICOLI: CoppiaSemantica = {
  etichetta: "Cibi",
  paroleGo:  ["pane", "pasta", "riso", "carne", "pesce", "uovo", "mela", "pera", "pollo", "insalata", "carota", "formaggio", "latte", "burro", "pizza", "patata", "fagioli", "tonno", "salmone", "farina"],
  paroleNogo:["treno", "aereo", "nave", "moto", "bus", "camion", "bici", "taxi", "tram", "elicottero", "monopattino", "yacht", "ferry", "metro", "furgone", "carro", "jeep", "scooter", "imbarcazione", "carrello"],
};

const FRUTTI_VS_STRUMENTI: CoppiaSemantica = {
  etichetta: "Frutti",
  paroleGo:  ["mela", "pera", "uva", "mango", "fico", "lime", "kiwi", "prugna", "ciliegia", "banana", "arancia", "limone", "fragola", "pesca", "melone", "albicocca", "ananas", "papaya", "cocco", "melograno"],
  paroleNogo:["martello", "chiodo", "pinza", "sega", "filo", "vite", "livella", "trapano", "scalpello", "morsetto", "lima", "squadra", "pialla", "grimaldello", "leva", "cacciavite", "metro", "spatola", "coltello", "uncino"],
};

const SPORT_VS_PROFESSIONI: CoppiaSemantica = {
  etichetta: "Sport",
  paroleGo:  ["calcio", "tennis", "nuoto", "corsa", "ciclismo", "boxe", "golf", "sci", "rugby", "pallavolo", "basket", "judo", "karate", "vela", "tiro", "ginnastica", "atletica", "equitazione", "surf", "scherma"],
  paroleNogo:["medico", "avvocato", "pilota", "cuoco", "insegnante", "ingegnere", "muratore", "chimico", "fisico", "dentista", "infermiere", "notaio", "farmacista", "architetto", "magistrato", "psicologo", "geografo", "biologo", "agronomo", "veterinario"],
};

const COLORI_VS_NUMERI: CoppiaSemantica = {
  etichetta: "Colori",
  paroleGo:  ["rosso", "blu", "verde", "giallo", "viola", "arancio", "nero", "bianco", "grigio", "marrone", "azzurro", "beige", "rosa", "indaco", "turchese", "ocra", "magenta", "cremisi", "avorio", "bronzo"],
  paroleNogo:["uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci", "undici", "dodici", "tredici", "venti", "trenta", "cento", "mille", "zero", "mezzo", "doppio"],
};

// — Lv 6-10: distanza moderata —

const ANIMALI_DOMESTICI_VS_SELVATICI: CoppiaSemantica = {
  etichetta: "Animali domestici",
  paroleGo:  ["cane", "gatto", "coniglio", "criceto", "pappagallo", "tartaruga", "pesce", "topo", "cavia", "canarino", "cincillà", "furretto", "iguana", "serpente", "rana", "cockatiel", "labrador", "persiano", "siamese", "beagle"],
  paroleNogo:["leone", "tigre", "orso", "lupo", "volpe", "giaguaro", "leopardo", "rinoceronte", "ippopotamo", "elefante", "gorilla", "scimmia", "zebra", "bisonte", "alce", "lince", "ghepardo", "iene", "mangusta", "coyote"],
};

const FRUTTI_VS_VERDURE: CoppiaSemantica = {
  etichetta: "Frutti",
  paroleGo:  ["mela", "pera", "uva", "kiwi", "mango", "fragola", "pesca", "prugna", "ciliegia", "fico", "banana", "arancia", "limone", "melone", "albicocca", "papaya", "cocco", "ribes", "mora", "lampone"],
  paroleNogo:["carota", "zucchina", "melanzana", "pomodoro", "sedano", "cipolla", "aglio", "broccoli", "cavolo", "spinaci", "lattuga", "rucola", "finocchio", "porro", "ravanello", "barbabietola", "carciofo", "asparago", "zucca", "peperone"],
};

const MOBILI_VS_ELETTRODOMESTICI: CoppiaSemantica = {
  etichetta: "Mobili",
  paroleGo:  ["sedia", "tavolo", "letto", "armadio", "divano", "libreria", "comodino", "scrivania", "poltrona", "cassettiera", "panca", "specchiera", "credenza", "canterano", "ottomana", "consolle", "vetrina", "buffet", "sgabello", "dondolo"],
  paroleNogo:["frigorifero", "lavatrice", "forno", "lavastoviglie", "microonde", "televisore", "aspirapolvere", "asciugatrice", "lavello", "bollitore", "tostapane", "frullatore", "robot", "condizionatore", "stufa", "ventilatore", "ferro", "macchina", "freezer", "phon"],
};

const PROFESSIONI_SANITARIE_VS_TECNICHE: CoppiaSemantica = {
  etichetta: "Professioni sanitarie",
  paroleGo:  ["medico", "infermiere", "dentista", "farmacista", "psicologo", "chirurgo", "veterinario", "ostetrica", "fisioterapista", "radiologo", "otorinolaringoiatra", "pediatra", "cardiologo", "ginecologo", "ortopedico", "anestesista", "oculista", "dermatologo", "reumatologo", "ematologo"],
  paroleNogo:["ingegnere", "architetto", "muratore", "elettricista", "idraulico", "falegname", "meccanico", "saldatore", "geometra", "tecnico", "operatore", "programmatore", "costruttore", "carrozziere", "tornitore", "fresatore", "gruista", "ponteggiatore", "cablatore", "installatore"],
};

const SPORT_INDIVIDUALI_VS_SQUADRA: CoppiaSemantica = {
  etichetta: "Sport individuali",
  paroleGo:  ["nuoto", "tennis", "golf", "boxe", "judo", "karate", "sci", "atletica", "ginnastica", "ciclismo", "equitazione", "scherma", "tiro", "surf", "arrampicata", "triathlon", "canottaggio", "sollevamento", "lotta", "taekwondo"],
  paroleNogo:["calcio", "basket", "pallavolo", "rugby", "hockey", "baseball", "polo", "pallanuoto", "dodgeball", "handball", "cricket", "lacrosse", "curling", "bob", "rowing", "waterpolo", "softball", "ultimate", "cabestan", "remo"],
};

// — Lv 11-15: categorie vicine —

const MAMMIFERI_VS_RETTILI: CoppiaSemantica = {
  etichetta: "Mammiferi",
  paroleGo:  ["cane", "gatto", "orso", "lupo", "delfino", "balena", "elefante", "giraffa", "zebra", "coniglio", "topo", "volpe", "leone", "tigre", "leopardo", "scimmia", "riccio", "talpa", "pipistrello", "foca"],
  paroleNogo:["coccodrillo", "iguana", "serpente", "lucertola", "camaleonte", "geco", "varano", "anaconda", "pitone", "boa", "vipera", "tartaruga", "alligatore", "gaviale", "agama", "tegù", "skink", "tuatara", "laceride", "cameleon"],
};

const STRUMENTI_FIATO_VS_CORDA: CoppiaSemantica = {
  etichetta: "Strumenti a fiato",
  paroleGo:  ["flauto", "tromba", "saxofono", "clarinetto", "oboe", "corno", "tuba", "trombone", "fagotto", "ottavino", "bombardone", "eufonio", "flicorno", "cornamusa", "ocarina", "kazoo", "sousafono", "fisarmonica", "armonica", "didgeridoo"],
  paroleNogo:["violino", "violoncello", "chitarra", "arpa", "mandolino", "ukulele", "banjo", "contrabbasso", "viola", "liuto", "cetra", "sitar", "shamisen", "koto", "erhu", "dulcimer", "balalaika", "bouzouki", "oud", "rebab"],
};

const PAESI_EUROPEI_VS_CITTA_ITALIANE: CoppiaSemantica = {
  etichetta: "Paesi europei",
  paroleGo:  ["Francia", "Spagna", "Germania", "Portogallo", "Olanda", "Belgio", "Svezia", "Norvegia", "Danimarca", "Polonia", "Ungheria", "Austria", "Svizzera", "Grecia", "Romania", "Bulgaria", "Croazia", "Serbia", "Slovacchia", "Estonia"],
  paroleNogo:["Milano", "Roma", "Napoli", "Torino", "Bologna", "Firenze", "Venezia", "Palermo", "Catania", "Bari", "Genova", "Trieste", "Verona", "Padova", "Brescia", "Modena", "Parma", "Reggio", "Messina", "Taranto"],
};

const EMOZIONI_POSITIVE_VS_NEGATIVE: CoppiaSemantica = {
  etichetta: "Emozioni positive",
  paroleGo:  ["gioia", "felicità", "amore", "entusiasmo", "speranza", "gratitudine", "orgoglio", "serenità", "euforia", "soddisfazione", "allegria", "tenerezza", "empatia", "fiducia", "pace", "stupore", "eccitazione", "ispirazione", "sollievo", "ammirazione"],
  paroleNogo:["rabbia", "tristezza", "paura", "ansia", "disgusto", "invidia", "vergogna", "colpa", "odio", "rimorso", "noia", "solitudine", "gelosia", "rancore", "ira", "terrore", "disperazione", "frustrazione", "amarezza", "rimpianto"],
};

const VERBI_MOVIMENTO_VS_STATO: CoppiaSemantica = {
  etichetta: "Verbi di movimento",
  paroleGo:  ["correre", "saltare", "camminare", "nuotare", "volare", "strisciare", "rotolare", "scivolate", "balzare", "trotterellare", "galoppare", "arrampicare", "scivolare", "rimbalzare", "avanzare", "ritirarsi", "sfrecciare", "planare", "volteggiare", "danzare"],
  paroleNogo:["essere", "stare", "esistere", "rimanere", "aspettare", "giacere", "sedere", "abitare", "risiedere", "vivere", "durare", "persistere", "sostare", "fermarsi", "tacere", "dormire", "attendere", "dimorare", "soggiornare", "permanere"],
};

// — Lv 16-20: massima difficoltà (proprietà non ovvie) —

const PAROLE_ASTRATTE_VS_CONCRETE: CoppiaSemantica = {
  etichetta: "Concetti astratti",
  paroleGo:  ["libertà", "giustizia", "verità", "bellezza", "amore", "onore", "speranza", "coraggio", "saggezza", "pazienza", "lealtà", "virtù", "fede", "morale", "etica", "dignità", "uguaglianza", "solidarietà", "coscienza", "volontà"],
  paroleNogo:["sedia", "pane", "finestra", "scarpa", "matita", "borsa", "bicchiere", "porta", "bottone", "chiave", "forbici", "cuscino", "specchio", "lampada", "tappeto", "vaso", "moneta", "orologio", "ombrello", "cassetto"],
};

const SINONIMI_GRANDE_VS_PICCOLO: CoppiaSemantica = {
  etichetta: "Parole che significano «grande»",
  paroleGo:  ["enorme", "gigantesco", "immenso", "vasto", "colossale", "mastodontico", "monumentale", "titanico", "smisurato", "sterminato", "maestoso", "grandioso", "possente", "possente", "ciclopico", "gargantuesco", "spropositato", "démesure", "colosseo", "macroscopico"],
  paroleNogo:["minuscolo", "piccolo", "nano", "esiguo", "ridotto", "angusto", "microscopico", "breve", "infimo", "lieve", "esile", "modesto", "scarso", "stretto", "compatto", "sommesso", "tenue", "flebile", "gretto", "sottile"],
};

const PAROLE_4_LETTERE_VS_PIU: CoppiaSemantica = {
  etichetta: "Parole di 4 lettere",
  paroleGo:  ["cane", "gato", "luna", "sole", "mare", "lago", "mano", "pane", "vino", "rosa", "casa", "topo", "rana", "orso", "naso", "dito", "filo", "onda", "erba", "luce"],
  paroleNogo:["cavallo", "finestra", "sorriso", "montagna", "farfalla", "profumo", "silenzio", "abbraccio", "telefono", "chitarra", "cappello", "giardino", "nuvola", "mattino", "tramonto", "stellina", "cartella", "soffitto", "poltrona", "stradina"],
};

const NOMI_MASCHILI_VS_FEMMINILI: CoppiaSemantica = {
  etichetta: "Nomi maschili",
  paroleGo:  ["Marco", "Luca", "Andrea", "Matteo", "Giovanni", "Francesco", "Antonio", "Roberto", "Stefano", "Davide", "Alessandro", "Paolo", "Fabio", "Giorgio", "Simone", "Lorenzo", "Riccardo", "Claudio", "Enrico", "Nicola"],
  paroleNogo:["Maria", "Anna", "Laura", "Elena", "Sara", "Giulia", "Francesca", "Chiara", "Valentina", "Alessia", "Martina", "Silvia", "Monica", "Roberta", "Cristina", "Paola", "Federica", "Elisa", "Beatrice", "Giorgia"],
};

const AGGETTIVI_POSITIVI_VS_NEGATIVI: CoppiaSemantica = {
  etichetta: "Aggettivi positivi",
  paroleGo:  ["bello", "bravo", "gentile", "saggio", "coraggioso", "onesto", "generoso", "allegro", "dolce", "simpatico", "brillante", "energico", "affidabile", "paziente", "curioso", "creativo", "leale", "premuroso", "sincero", "luminoso"],
  paroleNogo:["brutto", "cattivo", "crudele", "pigro", "bugiardo", "avaro", "triste", "amaro", "antipatico", "ottuso", "aggressivo", "inaffidabile", "impaziente", "chiuso", "distruttivo", "sleale", "indifferente", "falso", "cupo", "tetro"],
};

// ── Tabella livelli ────────────────────────────────────────────────────────────

export const GO_NOGO_SEMANTICO_LEVELS: readonly GoNogoSemanticoLevelConfig[] = [
  // lv 1-5: distanza massima, T.Lim ampio
  { livello:  1, tLimMs: 2000, coppieAmmesse: [ANIMALI_VS_OGGETTI,               CIBI_VS_VEICOLI]               },
  { livello:  2, tLimMs: 1900, coppieAmmesse: [ANIMALI_VS_OGGETTI,               FRUTTI_VS_STRUMENTI]           },
  { livello:  3, tLimMs: 1800, coppieAmmesse: [CIBI_VS_VEICOLI,                  SPORT_VS_PROFESSIONI]          },
  { livello:  4, tLimMs: 1700, coppieAmmesse: [FRUTTI_VS_STRUMENTI,              COLORI_VS_NUMERI]              },
  { livello:  5, tLimMs: 1600, coppieAmmesse: [SPORT_VS_PROFESSIONI,             COLORI_VS_NUMERI]              },
  // lv 6-10: distanza moderata
  { livello:  6, tLimMs: 1500, coppieAmmesse: [ANIMALI_DOMESTICI_VS_SELVATICI,   FRUTTI_VS_VERDURE]             },
  { livello:  7, tLimMs: 1400, coppieAmmesse: [FRUTTI_VS_VERDURE,                MOBILI_VS_ELETTRODOMESTICI]    },
  { livello:  8, tLimMs: 1300, coppieAmmesse: [MOBILI_VS_ELETTRODOMESTICI,       PROFESSIONI_SANITARIE_VS_TECNICHE] },
  { livello:  9, tLimMs: 1200, coppieAmmesse: [PROFESSIONI_SANITARIE_VS_TECNICHE,SPORT_INDIVIDUALI_VS_SQUADRA]  },
  { livello: 10, tLimMs: 1100, coppieAmmesse: [ANIMALI_DOMESTICI_VS_SELVATICI,   SPORT_INDIVIDUALI_VS_SQUADRA]  },
  // lv 11-15: categorie vicine/ambigue
  { livello: 11, tLimMs: 1050, coppieAmmesse: [MAMMIFERI_VS_RETTILI,             STRUMENTI_FIATO_VS_CORDA]      },
  { livello: 12, tLimMs: 1000, coppieAmmesse: [STRUMENTI_FIATO_VS_CORDA,         PAESI_EUROPEI_VS_CITTA_ITALIANE] },
  { livello: 13, tLimMs:  950, coppieAmmesse: [PAESI_EUROPEI_VS_CITTA_ITALIANE,  EMOZIONI_POSITIVE_VS_NEGATIVE]  },
  { livello: 14, tLimMs:  900, coppieAmmesse: [EMOZIONI_POSITIVE_VS_NEGATIVE,    VERBI_MOVIMENTO_VS_STATO]      },
  { livello: 15, tLimMs:  850, coppieAmmesse: [MAMMIFERI_VS_RETTILI,             VERBI_MOVIMENTO_VS_STATO]      },
  // lv 16-20: massima difficoltà
  { livello: 16, tLimMs:  850, coppieAmmesse: [PAROLE_ASTRATTE_VS_CONCRETE,      SINONIMI_GRANDE_VS_PICCOLO]    },
  { livello: 17, tLimMs:  825, coppieAmmesse: [SINONIMI_GRANDE_VS_PICCOLO,       PAROLE_4_LETTERE_VS_PIU]       },
  { livello: 18, tLimMs:  825, coppieAmmesse: [PAROLE_4_LETTERE_VS_PIU,          NOMI_MASCHILI_VS_FEMMINILI]    },
  { livello: 19, tLimMs:  800, coppieAmmesse: [NOMI_MASCHILI_VS_FEMMINILI,       AGGETTIVI_POSITIVI_VS_NEGATIVI] },
  { livello: 20, tLimMs:  800, coppieAmmesse: [PAROLE_ASTRATTE_VS_CONCRETE,      AGGETTIVI_POSITIVI_VS_NEGATIVI] },
] as const;

export function getGoNogoSemanticoLevel(livello: number): GoNogoSemanticoLevelConfig {
  const clamped = Math.min(20, Math.max(1, livello));
  return GO_NOGO_SEMANTICO_LEVELS[clamped - 1];
}
