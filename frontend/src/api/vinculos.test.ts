import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchMyRelationships, confirmRelationship } from "./vinculos"

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock("../services/api", () => ({ api: { get: mocks.get, post: mocks.post } }))
vi.mock("../utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}))

const mockRelationships = [
  {
    projectId: 1,
    projectName: "Projeto A",
    partnerInstitutionId: 5,
    partnerInstitutionName: "Empresa X",
    status: "active",
    partnerContactEmail: "x@empresa.com",
    partnerContactPhone: null,
    canRespond: false,
    canConfirm: false,
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe("fetchMyRelationships", () => {
  it("chama GET /api/relationships com Authorization e sem status", async () => {
    mocks.get.mockResolvedValue({ data: mockRelationships })
    await fetchMyRelationships("meu-token")
    expect(mocks.get).toHaveBeenCalledWith("/api/relationships", {
      headers: { Authorization: "Bearer meu-token" },
      params: {},
    })
  })

  it("inclui status nos params quando fornecido", async () => {
    mocks.get.mockResolvedValue({ data: [] })
    await fetchMyRelationships("token", "active")
    expect(mocks.get).toHaveBeenCalledWith("/api/relationships", {
      headers: { Authorization: "Bearer token" },
      params: { status: "active" },
    })
  })

  it("retorna a lista de relacionamentos", async () => {
    mocks.get.mockResolvedValue({ data: mockRelationships })
    const result = await fetchMyRelationships("token")
    expect(result).toHaveLength(1)
    expect(result[0].projectName).toBe("Projeto A")
  })

  it("propaga erro quando a requisição falha", async () => {
    mocks.get.mockRejectedValue(new Error("401"))
    await expect(fetchMyRelationships("token-invalido")).rejects.toThrow("401")
  })
})

describe("confirmRelationship", () => {
  it("chama POST /api/relationships/:companyId/:projectId/confirm com Authorization", async () => {
    mocks.post.mockResolvedValue({})
    await confirmRelationship(5, 1, "meu-token")
    expect(mocks.post).toHaveBeenCalledWith(
      "/api/relationships/5/1/confirm",
      null,
      { headers: { Authorization: "Bearer meu-token" } },
    )
  })

  it("não retorna nada (void)", async () => {
    mocks.post.mockResolvedValue({})
    const result = await confirmRelationship(5, 1, "token")
    expect(result).toBeUndefined()
  })

  it("propaga erro quando a requisição falha", async () => {
    mocks.post.mockRejectedValue(new Error("403"))
    await expect(confirmRelationship(5, 1, "token")).rejects.toThrow("403")
  })
})
