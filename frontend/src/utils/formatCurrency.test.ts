import { describe, expect, it } from "vitest";
import {
  formatCurrencyValue,
  normalizeCurrencyValue,
} from "./formatCurrency";

const NBSP = "\u00a0";

describe("formatCurrencyValue", () => {
  it("formats plain digits as BRL currency", () => {
    expect(formatCurrencyValue("10000")).toBe(`R$${NBSP}10.000,00`);
  });

  it("formats pasted formatted digits as BRL currency", () => {
    expect(formatCurrencyValue("1234.56")).toBe(`R$${NBSP}123.456,00`);
    expect(formatCurrencyValue("1234,56")).toBe(`R$${NBSP}123.456,00`);
  });

  it("returns an empty string for blank input", () => {
    expect(formatCurrencyValue("")).toBe("");
  });
});

describe("normalizeCurrencyValue", () => {
  it("removes currency symbols and separators", () => {
    expect(normalizeCurrencyValue("R$ 1.234,56")).toBe("123456");
  });

  it("keeps plain digits intact", () => {
    expect(normalizeCurrencyValue("10000")).toBe("10000");
  });

  it("preserves a zero-only input as zero", () => {
    expect(normalizeCurrencyValue("000")).toBe("0");
  });
});
