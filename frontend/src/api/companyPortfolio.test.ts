import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchCompanyEsgImpactDashboard } from "./companyPortfolio"

const mocks = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
}))

vi.mock("../services/api", () => ({
  api: { get: mocks.apiGetMock },
}))

vi.mock("../utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}))

const mockDashboard = {
  projectCount: 2,
  totalInvested: 1000,
  totalBudgetNeeded: 2000,
  pillars: [
    {
      pillar: "ENVIRONMENTAL",
      label: "Ambiental",
      projectCount: 1,
      totalInvested: 600,
      budgetNeeded: 800,
      investmentPercentage: 60,
    },
    {
      pillar: "SOCIAL",
      label: "Social",
      projectCount: 1,
      totalInvested: 400,
      budgetNeeded: 1200,
      investmentPercentage: 40,
    },
    {
      pillar: "GOVERNANCE",
      label: "Governança",
      projectCount: 0,
      totalInvested: 0,
      budgetNeeded: 0,
      investmentPercentage: 0,
    },
  ],
}

describe("fetchCompanyEsgImpactDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiGetMock.mockResolvedValue({ data: mockDashboard })
  })

  it("chama GET /api/me/company/portfolio/esg-impact com Authorization", async () => {
    await fetchCompanyEsgImpactDashboard("meu-token")

    expect(mocks.apiGetMock).toHaveBeenCalledWith(
      "/api/me/company/portfolio/esg-impact",
      {
        headers: { Authorization: "Bearer meu-token" },
      },
    )
  })

  it("retorna os dados do response corretamente", async () => {
    const result = await fetchCompanyEsgImpactDashboard("meu-token")

    expect(result).toEqual(mockDashboard)
  })

  it("propaga o erro quando api.get rejeita", async () => {
    mocks.apiGetMock.mockRejectedValue(new Error("Network error"))

    await expect(fetchCompanyEsgImpactDashboard("meu-token")).rejects.toThrow(
      "Network error",
    )
  })
})
