import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { USE_COMPANY_MOCKS, mockFetchCompaniesForNpo } from "../api/companies.mocks"
import { fetchCompaniesForNpo, type CompanyListItem } from "../api/companies"

interface UsePaginatedCompaniesOptions {
  pageSize?: number
  name?: string
}

interface UsePaginatedCompaniesResult {
  companies: CompanyListItem[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalElements: number
  setCurrentPage: (page: number) => void
  refetch: () => void
}

export function usePaginatedCompanies({
  pageSize = 10,
  name,
}: UsePaginatedCompaniesOptions): UsePaginatedCompaniesResult {
  const { getAccessTokenSilently } = useAuth0()
  const [currentPage, setCurrentPage] = useState(0)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
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
        let data

        if (USE_COMPANY_MOCKS) {
          data = mockFetchCompaniesForNpo({ page: currentPage, size: pageSize })
        } else {
          const token = await getAccessTokenSilently()
          data = await fetchCompaniesForNpo(
            { page: currentPage, size: pageSize, name },
            token,
          )
        }

        if (cancelled) return
        setCompanies(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
        setError(null)
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Erro ao carregar empresas")
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
    companies,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    setCurrentPage,
    refetch,
  }
}
