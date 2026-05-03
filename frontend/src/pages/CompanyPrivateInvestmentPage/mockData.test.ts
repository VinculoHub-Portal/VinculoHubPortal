import { describe, expect, it } from "vitest"
import {
  countProjectsByTheme,
  enrichProjectWithMocks,
  INVESTMENT_THEMES,
  MOCK_USER_INTEREST_LABELS,
  MOCK_USER_INTERESTS,
  type SocialEnrichedProject,
} from "./mockData"
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
    const result = enrichProjectWithMocks({ ...baseProject, id: 5, title: "Social Teste" })
    expect(result.id).toBe(5)
    expect(result.title).toBe("Social Teste")
  })

  it("atribui tema deterministicamente: id=0 → educacao (índice 0)", () => {
    const result = enrichProjectWithMocks({ ...baseProject, id: 0 })
    expect(result.themes).toContain("educacao")
    expect(result.primaryThemeLabel).toBe("Educação")
  })

  it("atribui tema deterministicamente: id=1 → saude (índice 1)", () => {
    const result = enrichProjectWithMocks({ ...baseProject, id: 1 })
    expect(result.themes).toContain("saude")
  })

  it("cicla o tema com módulo 7: id=7 → mesmo que id=0 (educacao)", () => {
    const r0 = enrichProjectWithMocks({ ...baseProject, id: 0 })
    const r7 = enrichProjectWithMocks({ ...baseProject, id: 7 })
    expect(r7.themes).toEqual(r0.themes)
    expect(r7.primaryThemeLabel).toBe(r0.primaryThemeLabel)
  })

  it("preenche campos placeholders com valores constantes", () => {
    const result = enrichProjectWithMocks(baseProject)
    expect(result.targetAmount).toBe(50000)
    expect(result.progressPercent).toBe(50)
    expect(result.location).toBe("Brasil")
    expect(result.description).toBeTruthy()
  })
})

describe("countProjectsByTheme", () => {
  it("retorna zero para todos os temas com lista vazia", () => {
    const counts = countProjectsByTheme([])
    for (const theme of INVESTMENT_THEMES) {
      expect(counts[theme.id]).toBe(0)
    }
  })

  it("conta corretamente para projetos com múltiplos temas", () => {
    const projects: SocialEnrichedProject[] = [
      { id: 1, title: "", description: "", themes: ["saude", "desenvolvimento-comunitario"], primaryThemeLabel: "", targetAmount: 0, progressPercent: 0, location: "" },
      { id: 2, title: "", description: "", themes: ["inclusao", "educacao"], primaryThemeLabel: "", targetAmount: 0, progressPercent: 0, location: "" },
    ]
    const counts = countProjectsByTheme(projects)
    expect(counts["saude"]).toBe(1)
    expect(counts["desenvolvimento-comunitario"]).toBe(1)
    expect(counts["inclusao"]).toBe(1)
    expect(counts["educacao"]).toBe(1)
    expect(counts["cultura"]).toBe(0)
  })
})

describe("MOCK_USER_INTEREST_LABELS", () => {
  it("gera string com labels dos interesses mockados", () => {
    expect(MOCK_USER_INTEREST_LABELS).toBe("Educação, Meio Ambiente, Saúde")
  })

  it("MOCK_USER_INTERESTS contém 3 temas", () => {
    expect(MOCK_USER_INTERESTS).toHaveLength(3)
  })
})
