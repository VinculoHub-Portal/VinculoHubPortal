import { describe, expect, it } from "vitest"
import {
  mapRelationshipToVinculo,
  mapRelationshipsToVinculos,
} from "./vinculo"

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
})
