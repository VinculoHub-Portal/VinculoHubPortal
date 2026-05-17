import { describe, expect, it } from "vitest"
import { mockNpoProfile, npoProfilesBySlug } from "./npoProfileMockData"

describe("npoProfileMockData", () => {
  it("mockNpoProfile tem todos os campos obrigatórios preenchidos", () => {
    expect(mockNpoProfile.slug).toBeTruthy()
    expect(mockNpoProfile.name).toBeTruthy()
    expect(mockNpoProfile.cnpj).toBeTruthy()
    expect(mockNpoProfile.email).toBeTruthy()
    expect(mockNpoProfile.responsible.name).toBeTruthy()
    expect(mockNpoProfile.responsible.email).toBeTruthy()
  })

  it("npoProfilesBySlug indexa corretamente pelo slug", () => {
    expect(npoProfilesBySlug[mockNpoProfile.slug]).toBe(mockNpoProfile)
  })

  it("mockNpoProfile tem badges definidas", () => {
    expect(mockNpoProfile.badges.length).toBeGreaterThan(0)
  })

  it("foundationYear é um número", () => {
    expect(typeof mockNpoProfile.foundationYear).toBe("number")
  })
})
