import { api } from "../services/api"
import { logger } from "../utils/logger"

export type RelationshipStatus = "pending" | "active" | "inactive" | "negotiation"

export interface RelationshipListItemResponse {
  projectId: number
  projectName: string
  partnerInstitutionId: number
  partnerInstitutionName: string
  status: RelationshipStatus
  partnerContactEmail: string | null
  partnerContactPhone: string | null
  canRespond: boolean
  canConfirm: boolean
}

export async function fetchMyRelationships(
  token: string,
  status?: RelationshipStatus,
): Promise<RelationshipListItemResponse[]> {
  logger.info("VinculosAPI", "Fetching relationships for current user")
  try {
    const params = status ? { status } : {}
    const { data } = await api.get<RelationshipListItemResponse[]>("/api/relationships", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
    logger.info("VinculosAPI", "Relationships fetched", data)
    return data
  } catch (error) {
    logger.error("VinculosAPI", "Failed to fetch relationships", error)
    throw error
  }
}

export async function confirmRelationship(
  companyId: number,
  projectId: number,
  token: string,
): Promise<void> {
  logger.info("VinculosAPI", `Confirming relationship companyId=${companyId} projectId=${projectId}`)
  try {
    await api.post(
      `/api/relationships/${companyId}/${projectId}/confirm`,
      null,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    logger.info("VinculosAPI", "Relationship confirmed")
  } catch (error) {
    logger.error("VinculosAPI", "Failed to confirm relationship", error)
    throw error
  }
}
