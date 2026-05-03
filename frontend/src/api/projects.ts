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

export interface CreateProjectPayload {
  title: string
  description: string
  budgetNeeded: number | null
  startDate?: string | null
  endDate?: string | null
  odsIds: number[]
  type: "SOCIAL" | "GOVERNMENTAL" | "CULTURAL" | "ENVIRONMENTAL"
  focusArea: string
  fundraisingDeadline?: string | null
  beneficiariesCount?: number | null
  location?: string | null
  mainObjective?: string | null
}

export interface CreateProjectResponse {
  id: number
  npoId: number
  title: string
  description: string
  status: ProjectStatus
  budgetNeeded: number | null
  investedAmount: number | null
  startDate: string | null
  endDate: string | null
}

export async function createProject(
  payload: CreateProjectPayload,
  token: string,
): Promise<CreateProjectResponse> {
  logger.info("ProjectsAPI", "Creating project", { title: payload.title })
  try {
    const { data } = await api.post<CreateProjectResponse>("/api/projects", payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("ProjectsAPI", "Project created", { id: data.id })
    return data
  } catch (error) {
    logger.error("ProjectsAPI", "Failed to create project", error)
    throw error
  }
}
