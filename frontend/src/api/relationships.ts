import { api } from "../services/api"
import { logger } from "../utils/logger"

export type RelationshipStatus = "pending" | "negotiation" | "active"

export interface RelationshipListItem {
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

export interface RelationshipListParams {
  status?: RelationshipStatus
}

export async function fetchRelationships(
  params: RelationshipListParams = {},
  token: string,
): Promise<RelationshipListItem[]> {
  logger.info("RelationshipsAPI", "Fetching relationships", params)
  try {
    const { data } = await api.get<RelationshipListItem[]>("/api/relationships", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("RelationshipsAPI", "Relationships fetched", { count: data.length })
    return data
  } catch (error) {
    logger.error("RelationshipsAPI", "Failed to fetch relationships", error)
    throw error
  }
}

export async function acceptRelationship(
  companyId: number,
  projectId: number,
  token: string,
): Promise<void> {
  logger.info("RelationshipsAPI", "Accepting relationship", { companyId, projectId })
  try {
    await api.post(
      `/api/relationships/${companyId}/${projectId}/accept`,
      undefined,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    logger.info("RelationshipsAPI", "Relationship accepted", { companyId, projectId })
  } catch (error) {
    logger.error("RelationshipsAPI", "Failed to accept relationship", error)
    throw error
  }
}

export async function rejectRelationship(
  companyId: number,
  projectId: number,
  token: string,
): Promise<void> {
  logger.info("RelationshipsAPI", "Rejecting relationship", { companyId, projectId })
  try {
    await api.post(
      `/api/relationships/${companyId}/${projectId}/reject`,
      undefined,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    logger.info("RelationshipsAPI", "Relationship rejected", { companyId, projectId })
  } catch (error) {
    logger.error("RelationshipsAPI", "Failed to reject relationship", error)
    throw error
  }
}
