import { useAuth0 } from "@auth0/auth0-react"
import { useCallback, useEffect, useState } from "react"
import { fetchRelationships } from "../api/relationships"

interface Args {
  projectId: number | null
  companyId?: number
}

export interface ExistingRelationshipResult {
  exists: boolean
  loading: boolean
  refetch: () => Promise<void>
}

export function useExistingRelationship({
  projectId,
  companyId,
}: Args): ExistingRelationshipResult {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(false)

  const check = useCallback(async () => {
    if (!isAuthenticated || projectId == null) {
      setExists(false)
      return
    }
    setLoading(true)
    try {
      const token = await getAccessTokenSilently()
      const items = await fetchRelationships({}, token)
      const hit = items.some(
        (it) =>
          it.status !== "inactive" &&
          it.projectId === projectId &&
          (companyId == null || it.partnerInstitutionId === companyId),
      )
      setExists(hit)
    } catch {
      setExists(false)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, projectId, companyId, getAccessTokenSilently])

  useEffect(() => {
    void check()
  }, [check])

  return { exists, loading, refetch: check }
}
