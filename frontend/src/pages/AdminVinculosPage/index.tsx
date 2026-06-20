import { useAuth0 } from "@auth0/auth0-react"
import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import {
  fetchAdminRelationships,
  type AdminRelationshipCard,
  type AdminRelationshipStatusFilter,
} from "../../api/admin"

const PAGE_SIZE = 10

interface AdminVinculosPageContextValue {
  relationships: AdminRelationshipCard[]
  page: number
  totalPages: number
  totalElements: number
  loading: boolean
  error: string
  companyNameFilter: string
  npoNameFilter: string
  projectTitleFilter: string
  statusFilter: AdminRelationshipStatusFilter
  setCompanyNameFilter: (value: string) => void
  setNpoNameFilter: (value: string) => void
  setProjectTitleFilter: (value: string) => void
  setPage: (page: number) => void
  handleStatusChange: (value: AdminRelationshipStatusFilter) => void
}

const AdminVinculosPageContext = createContext<AdminVinculosPageContextValue | null>(null)

export function useAdminVinculosPage() {
  const context = useContext(AdminVinculosPageContext)

  if (!context) {
    throw new Error("useAdminVinculosPage must be used within AdminVinculosPage")
  }

  return context
}

export function AdminVinculosPage({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently } = useAuth0()
  const [relationships, setRelationships] = useState<AdminRelationshipCard[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [companyNameFilter, setCompanyNameFilter] = useState("")
  const [npoNameFilter, setNpoNameFilter] = useState("")
  const [projectTitleFilter, setProjectTitleFilter] = useState("")
  const [debouncedCompanyName, setDebouncedCompanyName] = useState("")
  const [debouncedNpoName, setDebouncedNpoName] = useState("")
  const [debouncedProjectTitle, setDebouncedProjectTitle] = useState("")
  const [statusFilter, setStatusFilter] = useState<AdminRelationshipStatusFilter>("all")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCompanyName(companyNameFilter)
      setPage(0)
    }, 400)

    return () => clearTimeout(timer)
  }, [companyNameFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNpoName(npoNameFilter)
      setPage(0)
    }, 400)

    return () => clearTimeout(timer)
  }, [npoNameFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProjectTitle(projectTitleFilter)
      setPage(0)
    }, 400)

    return () => clearTimeout(timer)
  }, [projectTitleFilter])

  useEffect(() => {
    let isMounted = true

    async function loadRelationships() {
      setLoading(true)
      setError("")
      try {
        const token = await getAccessTokenSilently()
        const data = await fetchAdminRelationships(token, {
          companyName: debouncedCompanyName || undefined,
          npoName: debouncedNpoName || undefined,
          projectTitle: debouncedProjectTitle || undefined,
          status: statusFilter,
          page,
          size: PAGE_SIZE,
        })
        if (!isMounted) return
        setRelationships(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch {
        if (isMounted) {
          setError("Não foi possível carregar os vínculos.")
          setRelationships([])
          setTotalPages(0)
          setTotalElements(0)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadRelationships()

    return () => {
      isMounted = false
    }
  }, [
    getAccessTokenSilently,
    debouncedCompanyName,
    debouncedNpoName,
    debouncedProjectTitle,
    statusFilter,
    page,
  ])

  function handleStatusChange(value: AdminRelationshipStatusFilter) {
    setStatusFilter(value)
    setPage(0)
  }

  return (
    <AdminVinculosPageContext.Provider
      value={{
        relationships,
        page,
        totalPages,
        totalElements,
        loading,
        error,
        companyNameFilter,
        npoNameFilter,
        projectTitleFilter,
        statusFilter,
        setCompanyNameFilter,
        setNpoNameFilter,
        setProjectTitleFilter,
        setPage,
        handleStatusChange,
      }}
    >
      {children}
    </AdminVinculosPageContext.Provider>
  )
}
