import { describe, it, expect } from "vitest"
import {
  npoSizeLabel,
  vinculoStatusLabel,
  mapNposForCsvExport,
  mapVinculosForCsvExport,
} from "./adminExportDisplay"
import type { NpoExportData, VinculoExportData } from "../api/admin"

describe("npoSizeLabel", () => {
  it('retorna "Pequeno" para small', () => {
    expect(npoSizeLabel("small")).toBe("Pequeno")
  })

  it('retorna "Médio" para medium', () => {
    expect(npoSizeLabel("medium")).toBe("Médio")
  })

  it('retorna "Grande" para large', () => {
    expect(npoSizeLabel("large")).toBe("Grande")
  })

  it("retorna string vazia para null", () => {
    expect(npoSizeLabel(null)).toBe("")
  })

  it("retorna string vazia para undefined", () => {
    expect(npoSizeLabel(undefined)).toBe("")
  })
})

describe("vinculoStatusLabel", () => {
  it('retorna "Pendente" para pending', () => {
    expect(vinculoStatusLabel("pending")).toBe("Pendente")
  })

  it('retorna "Ativo" para active', () => {
    expect(vinculoStatusLabel("active")).toBe("Ativo")
  })

  it('retorna "Inativo" para inactive', () => {
    expect(vinculoStatusLabel("inactive")).toBe("Inativo")
  })

  it('retorna "Negociação" para negotiation', () => {
    expect(vinculoStatusLabel("negotiation")).toBe("Negociação")
  })
})

describe("mapNposForCsvExport", () => {
  const baseNpo: NpoExportData = {
    id: 1,
    name: "ONG Teste",
    cnpj: "12345678000195",
    cpf: null,
    phone: null,
    npoSize: "small",
    environmental: true,
    social: false,
    governance: true,
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    createdAt: "2026-01-01T00:00:00",
  }

  it("mapeia npoSize para label legível", () => {
    const result = mapNposForCsvExport([baseNpo])
    expect(result[0].npoSize).toBe("Pequeno")
  })

  it("mapeia environmental true para X", () => {
    const result = mapNposForCsvExport([baseNpo])
    expect(result[0].environmental).toBe("X")
  })

  it("mapeia social false para string vazia", () => {
    const result = mapNposForCsvExport([baseNpo])
    expect(result[0].social).toBe("")
  })

  it("mapeia governance true para X", () => {
    const result = mapNposForCsvExport([baseNpo])
    expect(result[0].governance).toBe("X")
  })

  it("mantém campos como id, name, city intactos", () => {
    const result = mapNposForCsvExport([baseNpo])
    expect(result[0].id).toBe(1)
    expect(result[0].name).toBe("ONG Teste")
    expect(result[0].city).toBe("São Paulo")
  })

  it("retorna lista vazia para input vazio", () => {
    expect(mapNposForCsvExport([])).toEqual([])
  })

  it("mapeia npoSize null para string vazia", () => {
    const result = mapNposForCsvExport([{ ...baseNpo, npoSize: null }])
    expect(result[0].npoSize).toBe("")
  })

  it("mapeia medium corretamente", () => {
    const result = mapNposForCsvExport([{ ...baseNpo, npoSize: "medium" }])
    expect(result[0].npoSize).toBe("Médio")
  })
})

describe("mapVinculosForCsvExport", () => {
  const baseVinculo: VinculoExportData = {
    companyName: "Empresa B",
    npoName: "ONG A",
    projectTitle: "Projeto A",
    status: "active",
  }

  it('mapeia status "active" para "Ativo"', () => {
    const result = mapVinculosForCsvExport([baseVinculo])
    expect(result[0].status).toBe("Ativo")
  })

  it('mapeia status "pending" para "Pendente"', () => {
    const result = mapVinculosForCsvExport([{ ...baseVinculo, status: "pending" }])
    expect(result[0].status).toBe("Pendente")
  })

  it('mapeia status "negotiation" para "Negociação"', () => {
    const result = mapVinculosForCsvExport([{ ...baseVinculo, status: "negotiation" }])
    expect(result[0].status).toBe("Negociação")
  })

  it("mantém campos como companyName, npoName, projectTitle intactos", () => {
    const result = mapVinculosForCsvExport([baseVinculo])
    expect(result[0].companyName).toBe("Empresa B")
    expect(result[0].npoName).toBe("ONG A")
    expect(result[0].projectTitle).toBe("Projeto A")
  })

  it("retorna lista vazia para input vazio", () => {
    expect(mapVinculosForCsvExport([])).toEqual([])
  })

  it("processa múltiplos vínculos corretamente", () => {
    const result = mapVinculosForCsvExport([
      { ...baseVinculo, status: "active" },
      { ...baseVinculo, status: "inactive" },
    ])
    expect(result).toHaveLength(2)
    expect(result[0].status).toBe("Ativo")
    expect(result[1].status).toBe("Inativo")
  })
})
