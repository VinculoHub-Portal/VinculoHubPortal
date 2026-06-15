import { useAuth0 } from "@auth0/auth0-react"
import { useQuery } from "@tanstack/react-query"
import { fetchAuthenticatedProfile } from "../api/me"

export const AUTH_PROFILE_QUERY_KEY = ["auth-profile"] as const

export function useAuthProfile() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
  return useQuery({
    queryKey: AUTH_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return fetchAuthenticatedProfile(token)
    },
    enabled: isAuthenticated && !isLoading,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
