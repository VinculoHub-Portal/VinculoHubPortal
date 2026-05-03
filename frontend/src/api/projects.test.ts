import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchProjects } from "./projects"

const mocks = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
}))

vi.mock("../services/api", () => ({
  api: { get: mocks.apiGetMock },
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

describe("fetchProjects", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiGetMock.mockResolvedValue({ data: mockPage })
  })

  it("chama GET /api/projects com os params corretos", async () => {
    await fetchProjects({ type: "TAX_INCENTIVE_LAW", size: 50 })
    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/projects", {
      params: { type: "TAX_INCENTIVE_LAW", size: 50 },
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
