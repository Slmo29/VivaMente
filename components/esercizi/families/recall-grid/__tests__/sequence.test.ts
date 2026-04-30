import { describe, it, expect } from "vitest";
import {
  getRecallGridMBTLevel,
  getRecallGridMLTLevel,
  ncells,
} from "@/components/esercizi/families/recall-grid/levels";
import {
  pescaPosizioni,
  generaTrialRecallGrid,
} from "@/components/esercizi/families/recall-grid/sequence";

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

/** Tutte le 78 parole del pool stub di parole-stub.ts (per test T15). */
const TUTTE_PAROLE_STUB: readonly string[] = [
  // animali (12)
  "cane", "gatto", "lupo", "volpe", "leone", "tigre", "cervo", "topo",
  "rana", "pecora", "mucca", "gufo",
  // cibi (12)
  "pane", "pasta", "carne", "uovo", "riso", "pizza", "biscotto", "gelato",
  "zuppa", "sale", "miele", "latte",
  // oggetti casa (10)
  "tavolo", "sedia", "letto", "porta", "lampada", "armadio", "divano",
  "mensola", "specchio", "finestra",
  // vestiti (10)
  "camicia", "scarpa", "gonna", "calza", "cintura", "cappello", "sciarpa",
  "guanto", "giacca", "cappotto",
  // natura (10)
  "fiume", "monte", "albero", "fiore", "pietra", "stella", "luna", "sole",
  "vento", "nuvola",
  // mestieri (8)
  "medico", "cuoco", "pilota", "operaio", "maestro", "sarto", "vigile", "barista",
  // abitazione (8)
  "cucina", "bagno", "salotto", "cantina", "balcone", "soffitta", "terrazzo", "garage",
  // mezzi (8)
  "treno", "barca", "aereo", "auto", "nave", "camion", "bici", "scooter",
];

/** 15 emoji della categoria "animali" (per test T16). */
const EMOJI_ANIMALI: readonly string[] = [
  "🐶", "🐱", "🐰", "🐹", "🐮",
  "🦁", "🐯", "🐺", "🐻", "🦊",
  "🦅", "🦉", "🐦",
  "🐟", "🐙",
];

// ── Test suite ────────────────────────────────────────────────────────────────

describe("Recall Grid — pescaPosizioni", () => {
  it("T1: nStimuli posizioni distinte (no duplicati su row,col)", () => {
    const pos = pescaPosizioni("4x4", 6, mulberry32(1));
    expect(pos.length).toBe(6);
    const keys = new Set(pos.map((p) => `${p.row},${p.col}`));
    expect(keys.size).toBe(6);
  });

  it("T2: posizioni nel range [0, rows) × [0, cols)", () => {
    const pos = pescaPosizioni("5x5", 8, mulberry32(2));
    for (const p of pos) {
      expect(p.row).toBeGreaterThanOrEqual(0);
      expect(p.row).toBeLessThan(5);
      expect(p.col).toBeGreaterThanOrEqual(0);
      expect(p.col).toBeLessThan(5);
    }
  });

  it("T3: throw RangeError su n > ncells", () => {
    expect(() => pescaPosizioni("3x3", 10, mulberry32(1)))
      .toThrow(/nStimuli=10 > ncells/);
  });

  it("T4: determinismo seed — stesso seed → stesse posizioni", () => {
    const a = pescaPosizioni("4x4", 5, mulberry32(42));
    const b = pescaPosizioni("4x4", 5, mulberry32(42));
    expect(a).toEqual(b);
  });
});

describe("Recall Grid — generaTrialRecallGrid (parole MBT)", () => {
  it("T5: lv 1 — trial ben formato", () => {
    const level = getRecallGridMBTLevel(1);
    const trial = generaTrialRecallGrid(level, "parole", new Set(), mulberry32(1));
    expect(trial.stimuli.length).toBe(level.nStimuli);
    expect(trial.delayMs).toBe(level.delayMs);
    expect(trial.isMlt).toBe(false);
    expect(trial.stimulusType).toBe("parole");
    for (const s of trial.stimuli) {
      expect(s.id).toMatch(/^p_/);
    }
  });

  it("T6: lv 5 — parole lowercase 4-8 caratteri", () => {
    const level = getRecallGridMBTLevel(5);
    const trial = generaTrialRecallGrid(level, "parole", new Set(), mulberry32(5));
    for (const s of trial.stimuli) {
      expect(s.valore).toBe(s.valore.toLowerCase());
      expect(s.valore.length).toBeGreaterThanOrEqual(4);
      expect(s.valore.length).toBeLessThanOrEqual(8);
    }
  });

  it("T7: gating lv 11+ → throw beta limitata", () => {
    const level = getRecallGridMBTLevel(11);
    expect(() => generaTrialRecallGrid(level, "parole", new Set(), mulberry32(11)))
      .toThrow(/beta limitata/);
  });
});

describe("Recall Grid — generaTrialRecallGrid (immagini MBT)", () => {
  it("T8: lv 1 — trial ben formato", () => {
    const level = getRecallGridMBTLevel(1);
    const trial = generaTrialRecallGrid(level, "immagini", new Set(), mulberry32(1));
    expect(trial.stimuli.length).toBe(level.nStimuli);
    expect(trial.isMlt).toBe(false);
    expect(trial.stimulusType).toBe("immagini");
    for (const s of trial.stimuli) {
      expect(s.id).toMatch(/^e_/);
    }
  });

  it("T9: lv 17 (nStimuli=8) — tutte categorie distinte (maxPerCategoria=1)", () => {
    const level = getRecallGridMBTLevel(17);
    expect(level.nStimuli).toBe(8);
    const trial = generaTrialRecallGrid(level, "immagini", new Set(), mulberry32(17));
    const categorie = new Set(trial.stimuli.map((s) => s.categoria));
    expect(categorie.size).toBe(8);
  });

  it("T10: lv 18 (nStimuli=9) — deroga maxPerCategoria=2 attiva", () => {
    const level = getRecallGridMBTLevel(18);
    expect(level.nStimuli).toBe(9);
    const trial = generaTrialRecallGrid(level, "immagini", new Set(), mulberry32(18));
    // Conta per categoria: max 2, almeno 1 categoria deve avere 2 (9 stimoli / 8 cat).
    const conteggi = new Map<string, number>();
    for (const s of trial.stimuli) {
      conteggi.set(s.categoria, (conteggi.get(s.categoria) ?? 0) + 1);
    }
    let maxConteggio = 0;
    let almeno1Doppia = false;
    for (const c of conteggi.values()) {
      if (c > maxConteggio) maxConteggio = c;
      if (c === 2) almeno1Doppia = true;
    }
    expect(maxConteggio).toBeLessThanOrEqual(2);
    expect(almeno1Doppia).toBe(true);
  });

  it("T11: lv 20 (nStimuli=10) — count esatto + max 2 per categoria", () => {
    const level = getRecallGridMBTLevel(20);
    expect(level.nStimuli).toBe(10);
    const trial = generaTrialRecallGrid(level, "immagini", new Set(), mulberry32(20));
    expect(trial.stimuli.length).toBe(10);
    // Emoji distinte (no duplicati su valore).
    const emojiSet = new Set(trial.stimuli.map((s) => s.valore));
    expect(emojiSet.size).toBe(10);
    // Max 2 per categoria.
    const conteggi = new Map<string, number>();
    for (const s of trial.stimuli) {
      conteggi.set(s.categoria, (conteggi.get(s.categoria) ?? 0) + 1);
    }
    for (const c of conteggi.values()) {
      expect(c).toBeLessThanOrEqual(2);
    }
  });
});

describe("Recall Grid — generaTrialRecallGrid (immagini MLT)", () => {
  it("T12: lv 1 — isMlt true, delayMs = delayS × 1000", () => {
    const level = getRecallGridMLTLevel(1);
    const trial = generaTrialRecallGrid(level, "immagini", new Set(), mulberry32(1));
    expect(trial.isMlt).toBe(true);
    expect(trial.delayMs).toBe(level.delayS * 1000);
    expect(trial.delayMs).toBe(30_000);
  });

  it("T13: lv 17 — delayMs 180000, tLimReproMs 25000", () => {
    const level = getRecallGridMLTLevel(17);
    const trial = generaTrialRecallGrid(level, "immagini", new Set(), mulberry32(17));
    expect(trial.delayMs).toBe(180_000);
    expect(trial.tLimReproMs).toBe(25_000);
  });

  it("T14: MLT lv 20 (nStimuli=7) — max 1 per categoria (no deroga MLT)", () => {
    const level = getRecallGridMLTLevel(20);
    expect(level.nStimuli).toBe(7);
    const trial = generaTrialRecallGrid(level, "immagini", new Set(), mulberry32(20));
    const conteggi = new Map<string, number>();
    for (const s of trial.stimuli) {
      conteggi.set(s.categoria, (conteggi.get(s.categoria) ?? 0) + 1);
    }
    for (const c of conteggi.values()) {
      expect(c).toBeLessThanOrEqual(1);
    }
  });
});

describe("Recall Grid — recentlyUsed", () => {
  it("T15: parole — recentlyUsed con tutto il pool → throw pool insufficiente", () => {
    const level = getRecallGridMBTLevel(1);
    const tutto = new Set<string>(TUTTE_PAROLE_STUB);
    expect(() => generaTrialRecallGrid(level, "parole", tutto, mulberry32(1)))
      .toThrow(/pool insufficiente/);
  });

  it("T16: immagini — recentlyUsed che esclude tutta una categoria → altre 7 disponibili", () => {
    const level = getRecallGridMBTLevel(1); // 3x3, 2 stim, immagini
    const tuttaCatAnimali = new Set<string>(EMOJI_ANIMALI);
    const trial = generaTrialRecallGrid(level, "immagini", tuttaCatAnimali, mulberry32(99));
    expect(trial.stimuli.length).toBe(2);
    for (const s of trial.stimuli) {
      expect(s.categoria).not.toBe("animali");
    }
  });
});

describe("Recall Grid — boundary livelli (loop)", () => {
  it("T17: tutti i 20 livelli MBT immagini + 20 livelli MLT immagini — output ben formato", () => {
    for (let lv = 1; lv <= 20; lv++) {
      const levelMBT = getRecallGridMBTLevel(lv);
      const trialMBT = generaTrialRecallGrid(
        levelMBT, "immagini", new Set(), mulberry32(1000 + lv),
      );
      expect(trialMBT.stimuli.length).toBe(levelMBT.nStimuli);
      expect(trialMBT.gridSize).toBe(levelMBT.gridSize);
      // Posizioni distinte
      const keysMBT = new Set(trialMBT.stimuli.map((s) => `${s.row},${s.col}`));
      expect(keysMBT.size).toBe(levelMBT.nStimuli);
      // Tutte le posizioni nel range
      for (const s of trialMBT.stimuli) {
        const [rows, cols] = levelMBT.gridSize.split("x").map(Number);
        expect(s.row).toBeLessThan(rows);
        expect(s.col).toBeLessThan(cols);
      }

      const levelMLT = getRecallGridMLTLevel(lv);
      const trialMLT = generaTrialRecallGrid(
        levelMLT, "immagini", new Set(), mulberry32(2000 + lv),
      );
      expect(trialMLT.stimuli.length).toBe(levelMLT.nStimuli);
      expect(trialMLT.isMlt).toBe(true);
      expect(trialMLT.delayMs).toBe(levelMLT.delayS * 1000);
    }
    // Sanity ncells helper
    expect(ncells("3x3")).toBe(9);
    expect(ncells("6x6")).toBe(36);
  });
});
