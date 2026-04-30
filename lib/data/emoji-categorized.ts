/**
 * lib/data/emoji-categorized.ts
 *
 * Pool generic-purpose di emoji Unicode categorizzate, riusato cross-famiglia.
 *
 * Consumer attuali:
 *   - components/esercizi/families/memoria-prospettica/sequence.ts
 *     (distrattore semantico + cue prospettico event-based)
 *   - components/esercizi/families/recall-grid/sequence.ts
 *     (encoding griglia immagini, MBT + MLT)
 *
 * 8 macro-categorie prescritte dal GDD §Generazione stimoli (memoria-prospettica.md
 * riga 85; recall-grid.md riga 92): animali, cibo, oggetti_casa, trasporti, natura,
 * attrezzi, sport, abbigliamento. ~15 emoji ciascuna → 120 emoji totali.
 *
 * Le emoji sono renderizzate dal font sistema (Apple Color Emoji /
 * Segoe UI Emoji / Noto Color Emoji) — coerente con CLAUDE.md root
 * "Stimoli visivi: solo emoji/icone vettoriali flat. Mai fotografie."
 *
 * NIENTE pescaCuePerSalience qui: la logica salianza è MP-specific
 * (dipende da CueSalience di families/memoria-prospettica/levels.ts) e
 * vive nel suo namespace. Vedi memoria-prospettica/sequence.ts.
 *
 * Riferimenti:
 *   docs/gdd/shared/06-content-generation.md (Twemoji/Noto)
 *   docs/gdd/families/memoria-prospettica.md §Generazione stimoli
 *   docs/gdd/families/recall-grid.md §Generazione stimoli — Immagini
 */

// ── Tipi esportati ────────────────────────────────────────────────────────────

export type CategoriaEmoji =
  | "animali"
  | "cibo"
  | "oggetti_casa"
  | "trasporti"
  | "natura"
  | "attrezzi"
  | "sport"
  | "abbigliamento";

export type EmojiCategorizzata = {
  emoji: string;
  categoria: CategoriaEmoji;
  /**
   * Sotto-categoria opzionale per discriminazioni fine (es. salianza media
   * in MP, o regole future). Lasciare undefined per emoji senza sottoclasse
   * rilevante. In questo pool tutte le emoji hanno sottoCategoria popolata.
   */
  sottoCategoria?: string;
};

// ── Helper costruzione (privato) ──────────────────────────────────────────────

function e(emoji: string, categoria: CategoriaEmoji, sottoCategoria: string): EmojiCategorizzata {
  return { emoji, categoria, sottoCategoria };
}

// ── Pool emoji (15 × 8 = 120) ────────────────────────────────────────────────

const ANIMALI: readonly EmojiCategorizzata[] = [
  e("🐶","animali","animale_domestico"), e("🐱","animali","animale_domestico"),
  e("🐰","animali","animale_domestico"), e("🐹","animali","animale_domestico"),
  e("🐮","animali","animale_domestico"),
  e("🦁","animali","animale_selvatico"), e("🐯","animali","animale_selvatico"),
  e("🐺","animali","animale_selvatico"), e("🐻","animali","animale_selvatico"),
  e("🦊","animali","animale_selvatico"),
  e("🦅","animali","animale_uccello"),   e("🦉","animali","animale_uccello"),
  e("🐦","animali","animale_uccello"),
  e("🐟","animali","animale_acquatico"), e("🐙","animali","animale_acquatico"),
];

const CIBO: readonly EmojiCategorizzata[] = [
  e("🍎","cibo","cibo_frutto"), e("🍐","cibo","cibo_frutto"), e("🍌","cibo","cibo_frutto"),
  e("🍓","cibo","cibo_frutto"), e("🍇","cibo","cibo_frutto"), e("🍊","cibo","cibo_frutto"),
  e("🥕","cibo","cibo_verdura"), e("🥦","cibo","cibo_verdura"),
  e("🌽","cibo","cibo_verdura"), e("🍅","cibo","cibo_verdura"),
  e("🍕","cibo","cibo_pasto"), e("🍔","cibo","cibo_pasto"), e("🍝","cibo","cibo_pasto"),
  e("🍰","cibo","cibo_dolce"), e("🍪","cibo","cibo_dolce"),
];

const OGGETTI_CASA: readonly EmojiCategorizzata[] = [
  e("🍴","oggetti_casa","casa_cucina"), e("🥄","oggetti_casa","casa_cucina"),
  e("🔪","oggetti_casa","casa_cucina"), e("🍳","oggetti_casa","casa_cucina"),
  e("☕","oggetti_casa","casa_cucina"),
  e("🚿","oggetti_casa","casa_bagno"),  e("🛁","oggetti_casa","casa_bagno"),
  e("🪥","oggetti_casa","casa_bagno"),  e("🧴","oggetti_casa","casa_bagno"),
  e("🛏️","oggetti_casa","casa_camera"),e("🛋️","oggetti_casa","casa_camera"),
  e("🚪","oggetti_casa","casa_camera"),
  e("🧹","oggetti_casa","casa_pulizia"),e("🧽","oggetti_casa","casa_pulizia"),
  e("🧺","oggetti_casa","casa_pulizia"),
];

const TRASPORTI: readonly EmojiCategorizzata[] = [
  e("🚗","trasporti","trasporto_terra"), e("🚌","trasporti","trasporto_terra"),
  e("🚲","trasporti","trasporto_terra"), e("🏍️","trasporti","trasporto_terra"),
  e("🚂","trasporti","trasporto_terra"),
  e("✈️","trasporti","trasporto_aria"), e("🚁","trasporti","trasporto_aria"),
  e("🚀","trasporti","trasporto_aria"), e("🪂","trasporti","trasporto_aria"),
  e("🚢","trasporti","trasporto_acqua"),e("⛵","trasporti","trasporto_acqua"),
  e("🚤","trasporti","trasporto_acqua"),
  e("🚎","trasporti","trasporto_pubblico"), e("🚊","trasporti","trasporto_pubblico"),
  e("🚆","trasporti","trasporto_pubblico"),
];

const NATURA: readonly EmojiCategorizzata[] = [
  e("🌳","natura","natura_pianta"), e("🌲","natura","natura_pianta"),
  e("🌴","natura","natura_pianta"), e("🌵","natura","natura_pianta"),
  e("🌿","natura","natura_pianta"),
  e("🌷","natura","natura_fiore"), e("🌸","natura","natura_fiore"),
  e("🌹","natura","natura_fiore"), e("🌻","natura","natura_fiore"),
  e("☀️","natura","natura_cielo"),  e("🌙","natura","natura_cielo"),
  e("⭐","natura","natura_cielo"),
  e("🌋","natura","natura_terra"),  e("⛰️","natura","natura_terra"),
  e("🏖️","natura","natura_terra"),
];

const ATTREZZI: readonly EmojiCategorizzata[] = [
  e("🔨","attrezzi","attrezzo_manuale"), e("🔧","attrezzi","attrezzo_manuale"),
  e("🪚","attrezzi","attrezzo_manuale"), e("🪛","attrezzi","attrezzo_manuale"),
  e("🔩","attrezzi","attrezzo_manuale"), e("⚙️","attrezzi","attrezzo_manuale"),
  e("📏","attrezzi","attrezzo_misurazione"), e("📐","attrezzi","attrezzo_misurazione"),
  e("⚖️","attrezzi","attrezzo_misurazione"),e("🧭","attrezzi","attrezzo_misurazione"),
  e("🖌️","attrezzi","attrezzo_arte"), e("🖍️","attrezzi","attrezzo_arte"),
  e("🎨","attrezzi","attrezzo_arte"),
  e("✂️","attrezzi","attrezzo_ufficio"), e("📎","attrezzi","attrezzo_ufficio"),
];

const SPORT: readonly EmojiCategorizzata[] = [
  e("⚽","sport","sport_palla"), e("🏀","sport","sport_palla"),
  e("🎾","sport","sport_palla"), e("🏐","sport","sport_palla"),
  e("🏉","sport","sport_palla"),
  e("🏓","sport","sport_attrezzo"), e("🥊","sport","sport_attrezzo"),
  e("🏹","sport","sport_attrezzo"), e("🎳","sport","sport_attrezzo"),
  e("🏊","sport","sport_acquatico"),e("🏄","sport","sport_acquatico"),
  e("🚣","sport","sport_acquatico"),
  e("⛷️","sport","sport_invernale"),e("🏂","sport","sport_invernale"),
  e("⛸️","sport","sport_invernale"),
];

const ABBIGLIAMENTO: readonly EmojiCategorizzata[] = [
  e("👕","abbigliamento","abito_sopra"), e("👔","abbigliamento","abito_sopra"),
  e("🧥","abbigliamento","abito_sopra"), e("🧶","abbigliamento","abito_sopra"),
  e("🎽","abbigliamento","abito_sopra"),
  e("👖","abbigliamento","abito_sotto"), e("🩳","abbigliamento","abito_sotto"),
  e("👗","abbigliamento","abito_sotto"),
  e("👟","abbigliamento","abito_scarpa"),e("👞","abbigliamento","abito_scarpa"),
  e("👠","abbigliamento","abito_scarpa"),e("🥾","abbigliamento","abito_scarpa"),
  e("🧢","abbigliamento","abito_accessorio"), e("🧤","abbigliamento","abito_accessorio"),
  e("🕶️","abbigliamento","abito_accessorio"),
];

// ── Lookup categoria → pool ──────────────────────────────────────────────────

export const POOL_PER_CATEGORIA: Record<CategoriaEmoji, readonly EmojiCategorizzata[]> = {
  animali:        ANIMALI,
  cibo:           CIBO,
  oggetti_casa:   OGGETTI_CASA,
  trasporti:      TRASPORTI,
  natura:         NATURA,
  attrezzi:       ATTREZZI,
  sport:          SPORT,
  abbigliamento:  ABBIGLIAMENTO,
};

export const TUTTE_LE_CATEGORIE: readonly CategoriaEmoji[] = [
  "animali", "cibo", "oggetti_casa", "trasporti",
  "natura",  "attrezzi", "sport", "abbigliamento",
];

// ── Helper Fisher-Yates partial ──────────────────────────────────────────────

function pescaSenzaRipetizioniFiltrato(
  pool: readonly EmojiCategorizzata[],
  n: number,
  rng: () => number,
  exclude: ReadonlySet<string>,
): EmojiCategorizzata[] {
  const candidati = pool.filter((s) => !exclude.has(s.emoji));
  if (n > candidati.length) {
    throw new RangeError(
      `[lib/data/emoji-categorized] pool insufficiente: ` +
      `richiesti ${n}, disponibili ${candidati.length} (totale ${pool.length})`,
    );
  }
  const arr = [...candidati];
  const result: EmojiCategorizzata[] = [];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    result.push(arr[i]);
  }
  return result;
}

// ── pescaEmojiPerCategoria ───────────────────────────────────────────────────

/**
 * Pesca `n` emoji random dalla categoria specificata, escludendo quelle
 * presenti in `exclude` (set di stringhe emoji).
 *
 * @throws RangeError se n < 1, categoria non riconosciuta o pool insufficiente.
 */
export function pescaEmojiPerCategoria(
  categoria: CategoriaEmoji,
  n: number,
  exclude: ReadonlySet<string>,
  rng: () => number,
): EmojiCategorizzata[] {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError(
      `[lib/data/emoji-categorized] n non valido: ${n} (atteso intero ≥ 1)`,
    );
  }
  const pool = POOL_PER_CATEGORIA[categoria];
  if (!pool) {
    throw new RangeError(
      `[lib/data/emoji-categorized] categoria non riconosciuta: ${categoria}`,
    );
  }
  return pescaSenzaRipetizioniFiltrato(pool, n, rng, exclude);
}
