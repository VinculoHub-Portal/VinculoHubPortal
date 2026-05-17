import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchProjectById, fetchProjects, updateProject } from "./projects"

const mocks = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
  apiPutMock: vi.fn(),
}))

vi.mock("../services/api", () => ({
  api: { get: mocks.apiGetMock, put: mocks.apiPutMock },
}))

vi.mock("../utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}))

const mockPage = {
  content: [{ id: 1, title: "Projeto A", status: "ACTIVE", npoId: 10, npoName: "ONG A", npoPhone: "51999", startDate: "2026-01-01" }],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 50,
  first: true,
  last: true,
}

const mockProject = {
  id: 1,
  npoId: 10,
  title: "Projeto A",
  description: "Descrição do projeto A com mais de cinquenta caracteres para validar.",
  status: "ACTIVE",
  type: "TAX_INCENTIVE_LAW",
  budgetNeeded: 100000,
  investedAmount: null,
  startDate: null,
  endDate: null,
  ods: [{ id: 1, name: "Sem Pobreza", description: "ODS 1" }],
}

describe("fetchProjects", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiGetMock.mockResolvedValue({ data: mockPage })
    mocks.apiPutMock.mockResolvedValue({ data: mockProject })
  })

  it("chama GET /api/projects com os params corretos", async () => {
    await fetchProjects({ type: "SOCIAL", size: 50 })
    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/projects", {
      params: { type: "SOCIAL", size: 50 },
      headers: undefined,
    })
  })

  it("inclui header Authorization quando token é passado", async () => {
    await fetchProjects({}, "meu-token")
    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/projects", {
      params: {},
      headers: { Authorization: "Bearer meu-token" },
    })
  })

  it("omite header Authorization quando token não é passado", async () => {
    await fetchProjects({ type: "SOCIAL_INVESTMENT_LAW" })
    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/projects", {
      params: { type: "SOCIAL_INVESTMENT_LAW" },
      headers: undefined,
    })
  })

  it("retorna os dados do response corretamente", async () => {
    const result = await fetchProjects()
    expect(result).toEqual(mockPage)
    expect(result.content).toHaveLength(1)
    expect(result.totalElements).toBe(1)
  })

  it("propaga o erro quando api.get rejeita", async () => {
    mocks.apiGetMock.mockRejectedValue(new Error("Network error"))
    await expect(fetchProjects()).rejects.toThrow("Network error")
  })
})

describe("fetchProjectById", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiGetMock.mockResolvedValue({ data: mockProject })
  })

  it("chama GET /api/projects/:id com token de autenticação", async () => {
    await fetchProjectById(1, "meu-token")
    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/projects/1", {
      headers: { Authorization: "Bearer meu-token" },
    })
  })

  it("retorna os dados do projeto corretamente", async () => {
    const result = await fetchProjectById(1, "meu-token")
    expect(result.id).toBe(1)
    expect(result.title).toBe("Projeto A")
    expect(result.type).toBe("TAX_INCENTIVE_LAW")
    expect(result.ods).toHaveLength(1)
  })

  it("propaga o erro quando api.get rejeita", async () => {
    mocks.apiGetMock.mockRejectedValue(new Error("Not found"))
    await expect(fetchProjectById(999, "meu-token")).rejects.toThrow("Not found")
  })
})

describe("updateProject", () => {
  const payload = {
    title: "Título Atualizado",
    description: "Descrição atualizada com mais de cinquenta caracteres para ser válida.",
    budgetNeeded: 150000,
    odsIds: [1, 3],
    type: "TAX_INCENTIVE_LAW" as const,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiPutMock.mockResolvedValue({ data: { ...mockProject, title: "Título Atualizado" } })
  })

  it("chama PUT /api/projects/:id com payload e token corretos", async () => {
    await updateProject(1, payload, "meu-token")
    expect(mocks.apiPutMock).toHaveBeenCalledWith("/api/projects/1", payload, {
      headers: { Authorization: "Bearer meu-token" },
    })
  })

  it("retorna os dados do projeto atualizado", async () => {
    const result = await updateProject(1, payload, "meu-token")
    expect(result.title).toBe("Título Atualizado")
  })

  it("propaga o erro quando api.put rejeita", async () => {
    mocks.apiPutMock.mockRejectedValue(new Error("Forbidden"))
    await expect(updateProject(1, payload, "meu-token")).rejects.toThrow("Forbidden")
  })
})
