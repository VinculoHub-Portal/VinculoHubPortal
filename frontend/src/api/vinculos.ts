import { api } from "../services/api"
import { logger } from "../utils/logger"

export type RelationshipStatus = "pending" | "active" | "inactive" | "negotiation"

export interface VinculoResponse {
  companyId: number
  projectId: number
  projectTitle: string
  companyName: string
  npoName: string
  companyEmail: string | null
  npoEmail: string | null
  status: RelationshipStatus
  companyConfirmed: boolean
  npoConfirmed: boolean
  currentUserConfirmed: boolean
}

export interface EfetivarParceiraResponse {
  companyId: number
  projectId: number
  status: RelationshipStatus
  companyConfirmed: boolean
  npoConfirmed: boolean
  message: string
}

export async function fetchMeVinculos(token: string): Promise<VinculoResponse[]> {
  logger.info("VinculosAPI", "Fetching vinculos for current user")
  try {
    const { data } = await api.get<VinculoResponse[]>("/api/me/vinculos", {
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("VinculosAPI", "Vinculos fetched", data)
    return data
  } catch (error) {
    logger.error("VinculosAPI", "Failed to fetch vinculos", error)
    throw error
  }
}

export async function efetivarParceria(
  companyId: number,
  projectId: number,
  token: string,
): Promise<EfetivarParceiraResponse> {
  logger.info("VinculosAPI", `Efetivar parceria companyId=${companyId} projectId=${projectId}`)
  try {
    const { data } = await api.post<EfetivarParceiraResponse>(
      `/api/me/vinculos/${companyId}/${projectId}/efetivar`,
      null,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    logger.info("VinculosAPI", "Efetivar parceria response", data)
    return data
  } catch (error) {
    logger.error("VinculosAPI", "Failed to efetivar parceria", error)
    throw error
  }
}
