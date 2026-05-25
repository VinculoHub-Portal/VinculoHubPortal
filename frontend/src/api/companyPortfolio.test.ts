import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchCompanySupportedProjectsSummary } from "./companyPortfolio"

const mocks = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
}))

vi.mock("../services/api", () => ({
  api: {
    get: mocks.apiGetMock,
  },
}))

vi.mock("../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe("fetchCompanySupportedProjectsSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("chama GET /api/company/portfolio/summary com bearer token", async () => {
    mocks.apiGetMock.mockResolvedValue({
      data: { active: 6, incentiveLaws: 4, privateInvestment: 2 },
    })

    await fetchCompanySupportedProjectsSummary("meu-token")

    expect(mocks.apiGetMock).toHaveBeenCalledWith(
      "/api/company/portfolio/summary",
      {
        headers: { Authorization: "Bearer meu-token" },
      },
    )
  })

  it("retorna o mesmo formato do contrato do backend", async () => {
    const summary = { active: 6, incentiveLaws: 4, privateInvestment: 2 }
    mocks.apiGetMock.mockResolvedValue({ data: summary })

    await expect(fetchCompanySupportedProjectsSummary("token")).resolves.toEqual(summary)
  })

  it("propaga erro quando a requisição falha", async () => {
    mocks.apiGetMock.mockRejectedValue(new Error("Network error"))

    await expect(fetchCompanySupportedProjectsSummary("token")).rejects.toThrow("Network error")
  })
})
