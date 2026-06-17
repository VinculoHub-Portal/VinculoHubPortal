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

export interface NpoExportData {
  id: number
  name: string
  cnpj: string | null 
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
