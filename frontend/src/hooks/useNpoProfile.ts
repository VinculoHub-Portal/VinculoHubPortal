import { useAuth0 } from "@auth0/auth0-react"
import { useCallback, useEffect, useState } from "react"
import { fetchAuthenticatedProfile } from "../api/me"
import {
  fetchNpoProfile,
  updateNpoProfile,
  type NpoProfileResponse,
  type NpoProfileUpdateRequest,
} from "../api/npo"

interface UseNpoProfileResult {
  profile: NpoProfileResponse | null
  loading: boolean
  error: string | null
  save: (payload: NpoProfileUpdateRequest) => Promise<void>
  refetch: () => void
}

export function useNpoProfile(targetId?: number): UseNpoProfileResult {
  const { getAccessTokenSilently } = useAuth0()
  const [profile, setProfile] = useState<NpoProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const token = await getAccessTokenSilently()

        let npoId: number
        if (targetId !== undefined) {
          npoId = targetId
        } else {
          const authProfile = await fetchAuthenticatedProfile(token)
          if (!authProfile.npoId) {
            throw new Error("ONG não encontrada para o usuário autenticado.")
          }
          npoId = authProfile.npoId
        }

        const data = await fetchNpoProfile(npoId, token)
        if (cancelled) return
        setProfile(data)
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Erro ao carregar perfil da ONG.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently, targetId, tick])

  const save = useCallback(
    async (payload: NpoProfileUpdateRequest) => {
      if (!profile) return
      const token = await getAccessTokenSilently()
      const updated = await updateNpoProfile(profile.institutionalData.id, payload, token)
      setProfile(updated)
    },
    [getAccessTokenSilently, profile],
  )

  const refetch = useCallback(() => {
    setTick((t) => t + 1)
  }, [])

  return { profile, loading, error, save, refetch }
}
