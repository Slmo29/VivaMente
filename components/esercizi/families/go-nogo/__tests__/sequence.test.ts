import { describe, it, expect } from "vitest";
import {
  generaProssimoStimolo,
  creaStreamState,
  BLOCK_SIZE,
  GO_PER_BLOCK,
  NOGO_PER_BLOCK,
  type GoNogoStreamState,
  type GoNogoStimolo,
} from "@/components/esercizi/families/go-nogo/sequence";
import {
  GO_NOGO_LEVELS,
  type CoppiaColore,
  type ColoreGoNogo,
} from "@/components/esercizi/families/go-nogo/levels";
import { getNDistrattori } from "@/components/esercizi/families/go-nogo/_deroghe";

// ── RNG deterministica (mulberry32) ───────────────────────────────────────────
// Stessa funzione usata nei test SART/Stroop/Odd One Out — duplicata inline.

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

const COPPIA_VR: CoppiaColore = { go: "verde", nogo: "rosso" };

function generaN(
  n: number,
  coppia: CoppiaColore,
  distrattori: readonly ColoreGoNogo[],
  seed: number,
): GoNogoStimolo[] {
  const state = creaStreamState();
  const rng = mulberry32(seed);
  const out: GoNogoStimolo[] = [];
  for (let i = 0; i < n; i++) {
    out.push(generaProssimoStimolo(state, coppia, distrattori, rng));
  }
  return out;
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe("Go/No-Go — generaProssimoStimolo (cap nogo consecutivi)", () => {
  it("T1: dopo uno stimolo nogo, il successivo è sempre go", () => {
    for (const seed of [1, 7, 42, 123, 999]) {
      const arr = generaN(50, COPPIA_VR, ["rosso"], seed);
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i].tipo === "nogo") {
          expect(arr[i + 1].tipo).toBe("go");
        }
      }
    }
  });

  it("T2: 200 stimoli, mai 2 nogo consecutivi", () => {
    const arr = generaN(200, COPPIA_VR, ["rosso"], 42);
    for (let i = 0; i < arr.length - 1; i++) {
      const due = arr[i].tipo === "nogo" && arr[i + 1].tipo === "nogo";
      expect(due).toBe(false);
    }
  });
});

describe("Go/No-Go — generaProssimoStimolo (ratio 80/20 rolling)", () => {
  it("T3: 10 stimoli (1 blocco) → 2 nogo + 8 go esatti", () => {
    for (const seed of [1, 7, 42, 100]) {
      const arr = generaN(BLOCK_SIZE, COPPIA_VR, ["rosso"], seed);
      const nogo = arr.filter((s) => s.tipo === "nogo").length;
      const go   = arr.filter((s) => s.tipo === "go").length;
      expect(nogo).toBe(NOGO_PER_BLOCK);
      expect(go).toBe(GO_PER_BLOCK);
    }
  });

  it("T4: 100 blocchi (1000 stimoli) → 200 nogo + 800 go esatti", () => {
    const arr = generaN(100 * BLOCK_SIZE, COPPIA_VR, ["rosso"], 42);
    const nogo = arr.filter((s) => s.tipo === "nogo").length;
    const go   = arr.filter((s) => s.tipo === "go").length;
    expect(nogo).toBe(100 * NOGO_PER_BLOCK);
    expect(go).toBe(100 * GO_PER_BLOCK);
  });

  it("T5: reset block — dopo BLOCK_SIZE stimoli, contatori e indice azzerati", () => {
    const state = creaStreamState();
    const rng = mulberry32(11);
    for (let i = 0; i < BLOCK_SIZE; i++) {
      generaProssimoStimolo(state, COPPIA_VR, ["rosso"], rng);
    }
    expect(state.blockIndex).toBe(0);
    expect(state.blockGoCount).toBe(0);
    expect(state.blockNogoCount).toBe(0);
  });
});

describe("Go/No-Go — generaProssimoStimolo (colore)", () => {
  it("T6: stimoli go hanno colore = coppiaCanonical.go", () => {
    const arr = generaN(50, COPPIA_VR, ["rosso"], 1);
    for (const s of arr) {
      if (s.tipo === "go") expect(s.colore).toBe(COPPIA_VR.go);
    }
  });

  it("T7: con distrattori=[rosso] (binario), stimoli nogo sono sempre rossi", () => {
    const arr = generaN(50, COPPIA_VR, ["rosso"], 2);
    for (const s of arr) {
      if (s.tipo === "nogo") expect(s.colore).toBe("rosso");
    }
  });

  it("T8: con distrattori=[rosso, arancio, giallo], stimoli nogo in {rosso, arancio, giallo}", () => {
    const distrattori: readonly ColoreGoNogo[] = ["rosso", "arancio", "giallo"];
    const arr = generaN(100, COPPIA_VR, distrattori, 3);
    for (const s of arr) {
      if (s.tipo === "nogo") {
        expect(distrattori).toContain(s.colore);
      }
    }
  });

  it("T9: copertura distrattori — ogni colore appare ≥ 5 volte su 200 stimoli", () => {
    const distrattori: readonly ColoreGoNogo[] = ["rosso", "arancio", "giallo"];
    const arr = generaN(200, COPPIA_VR, distrattori, 7);
    const conteggi = new Map<ColoreGoNogo, number>();
    for (const s of arr) {
      if (s.tipo === "nogo") {
        conteggi.set(s.colore, (conteggi.get(s.colore) ?? 0) + 1);
      }
    }
    for (const c of distrattori) {
      expect(conteggi.get(c) ?? 0).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("Go/No-Go — getNDistrattori", () => {
  it("T10: lv 1, 2 → 1", () => {
    expect(getNDistrattori(1)).toBe(1);
    expect(getNDistrattori(2)).toBe(1);
  });

  it("T11: lv 3 → 2, lv 4 → 3, lv 5 → 4, lv 6 → 5, lv 7 → 6", () => {
    expect(getNDistrattori(3)).toBe(2);
    expect(getNDistrattori(4)).toBe(3);
    expect(getNDistrattori(5)).toBe(4);
    expect(getNDistrattori(6)).toBe(5);
    expect(getNDistrattori(7)).toBe(6);
  });

  it("T12: lv 8–13 → 6 (cap massimo)", () => {
    for (let lv = 8; lv <= 13; lv++) {
      expect(getNDistrattori(lv)).toBe(6);
    }
  });
});

describe("Go/No-Go — creaStreamState", () => {
  it("T13: stato iniziale corretto", () => {
    const state = creaStreamState();
    const expected: GoNogoStreamState = {
      tail:                null,
      blockGoCount:        0,
      blockNogoCount:      0,
      blockIndex:          0,
      currentBlockPattern: [],
    };
    expect(state).toEqual(expected);
  });

  it("T14: due chiamate ritornano oggetti distinti (no shared mutation)", () => {
    const a = creaStreamState();
    const b = creaStreamState();
    expect(a).not.toBe(b);
    a.blockGoCount = 5;
    expect(b.blockGoCount).toBe(0);
  });
});

describe("Go/No-Go — determinismo", () => {
  it("T15: stesso seed → stessa sequenza (50 stimoli)", () => {
    const a = generaN(50, COPPIA_VR, ["rosso"], 123);
    const b = generaN(50, COPPIA_VR, ["rosso"], 123);
    expect(a).toEqual(b);
  });

  it("T16: seed diversi → sequenze diverse", () => {
    const a = generaN(50, COPPIA_VR, ["rosso", "arancio"], 123);
    const b = generaN(50, COPPIA_VR, ["rosso", "arancio"], 456);
    expect(a).not.toEqual(b);
  });
});

describe("Go/No-Go — vincoli per livello", () => {
  it("T17: ogni livello GO_NOGO_LEVELS — coppieAmmesse[0] ha go ≠ nogo", () => {
    for (const cfg of GO_NOGO_LEVELS) {
      const c = cfg.coppieAmmesse[0];
      expect(c.go).not.toBe(c.nogo);
    }
  });
});
