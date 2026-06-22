import { useAuth0 } from "@auth0/auth0-react"
import { type ReactNode, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  fetchAdminRelationships,
  type AdminRelationshipCard,
  type AdminRelationshipStatusFilter,
} from "../../api/admin"
import { AdminVinculosPageContext } from "./useAdminVinculosPage"

const PAGE_SIZE = 10
const VALID_STATUSES: AdminRelationshipStatusFilter[] = ["all", "pending", "negotiation", "active", "inactive"]

function isValidStatus(value: string | null): value is AdminRelationshipStatusFilter {
  return VALID_STATUSES.includes(value as AdminRelationshipStatusFilter)
}

export function AdminVinculosPage({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently } = useAuth0()
  const [searchParams] = useSearchParams()

  const initialCompany = searchParams.get("companyName") ?? ""
  const initialNpo = searchParams.get("npoName") ?? ""
  const initialProject = searchParams.get("projectTitle") ?? ""
  const initialStatus = searchParams.get("status")
  const initialStatusFilter: AdminRelationshipStatusFilter =
    isValidStatus(initialStatus) ? initialStatus : "all"

  const [relationships, setRelationships] = useState<AdminRelationshipCard[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [companyNameFilter, setCompanyNameFilter] = useState(initialCompany)
  const [npoNameFilter, setNpoNameFilter] = useState(initialNpo)
  const [projectTitleFilter, setProjectTitleFilter] = useState(initialProject)
  const [debouncedCompanyName, setDebouncedCompanyName] = useState(initialCompany)
  const [debouncedNpoName, setDebouncedNpoName] = useState(initialNpo)
  const [debouncedProjectTitle, setDebouncedProjectTitle] = useState(initialProject)
  const [statusFilter, setStatusFilter] = useState<AdminRelationshipStatusFilter>(initialStatusFilter)

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
