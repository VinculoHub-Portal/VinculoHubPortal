import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  fetchCompanyEsgImpactDashboard,
  fetchCompanySupportedProjectsSummary,
} from "./companyPortfolio"

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

describe("fetchCompanyEsgImpactDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("chama GET /api/me/company/portfolio/esg-impact com bearer token", async () => {
    mocks.apiGetMock.mockResolvedValue({
      data: {
        projectCount: 3,
        totalInvested: 1000,
        totalBudgetNeeded: 2000,
        pillars: [],
      },
    })

    await fetchCompanyEsgImpactDashboard("meu-token")

    expect(mocks.apiGetMock).toHaveBeenCalledWith(
      "/api/me/company/portfolio/esg-impact",
      {
        headers: { Authorization: "Bearer meu-token" },
      },
    )
  })

  it("retorna os dados da resposta", async () => {
    const dashboard = {
      projectCount: 3,
      totalInvested: 1000,
      totalBudgetNeeded: 2000,
      pillars: [
        {
          pillar: "ENVIRONMENTAL",
          label: "Ambiental",
          projectCount: 2,
          totalInvested: 600,
          budgetNeeded: 800,
          investmentPercentage: 60,
        },
      ],
    }
    mocks.apiGetMock.mockResolvedValue({ data: dashboard })

    await expect(fetchCompanyEsgImpactDashboard("token")).resolves.toEqual(dashboard)
  })

  it("propaga erro quando a requisição falha", async () => {
    mocks.apiGetMock.mockRejectedValue(new Error("Network error"))

    await expect(fetchCompanyEsgImpactDashboard("token")).rejects.toThrow("Network error")
  })
})
