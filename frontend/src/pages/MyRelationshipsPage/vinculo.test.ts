import { describe, expect, it } from "vitest"
import {
  filterVinculos,
  getOpenVinculoCount,
  getVinculoFilterCounts,
  isPendingStatus,
  mapRelationshipToVinculo,
  mapRelationshipsToVinculos,
} from "./vinculo"
import type { VinculoConnection } from "./vinculo"

const baseItem = {
  projectId: 1,
  projectName: "Projeto X",
  partnerInstitutionId: 7,
  partnerInstitutionName: "ACME",
  partnerContactEmail: null,
  partnerContactPhone: null,
  canRespond: false,
  canConfirm: false,
}

function makeVinculo(status: VinculoConnection["status"]): VinculoConnection {
  return {
    id: "7-1",
    projectId: 1,
    companyId: null,
    projectName: "Proj",
    partnerInstitutionName: "ACME",
    partnerType: "EMPRESA",
    partnerId: 7,
    status,
  }
}

describe("isPendingStatus", () => {
  it("retorna true para pending_waiting", () => {
    expect(isPendingStatus("pending_waiting")).toBe(true)
  })

  it("retorna true para pending_interest", () => {
    expect(isPendingStatus("pending_interest")).toBe(true)
  })

  it("retorna false para active", () => {
    expect(isPendingStatus("active")).toBe(false)
  })

  it("retorna false para negotiation", () => {
    expect(isPendingStatus("negotiation")).toBe(false)
  })
})

describe("getVinculoFilterCounts", () => {
  it("conta corretamente um vínculo de cada tipo", () => {
    const vinculos = [
      makeVinculo("active"),
      makeVinculo("negotiation"),
      makeVinculo("pending_waiting"),
      makeVinculo("pending_interest"),
    ]
    const counts = getVinculoFilterCounts(vinculos)
    expect(counts.all).toBe(4)
    expect(counts.active).toBe(1)
    expect(counts.negotiation).toBe(1)
    expect(counts.pending).toBe(2)
  })

  it("retorna zeros para lista vazia", () => {
    const counts = getVinculoFilterCounts([])
    expect(counts.all).toBe(0)
    expect(counts.active).toBe(0)
    expect(counts.negotiation).toBe(0)
    expect(counts.pending).toBe(0)
  })

  it("conta múltiplos ativos corretamente", () => {
    const vinculos = [makeVinculo("active"), makeVinculo("active"), makeVinculo("active")]
    expect(getVinculoFilterCounts(vinculos).active).toBe(3)
  })
})

describe("getOpenVinculoCount", () => {
  it("conta negotiation e pending como abertos", () => {
    const vinculos = [
      makeVinculo("active"),
      makeVinculo("negotiation"),
      makeVinculo("pending_waiting"),
      makeVinculo("pending_interest"),
    ]
    expect(getOpenVinculoCount(vinculos)).toBe(3)
  })

  it("retorna 0 quando todos são active", () => {
    expect(getOpenVinculoCount([makeVinculo("active"), makeVinculo("active")])).toBe(0)
  })

  it("retorna 0 para lista vazia", () => {
    expect(getOpenVinculoCount([])).toBe(0)
  })
})

describe("filterVinculos", () => {
  const vinculos = [
    makeVinculo("active"),
    makeVinculo("negotiation"),
    makeVinculo("pending_waiting"),
    makeVinculo("pending_interest"),
  ]

  it("retorna todos os vínculos com filtro 'all'", () => {
    expect(filterVinculos(vinculos, "all")).toHaveLength(4)
  })

  it("filtra apenas ativos com filtro 'active'", () => {
    const result = filterVinculos(vinculos, "active")
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe("active")
  })

  it("filtra apenas negociação com filtro 'negotiation'", () => {
    const result = filterVinculos(vinculos, "negotiation")
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe("negotiation")
  })

  it("filtra pendentes (waiting e interest) com filtro 'pending'", () => {
    const result = filterVinculos(vinculos, "pending")
    expect(result).toHaveLength(2)
    result.forEach((v) => expect(isPendingStatus(v.status)).toBe(true))
  })
})

describe("mapRelationshipToVinculo", () => {
  it("retorna null quando o item está com status inactive", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "inactive" },
      "company",
    )
    expect(result).toBeNull()
  })

  it("mapeia pending sem canRespond para pending_waiting", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "pending", canRespond: false },
      "company",
    )
    expect(result?.status).toBe("pending_waiting")
  })

  it("mapeia pending com canRespond para pending_interest", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "pending", canRespond: true },
      "company",
    )
    expect(result?.status).toBe("pending_interest")
  })

  it("preserva status active", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "active" },
      "company",
    )
    expect(result?.status).toBe("active")
  })

  it("preserva status negotiation", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "negotiation" },
      "company",
    )
    expect(result?.status).toBe("negotiation")
  })

  it("partnerType é EMPRESA quando viewer é npo", () => {
    const result = mapRelationshipToVinculo({ ...baseItem, status: "active" }, "npo")
    expect(result?.partnerType).toBe("EMPRESA")
  })

  it("partnerType é ONG quando viewer é company", () => {
    const result = mapRelationshipToVinculo({ ...baseItem, status: "active" }, "company")
    expect(result?.partnerType).toBe("ONG")
  })

  it("companyId é partnerInstitutionId quando viewer é npo", () => {
    const result = mapRelationshipToVinculo({ ...baseItem, status: "active" }, "npo")
    expect(result?.companyId).toBe(7)
  })

  it("companyId é null quando viewer é company", () => {
    const result = mapRelationshipToVinculo({ ...baseItem, status: "active" }, "company")
    expect(result?.companyId).toBeNull()
  })

  it("companyId é null quando viewerType é null", () => {
    const result = mapRelationshipToVinculo({ ...baseItem, status: "active" }, null)
    expect(result?.companyId).toBeNull()
  })

  it("contact é definido quando partnerContactEmail está preenchido", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "active", partnerContactEmail: "contato@acme.com" },
      "npo",
    )
    expect(result?.contact?.email).toBe("contato@acme.com")
  })

  it("contact é definido quando partnerContactPhone está preenchido", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "active", partnerContactPhone: "(51) 99999-0000" },
      "npo",
    )
    expect(result?.contact?.phone).toBe("(51) 99999-0000")
  })

  it("contact é undefined quando email e phone são null", () => {
    const result = mapRelationshipToVinculo({ ...baseItem, status: "active" }, "npo")
    expect(result?.contact).toBeUndefined()
  })

  it("infoBanner tone=success para pending_interest quando viewer é company", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "pending", canRespond: true },
      "company",
    )
    expect(result?.infoBanner?.tone).toBe("success")
  })

  it("infoBanner tone=success para pending_interest quando viewer é npo", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "pending", canRespond: true },
      "npo",
    )
    expect(result?.infoBanner?.tone).toBe("success")
  })

  it("infoBanner tone=warning para pending_waiting", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "pending", canRespond: false },
      "npo",
    )
    expect(result?.infoBanner?.tone).toBe("warning")
  })

  it("optionalActionLabel é 'Efetivar Parceria' quando canConfirm=true em negotiation", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "negotiation", canConfirm: true },
      "npo",
    )
    expect(result?.optionalActionLabel).toBe("Efetivar Parceria")
  })

  it("secondaryBadgeLabel está definido quando canConfirm=false em negotiation", () => {
    const result = mapRelationshipToVinculo(
      { ...baseItem, status: "negotiation", canConfirm: false },
      "npo",
    )
    expect(result?.secondaryBadgeLabel).toContain("Aguardando confirmação")
  })

  it("gera id composto de partnerInstitutionId e projectId", () => {
    const result = mapRelationshipToVinculo({ ...baseItem, status: "active" }, "npo")
    expect(result?.id).toBe("7-1")
  })
})

describe("mapRelationshipsToVinculos", () => {
  it("descarta items inactive da lista final", () => {
    const items = [
      { ...baseItem, status: "active" as const },
      { ...baseItem, projectId: 2, status: "inactive" as const },
      { ...baseItem, projectId: 3, status: "negotiation" as const },
    ]
    const result = mapRelationshipsToVinculos(items, "company")
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.projectId)).toEqual([1, 3])
  })

  it("retorna lista vazia quando todos os items são inactive", () => {
    const items = [
      { ...baseItem, status: "inactive" as const },
      { ...baseItem, projectId: 2, status: "inactive" as const },
    ]
    const result = mapRelationshipsToVinculos(items, "company")
    expect(result).toEqual([])
  })

  it("retorna lista vazia para input vazio", () => {
    expect(mapRelationshipsToVinculos([], "npo")).toEqual([])
  })

  it("aceita viewerType null e mapeia corretamente", () => {
    const items = [{ ...baseItem, status: "active" as const }]
    const result = mapRelationshipsToVinculos(items, null)
    expect(result).toHaveLength(1)
    expect(result[0].partnerType).toBe("ONG")
  })
})
