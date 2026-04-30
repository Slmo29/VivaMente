import { describe, it, expect } from "vitest";
import {
  shuffleFisherYates,
  assemblaTrialOdd,
  type StimoloOdd,
} from "@/components/esercizi/families/odd-one-out/sequence";
import { pescaTrialNumeriLettere } from "@/components/esercizi/families/odd-one-out/stimuli/numeri-lettere";
import { pescaTrialImmagini } from "@/components/esercizi/families/odd-one-out/stimuli/immagini";

// ── RNG deterministica (mulberry32) ───────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

// ── Helper / sentinel ─────────────────────────────────────────────────────────

const sA: StimoloOdd = { valore: "a", metadata: {} };
const sB: StimoloOdd = { valore: "b", metadata: {} };
const sC: StimoloOdd = { valore: "c", metadata: {} };
const sD: StimoloOdd = { valore: "d", metadata: {} };
const sE: StimoloOdd = { valore: "e", metadata: {} };
const sX: StimoloOdd = { valore: "X", metadata: {} };

// Tutte le emoji del pool stub di immagini.ts (per test esaurimento pool).
const TUTTE_EMOJI_STUB: readonly string[] = [
  // animale (20)
  "🐶", "🐱", "🐰", "🐹", "🐭", "🐮", "🐷", "🐴",
  "🦁", "🐯", "🐺", "🐻", "🦊", "🦝",
  "🦅", "🦉", "🐦",
  "🐟", "🐙", "🦈",
  // cibo (20)
  "🍎", "🍓", "🍒", "🍅",
  "🍐", "🍌", "🍋", "🥝", "🍇", "🍑", "🍊",
  "🥕", "🥦", "🌽", "🍆",
  "🍰", "🍪", "🍩", "🧁", "🍫",
  // veicolo (16)
  "🚗", "🚕", "🚌", "🚲", "🏍️", "🚂",
  "✈️", "🚁", "🚀", "🪂",
  "🚢", "⛵", "🛥️", "🚤", "⛴️", "⚓",
  // oggetto (20)
  "🍴", "🥄", "🔪", "🍳", "🥢",
  "🔨", "🔧", "🪚", "🧰", "⚙️",
  "✏️", "📎", "📏", "✂️", "📐",
  "⚽", "🏀", "🎾", "🏓", "🎯",
  // natura (19)
  "🌳", "🌲", "🌴", "🌵", "🌿",
  "🌷", "🌸", "🌹", "🌻", "🌺",
  "☀️", "🌙", "⭐", "☁️", "🌈",
  "💧", "🌊", "🌋", "⛰️",
];

// ── Test suite ────────────────────────────────────────────────────────────────

describe("Odd One Out — shuffleFisherYates", () => {
  it("T1: output stessa lunghezza e stesso multiset", () => {
    const input = [sA, sB, sC, sD, sE];
    const out = shuffleFisherYates(input, mulberry32(1));
    expect(out.length).toBe(input.length);
    expect([...out].sort((a, b) => a.valore.localeCompare(b.valore)))
      .toEqual([...input].sort((a, b) => a.valore.localeCompare(b.valore)));
  });

  it("T2: stesso seed → stesso output", () => {
    const input = [sA, sB, sC, sD, sE];
    const a = shuffleFisherYates(input, mulberry32(7));
    const b = shuffleFisherYates(input, mulberry32(7));
    expect(a.map(s => s.valore)).toEqual(b.map(s => s.valore));
  });

  it("T3: seed diversi → output diversi", () => {
    const input = [sA, sB, sC, sD, sE];
    const a = shuffleFisherYates(input, mulberry32(1));
    const b = shuffleFisherYates(input, mulberry32(2));
    expect(a.map(s => s.valore)).not.toEqual(b.map(s => s.valore));
  });

  it("T4: non muta l'input originale", () => {
    const input = [sA, sB, sC, sD, sE];
    const original = [...input];
    shuffleFisherYates(input, mulberry32(42));
    expect(input).toEqual(original);
  });
});

describe("Odd One Out — assemblaTrialOdd", () => {
  it("T5: lunghezza output = stimoliBase.length + 1", () => {
    const trial = assemblaTrialOdd([sA, sB, sC, sD], sX, "regola_test", mulberry32(1));
    expect(trial.stimoli.length).toBe(5);
  });

  it("T6: anomaliaIndex punta effettivamente all'anomalia", () => {
    const trial = assemblaTrialOdd([sA, sB, sC, sD], sX, "regola_test", mulberry32(2));
    expect(trial.stimoli[trial.anomaliaIndex]).toBe(sX);
  });

  it("T7: anomalia non è duplicata negli stimoliBase (sanity)", () => {
    const stimoliBase = [sA, sB, sC, sD];
    expect(stimoliBase).not.toContain(sX);
  });

  it("T8: regolaId preservato nell'output", () => {
    const trial = assemblaTrialOdd([sA, sB, sC], sX, "mia_regola_42", mulberry32(3));
    expect(trial.regolaId).toBe("mia_regola_42");
  });

  it("T9: throw su stimoliBase vuoto", () => {
    expect(() => assemblaTrialOdd([], sX, "r", mulberry32(1)))
      .toThrow(/stimoliBase vuoto/);
  });

  it("T10: throw su regolaId stringa vuota", () => {
    expect(() => assemblaTrialOdd([sA, sB], sX, "", mulberry32(1)))
      .toThrow(/regolaId stringa vuota/);
  });

  it("T11: distribuzione anomaliaIndex su 100 trial — ogni posizione ≥ 5", () => {
    const stimoliBase = [sA, sB, sC, sD, sE];
    const conteggio = [0, 0, 0, 0, 0, 0];
    const rng = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const trial = assemblaTrialOdd(stimoliBase, sX, "r", rng);
      conteggio[trial.anomaliaIndex]++;
    }
    for (let pos = 0; pos < 6; pos++) {
      expect(conteggio[pos]).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("Odd One Out — pescaTrialNumeriLettere", () => {
  it("T12: lv 1 (categoriale_alto, nStimuli=4) — output ben formato", () => {
    const out = pescaTrialNumeriLettere(1, "categoriale_alto", 4, mulberry32(1));
    expect(out.stimoliBase.length).toBe(3);
    expect(out.anomalia).toBeDefined();
    expect(["numeri_vs_lettere", "lettere_vs_numeri"]).toContain(out.regolaId);
  });

  it("T13: lv 7 (categoriale_medio, nStimuli=7) — vocali_vs_consonanti escluso", () => {
    const applicabili = ["pari_vs_dispari", "dispari_vs_pari", "consonanti_vs_vocali"];
    for (const seed of [1, 2, 3, 7, 42]) {
      const out = pescaTrialNumeriLettere(7, "categoriale_medio", 7, mulberry32(seed));
      expect(applicabili).toContain(out.regolaId);
    }
  });

  it("T14: lv 13 — solo range_10_20_vs_fuori applicabile", () => {
    const out = pescaTrialNumeriLettere(13, "semantico_contestuale", 10, mulberry32(13));
    expect(out.regolaId).toBe("range_10_20_vs_fuori");
    for (const s of out.stimoliBase) {
      const n = parseInt(s.valore, 10);
      expect(n).toBeGreaterThanOrEqual(10);
      expect(n).toBeLessThanOrEqual(20);
    }
    const nA = parseInt(out.anomalia.valore, 10);
    expect(nA).toBeGreaterThanOrEqual(0);
    expect(nA).toBeLessThanOrEqual(9);
  });

  it("T15: lv 18 — solo no_multipli_3 applicabile", () => {
    const out = pescaTrialNumeriLettere(18, "astratto", 12, mulberry32(18));
    expect(out.regolaId).toBe("no_multipli_3");
    for (const s of out.stimoliBase) {
      const n = parseInt(s.valore, 10);
      expect(n % 3).not.toBe(0);
    }
    const nA = parseInt(out.anomalia.valore, 10);
    expect(nA % 3).toBe(0);
  });

  it("T16: throw su nStimuli fuori range", () => {
    expect(() => pescaTrialNumeriLettere(1, "categoriale_alto", 3, mulberry32(1)))
      .toThrow(/fuori range/);
    expect(() => pescaTrialNumeriLettere(1, "categoriale_alto", 13, mulberry32(1)))
      .toThrow(/fuori range/);
  });

  it("T17: determinismo — stesso seed → stesso output", () => {
    const a = pescaTrialNumeriLettere(7, "categoriale_medio", 6, mulberry32(123));
    const b = pescaTrialNumeriLettere(7, "categoriale_medio", 6, mulberry32(123));
    expect(a.regolaId).toBe(b.regolaId);
    expect(a.anomalia.valore).toBe(b.anomalia.valore);
    expect(a.stimoliBase.map(s => s.valore)).toEqual(b.stimoliBase.map(s => s.valore));
  });
});

describe("Odd One Out — pescaTrialImmagini", () => {
  it("T18: lv 1 (categoriale_alto, nStimuli=4) — output ben formato", () => {
    const out = pescaTrialImmagini(1, "categoriale_alto", 4, new Set<string>(), mulberry32(1));
    expect(out.stimoliBase.length).toBe(3);
    expect(out.anomalia).toBeDefined();
    expect(out.regolaId).toMatch(/^(animali|cibi|veicoli|oggetti|natura)_vs_/);
  });

  it("T19: lv 9 (categoriale_medio, nStimuli=8) — output ben formato", () => {
    const out = pescaTrialImmagini(9, "categoriale_medio", 8, new Set<string>(), mulberry32(9));
    expect(out.stimoliBase.length).toBe(7);
    expect(out.anomalia).toBeDefined();
    expect(out.regolaId).toBeTruthy();
  });

  it("T20: copertura lv 11+ semantico_contestuale (nessun gating)", () => {
    const out = pescaTrialImmagini(11, "semantico_contestuale", 9, new Set<string>(), mulberry32(11));
    expect(out.stimoliBase.length).toBe(8);
    expect(out.anomalia).toBeDefined();
    expect(["con_volto_vs_senza", "rotondo_vs_no", "metallico_vs_no"]).toContain(out.regolaId);
  });

  it("T21: filtro recentlyUsed — solo regole con pool ancora applicabile", () => {
    // Esclude tutti gli animali e tutti i veicoli → restano regole su cibi/oggetti/natura.
    const escluse = new Set<string>([
      "🐶", "🐱", "🐰", "🐹", "🐭", "🐮", "🐷", "🐴",
      "🦁", "🐯", "🐺", "🐻", "🦊", "🦝",
      "🦅", "🦉", "🐦",
      "🐟", "🐙", "🦈",
      "🚗", "🚕", "🚌", "🚲", "🏍️", "🚂",
      "✈️", "🚁", "🚀", "🪂",
      "🚢", "⛵", "🛥️", "🚤", "⛴️", "⚓",
    ]);
    const ammesse = ["cibi_vs_oggetti", "oggetti_vs_cibi"];
    for (let seed = 0; seed < 50; seed++) {
      const out = pescaTrialImmagini(1, "categoriale_alto", 4, escluse, mulberry32(seed));
      expect(ammesse).toContain(out.regolaId);
    }
  });

  it("T22: throw quando recentlyUsed esaurisce tutto il pool", () => {
    const tutto = new Set<string>(TUTTE_EMOJI_STUB);
    expect(() => pescaTrialImmagini(1, "categoriale_alto", 4, tutto, mulberry32(1)))
      .toThrow(/nessuna regola applicabile/);
  });
});

describe("Odd One Out — pescaTrialImmagini lv 16+ (astratto)", () => {
  it("T23: lv 16 (astratto, nStimuli=11) — output ben formato", () => {
    const out = pescaTrialImmagini(16, "astratto", 11, new Set<string>(), mulberry32(16));
    expect(out.stimoliBase.length).toBe(10);
    expect(out.anomalia).toBeDefined();
    expect([
      "vivo_vs_non_vivo",
      "commestibile_vs_no",
      "vegetale_vs_animale",
      "costruito_vs_naturale",
    ]).toContain(out.regolaId);
  });
});
