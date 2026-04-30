/**
 * components/esercizi/families/recall-grid/stimuli/parole-stub.ts
 *
 * Pool stub di parole italiane NVdB-compatibili per Recall Grid Parole MBT.
 *
 * First-pass: ~78 parole tutte FO (Fondamentale), distribuite su 8 categorie
 * semantiche per varietà UX. Sufficienti a coprire **lv 1–10** (FO only).
 * Lv 11+ (FO+AU) richiede dataset esteso ~300 parole — gating via
 * SOGLIA_GATING_PAROLE_STUB, l'Engine throw esplicito.
 *
 * Vincoli editoriali del pool (GDD §Generazione stimoli — Parole, riga 80):
 *   - Lunghezza 4–8 caratteri (wordLength: [4, 8]).
 *   - Tutte lowercase.
 *   - Niente accenti grafici (è, à, é, ò, ù).
 *   - Niente apostrofi.
 *   - Niente omografi ambigui (es. "moto" → escluso, ambiguo movimento/motociclo).
 *   - Niente nomi propri.
 *   - Solo nomi concreti.
 *
 * Riferimento: docs/gdd/families/recall-grid.md §Generazione stimoli — Parole
 */

// ── Tipi esportati ────────────────────────────────────────────────────────────

export type FasciaFrequenza = "FO" | "AU" | "AD";

export type ParolaMBT = {
  /** Parola lowercase, lunghezza 4–8 caratteri, niente accenti. */
  parola: string;
  /** Numero di sillabe (informativo, non usato in Recall Grid). */
  nSillabe?: number;
  /** Categoria semantica grossolana (per future no-rep cross-trial). */
  categoria: string;
  fasciaFrequenza: FasciaFrequenza;
};

// ── Costanti ──────────────────────────────────────────────────────────────────

/** Soglia livello (MBT) oltre cui il pool stub è insufficiente. */
export const SOGLIA_GATING_PAROLE_STUB = 11;

// ── Pool stub (~78 parole FO, 8 categorie) ───────────────────────────────────

const POOL_STUB: readonly ParolaMBT[] = [
  // ── Animali (12) ──
  { parola: "cane",    categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "gatto",   categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "lupo",    categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "volpe",   categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "leone",   categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "tigre",   categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "cervo",   categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "topo",    categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "rana",    categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "pecora",  categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "mucca",   categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "gufo",    categoria: "animali",     fasciaFrequenza: "FO", nSillabe: 2 },

  // ── Cibi (12) ──
  { parola: "pane",    categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "pasta",   categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "carne",   categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "uovo",    categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "riso",    categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "pizza",   categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "biscotto", categoria: "cibi",       fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "gelato",  categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "zuppa",   categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "sale",    categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "miele",   categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "latte",   categoria: "cibi",        fasciaFrequenza: "FO", nSillabe: 2 },

  // ── Oggetti casa (10) ──
  { parola: "tavolo",  categoria: "oggetti_casa", fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "sedia",   categoria: "oggetti_casa", fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "letto",   categoria: "oggetti_casa", fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "porta",   categoria: "oggetti_casa", fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "lampada", categoria: "oggetti_casa", fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "armadio", categoria: "oggetti_casa", fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "divano",  categoria: "oggetti_casa", fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "mensola", categoria: "oggetti_casa", fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "specchio", categoria: "oggetti_casa", fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "finestra", categoria: "oggetti_casa", fasciaFrequenza: "FO", nSillabe: 3 },

  // ── Vestiti (10) ──
  { parola: "camicia", categoria: "vestiti",     fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "scarpa",  categoria: "vestiti",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "gonna",   categoria: "vestiti",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "calza",   categoria: "vestiti",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "cintura", categoria: "vestiti",     fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "cappello", categoria: "vestiti",    fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "sciarpa", categoria: "vestiti",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "guanto",  categoria: "vestiti",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "giacca",  categoria: "vestiti",     fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "cappotto", categoria: "vestiti",    fasciaFrequenza: "FO", nSillabe: 3 },

  // ── Natura (10) ──
  { parola: "fiume",   categoria: "natura",      fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "monte",   categoria: "natura",      fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "albero",  categoria: "natura",      fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "fiore",   categoria: "natura",      fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "pietra",  categoria: "natura",      fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "stella",  categoria: "natura",      fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "luna",    categoria: "natura",      fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "sole",    categoria: "natura",      fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "vento",   categoria: "natura",      fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "nuvola",  categoria: "natura",      fasciaFrequenza: "FO", nSillabe: 3 },

  // ── Mestieri (8) ──
  { parola: "medico",  categoria: "mestieri",    fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "cuoco",   categoria: "mestieri",    fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "pilota",  categoria: "mestieri",    fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "operaio", categoria: "mestieri",    fasciaFrequenza: "FO", nSillabe: 4 },
  { parola: "maestro", categoria: "mestieri",    fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "sarto",   categoria: "mestieri",    fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "vigile",  categoria: "mestieri",    fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "barista", categoria: "mestieri",    fasciaFrequenza: "FO", nSillabe: 3 },

  // ── Abitazione (8) ──
  { parola: "cucina",  categoria: "abitazione",  fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "bagno",   categoria: "abitazione",  fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "salotto", categoria: "abitazione",  fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "cantina", categoria: "abitazione",  fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "balcone", categoria: "abitazione",  fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "soffitta", categoria: "abitazione", fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "terrazzo", categoria: "abitazione", fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "garage",  categoria: "abitazione",  fasciaFrequenza: "FO", nSillabe: 3 },

  // ── Mezzi (8) ──
  { parola: "treno",   categoria: "mezzi",       fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "barca",   categoria: "mezzi",       fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "aereo",   categoria: "mezzi",       fasciaFrequenza: "FO", nSillabe: 3 },
  { parola: "auto",    categoria: "mezzi",       fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "nave",    categoria: "mezzi",       fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "camion",  categoria: "mezzi",       fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "bici",    categoria: "mezzi",       fasciaFrequenza: "FO", nSillabe: 2 },
  { parola: "scooter", categoria: "mezzi",       fasciaFrequenza: "FO", nSillabe: 2 },
];

// ── Helper Fisher-Yates partial ──────────────────────────────────────────────

function pescaSenzaRipetizioniFiltrato(
  pool: readonly ParolaMBT[],
  n: number,
  rng: () => number,
): ParolaMBT[] {
  const arr = [...pool];
  const result: ParolaMBT[] = [];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    result.push(arr[i]);
  }
  return result;
}

// ── pescaParoleStub ──────────────────────────────────────────────────────────

/**
 * Pesca `n` parole univoche dal pool stub, escludendo quelle in `exclude`
 * e filtrando per fascia di frequenza ammessa al livello.
 *
 * @throws RangeError se n < 1 o pool insufficiente dopo filtri.
 */
export function pescaParoleStub(
  n: number,
  fasceAmmesse: readonly FasciaFrequenza[],
  exclude: ReadonlySet<string>,
  rng: () => number,
): ParolaMBT[] {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError(
      `[recall-grid/parole-stub] n non valido: ${n} (atteso intero ≥ 1)`,
    );
  }
  const fasciaSet = new Set<FasciaFrequenza>(fasceAmmesse);
  const candidati = POOL_STUB.filter(
    (p) => fasciaSet.has(p.fasciaFrequenza) && !exclude.has(p.parola),
  );
  if (candidati.length < n) {
    throw new RangeError(
      `[recall-grid/parole-stub] pool insufficiente: richiesti ${n}, ` +
      `disponibili ${candidati.length} dopo filtro fasce=[${fasceAmmesse.join(",")}] ` +
      `+ exclude=${exclude.size}.`,
    );
  }
  return pescaSenzaRipetizioniFiltrato(candidati, n, rng);
}
