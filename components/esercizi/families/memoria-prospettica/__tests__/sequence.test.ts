import { describe, it, expect } from "vitest";
import {
  FINESTRA_EVENT_K_ISI,
  getMPLevelEvent,
  getMPLevelTime,
  type MPLevelEvent,
  type MPLevelTime,
} from "@/components/esercizi/families/memoria-prospettica/levels";
import {
  pescaPosizioniCue,
  generaTrialMPEvent,
  generaTrialMPTime,
} from "@/components/esercizi/families/memoria-prospettica/sequence";

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

// ── Test suite ────────────────────────────────────────────────────────────────

describe("Memoria Prospettica — pescaPosizioniCue", () => {
  it("T1: nWindows posizioni distinte e nel range [0, nStimuli)", () => {
    const positions = pescaPosizioniCue(40, 4, 5, mulberry32(1));
    expect(positions.length).toBe(4);
    const set = new Set(positions);
    expect(set.size).toBe(4);
    for (const p of positions) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(40);
    }
  });

  it("T2: posizioni ordinate crescenti", () => {
    for (const seed of [1, 7, 42, 123]) {
      const positions = pescaPosizioniCue(60, 5, 6, mulberry32(seed));
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThan(positions[i - 1]);
      }
    }
  });

  it("T3: spacing minimo rispettato tra coppie consecutive", () => {
    const distMin = 6;
    for (const seed of [1, 7, 42, 123]) {
      const positions = pescaPosizioniCue(60, 5, distMin, mulberry32(seed));
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i] - positions[i - 1]).toBeGreaterThanOrEqual(distMin);
      }
    }
  });

  it("T4: throw su nStimuli < nWindows", () => {
    expect(() => pescaPosizioniCue(3, 5, 1, mulberry32(1)))
      .toThrow(/insufficiente/);
  });

  it("T5: determinismo — stesso seed → stessa lista", () => {
    const a = pescaPosizioniCue(40, 4, 5, mulberry32(99));
    const b = pescaPosizioniCue(40, 4, 5, mulberry32(99));
    expect(a).toEqual(b);
  });
});

describe("Memoria Prospettica — generaTrialMPEvent", () => {
  it("T6: lv 1 — trial ben formato", () => {
    const level = getMPLevelEvent(1);
    const trial = generaTrialMPEvent(level, mulberry32(1));
    expect(trial.tipo).toBe("event");
    expect(trial.finestre.length).toBe(level.nWindows);
    const expectedNStimuli = Math.ceil(level.durationMs / level.distractorISIMs);
    expect(trial.sequenza.length).toBe(expectedNStimuli);
  });

  it("T7: cue posizioni coerenti con finestre", () => {
    const level = getMPLevelEvent(1);
    const trial = generaTrialMPEvent(level, mulberry32(2));
    for (const finestra of trial.finestre) {
      const stim = trial.sequenza[finestra.cueIdx];
      expect(stim.isCue).toBe(true);
      expect(stim.finestraId).toBe(finestra.id);
      expect(stim.emoji).toBe(trial.cueEmoji);
    }
  });

  it("T8: cue di categoria diversa da categoriaTarget (salianza alta)", () => {
    const level = getMPLevelEvent(1); // salianza alta
    for (const seed of [1, 7, 42, 123, 999]) {
      const trial = generaTrialMPEvent(level, mulberry32(seed));
      const cueStim = trial.sequenza.find((s) => s.isCue);
      expect(cueStim).toBeDefined();
      expect(cueStim!.categoria).not.toBe(trial.categoriaTarget);
    }
  });

  it("T9: aperturaMs e chiusuraMs coerenti con FINESTRA_EVENT_K_ISI", () => {
    const level = getMPLevelEvent(1);
    const trial = generaTrialMPEvent(level, mulberry32(3));
    for (const f of trial.finestre) {
      expect(f.aperturaMs).toBe(f.cueIdx * level.distractorISIMs);
      expect(f.chiusuraMs - f.aperturaMs)
        .toBe(FINESTRA_EVENT_K_ISI * level.distractorISIMs);
    }
  });

  it("T10: lv 13 (salianza bassa) → throw post-pilot", () => {
    const level = getMPLevelEvent(13);
    expect(() => generaTrialMPEvent(level, mulberry32(13)))
      .toThrow(/post-pilot|beta/);
  });

  it("T11: throw se level.tipo !== 'event'", () => {
    const fake = {
      ...getMPLevelTime(1),
      cueSalience: "alta" as const,
    } as unknown as MPLevelEvent;
    expect(() => generaTrialMPEvent(fake, mulberry32(1)))
      .toThrow(/tipo="event"/);
  });
});

describe("Memoria Prospettica — generaTrialMPTime", () => {
  it("T12: lv 1 — trial ben formato", () => {
    const level = getMPLevelTime(1);
    const trial = generaTrialMPTime(level, mulberry32(1));
    expect(trial.tipo).toBe("time");
    expect(trial.intervalliMs.length).toBe(level.nWindows);
    expect(trial.toleranceMs).toBeGreaterThan(0);
    expect(trial.clockVisibility).toBe("piena");
  });

  it("T13: intervalliMs progressivi corretti", () => {
    const level = getMPLevelTime(1);
    const trial = generaTrialMPTime(level, mulberry32(2));
    for (let i = 0; i < trial.intervalliMs.length; i++) {
      expect(trial.intervalliMs[i]).toBe(level.intervalS * 1000 * (i + 1));
    }
  });

  it("T14: lv 13 — clockVisibility 'assente', toleranceMs 10000", () => {
    const level = getMPLevelTime(13);
    const trial = generaTrialMPTime(level, mulberry32(13));
    expect(trial.clockVisibility).toBe("assente");
    expect(trial.toleranceMs).toBe(10_000);
  });

  it("T15: nessun cue nello stream time-based", () => {
    const level = getMPLevelTime(1);
    const trial = generaTrialMPTime(level, mulberry32(5));
    expect(trial.sequenza.every((s) => !s.isCue)).toBe(true);
  });

  it("T16: throw se level.tipo !== 'time'", () => {
    const fake = {
      ...getMPLevelEvent(1),
    } as unknown as MPLevelTime;
    expect(() => generaTrialMPTime(fake, mulberry32(1)))
      .toThrow(/tipo="time"/);
  });
});

describe("Memoria Prospettica — distrattore mix", () => {
  it("T17: distrattori contengono almeno 2 categorie distinte", () => {
    const level = getMPLevelEvent(1);
    const trial = generaTrialMPEvent(level, mulberry32(42));
    const categoriaSet = new Set<string>();
    for (const s of trial.sequenza) {
      if (!s.isCue) categoriaSet.add(s.categoria);
    }
    expect(categoriaSet.size).toBeGreaterThanOrEqual(2);
  });
});
