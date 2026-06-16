import { api } from "../services/api"
import { logger } from "../utils/logger"

export type RelationshipStatus = "pending" | "active" | "inactive" | "negotiation"

/**
 * One row of the "Meus Vínculos" panel (VNC-01), as returned by
 * {@code GET /api/relationships}. {@code partnerContactEmail}/{@code partnerContactPhone} are only
 * populated once the relationship reaches {@code negotiation} or {@code active}; {@code canRespond}
 * and {@code canConfirm} tell the caller which actions it may take in this relationship.
 */
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

export async function fetchMyRelationships(
  token: string,
  status?: RelationshipStatus,
): Promise<RelationshipListItem[]> {
  logger.info("RelationshipsAPI", "Fetching my relationships", { status })
  try {
    const { data } = await api.get<RelationshipListItem[]>("/api/relationships", {
      headers: { Authorization: `Bearer ${token}` },
      params: status ? { status } : undefined,
    })
    logger.info("RelationshipsAPI", "Relationships fetched", { count: data.length })
    return data
  } catch (error) {
    logger.error("RelationshipsAPI", "Failed to fetch relationships", error)
    throw error
  }
}
