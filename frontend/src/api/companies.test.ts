import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchCompaniesForNpo, fetchCompanyPublicProfile } from "./companies"

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
  content: [
    {
      id: 1,
      legalName: "Empresa A LTDA",
      socialName: "Empresa A",
      description: "Desc",
      logoUrl: null,
      city: "São Paulo",
      state: "SP",
    },
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
}

describe("fetchCompaniesForNpo", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiGetMock.mockResolvedValue({ data: mockPage })
  })

  it("chama GET /api/npo/companies com os params corretos (page, size)", async () => {
    await fetchCompaniesForNpo({ page: 0, size: 10 })
    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/npo/companies", {
      params: { page: 0, size: 10 },
      headers: undefined,
    })
  })

  it("inclui header Authorization quando token é fornecido", async () => {
    await fetchCompaniesForNpo({ page: 0, size: 10 }, "meu-token")
    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/npo/companies", {
      params: { page: 0, size: 10 },
      headers: { Authorization: "Bearer meu-token" },
    })
  })

  it("omite header Authorization quando token não é fornecido", async () => {
    await fetchCompaniesForNpo({ page: 0, size: 10 })
    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/npo/companies", {
      params: { page: 0, size: 10 },
      headers: undefined,
    })
  })

  it("retorna os dados do PageResponse corretamente", async () => {
    const result = await fetchCompaniesForNpo({ page: 0, size: 10 })
    expect(result).toEqual(mockPage)
    expect(result.content).toHaveLength(1)
    expect(result.content[0].legalName).toBe("Empresa A LTDA")
    expect(result.totalElements).toBe(1)
    expect(result.totalPages).toBe(1)
  })

  it("propaga o erro quando api.get rejeita", async () => {
    mocks.apiGetMock.mockRejectedValue(new Error("Network error"))
    await expect(fetchCompaniesForNpo({ page: 0, size: 10 })).rejects.toThrow("Network error")
  })
})

describe("fetchCompanyPublicProfile", () => {
  const publicProfile = {
    id: 7,
    legalName: "ACME LTDA",
    socialName: "ACME",
    description: "Empresa de tecnologia",
    logoUrl: null,
    cnpj: "12.345.678/0001-90",
    city: "São Paulo",
    state: "São Paulo",
    stateCode: "SP",
    street: "Rua Exemplo",
    number: "123",
    complement: null,
    zipCode: "01000-000",
    segment: null,
    website: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiGetMock.mockResolvedValue({ data: publicProfile })
  })

  it("chama GET /api/companies/{id}/public com bearer token", async () => {
    await fetchCompanyPublicProfile(7, "meu-token")

    expect(mocks.apiGetMock).toHaveBeenCalledWith("/api/companies/7/public", {
      headers: { Authorization: "Bearer meu-token" },
    })
  })

  it("retorna o perfil público da empresa", async () => {
    const result = await fetchCompanyPublicProfile(7, "meu-token")
    expect(result).toEqual(publicProfile)
  })

  it("propaga o erro quando api.get rejeita", async () => {
    mocks.apiGetMock.mockRejectedValue(new Error("Not Found"))
    await expect(fetchCompanyPublicProfile(7, "meu-token")).rejects.toThrow("Not Found")
  })
})
