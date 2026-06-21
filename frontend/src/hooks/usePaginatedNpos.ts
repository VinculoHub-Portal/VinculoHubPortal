import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { fetchNposForCompany, type NpoListItem } from "../api/npo"

interface UsePaginatedNposOptions {
  pageSize?: number
  name?: string
}

interface UsePaginatedNposResult {
  npos: NpoListItem[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalElements: number
  setCurrentPage: (page: number) => void
  refetch: () => void
}

export function usePaginatedNpos({
  pageSize = 10,
  name,
}: UsePaginatedNposOptions): UsePaginatedNposResult {
  const { getAccessTokenSilently } = useAuth0()
  const [currentPage, setCurrentPage] = useState(0)
  const [npos, setNpos] = useState<NpoListItem[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently()
        const data = await fetchNposForCompany({ page: currentPage, size: pageSize, name }, token)
        if (cancelled) return
        setNpos(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
        setError(null)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar ONGs")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently, currentPage, pageSize, name, refreshKey])

  return {
    npos,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    setCurrentPage,
    refetch,
  }
}
