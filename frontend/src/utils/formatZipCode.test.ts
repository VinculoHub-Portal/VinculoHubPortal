import { describe, it, expect } from "vitest"
import { formatZipCode } from "./formatZipCode"

describe("formatZipCode", () => {
  it("formata CEP completo com 8 dígitos", () => {
    expect(formatZipCode("01310100")).toBe("01310-100")
  })

  it("formata CEP com máscara já existente", () => {
    expect(formatZipCode("01310-100")).toBe("01310-100")
  })

  it("retorna string vazia para entrada vazia", () => {
    expect(formatZipCode("")).toBe("")
  })

  it("formata parcialmente com 5 dígitos (sem traço ainda)", () => {
    expect(formatZipCode("01310")).toBe("01310")
  })

  it("formata parcialmente com 6 dígitos (adiciona traço)", () => {
    expect(formatZipCode("013101")).toBe("01310-1")
  })

  it("trunca entrada com mais de 8 dígitos", () => {
    expect(formatZipCode("013101009999")).toBe("01310-100")
  })

  it("ignora caracteres não numéricos", () => {
    expect(formatZipCode("01310-100abc")).toBe("01310-100")
  })

  it("formata com 3 dígitos", () => {
    expect(formatZipCode("013")).toBe("013")
  })
})
