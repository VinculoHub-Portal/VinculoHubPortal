import { useAuth0 } from "@auth0/auth0-react"
import { useCallback, useEffect, useState } from "react"
import {
  fetchRelationships,
  type RelationshipListItem,
  type RelationshipStatus,
} from "../api/relationships"

interface Args {
  projectId: number | null
  companyId?: number
}

export interface ExistingRelationshipResult {
  exists: boolean
  relationship: RelationshipListItem | null
  status: RelationshipStatus | null
  loading: boolean
  refetch: () => Promise<void>
}

export function useExistingRelationship({
  projectId,
  companyId,
}: Args): ExistingRelationshipResult {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [exists, setExists] = useState(false)
  const [relationship, setRelationship] = useState<RelationshipListItem | null>(null)
  const [loading, setLoading] = useState(false)

  const check = useCallback(async () => {
    if (!isAuthenticated || projectId == null) {
      setExists(false)
      setRelationship(null)
      return
    }
    setLoading(true)
    try {
      const token = await getAccessTokenSilently()
      const items = await fetchRelationships({}, token)
      const hit = items.find(
        (it) =>
          it.status !== "inactive" &&
          it.projectId === projectId &&
          (companyId == null || it.partnerInstitutionId === companyId),
      )
      setExists(Boolean(hit))
      setRelationship(hit ?? null)
    } catch {
      setExists(false)
      setRelationship(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, projectId, companyId, getAccessTokenSilently])

  useEffect(() => {
    void check()
  }, [check])

  return { exists, relationship, status: relationship?.status ?? null, loading, refetch: check }
}
