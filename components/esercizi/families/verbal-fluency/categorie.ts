/**
 * components/esercizi/families/verbal-fluency/categorie.ts
 *
 * Pool categorie semantiche per Verbal Fluency Semantica.
 * 20 categorie suddivise per banda di ampiezza.
 */

export interface VFCategoria {
  id:     string;
  label:  string;   // mostrata all'utente
  banda:  "molto_ampia" | "media";
}

export const VF_CATEGORIE: readonly VFCategoria[] = [
  // ── Banda: molto_ampia ────────────────────────────────────────────────────
  { id: "animali",          label: "animali",                      banda: "molto_ampia" },
  { id: "cibo",             label: "cose da mangiare",             banda: "molto_ampia" },
  { id: "oggetti_casa",     label: "oggetti che si trovano in casa",banda: "molto_ampia" },
  { id: "mezzi_trasporto",  label: "mezzi di trasporto",           banda: "molto_ampia" },
  { id: "abbigliamento",    label: "capi di abbigliamento",        banda: "molto_ampia" },
  { id: "colori",           label: "colori",                       banda: "molto_ampia" },
  { id: "mobili",           label: "mobili e arredi",              banda: "molto_ampia" },
  { id: "giocattoli",       label: "giochi e giocattoli",          banda: "molto_ampia" },
  { id: "paesi",            label: "nazioni del mondo",            banda: "molto_ampia" },
  { id: "professioni",      label: "professioni e mestieri",       banda: "molto_ampia" },

  // ── Banda: media ─────────────────────────────────────────────────────────
  { id: "frutta",           label: "tipi di frutta",               banda: "media" },
  { id: "verdure",          label: "verdure e ortaggi",            banda: "media" },
  { id: "sport",            label: "sport e attività fisiche",     banda: "media" },
  { id: "strumenti",        label: "strumenti musicali",           banda: "media" },
  { id: "fiori",            label: "fiori e piante",               banda: "media" },
  { id: "paesi_europei",    label: "paesi europei",                banda: "media" },
  { id: "animali_domestici",label: "animali domestici",            banda: "media" },
  { id: "cibi_dolci",       label: "cibi e dolci tipici italiani", banda: "media" },
  { id: "elettrodomestici", label: "elettrodomestici",             banda: "media" },
  { id: "lavori_cucina",    label: "utensili da cucina",           banda: "media" },
];
