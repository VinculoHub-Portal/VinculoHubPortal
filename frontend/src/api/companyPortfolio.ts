import { api } from "../services/api"
import { logger } from "../utils/logger"

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
    logger.info("CompanyPortfolioAPI", "ESG impact dashboard fetched", {
      projectCount: data.projectCount,
      pillars: data.pillars.length,
    })
    return data
  } catch (error) {
    logger.error("CompanyPortfolioAPI", "Failed to fetch ESG impact dashboard", error)
    throw error
  }
}
