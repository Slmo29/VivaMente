import { describe, it, expect } from "vitest";
import {
  generaSequenzaSart,
  piazzaCostruttivo,
  MIN_SPACING,
} from "@/components/esercizi/families/sart/sequence";
import { SART_LEVELS, SART_LEVELS_GDD_STRICT } from "@/components/esercizi/families/sart/levels";
import { SART_DEROGA_LUNGHEZZA_BLOCCO } from "@/components/esercizi/families/sart/_deroghe";

// ── RNG deterministica (mulberry32) ───────────────────────────────────────────
// Stessa funzione usata nei test Stroop e Go/No-Go — duplicata inline,
// no astrazione cross-famiglia preventiva.

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

// ── Helper ────────────────────────────────────────────────────────────────────

function targetPositions(seq: number[], target: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < seq.length; i++) {
    if (seq[i] === target) out.push(i);
  }
  return out;
}

function minSpacing(positions: number[]): number {
  if (positions.length < 2) return Infinity;
  let min = Infinity;
  for (let i = 1; i < positions.length; i++) {
    const gap = positions[i] - positions[i - 1];
    if (gap < min) min = gap;
  }
  return min;
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe("SART sequence — count target", () => {
  it("T1: lv 1 (seqLen 50, freq 0.20) → 10 target esatti", () => {
    const seq = generaSequenzaSart(50, 0.20, 3, mulberry32(1));
    expect(targetPositions(seq, 3).length).toBe(10);
  });

  it("T2: lv 11 (seqLen 140, freq 0.08) → 11 target esatti", () => {
    const seq = generaSequenzaSart(140, 0.08, 7, mulberry32(2));
    expect(targetPositions(seq, 7).length).toBe(11);
  });

  it("T3: lv 20 (seqLen 200, freq 0.05) → 10 target esatti", () => {
    const seq = generaSequenzaSart(200, 0.05, 5, mulberry32(3));
    expect(targetPositions(seq, 5).length).toBe(10);
  });
});

describe("SART sequence — vincoli posizionali", () => {
  it("T4: no target consecutivi su lv 1, 11, 20 con seed multipli", () => {
    const cases: Array<[number, number, number]> = [
      [50, 0.20, 3],
      [140, 0.08, 7],
      [200, 0.05, 5],
    ];
    for (const [seqLen, freq, target] of cases) {
      for (const seed of [1, 7, 42, 123]) {
        const seq = generaSequenzaSart(seqLen, freq, target, mulberry32(seed));
        for (let i = 0; i < seq.length - 1; i++) {
          if (seq[i] === target && seq[i + 1] === target) {
            throw new Error(
              `Target consecutivi a i=${i}, seqLen=${seqLen}, seed=${seed}`,
            );
          }
        }
      }
    }
  });

  it("T5: spacing min 5 esplicito tra target consecutivi", () => {
    const cases: Array<[number, number, number]> = [
      [50, 0.20, 3],
      [140, 0.08, 7],
      [200, 0.05, 5],
    ];
    for (const [seqLen, freq, target] of cases) {
      for (const seed of [1, 7, 42, 123]) {
        const seq = generaSequenzaSart(seqLen, freq, target, mulberry32(seed));
        const positions = targetPositions(seq, target);
        const min = minSpacing(positions);
        if (min < MIN_SPACING) {
          throw new Error(
            `Spacing < ${MIN_SPACING} su seqLen=${seqLen}, seed=${seed}, min=${min}`,
          );
        }
      }
    }
  });
});

describe("SART sequence — vincoli sui valori", () => {
  it("T6: range cifre 1–9 (interi)", () => {
    const seq = generaSequenzaSart(200, 0.05, 5, mulberry32(42));
    for (const v of seq) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(9);
    }
  });

  it("T7: non-target ≠ target", () => {
    const target = 5;
    const seq = generaSequenzaSart(200, 0.05, target, mulberry32(43));
    for (let i = 0; i < seq.length; i++) {
      if (seq[i] !== target) {
        // Verifica esplicita: la cifra è non-target → deve essere in [1..9]\{target}
        expect(seq[i]).not.toBe(target);
        expect(seq[i]).toBeGreaterThanOrEqual(1);
        expect(seq[i]).toBeLessThanOrEqual(9);
      }
    }
  });

  it("T8: robustezza target diverso (1..9) — vincoli rispettati", () => {
    for (let target = 1; target <= 9; target++) {
      const seq = generaSequenzaSart(140, 0.08, target, mulberry32(100 + target));
      // count
      const positions = targetPositions(seq, target);
      expect(positions.length).toBe(Math.floor(140 * 0.08));
      // spacing
      expect(minSpacing(positions)).toBeGreaterThanOrEqual(MIN_SPACING);
      // range
      for (const v of seq) {
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(9);
      }
    }
  });
});

describe("SART sequence — distribuzione non-target", () => {
  it("T9: distribuzione non-target ±20% su 100 sequenze lv 20", () => {
    const target = 5;
    const conteggio: Record<number, number> = {};
    for (let d = 1; d <= 9; d++) if (d !== target) conteggio[d] = 0;

    // RNG condivisa tra le iterazioni (deterministica, seed fisso).
    const rng = mulberry32(42);
    let totaleNonTarget = 0;
    for (let i = 0; i < 100; i++) {
      const seq = generaSequenzaSart(200, 0.05, target, rng);
      for (const v of seq) {
        if (v !== target) {
          conteggio[v]++;
          totaleNonTarget++;
        }
      }
    }

    const attesa = totaleNonTarget / 8;
    const lower = attesa * 0.80;
    const upper = attesa * 1.20;
    for (let d = 1; d <= 9; d++) {
      if (d === target) continue;
      expect(conteggio[d]).toBeGreaterThan(lower);
      expect(conteggio[d]).toBeLessThan(upper);
    }
  });
});

describe("SART sequence — determinismo e seed", () => {
  it("T10: stesso seed → stessa sequenza", () => {
    const a = generaSequenzaSart(140, 0.08, 7, mulberry32(123));
    const b = generaSequenzaSart(140, 0.08, 7, mulberry32(123));
    expect(a).toEqual(b);
  });

  it("T11: seed diversi → sequenze diverse", () => {
    const a = generaSequenzaSart(140, 0.08, 7, mulberry32(123));
    const b = generaSequenzaSart(140, 0.08, 7, mulberry32(456));
    expect(a).not.toEqual(b);
  });
});

describe("SART sequence — boundary livelli", () => {
  it("T12: lv 1 boundary inferiore (seqLen 50, count 10)", () => {
    const seq = generaSequenzaSart(50, 0.20, 4, mulberry32(11));
    expect(seq.length).toBe(50);
    expect(targetPositions(seq, 4).length).toBe(10);
    expect(minSpacing(targetPositions(seq, 4))).toBeGreaterThanOrEqual(MIN_SPACING);
  });

  it("T13: lv 14 transizione 3→2 blocchi (seqLen 150, freq 0.07, count 10)", () => {
    const seq = generaSequenzaSart(150, 0.07, 8, mulberry32(14));
    expect(seq.length).toBe(150);
    expect(targetPositions(seq, 8).length).toBe(10);
    expect(minSpacing(targetPositions(seq, 8))).toBeGreaterThanOrEqual(MIN_SPACING);
  });

  it("T14: lv 20 boundary superiore (seqLen 200, count 10)", () => {
    const seq = generaSequenzaSart(200, 0.05, 9, mulberry32(20));
    expect(seq.length).toBe(200);
    expect(targetPositions(seq, 9).length).toBe(10);
    expect(minSpacing(targetPositions(seq, 9))).toBeGreaterThanOrEqual(MIN_SPACING);
  });
});

describe("SART sequence — fallback path", () => {
  it("T15: rejection sampling sufficiente sui parametri GDD (loop su SART_LEVELS)", () => {
    for (const lv of SART_LEVELS) {
      const target = ((lv.livello % 9) + 1); // cifra 1..9 deterministica per livello
      const seq = generaSequenzaSart(
        lv.sequenceLength,
        lv.targetFrequency,
        target,
        mulberry32(lv.livello),
      );
      const expectedCount = Math.floor(lv.sequenceLength * lv.targetFrequency);
      const actualCount = targetPositions(seq, target).length;
      if (actualCount !== expectedCount) {
        throw new Error(
          `lv ${lv.livello}: count target ${actualCount} ≠ atteso ${expectedCount}`,
        );
      }
      const spacing = minSpacing(targetPositions(seq, target));
      if (spacing < MIN_SPACING) {
        throw new Error(
          `lv ${lv.livello}: spacing ${spacing} < ${MIN_SPACING}`,
        );
      }
    }
  });
});

describe("piazzaCostruttivo — diretto", () => {
  it("T16: count e spacing rispettati su (50, 10, 5)", () => {
    const positions = piazzaCostruttivo(50, 10, 5, mulberry32(1));
    expect(positions.length).toBe(10);
    // ordina in caso di asimmetria interna
    const sorted = [...positions].sort((a, b) => a - b);
    expect(minSpacing(sorted)).toBeGreaterThanOrEqual(5);
    for (const p of positions) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(50);
    }
  });

  it("T17: throw su parametri infeasibili (seqLen 20, t 10, minSpacing 5)", () => {
    expect(() => piazzaCostruttivo(20, 10, 5, mulberry32(1))).toThrow(/infeasibile/);
  });
});

describe("SART sequence — output structure", () => {
  it("T18: lunghezza output uguale a seqLen per lv 1, 11, 20", () => {
    expect(generaSequenzaSart(50, 0.20, 3, mulberry32(1)).length).toBe(50);
    expect(generaSequenzaSart(140, 0.08, 7, mulberry32(2)).length).toBe(140);
    expect(generaSequenzaSart(200, 0.05, 5, mulberry32(3)).length).toBe(200);
  });
});

describe("SART sequence — validazione input", () => {
  it("T19: seqLen = 0 → throw", () => {
    expect(() => generaSequenzaSart(0, 0.20, 3, mulberry32(1)))
      .toThrow(/seqLen non valido/);
  });

  it("T20: targetFreq = 1.5 → throw", () => {
    expect(() => generaSequenzaSart(50, 1.5, 3, mulberry32(1)))
      .toThrow(/targetFreq fuori range/);
  });

  it("T21: target = 0 → throw", () => {
    expect(() => generaSequenzaSart(50, 0.20, 0, mulberry32(1)))
      .toThrow(/target fuori range/);
  });
});

describe("SART deroga lunghezza blocco", () => {
  it("T22: SART_LEVELS applica moltiplicatore vs SART_LEVELS_GDD_STRICT", () => {
    for (let i = 0; i < SART_LEVELS.length; i++) {
      const runtime = SART_LEVELS[i];
      const strict = SART_LEVELS_GDD_STRICT[i];
      expect(runtime.sequenceLength).toBe(
        Math.round(strict.sequenceLength * SART_DEROGA_LUNGHEZZA_BLOCCO),
      );
      expect(runtime.targetFrequency).toBe(strict.targetFrequency);
      expect(runtime.isiMs).toBe(strict.isiMs);
      expect(runtime.maskingMs).toBe(strict.maskingMs);
      expect(runtime.trialsPerSession).toBe(strict.trialsPerSession);
    }
  });
});
