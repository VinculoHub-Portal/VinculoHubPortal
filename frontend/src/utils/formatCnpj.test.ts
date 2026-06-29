import { describe, it, expect } from "vitest"
import { formatCnpj } from "./formatCnpj"

describe("formatCnpj", () => {
  it("formata CNPJ completo com 14 dígitos", () => {
    expect(formatCnpj("12345678000195")).toBe("12.345.678/0001-95")
  })

  it("formata CNPJ com máscara já existente", () => {
    expect(formatCnpj("12.345.678/0001-95")).toBe("12.345.678/0001-95")
  })

  it("retorna string vazia para entrada vazia", () => {
    expect(formatCnpj("")).toBe("")
  })

  it("formata parcialmente com 6 dígitos", () => {
    expect(formatCnpj("123456")).toBe("12.345.6")
  })

  it("formata parcialmente com 10 dígitos", () => {
    expect(formatCnpj("1234567800")).toBe("12.345.678/00")
  })

  it("trunca entrada com mais de 14 dígitos", () => {
    expect(formatCnpj("123456780001959999")).toBe("12.345.678/0001-95")
  })

  it("ignora caracteres não numéricos intermediários", () => {
    expect(formatCnpj("12.345.678/0001-95abc")).toBe("12.345.678/0001-95")
  })

  it("retorna apenas dígitos formatados para entrada parcial com 2 dígitos", () => {
    expect(formatCnpj("12")).toBe("12")
  })

  it("formata com 3 dígitos", () => {
    expect(formatCnpj("123")).toBe("12.3")
  })
})
