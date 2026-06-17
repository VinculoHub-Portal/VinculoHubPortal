import { useAuth0 } from "@auth0/auth0-react"
import { useQuery } from "@tanstack/react-query"
import { fetchMyRelationships } from "../api/relationships"

export const MY_RELATIONSHIPS_QUERY_KEY = ["my-relationships"] as const

/**
 * Loads every visible relationship (pending / negotiation / active) of the authenticated actor.
 * Filtering by status is done client-side so the summary counts can stay accurate, so we fetch the
 * full list without the {@code status} query param.
 */
export function useMyRelationships() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
  return useQuery({
    queryKey: MY_RELATIONSHIPS_QUERY_KEY,
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return fetchMyRelationships(token)
    },
    enabled: isAuthenticated && !isLoading,
    staleTime: 60 * 1000,
  })
}
