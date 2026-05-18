import { api } from "../services/api"
import { logger } from "../utils/logger"

export interface CompanySupportedProjectsSummary {
  active: number
  incentiveLaws: number
  privateInvestment: number
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
