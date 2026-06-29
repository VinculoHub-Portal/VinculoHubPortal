import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  fetchNpoProfile,
  fetchNposForCompany,
  fetchNpoProfileProjects,
  updateNpoProfile,
} from "./npo"

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock("../services/api", () => ({
  api: { get: mocks.get, put: mocks.put },
}))

vi.mock("../utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}))

const mockProfile = {
  viewerContext: "OWNER" as const,
  institutionalData: { id: 1, name: "ONG Teste", description: null, logoUrl: null, npoSize: null, cnpj: null, cpf: null, environmental: null, social: null, governance: null },
  contact: { email: "ong@test.com", phone: null },
  address: null,
  responsible: null,
  projects: [],
}

const mockPage = {
  content: [{ id: 1, name: "ONG A", description: null, logoUrl: null, city: null, stateCode: null }],
  totalElements: 1, totalPages: 1, number: 0, size: 20, first: true, last: true,
}

const mockProjectPage = {
  content: [], totalElements: 0, totalPages: 0, number: 0, size: 5, first: true, last: true,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("fetchNpoProfile", () => {
  it("chama GET /api/npos/:id sem token", async () => {
    mocks.get.mockResolvedValue({ data: mockProfile })
    await fetchNpoProfile(10)
    expect(mocks.get).toHaveBeenCalledWith("/api/npos/10", { headers: undefined })
  })

  it("chama GET /api/npos/:id com Authorization quando token é passado", async () => {
    mocks.get.mockResolvedValue({ data: mockProfile })
    await fetchNpoProfile(10, "meu-token")
    expect(mocks.get).toHaveBeenCalledWith("/api/npos/10", {
      headers: { Authorization: "Bearer meu-token" },
    })
  })

  it("retorna os dados do perfil", async () => {
    mocks.get.mockResolvedValue({ data: mockProfile })
    const result = await fetchNpoProfile(10)
    expect(result.viewerContext).toBe("OWNER")
    expect(result.institutionalData.name).toBe("ONG Teste")
  })

  it("propaga erro quando a requisição falha", async () => {
    mocks.get.mockRejectedValue(new Error("Network error"))
    await expect(fetchNpoProfile(10)).rejects.toThrow("Network error")
  })
})

describe("fetchNposForCompany", () => {
  it("chama GET /api/company/npos com params e token", async () => {
    mocks.get.mockResolvedValue({ data: mockPage })
    await fetchNposForCompany({ page: 0, size: 10, name: "ONG" }, "token-abc")
    expect(mocks.get).toHaveBeenCalledWith("/api/company/npos", {
      params: { page: 0, size: 10, name: "ONG" },
      headers: { Authorization: "Bearer token-abc" },
    })
  })

  it("chama com params vazios e sem token quando chamado sem argumentos", async () => {
    mocks.get.mockResolvedValue({ data: mockPage })
    await fetchNposForCompany()
    expect(mocks.get).toHaveBeenCalledWith("/api/company/npos", {
      params: {},
      headers: undefined,
    })
  })

  it("retorna a página de ONGs", async () => {
    mocks.get.mockResolvedValue({ data: mockPage })
    const result = await fetchNposForCompany()
    expect(result.totalElements).toBe(1)
    expect(result.content[0].name).toBe("ONG A")
  })

  it("propaga erro quando a requisição falha", async () => {
    mocks.get.mockRejectedValue(new Error("500"))
    await expect(fetchNposForCompany()).rejects.toThrow("500")
  })
})

describe("fetchNpoProfileProjects", () => {
  it("chama GET /api/npos/:id/projects com page e size padrão", async () => {
    mocks.get.mockResolvedValue({ data: mockProjectPage })
    await fetchNpoProfileProjects(5)
    expect(mocks.get).toHaveBeenCalledWith("/api/npos/5/projects", {
      params: { page: 0, size: 5 },
    })
  })

  it("chama com page e size customizados", async () => {
    mocks.get.mockResolvedValue({ data: mockProjectPage })
    await fetchNpoProfileProjects(5, 2, 10)
    expect(mocks.get).toHaveBeenCalledWith("/api/npos/5/projects", {
      params: { page: 2, size: 10 },
    })
  })

  it("propaga erro quando a requisição falha", async () => {
    mocks.get.mockRejectedValue(new Error("404"))
    await expect(fetchNpoProfileProjects(99)).rejects.toThrow("404")
  })
})

describe("updateNpoProfile", () => {
  it("chama PUT /api/npos/:id com payload e Authorization", async () => {
    mocks.put.mockResolvedValue({ data: mockProfile })
    await updateNpoProfile(10, { contact: { email: "novo@email.com" } }, "meu-token")
    expect(mocks.put).toHaveBeenCalledWith(
      "/api/npos/10",
      { contact: { email: "novo@email.com" } },
      { headers: { Authorization: "Bearer meu-token" } },
    )
  })

  it("retorna o perfil atualizado", async () => {
    mocks.put.mockResolvedValue({ data: mockProfile })
    const result = await updateNpoProfile(10, {}, "token")
    expect(result.viewerContext).toBe("OWNER")
  })

  it("propaga erro quando a requisição falha", async () => {
    mocks.put.mockRejectedValue(new Error("403"))
    await expect(updateNpoProfile(10, {}, "token")).rejects.toThrow("403")
  })
})
