/**
 * components/esercizi/families/verbal-fluency/sequence.ts
 *
 * Tipi stimolo/risposta e generazione per Verbal Fluency.
 *
 * Semantica: categoria libera, accetta qualsiasi parola (validazione per dedup + lunghezza).
 * Fonemica:  parola deve iniziare con la lettera assegnata.
 *
 * Micro-progressione agisce su tLimMs (valoreCorrente passato da TrialFlow).
 */

import { VF_CATEGORIE, type VFCategoria } from "./categorie";
import type { VFBanda } from "./levels";

export type VFVariante = "semantica" | "fonemica";

export interface StimoloVF {
  variante:       VFVariante;
  categoria:      string;   // label mostrata ("animali") o lettera ("F")
  scoreThreshold: number;
  tLimMs:         number;
}

export type RispostaVF = {
  parole: string[];  // lista parole accettate (dedup + filtrate)
  score:  number;    // = parole.length
} | null;

// ── Pool categorie semantiche senza ripetizione ───────────────────────────────

export interface VFPoolRef {
  semantica: Record<VFBanda, { shuffled: VFCategoria[]; idx: number }>;
  fonemica:  { ultimaLettera: string | null };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function creaVFPoolRef(rng: () => number): VFPoolRef {
  const bande: VFBanda[] = ["molto_ampia", "media"];
  const semantica = {} as VFPoolRef["semantica"];
  for (const b of bande) {
    const filtered = VF_CATEGORIE.filter((c) => c.banda === b);
    semantica[b] = { shuffled: shuffle([...filtered], rng), idx: 0 };
  }
  return { semantica, fonemica: { ultimaLettera: null } };
}

// ── Generatore ────────────────────────────────────────────────────────────────

export function generaStimoloVF(
  variante:       VFVariante,
  banda:          VFBanda,
  letterPool:     string[],
  scoreThreshold: number,
  tLimMs:         number,
  poolRef:        VFPoolRef,
  rng:            () => number,
): StimoloVF {
  if (variante === "semantica") {
    const pool = poolRef.semantica[banda];
    const cat  = pool.shuffled[pool.idx];
    pool.idx   = (pool.idx + 1) % pool.shuffled.length;
    if (pool.idx === 0) {
      pool.shuffled = shuffle(
        VF_CATEGORIE.filter((c) => c.banda === banda),
        rng,
      );
    }
    return { variante, categoria: cat.label, scoreThreshold, tLimMs };
  }

  // fonemica: evita di ripetere la lettera usata l'ultima volta
  const candidates = letterPool.filter(
    (l) => l !== poolRef.fonemica.ultimaLettera || letterPool.length === 1,
  );
  const lettera = candidates[Math.floor(rng() * candidates.length)];
  poolRef.fonemica.ultimaLettera = lettera;

  return { variante, categoria: lettera, scoreThreshold, tLimMs };
}

// ── Validazione parola ────────────────────────────────────────────────────────

function normalizza(s: string): string {
  return s.trim().toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u");
}

export function isParolaAccettata(
  parola:    string,
  variante:  VFVariante,
  categoria: string,       // lettera (per fonemica)
  giàUsate:  Set<string>,
): boolean {
  const p = normalizza(parola);
  if (p.length < 2) return false;
  if (giàUsate.has(p)) return false;
  if (variante === "fonemica") {
    const letteraNorm = normalizza(categoria);
    if (!p.startsWith(letteraNorm)) return false;
  }
  return true;
}
