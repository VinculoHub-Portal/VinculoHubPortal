import { api } from "../services/api"
import { logger } from "../utils/logger"

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "CANCELLED"
export type ProjectType = "SOCIAL_INVESTMENT_LAW" | "TAX_INCENTIVE_LAW"

export interface ProjectListItem {
  id: number
  title: string
  status: ProjectStatus
  npoId: number
  npoName: string
  npoPhone: string
  startDate: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface ProjectFilterParams {
  type?: ProjectType
  status?: ProjectStatus
  title?: string
  npoId?: number
  page?: number
  size?: number
}

export async function fetchProjects(
  params: ProjectFilterParams = {},
  token?: string,
): Promise<PageResponse<ProjectListItem>> {
  logger.info("ProjectsAPI", "Fetching projects", params)
  try {
    const { data } = await api.get<PageResponse<ProjectListItem>>("/api/projects", {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    logger.info("ProjectsAPI", "Projects fetched", {
      count: data.totalElements,
      pageSize: data.size,
    })
    return data
  } catch (error) {
    logger.error("ProjectsAPI", "Failed to fetch projects", error)
    throw error
  }
}
