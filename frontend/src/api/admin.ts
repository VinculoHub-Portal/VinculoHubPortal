import { api } from "../services/api"
import { logger } from "../utils/logger"

export interface AdminMetrics {
  totalNpos: number
  publishedEditais: number
  activeVinculos: number
  pendingNotifications: number
}

export type VinculoStatus = "pending" | "active" | "inactive" | "negotiation"

export interface AdminVinculoItem {
  companyId: number
  companyName: string
  projectId: number
  projectTitle: string
  npoId: number
  npoName: string
  status: VinculoStatus
  createdAt: string
}

export interface AdminVinculoPage {
  content: AdminVinculoItem[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface OverdueRelationshipAlert {
  companyId: number
  companyName: string
  npoId: number
  npoName: string
  projectId: number
  projectName: string
  requestedAt: string
}

export interface NpoExportData {
  id: number
  name: string
  cnpj: string | null 
  cpf: string | null
  phone: string | null
  npoSize: "small" | "medium" | "large" | null
  environmental: boolean
  social: boolean
  governance: boolean
  city: string | null
  state: string | null
  zipCode: string | null
  createdAt: string
}

export interface CompanyExportData {
  id: number
  legalName: string
  socialName: string | null
  cnpj: string | null
  phone: string | null
  email: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  createdAt: string
}

export type AdminNpoAreaFilter = "environmental" | "social" | "governance"
export type AdminNpoStatusFilter = "all" | "active" | "inactive"

export interface AdminNpoCard {
  id: number
  name: string
  logoUrl: string | null
  active: boolean
  environmental: boolean
  social: boolean
  governance: boolean
  city: string | null
  stateCode: string | null
  createdAt: string
}

export interface AdminNpoPage {
  content: AdminNpoCard[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface AdminNpoFilters {
  search?: string
  area?: AdminNpoAreaFilter | "all"
  status?: AdminNpoStatusFilter
  page?: number
  size?: number
}

export type AdminRelationshipStatusFilter = "all" | "pending" | "negotiation" | "active" | "inactive"
export type AdminRelationshipInitiator = "company" | "npo"

export interface AdminRelationshipCard {
  companyId: number
  companyName: string
  companyEmail: string | null
  npoId: number
  npoName: string
  npoEmail: string | null
  projectId: number
  projectTitle: string
  status: "pending" | "negotiation" | "active" | "inactive"
  initiatorType: AdminRelationshipInitiator
  createdAt: string
  updatedAt: string
  respondedAt: string | null
  companyConfirmedAt: string | null
  npoConfirmedAt: string | null
}

export interface AdminRelationshipPage {
  content: AdminRelationshipCard[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface AdminRelationshipFilters {
  companyName?: string
  npoName?: string
  projectTitle?: string
  status?: AdminRelationshipStatusFilter
  page?: number
  size?: number
}

export interface VinculoExportData {
  companyName: string
  npoName: string
  projectTitle: string
  status: "pending" | "active" | "inactive" | "negotiation"
}

export async function fetchAllNpos(token: string): Promise<NpoExportData[]> {
  logger.info("AdminAPI", "Fetching all NPOs for export")
  try {
    const { data } = await api.get<NpoExportData[]>("/api/npo-accounts", {
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("AdminAPI", "NPOs fetched", { count: data.length })
    return data
  } catch (error) {
    logger.error("AdminAPI", "Failed to fetch NPOs", error)
    throw error
  }
}

export async function fetchAllCompanies(token: string): Promise<CompanyExportData[]> {
  logger.info("AdminAPI", "Fetching all companies for export")
  try {
    const { data } = await api.get<CompanyExportData[]>("/api/companies", {
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("AdminAPI", "Companies fetched", { count: data.length })
    return data
  } catch (error) {
    logger.error("AdminAPI", "Failed to fetch companies", error)
    throw error
  }
}

export async function fetchAdminNpos(
  token: string,
  filters: AdminNpoFilters = {},
): Promise<AdminNpoPage> {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.area && filters.area !== "all") params.set("area", filters.area)
  if (filters.status === "active") params.set("active", "true")
  if (filters.status === "inactive") params.set("active", "false")
  if (filters.page !== undefined) params.set("page", String(filters.page))
  if (filters.size !== undefined) params.set("size", String(filters.size))

  logger.info("AdminAPI", "Fetching admin NPO cards", { filters })
  try {
    const { data } = await api.get<AdminNpoPage>("/api/admin/ongs", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
    logger.info("AdminAPI", "Admin NPO cards fetched", {
      total: data.totalElements,
      page: data.number,
    })
    return data
  } catch (error) {
    logger.error("AdminAPI", "Failed to fetch admin NPO cards", error)
        throw error
  }
}

export async function fetchAllVinculos(token: string): Promise<VinculoExportData[]> {
  logger.info("AdminAPI", "Fetching all vinculos for export")
  try {
    const { data } = await api.get<VinculoExportData[]>("/api/admin/export/vinculos", {
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("AdminAPI", "Vinculos fetched", { count: data.length })
    return data
  } catch (error) {
    logger.error("AdminAPI", "Failed to fetch vinculos", error)
        throw error
  }
}

export async function fetchAdminMetrics(token: string): Promise<AdminMetrics> {
  logger.info("AdminAPI", "Fetching admin metrics")
  try {
    const { data } = await api.get<AdminMetrics>("/api/admin/metrics", {
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("AdminAPI", "Admin metrics fetched", data)
    return data
  } catch (error) {
    logger.error("AdminAPI", "Failed to fetch admin metrics", error)
    throw error
  }
}

export async function fetchAdminRelationships(
  token: string,
  filters: AdminRelationshipFilters = {},
): Promise<AdminRelationshipPage> {
  const params = new URLSearchParams()
  if (filters.companyName) params.set("companyName", filters.companyName)
  if (filters.npoName) params.set("npoName", filters.npoName)
  if (filters.projectTitle) params.set("projectTitle", filters.projectTitle)
  if (filters.status && filters.status !== "all") params.set("status", filters.status)
  if (filters.page !== undefined) params.set("page", String(filters.page))
  if (filters.size !== undefined) params.set("size", String(filters.size))

  logger.info("AdminAPI", "Fetching admin relationships", { filters })
  try {
    const { data } = await api.get<AdminRelationshipPage>("/api/admin/vinculos/search", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
    logger.info("AdminAPI", "Admin relationships fetched", {
      total: data.totalElements,
      page: data.number,
    })
    return data
  } catch (error) {
    logger.error("AdminAPI", "Failed to fetch admin relationships", error)
        throw error
  }
}

export async function fetchAdminVinculos(
  token: string,
  page = 0,
  size = 20,
): Promise<AdminVinculoPage> {
  logger.info("AdminAPI", "Fetching admin vinculos", { page, size })
  try {
    const { data } = await api.get<AdminVinculoPage>("/api/admin/vinculos", {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, size, sort: "createdAt,desc" },
    })
    logger.info("AdminAPI", "Admin vinculos fetched", { total: data.totalElements })
    return data
  } catch (error) {
    logger.error("AdminAPI", "Failed to fetch admin vinculos", error)
    throw error
  }
}

export async function fetchOverdueRelationshipAlerts(
  token: string,
): Promise<OverdueRelationshipAlert[]> {
  logger.info("AdminAPI", "Fetching overdue relationship alerts")
  try {
    const { data } = await api.get<OverdueRelationshipAlert[]>(
      "/api/admin/relationships/overdue",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    logger.info("AdminAPI", "Overdue relationship alerts fetched", {
      count: data.length,
    })
    return data
  } catch (error) {
    logger.error("AdminAPI", "Failed to fetch overdue relationship alerts", error)
    throw error
  }
}
