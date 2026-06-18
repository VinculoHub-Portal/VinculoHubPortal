import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  acceptRelationship,
  fetchRelationships,
  rejectRelationship,
} from "./relationships"

const mocks = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
  apiPostMock: vi.fn(),
}))

vi.mock("../services/api", () => ({
  api: {
    get: mocks.apiGetMock,
    post: mocks.apiPostMock,
  },
}))

vi.mock("../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

const relationships = [
  {
    projectId: 1,
    projectName: "Projeto Dev",
    partnerInstitutionId: 1,
    partnerInstitutionName: "Empresa Dev S.A.",
    status: "pending",
    partnerContactEmail: null,
    partnerContactPhone: null,
    canRespond: true,
    canConfirm: false,
  },
]

describe("fetchRelationships", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiGetMock.mockResolvedValue({ data: relationships })
  })

  it("chama GET /api/relationships com bearer token", async () => {
    await fetchRelationships({}, "meu-token")

    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/relationships", {
      params: {},
      headers: { Authorization: "Bearer meu-token" },
    })
  })

  it("envia status como query param quando informado", async () => {
    await fetchRelationships({ status: "pending" }, "meu-token")

    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/relationships", {
      params: { status: "pending" },
      headers: { Authorization: "Bearer meu-token" },
    })
  })

  it("retorna a lista de relacionamentos", async () => {
    await expect(fetchRelationships({}, "meu-token")).resolves.toEqual(relationships)
  })

  it("propaga erros da requisição", async () => {
    mocks.apiGetMock.mockRejectedValue(new Error("Network error"))

    await expect(fetchRelationships({}, "meu-token")).rejects.toThrow("Network error")
  })
})

describe("acceptRelationship", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiPostMock.mockResolvedValue({})
  })

  it("chama o POST de aceite com bearer token e sem body", async () => {
    await acceptRelationship(10, 20, "meu-token")

    expect(mocks.apiPostMock).toHaveBeenCalledWith(
      "/api/relationships/10/20/accept",
      undefined,
      { headers: { Authorization: "Bearer meu-token" } },
    )
  })

  it("propaga erros da requisição", async () => {
    mocks.apiPostMock.mockRejectedValue(new Error("Forbidden"))

    await expect(acceptRelationship(10, 20, "meu-token")).rejects.toThrow("Forbidden")
  })
})

describe("rejectRelationship", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiPostMock.mockResolvedValue({})
  })

  it("chama o POST de rejeição com bearer token e sem body", async () => {
    await rejectRelationship(10, 20, "meu-token")

    expect(mocks.apiPostMock).toHaveBeenCalledWith(
      "/api/relationships/10/20/reject",
      undefined,
      { headers: { Authorization: "Bearer meu-token" } },
    )
  })

  it("propaga erros da requisição", async () => {
    mocks.apiPostMock.mockRejectedValue(new Error("Forbidden"))

    await expect(rejectRelationship(10, 20, "meu-token")).rejects.toThrow("Forbidden")
  })
})
