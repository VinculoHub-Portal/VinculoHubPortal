import { describe, it, expect } from "vitest"
import { formatCpf } from "./formatCpf"

describe("formatCpf", () => {
  it("formata CPF completo com 11 dígitos", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25")
  })

  it("formata CPF com máscara já existente", () => {
    expect(formatCpf("529.982.247-25")).toBe("529.982.247-25")
  })

  it("retorna string vazia para entrada vazia", () => {
    expect(formatCpf("")).toBe("")
  })

  it("formata parcialmente com 3 dígitos", () => {
    expect(formatCpf("529")).toBe("529")
  })

  it("formata parcialmente com 4 dígitos", () => {
    expect(formatCpf("5299")).toBe("529.9")
  })

  it("formata parcialmente com 7 dígitos", () => {
    expect(formatCpf("5299822")).toBe("529.982.2")
  })

  it("trunca entrada com mais de 11 dígitos", () => {
    expect(formatCpf("529982247259999")).toBe("529.982.247-25")
  })

  it("ignora caracteres não numéricos", () => {
    expect(formatCpf("529.982.247-25abc")).toBe("529.982.247-25")
  })

  it("formata com 9 dígitos (sem dígito verificador)", () => {
    expect(formatCpf("529982247")).toBe("529.982.247")
  })
})
