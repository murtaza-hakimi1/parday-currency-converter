import { describe, expect, it } from "vitest";
import { convertAmount, invertRate, parseAmount } from "./conversion";

describe("currency conversion utilities", () => {
  it("converts a base amount", () => expect(convertAmount(100, 70)).toBe(7000));
  it("inverts a positive rate", () =>
    expect(invertRate(70)).toBeCloseTo(1 / 70));
  it("rejects negative amounts", () =>
    expect(() => convertAmount(-1, 70)).toThrow());
  it("rejects zero rates", () => expect(() => convertAmount(100, 0)).toThrow());
  it("parses valid decimals", () => expect(parseAmount("123.45")).toBe(123.45));
  it("returns null for empty or malformed input", () => {
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("1.2.3")).toBeNull();
    expect(parseAmount("-5")).toBeNull();
  });
});
