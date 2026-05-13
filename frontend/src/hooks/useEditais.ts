import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { fetchEditais, type EditalListItem } from "../api/editais"

export function useEditais() {
  const { getAccessTokenSilently } = useAuth0()
  const [editais, setEditais] = useState<EditalListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    void (async () => {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently()
        const data = await fetchEditais(token)
        if (!mounted) return
        setEditais(data)
        setError(null)
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "Erro ao carregar editais")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [getAccessTokenSilently])

  return { editais, loading, error }
}
