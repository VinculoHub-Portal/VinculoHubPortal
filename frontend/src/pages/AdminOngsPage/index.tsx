import { useAuth0 } from "@auth0/auth0-react"
import { type ReactNode, useEffect, useState } from "react"
import {
  fetchAdminNpos,
  type AdminNpoAreaFilter,
  type AdminNpoCard,
  type AdminNpoStatusFilter,
} from "../../api/admin"
import { AdminOngsPageContext } from "./useAdminOngsPage"

const PAGE_SIZE = 12

export function AdminOngsPage({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently } = useAuth0()
  const [npos, setNpos] = useState<AdminNpoCard[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchFilter, setSearchFilter] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [areaFilter, setAreaFilter] = useState<AdminNpoAreaFilter | "all">("all")
  const [statusFilter, setStatusFilter] = useState<AdminNpoStatusFilter>("all")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchFilter)
      setPage(0)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchFilter])

  useEffect(() => {
    let isMounted = true

    async function loadNpos() {
      setLoading(true)
      setError("")
      try {
        const token = await getAccessTokenSilently()
        const data = await fetchAdminNpos(token, {
          search: debouncedSearch || undefined,
          area: areaFilter,
          status: statusFilter,
          page,
          size: PAGE_SIZE,
        })
        if (!isMounted) return
        setNpos(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch {
        if (isMounted) {
          setError("Não foi possível carregar as ONGs.")
          setNpos([])
          setTotalPages(0)
          setTotalElements(0)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadNpos()

    return () => {
      isMounted = false
    }
  }, [getAccessTokenSilently, debouncedSearch, areaFilter, statusFilter, page])

  function handleAreaChange(value: AdminNpoAreaFilter | "all") {
    setAreaFilter(value)
    setPage(0)
  }

  function handleStatusChange(value: AdminNpoStatusFilter) {
    setStatusFilter(value)
    setPage(0)
  }

  return (
    <AdminOngsPageContext.Provider
      value={{
        npos,
        page,
        totalPages,
        totalElements,
        loading,
        error,
        searchFilter,
        areaFilter,
        statusFilter,
        setSearchFilter,
        setPage,
        handleAreaChange,
        handleStatusChange,
      }}
    >
      {children}
    </AdminOngsPageContext.Provider>
  )
}
