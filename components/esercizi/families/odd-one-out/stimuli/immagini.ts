/**
 * components/esercizi/families/odd-one-out/stimuli/immagini.ts
 *
 * Strategy emoji-based per la variante `odd_one_out_immagini`.
 *
 * Pool di ~95 emoji Unicode (caratteri, NIENTE asset) con metadata:
 *   - categoria macro (animale, cibo, veicolo, oggetto, natura)
 *   - sottoCategoria (mammifero_dom, frutto_rosso, terrestre, ...)
 *   - proprietaVisive[] (rosso, rotondo, con_volto, metallico, ...) per
 *     la dimensione semantico_contestuale (lv 11–15)
 *   - proprietaAstratte[] (vivo, commestibile, vegetale, costruito, ...)
 *     per la dimensione astratto (lv 16–20)
 *
 * Tutte le 4 dimensioni discriminanti sono coperte: NIENTE gating lv 11+
 * (a differenza della variante `parole_miste` precedente, che era stub-based
 * e bloccata a lv 1–10).
 *
 * Le emoji sono renderizzate dal font sistema (Apple Color Emoji / Segoe UI
 * Emoji / Noto Color Emoji) — niente download asset, niente CDN. Coerente
 * con la regola GDD CLAUDE.md root: "Stimoli visivi: solo emoji/icone vettoriali
 * flat. Mai fotografie. Mai immagini raster."
 *
 * Vincolo no-rep: gestito dall'Engine via ref + Set passato come parametro
 * `recentlyUsed`, NON qui (questa strategy è stateless).
 *
 * Riferimento: docs/gdd/families/odd-one-out.md §Generazione stimoli
 */

import type { StimoloOdd } from "../sequence";
import type { DimensioneDiscriminante } from "../levels";

// ── Tipi esportati ────────────────────────────────────────────────────────────

export type CategoriaImmagine = "animale" | "cibo" | "veicolo" | "oggetto" | "natura";

export type MetadataImmagine = {
  categoria:         CategoriaImmagine;
  sottoCategoria:    string;
  proprietaVisive:   readonly string[];
  proprietaAstratte: readonly string[];
};

// ── Lookup sotto-categoria → categoria macro ─────────────────────────────────

function sottoToMacro(sotto: string): CategoriaImmagine {
  if (sotto.startsWith("mammifero") || sotto === "uccello" || sotto === "pesce")    return "animale";
  if (sotto === "frutto_rosso" || sotto === "frutto_altro" || sotto === "verdura"
      || sotto === "dolce")                                                          return "cibo";
  if (sotto === "veicolo_terrestre" || sotto === "veicolo_aereo"
      || sotto === "veicolo_acquatico")                                              return "veicolo";
  if (sotto === "cucina" || sotto === "officina" || sotto === "ufficio"
      || sotto === "sport")                                                          return "oggetto";
  if (sotto === "pianta" || sotto === "fiore" || sotto === "cielo"
      || sotto === "terra_acqua")                                                    return "natura";
  throw new Error(`[odd-one-out/immagini] sottoCategoria sconosciuta: ${sotto}`);
}

// ── Helper costruzione stimolo emoji ─────────────────────────────────────────

function emo(
  emoji: string,
  sottoCategoria: string,
  proprietaVisive: readonly string[],
  proprietaAstratte: readonly string[],
): StimoloOdd {
  const meta: MetadataImmagine = {
    categoria: sottoToMacro(sottoCategoria),
    sottoCategoria,
    proprietaVisive,
    proprietaAstratte,
  };
  return { valore: emoji, metadata: meta as Record<string, unknown> };
}

// ── Pool emoji ────────────────────────────────────────────────────────────────
// Tag visivi/astratti scelti in modo che ogni regola semantico/astratto abbia
// almeno N-1=11 emoji target (per coprire nStimuli=12 al lv 18+).

// ── Animale (20) ──
const ANIMALI_MAMMIFERI_DOM: readonly StimoloOdd[] = [
  emo("🐶", "mammifero_domestico", ["con_volto", "peloso"], ["vivo"]),
  emo("🐱", "mammifero_domestico", ["con_volto", "peloso"], ["vivo"]),
  emo("🐰", "mammifero_domestico", ["con_volto", "peloso"], ["vivo"]),
  emo("🐹", "mammifero_domestico", ["con_volto", "peloso"], ["vivo"]),
  emo("🐭", "mammifero_domestico", ["con_volto", "peloso"], ["vivo"]),
  emo("🐮", "mammifero_domestico", ["con_volto", "peloso"], ["vivo"]),
  emo("🐷", "mammifero_domestico", ["con_volto", "peloso", "rotondo"], ["vivo"]),
  emo("🐴", "mammifero_domestico", ["con_volto", "peloso"], ["vivo"]),
];
const ANIMALI_MAMMIFERI_SELV: readonly StimoloOdd[] = [
  emo("🦁", "mammifero_selvatico", ["con_volto", "peloso"], ["vivo"]),
  emo("🐯", "mammifero_selvatico", ["con_volto", "peloso"], ["vivo"]),
  emo("🐺", "mammifero_selvatico", ["con_volto", "peloso"], ["vivo"]),
  emo("🐻", "mammifero_selvatico", ["con_volto", "peloso"], ["vivo"]),
  emo("🦊", "mammifero_selvatico", ["con_volto", "peloso"], ["vivo"]),
  emo("🦝", "mammifero_selvatico", ["con_volto", "peloso"], ["vivo"]),
];
const ANIMALI_UCCELLI: readonly StimoloOdd[] = [
  emo("🦅", "uccello", ["con_volto", "alato"], ["vivo", "volante"]),
  emo("🦉", "uccello", ["con_volto", "alato"], ["vivo", "volante"]),
  emo("🐦", "uccello", ["con_volto", "alato"], ["vivo", "volante"]),
];
const ANIMALI_PESCI: readonly StimoloOdd[] = [
  emo("🐟", "pesce", ["senza_volto_evidente"], ["vivo", "nuotante"]),
  emo("🐙", "pesce", ["senza_volto_evidente"], ["vivo", "nuotante"]),
  emo("🦈", "pesce", ["senza_volto_evidente"], ["vivo", "nuotante"]),
];

// ── Cibo (20) ──
const CIBI_FRUTTO_ROSSO: readonly StimoloOdd[] = [
  emo("🍎", "frutto_rosso", ["rosso", "rotondo"], ["commestibile", "vegetale"]),
  emo("🍓", "frutto_rosso", ["rosso", "rotondo"], ["commestibile", "vegetale"]),
  emo("🍒", "frutto_rosso", ["rosso", "rotondo"], ["commestibile", "vegetale"]),
  emo("🍅", "frutto_rosso", ["rosso", "rotondo"], ["commestibile", "vegetale"]),
];
const CIBI_FRUTTO_ALTRO: readonly StimoloOdd[] = [
  emo("🍐", "frutto_altro", ["rotondo"],         ["commestibile", "vegetale"]),
  emo("🍌", "frutto_altro", [],                   ["commestibile", "vegetale"]),
  emo("🍋", "frutto_altro", ["rotondo"],         ["commestibile", "vegetale"]),
  emo("🥝", "frutto_altro", ["rotondo"],         ["commestibile", "vegetale"]),
  emo("🍇", "frutto_altro", ["rotondo"],         ["commestibile", "vegetale"]),
  emo("🍑", "frutto_altro", ["rotondo"],         ["commestibile", "vegetale"]),
  emo("🍊", "frutto_altro", ["rotondo"],         ["commestibile", "vegetale"]),
];
const CIBI_VERDURA: readonly StimoloOdd[] = [
  emo("🥕", "verdura", [],            ["commestibile", "vegetale"]),
  emo("🥦", "verdura", [],            ["commestibile", "vegetale"]),
  emo("🌽", "verdura", [],            ["commestibile", "vegetale"]),
  emo("🍆", "verdura", [],            ["commestibile", "vegetale"]),
];
const CIBI_DOLCI: readonly StimoloOdd[] = [
  emo("🍰", "dolce", [],            ["commestibile", "lavorato"]),
  emo("🍪", "dolce", ["rotondo"],   ["commestibile", "lavorato"]),
  emo("🍩", "dolce", ["rotondo"],   ["commestibile", "lavorato"]),
  emo("🧁", "dolce", [],            ["commestibile", "lavorato"]),
  emo("🍫", "dolce", [],            ["commestibile", "lavorato"]),
];

// ── Veicolo (16) ──
const VEICOLI_TERRESTRI: readonly StimoloOdd[] = [
  emo("🚗", "veicolo_terrestre", ["con_ruote"], ["mobile", "costruito"]),
  emo("🚕", "veicolo_terrestre", ["con_ruote"], ["mobile", "costruito"]),
  emo("🚌", "veicolo_terrestre", ["con_ruote"], ["mobile", "costruito"]),
  emo("🚲", "veicolo_terrestre", ["con_ruote"], ["mobile", "costruito"]),
  emo("🏍️", "veicolo_terrestre", ["con_ruote"], ["mobile", "costruito"]),
  emo("🚂", "veicolo_terrestre", ["con_ruote"], ["mobile", "costruito"]),
];
const VEICOLI_AEREI: readonly StimoloOdd[] = [
  emo("✈️", "veicolo_aereo", ["volante_visivo"], ["mobile", "volante", "costruito"]),
  emo("🚁", "veicolo_aereo", ["volante_visivo"], ["mobile", "volante", "costruito"]),
  emo("🚀", "veicolo_aereo", ["volante_visivo"], ["mobile", "volante", "costruito"]),
  emo("🪂", "veicolo_aereo", ["volante_visivo"], ["mobile", "volante", "costruito"]),
];
const VEICOLI_ACQUATICI: readonly StimoloOdd[] = [
  emo("🚢", "veicolo_acquatico", [],            ["mobile", "costruito"]),
  emo("⛵", "veicolo_acquatico", [],            ["mobile", "costruito"]),
  emo("🛥️", "veicolo_acquatico", [],            ["mobile", "costruito"]),
  emo("🚤", "veicolo_acquatico", [],            ["mobile", "costruito"]),
  emo("⛴️", "veicolo_acquatico", [],            ["mobile", "costruito"]),
  emo("⚓", "veicolo_acquatico", ["metallico"], ["costruito"]),
];

// ── Oggetto (20) ──
const OGG_CUCINA: readonly StimoloOdd[] = [
  emo("🍴", "cucina", ["metallico"],   ["utensile", "costruito"]),
  emo("🥄", "cucina", ["metallico"],   ["utensile", "costruito"]),
  emo("🔪", "cucina", ["metallico"],   ["utensile", "costruito"]),
  emo("🍳", "cucina", ["metallico"],   ["utensile", "costruito"]),
  emo("🥢", "cucina", [],              ["utensile", "costruito"]),
];
const OGG_OFFICINA: readonly StimoloOdd[] = [
  emo("🔨", "officina", ["metallico"], ["utensile", "costruito"]),
  emo("🔧", "officina", ["metallico"], ["utensile", "costruito"]),
  emo("🪚", "officina", ["metallico"], ["utensile", "costruito"]),
  emo("🧰", "officina", [],            ["utensile", "costruito"]),
  emo("⚙️", "officina", ["metallico"], ["utensile", "costruito"]),
];
const OGG_UFFICIO: readonly StimoloOdd[] = [
  emo("✏️", "ufficio", [],              ["utensile", "costruito"]),
  emo("📎", "ufficio", ["metallico"],  ["utensile", "costruito"]),
  emo("📏", "ufficio", [],              ["utensile", "costruito"]),
  emo("✂️", "ufficio", ["metallico"],  ["utensile", "costruito"]),
  emo("📐", "ufficio", [],              ["utensile", "costruito"]),
];
const OGG_SPORT: readonly StimoloOdd[] = [
  emo("⚽", "sport", ["rotondo"], ["gioco", "costruito"]),
  emo("🏀", "sport", ["rotondo"], ["gioco", "costruito"]),
  emo("🎾", "sport", ["rotondo"], ["gioco", "costruito"]),
  emo("🏓", "sport", ["rotondo"], ["gioco", "costruito"]),
  emo("🎯", "sport", ["rotondo"], ["gioco", "costruito"]),
];

// ── Natura (19) ──
const NAT_PIANTE: readonly StimoloOdd[] = [
  emo("🌳", "pianta", ["verde"], ["vivo", "vegetale", "naturale"]),
  emo("🌲", "pianta", ["verde"], ["vivo", "vegetale", "naturale"]),
  emo("🌴", "pianta", ["verde"], ["vivo", "vegetale", "naturale"]),
  emo("🌵", "pianta", ["verde"], ["vivo", "vegetale", "naturale"]),
  emo("🌿", "pianta", ["verde"], ["vivo", "vegetale", "naturale"]),
];
const NAT_FIORI: readonly StimoloOdd[] = [
  emo("🌷", "fiore", [],         ["vivo", "vegetale", "naturale"]),
  emo("🌸", "fiore", ["rosa"],   ["vivo", "vegetale", "naturale"]),
  emo("🌹", "fiore", ["rosso"],  ["vivo", "vegetale", "naturale"]),
  emo("🌻", "fiore", [],         ["vivo", "vegetale", "naturale"]),
  emo("🌺", "fiore", [],         ["vivo", "vegetale", "naturale"]),
];
const NAT_CIELO: readonly StimoloOdd[] = [
  emo("☀️", "cielo", ["luminoso", "rotondo"], ["celeste", "naturale"]),
  emo("🌙", "cielo", ["luminoso", "rotondo"], ["celeste", "naturale"]),
  emo("⭐", "cielo", ["luminoso"],            ["celeste", "naturale"]),
  emo("☁️", "cielo", [],                       ["celeste", "naturale"]),
  emo("🌈", "cielo", ["colorato"],            ["celeste", "naturale"]),
];
const NAT_TERRA_ACQUA: readonly StimoloOdd[] = [
  emo("💧", "terra_acqua", [],         ["naturale"]),
  emo("🌊", "terra_acqua", [],         ["naturale"]),
  emo("🌋", "terra_acqua", [],         ["naturale"]),
  emo("⛰️", "terra_acqua", [],         ["naturale"]),
];

// ── Pool aggregati per macro-categoria ────────────────────────────────────────

const ANIMALI: readonly StimoloOdd[] = [
  ...ANIMALI_MAMMIFERI_DOM, ...ANIMALI_MAMMIFERI_SELV,
  ...ANIMALI_UCCELLI, ...ANIMALI_PESCI,
];
const CIBI: readonly StimoloOdd[] = [
  ...CIBI_FRUTTO_ROSSO, ...CIBI_FRUTTO_ALTRO, ...CIBI_VERDURA, ...CIBI_DOLCI,
];
const VEICOLI: readonly StimoloOdd[] = [
  ...VEICOLI_TERRESTRI, ...VEICOLI_AEREI, ...VEICOLI_ACQUATICI,
];
const OGGETTI: readonly StimoloOdd[] = [
  ...OGG_CUCINA, ...OGG_OFFICINA, ...OGG_UFFICIO, ...OGG_SPORT,
];
const NATURA: readonly StimoloOdd[] = [
  ...NAT_PIANTE, ...NAT_FIORI, ...NAT_CIELO, ...NAT_TERRA_ACQUA,
];

const POOL_TUTTI: readonly StimoloOdd[] = [
  ...ANIMALI, ...CIBI, ...VEICOLI, ...OGGETTI, ...NATURA,
];

// ── Filtri per proprietà ──────────────────────────────────────────────────────

const meta = (s: StimoloOdd) => s.metadata as MetadataImmagine;

function filtraVisiva(tag: string): readonly StimoloOdd[] {
  return POOL_TUTTI.filter((s) => meta(s).proprietaVisive.includes(tag));
}
function filtraNonVisiva(tag: string): readonly StimoloOdd[] {
  return POOL_TUTTI.filter((s) => !meta(s).proprietaVisive.includes(tag));
}
function filtraAstratta(tag: string): readonly StimoloOdd[] {
  return POOL_TUTTI.filter((s) => meta(s).proprietaAstratte.includes(tag));
}
function filtraNonAstratta(tag: string): readonly StimoloOdd[] {
  return POOL_TUTTI.filter((s) => !meta(s).proprietaAstratte.includes(tag));
}

// ── Tabella regole per dimensione ────────────────────────────────────────────

type RegolaSpec = {
  id: string;
  poolTarget:   readonly StimoloOdd[];
  poolAnomalia: readonly StimoloOdd[];
};

const REGOLE_PER_DIMENSIONE: Record<DimensioneDiscriminante, readonly RegolaSpec[]> = {
  categoriale_alto: [
    { id: "animali_vs_cibi",     poolTarget: ANIMALI, poolAnomalia: CIBI    },
    { id: "cibi_vs_animali",     poolTarget: CIBI,    poolAnomalia: ANIMALI },
    { id: "animali_vs_veicoli",  poolTarget: ANIMALI, poolAnomalia: VEICOLI },
    { id: "veicoli_vs_animali",  poolTarget: VEICOLI, poolAnomalia: ANIMALI },
    { id: "cibi_vs_oggetti",     poolTarget: CIBI,    poolAnomalia: OGGETTI },
    { id: "oggetti_vs_cibi",     poolTarget: OGGETTI, poolAnomalia: CIBI    },
    { id: "natura_vs_veicoli",   poolTarget: NATURA,  poolAnomalia: VEICOLI },
    { id: "veicoli_vs_natura",   poolTarget: VEICOLI, poolAnomalia: NATURA  },
  ],
  categoriale_medio: [
    { id: "mamm_dom_vs_selv",     poolTarget: ANIMALI_MAMMIFERI_DOM,  poolAnomalia: ANIMALI_MAMMIFERI_SELV },
    { id: "mamm_selv_vs_dom",     poolTarget: ANIMALI_MAMMIFERI_SELV, poolAnomalia: ANIMALI_MAMMIFERI_DOM  },
    { id: "uccello_vs_pesce",     poolTarget: ANIMALI_UCCELLI,        poolAnomalia: ANIMALI_PESCI          },
    { id: "frutto_vs_verdura",    poolTarget: CIBI_FRUTTO_ALTRO,      poolAnomalia: CIBI_VERDURA           },
    { id: "verdura_vs_frutto",    poolTarget: CIBI_VERDURA,           poolAnomalia: CIBI_FRUTTO_ALTRO      },
    { id: "frutto_vs_dolce",      poolTarget: CIBI_FRUTTO_ALTRO,      poolAnomalia: CIBI_DOLCI             },
    { id: "terrestre_vs_aereo",   poolTarget: VEICOLI_TERRESTRI,      poolAnomalia: VEICOLI_AEREI          },
    { id: "aereo_vs_acquatico",   poolTarget: VEICOLI_AEREI,          poolAnomalia: VEICOLI_ACQUATICI      },
    { id: "terrestre_vs_acquatico", poolTarget: VEICOLI_TERRESTRI,    poolAnomalia: VEICOLI_ACQUATICI      },
    { id: "cucina_vs_officina",   poolTarget: OGG_CUCINA,             poolAnomalia: OGG_OFFICINA           },
    { id: "officina_vs_ufficio",  poolTarget: OGG_OFFICINA,           poolAnomalia: OGG_UFFICIO            },
    { id: "pianta_vs_fiore",      poolTarget: NAT_PIANTE,             poolAnomalia: NAT_FIORI              },
    { id: "cielo_vs_terra",       poolTarget: NAT_CIELO,              poolAnomalia: NAT_TERRA_ACQUA        },
  ],
  semantico_contestuale: [
    { id: "con_volto_vs_senza", poolTarget: filtraVisiva("con_volto"),   poolAnomalia: filtraNonVisiva("con_volto") },
    { id: "rotondo_vs_no",      poolTarget: filtraVisiva("rotondo"),     poolAnomalia: filtraNonVisiva("rotondo")   },
    { id: "metallico_vs_no",    poolTarget: filtraVisiva("metallico"),   poolAnomalia: filtraNonVisiva("metallico") },
  ],
  astratto: [
    { id: "vivo_vs_non_vivo",         poolTarget: filtraAstratta("vivo"),         poolAnomalia: filtraNonAstratta("vivo")         },
    { id: "commestibile_vs_no",       poolTarget: filtraAstratta("commestibile"), poolAnomalia: filtraNonAstratta("commestibile") },
    { id: "vegetale_vs_animale",      poolTarget: filtraAstratta("vegetale"),     poolAnomalia: ANIMALI                            },
    { id: "costruito_vs_naturale",    poolTarget: filtraAstratta("costruito"),    poolAnomalia: filtraAstratta("naturale")        },
  ],
};

// ── Helper interni ────────────────────────────────────────────────────────────

function pescaSenzaRipetizioniFiltrato(
  pool: readonly StimoloOdd[],
  n: number,
  rng: () => number,
  exclude: ReadonlySet<string>,
): StimoloOdd[] {
  const candidati = pool.filter((s) => !exclude.has(s.valore));
  if (n > candidati.length) {
    throw new RangeError(
      `[odd-one-out/immagini] pool insufficiente dopo filtro recentlyUsed: ` +
      `richiesti ${n}, disponibili ${candidati.length} (totale ${pool.length})`,
    );
  }
  const arr = [...candidati];
  const result: StimoloOdd[] = [];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    result.push(arr[i]);
  }
  return result;
}

function regoleApplicabili(
  candidate: readonly RegolaSpec[],
  nStimuli: number,
  recentlyUsed: ReadonlySet<string>,
): readonly RegolaSpec[] {
  const nBase = nStimuli - 1;
  return candidate.filter((r) => {
    const targetDisp = r.poolTarget.filter((s) => !recentlyUsed.has(s.valore)).length;
    const anomDisp   = r.poolAnomalia.filter((s) => !recentlyUsed.has(s.valore)).length;
    return targetDisp >= nBase && anomDisp >= 1;
  });
}

// ── pescaTrialImmagini — funzione principale ─────────────────────────────────

export function pescaTrialImmagini(
  livello: number,
  dimensione: DimensioneDiscriminante,
  nStimuli: number,
  recentlyUsed: ReadonlySet<string>,
  rng: () => number,
): { stimoliBase: StimoloOdd[]; anomalia: StimoloOdd; regolaId: string } {
  if (!Number.isInteger(nStimuli) || nStimuli < 4 || nStimuli > 12) {
    throw new RangeError(
      `[odd-one-out/immagini] nStimuli fuori range [4, 12]: ${nStimuli}`,
    );
  }

  const candidate = REGOLE_PER_DIMENSIONE[dimensione];
  if (!candidate || candidate.length === 0) {
    throw new RangeError(
      `[odd-one-out/immagini] dimensione non riconosciuta: ${dimensione}`,
    );
  }

  const applicabili = regoleApplicabili(candidate, nStimuli, recentlyUsed);
  if (applicabili.length === 0) {
    throw new RangeError(
      `[odd-one-out/immagini] nessuna regola applicabile per ` +
      `(dim=${dimensione}, nStimuli=${nStimuli}, lv=${livello}, ` +
      `recentlyUsed=${recentlyUsed.size}). Pool emoji esaurito.`,
    );
  }

  const regola = applicabili[Math.floor(rng() * applicabili.length)];

  const stimoliBase = pescaSenzaRipetizioniFiltrato(
    regola.poolTarget,
    nStimuli - 1,
    rng,
    recentlyUsed,
  );

  // Pesca 1 anomalia escludendo recentlyUsed + valori appena pescati.
  const exclude = new Set<string>();
  recentlyUsed.forEach((v) => exclude.add(v));
  for (const s of stimoliBase) exclude.add(s.valore);
  const [anomalia] = pescaSenzaRipetizioniFiltrato(
    regola.poolAnomalia,
    1,
    rng,
    exclude,
  );

  return {
    stimoliBase,
    anomalia,
    regolaId: regola.id,
  };
}
