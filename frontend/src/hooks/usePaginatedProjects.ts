import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { fetchProjects, type ProjectListItem, type ProjectType } from "../api/projects"

interface UsePaginatedProjectsOptions {
  type: ProjectType
  pageSize?: number
}

interface UsePaginatedProjectsResult {
  projects: ProjectListItem[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalElements: number
  setCurrentPage: (page: number) => void
}

export function usePaginatedProjects({
  type,
  pageSize = 12,
}: UsePaginatedProjectsOptions): UsePaginatedProjectsResult {
  const { getAccessTokenSilently } = useAuth0()
  const [currentPage, setCurrentPage] = useState(0)
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently()
        const data = await fetchProjects(
          { type, page: currentPage, size: pageSize },
          token,
        )
        if (cancelled) return
        setProjects(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
        setError(null)
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Erro ao carregar projetos")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently, type, currentPage, pageSize])

  return { projects, loading, error, currentPage, totalPages, totalElements, setCurrentPage }
}
