import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { fetchEditais, type EditalListItem } from "../api/editais"

export function useEditais(activeOnly = false) {
  const { getAccessTokenSilently } = useAuth0()
  const [editais, setEditais] = useState<EditalListItem[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let mounted = true
    void (async () => {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently()
        const data = await fetchEditais(token, activeOnly, page, 1)
        if (!mounted) return
        setEditais(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
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
  }, [getAccessTokenSilently, activeOnly, refreshKey, page])

  function refetch() {
    setRefreshKey((k) => k + 1)
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  return { editais, loading, error, refetch, page, totalPages, totalElements, setPage: handlePageChange }
}
