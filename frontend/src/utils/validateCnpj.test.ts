import { describe, it, expect } from "vitest"
import { validateCnpj } from "./validateCnpj"

describe("validateCnpj", () => {
  it("retorna true para CNPJ válido (formatado)", () => {
    expect(validateCnpj("11.222.333/0001-81")).toBe(true)
  })

  it("retorna true para CNPJ válido (apenas dígitos)", () => {
    expect(validateCnpj("11222333000181")).toBe(true)
  })

  it("retorna false para CNPJ com menos de 14 dígitos", () => {
    expect(validateCnpj("1234567890123")).toBe(false)
  })

  it("retorna false para CNPJ com mais de 14 dígitos", () => {
    expect(validateCnpj("123456789012345")).toBe(false)
  })

  it("retorna false para CNPJ com todos os dígitos iguais (00000000000000)", () => {
    expect(validateCnpj("00000000000000")).toBe(false)
  })

  it("retorna false para CNPJ com todos os dígitos iguais (11111111111111)", () => {
    expect(validateCnpj("11111111111111")).toBe(false)
  })

  it("retorna false para CNPJ com dígito verificador inválido", () => {
    expect(validateCnpj("11.222.333/0001-99")).toBe(false)
  })

  it("retorna false para string vazia", () => {
    expect(validateCnpj("")).toBe(false)
  })

  it("retorna false para string sem dígitos numéricos", () => {
    expect(validateCnpj("abc.def.ghi/jklm-no")).toBe(false)
  })

  it("retorna true para outro CNPJ válido conhecido", () => {
    expect(validateCnpj("45.997.418/0001-53")).toBe(true)
  })

  it("retorna false quando primeiro dígito verificador está errado", () => {
    // 11222333000181 é válido; mudar dígito 12 (posição) deve invalidar
    expect(validateCnpj("11222333000191")).toBe(false)
  })
})
