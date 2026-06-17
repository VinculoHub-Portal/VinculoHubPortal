import { api } from "../services/api"
import { logger } from "../utils/logger"
import type { PageResponse } from "./projects"

export interface CompanyListItem {
  id: number
  legalName: string
  socialName: string | null
  description: string | null
  logoUrl: string | null
  city: string | null
  state: string | null
}

export interface CompanyFilterParams {
  page?: number
  size?: number
  sort?: string
  name?: string
}

export async function fetchCompaniesForNpo(
  params: CompanyFilterParams = {},
  token?: string,
): Promise<PageResponse<CompanyListItem>> {
  logger.info("CompaniesAPI", "Fetching companies for NPO", params)
  try {
    const { data } = await api.get<PageResponse<CompanyListItem>>("/api/npo/companies", {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    logger.info("CompaniesAPI", "Companies fetched", {
      count: data.totalElements,
      pageSize: data.size,
    })
    return data
  } catch (error) {
    logger.error("CompaniesAPI", "Failed to fetch companies", error)
    throw error
  }
}
