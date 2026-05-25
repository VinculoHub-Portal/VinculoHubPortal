import { api } from "../services/api"
import { logger } from "../utils/logger"

export interface CompanySupportedProjectsSummary {
  active: number
  incentiveLaws: number
  privateInvestment: number
}

export type EsgPillarCode = "ENVIRONMENTAL" | "SOCIAL" | "GOVERNANCE"

export interface EsgPillarImpactResponse {
  pillar: EsgPillarCode
  label: string
  projectCount: number
  totalInvested: number
  budgetNeeded: number
  investmentPercentage: number
}

export interface CompanyEsgImpactDashboardResponse {
  projectCount: number
  totalInvested: number
  totalBudgetNeeded: number
  pillars: EsgPillarImpactResponse[]
}

export async function fetchCompanySupportedProjectsSummary(
  token: string,
): Promise<CompanySupportedProjectsSummary> {
  logger.info("CompanyPortfolioAPI", "Fetching supported projects summary")
  try {
    const { data } = await api.get<CompanySupportedProjectsSummary>(
      "/api/company/portfolio/summary",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    logger.info("CompanyPortfolioAPI", "Supported projects summary fetched", data)
    return data
  } catch (error) {
    logger.error("CompanyPortfolioAPI", "Failed to fetch supported projects summary", error)
    throw error
  }
}

export async function fetchCompanyEsgImpactDashboard(
  token: string,
): Promise<CompanyEsgImpactDashboardResponse> {
  logger.info("CompanyPortfolioAPI", "Fetching ESG impact dashboard")
  try {
    const { data } = await api.get<CompanyEsgImpactDashboardResponse>(
      "/api/me/company/portfolio/esg-impact",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    logger.info("CompanyPortfolioAPI", "ESG impact dashboard fetched", data)
    return data
  } catch (error) {
    logger.error("CompanyPortfolioAPI", "Failed to fetch ESG impact dashboard", error)
    throw error
  }
}