import { describe, expect, it } from "vitest";
import {
  entropyBits,
  estimateCrackTime,
  generate,
  generatePin,
  generatePronounceable,
  randomInt,
  shuffle,
  strength,
} from "../src/index.js";

describe("randomInt (unbiased CSPRNG)", () => {
  it("always returns values in range", () => {
    for (let i = 0; i < 2000; i++) {
      const v = randomInt(7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("returns 0 for max=1 and rejects bad input", () => {
    expect(randomInt(1)).toBe(0);
    expect(() => randomInt(0)).toThrow(RangeError);
    expect(() => randomInt(-3)).toThrow(RangeError);
    expect(() => randomInt(2.5)).toThrow(RangeError);
  });

  it("covers the whole range over many draws", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) seen.add(randomInt(6));
    expect(seen).toEqual(new Set([0, 1, 2, 3, 4, 5]));
  });

  it("shuffle keeps all elements", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle([...arr]);
    expect([...out].sort((a, b) => a - b)).toEqual(arr);
  });
});

describe("generate", () => {
  it("respects length and enabled classes", () => {
    const { password } = generate({ length: 24, symbols: true });
    expect(password).toHaveLength(24);
  });

  it("excludes disabled classes", () => {
    for (let i = 0; i < 30; i++) {
      const { password } = generate({ length: 20, digits: false, symbols: false, uppercase: false });
      expect(password).toMatch(/^[a-z]+$/);
    }
  });

  it("guarantees each class when requireEachClass is on", () => {
    for (let i = 0; i < 30; i++) {
      const { password } = generate({ length: 8, lowercase: true, uppercase: true, digits: true, symbols: true });
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[!@#$%^&*()\-_=+[\]{};:,.?/]/);
    }
  });

  it("excludes ambiguous characters when asked", () => {
    for (let i = 0; i < 30; i++) {
      const { password } = generate({ length: 30, excludeAmbiguous: true });
      expect(password).not.toMatch(/[O0Il1|]/);
    }
  });

  it("reports entropy and pool size", () => {
    const r = generate({ length: 16, lowercase: true, uppercase: true, digits: true, symbols: false });
    expect(r.poolSize).toBe(62);
    expect(r.entropyBits).toBeGreaterThan(90);
  });

  it("throws when no classes are enabled", () => {
    expect(() => generate({ lowercase: false, uppercase: false, digits: false, symbols: false })).toThrow();
  });
});

describe("pronounceable & pin", () => {
  it("pronounceable is mostly letters with an optional number suffix", () => {
    const { password } = generatePronounceable({ length: 12 });
    expect(password).toMatch(/^[A-Za-z]+\d{2}$/);
  });

  it("pronounceable can omit digits and capitalization", () => {
    const { password } = generatePronounceable({ length: 10, digits: false, capitalize: false });
    expect(password).toMatch(/^[a-z]+$/);
  });

  it("pin is numeric and the right length", () => {
    const { password, poolSize } = generatePin(8);
    expect(password).toMatch(/^\d{8}$/);
    expect(poolSize).toBe(10);
  });
});

describe("entropy & strength", () => {
  it("computes entropy bits", () => {
    expect(entropyBits(94, 16)).toBeCloseTo(104.87, 1);
    expect(entropyBits(1, 10)).toBe(0);
  });

  it("rates a long random password as strong", () => {
    const s = strength("Tr0ub4dour&3xKj9mZ!qWp");
    expect(s.entropyBits).toBeGreaterThan(80);
    expect(["Strong", "Very strong"]).toContain(s.label);
  });

  it("rates weak passwords as weak", () => {
    expect(strength("password").entropyBits).toBeLessThan(40);
    expect(strength("aaaaaaaa").entropyBits).toBeLessThan(15);
    expect(strength("abcdefg").entropyBits).toBeLessThan(20);
  });

  it("handles empty input", () => {
    const s = strength("");
    expect(s.entropyBits).toBe(0);
    expect(s.crackTime.text).toBe("instant");
  });

  it("estimates crack time", () => {
    expect(estimateCrackTime(0).text).toBe("instant");
    expect(estimateCrackTime(128).text).toBe("centuries");
    expect(estimateCrackTime(40).seconds).toBeGreaterThan(0);
  });
});
