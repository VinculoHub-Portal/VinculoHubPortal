import { describe, expect, it } from "vitest"
import { enrichProjectWithMocks, INCENTIVE_LAWS } from "./mockData"
import type { ProjectListItem } from "../../api/projects"

const baseProject: ProjectListItem = {
  id: 0,
  title: "Projeto Teste",
  status: "ACTIVE",
  npoId: 1,
  npoName: "ONG Teste",
  npoPhone: "51999",
  startDate: "2026-01-01",
}

describe("enrichProjectWithMocks", () => {
  it("preserva id e title do projeto original", () => {
    const result = enrichProjectWithMocks({ ...baseProject, id: 3, title: "Meu Projeto" })
    expect(result.id).toBe(3)
    expect(result.title).toBe("Meu Projeto")
  })

  it("atribui lei deterministicamente: id=0 → rouanet (índice 0)", () => {
    const result = enrichProjectWithMocks({ ...baseProject, id: 0 })
    expect(result.lawId).toBe("rouanet")
  })

  it("atribui lei deterministicamente: id=2 → funcrianca (índice 2)", () => {
    const result = enrichProjectWithMocks({ ...baseProject, id: 2 })
    expect(result.lawId).toBe("funcrianca")
  })

  it("cicla a lei com módulo 6: id=6 → mesmo que id=0 (rouanet)", () => {
    const r0 = enrichProjectWithMocks({ ...baseProject, id: 0 })
    const r6 = enrichProjectWithMocks({ ...baseProject, id: 6 })
    expect(r6.lawId).toBe(r0.lawId)
    expect(r6.lawLabel).toBe(r0.lawLabel)
  })

  it("preenche campos placeholders com valores constantes", () => {
    const result = enrichProjectWithMocks(baseProject)
    expect(result.targetAmount).toBe(50000)
    expect(result.progressPercent).toBe(50)
    expect(result.location).toBe("Brasil")
    expect(result.description).toBeTruthy()
  })

  it("lawLabel bate com o label da lei atribuída", () => {
    const result = enrichProjectWithMocks({ ...baseProject, id: 1 })
    const expected = INCENTIVE_LAWS.find((l) => l.id === result.lawId)
    expect(result.lawLabel).toBe(expected?.label)
  })
})
