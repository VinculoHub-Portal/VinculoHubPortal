import { api } from "../services/api"
import { logger } from "../utils/logger"

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
