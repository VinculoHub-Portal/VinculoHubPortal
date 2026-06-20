import { useAuth0 } from "@auth0/auth0-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { fetchAuthenticatedProfile } from "../../api/me"
import {
  fetchProjects,
  type ProjectListItem,
  type ProjectStatus,
  type ProjectType,
} from "../../api/projects"

const AUTH0_AUDIENCE =
  import.meta.env.VITE_AUTH0_AUDIENCE || "https://api.vinculohub"

const PAGE_SIZE = 3
const METRICS_SIZE = 100

export type OngDashboardFilter = "all" | ProjectStatus

export interface OngProjectTypeMetric {
  label: string
  count: number
  percentage: number
  barClassName: string
  trackClassName: string
}

export interface OngDashboardProject {
  id: number
  title: string
  type: string
  status: ProjectStatus
  statusLabel: string
  progress: number
  iconClassName: string
}

interface UseOngDashboardResult {
  projects: OngDashboardProject[]
  typeMetrics: OngProjectTypeMetric[]
  filter: OngDashboardFilter
  setFilter: (filter: OngDashboardFilter) => void
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: string | null
  npoId: number | null
  refetch: () => Promise<void>
  loadMore: () => Promise<void>
}

const PROJECT_TYPE_DISPLAY: Partial<Record<
  ProjectType,
  { label: string; barClassName: string; trackClassName: string; iconClassName: string }
>> = {
  TAX_INCENTIVE_LAW: {
    label: "Leis de Incentivo",
    barClassName: "bg-vinculo-dark",
    trackClassName: "bg-blue-50",
    iconClassName: "bg-vinculo-dark",
  },
  SOCIAL_INVESTMENT_LAW: {
    label: "Investimento Social Privado",
    barClassName: "bg-vinculo-green",
    trackClassName: "bg-green-50",
    iconClassName: "bg-vinculo-green",
  },
  GOVERNMENTAL: {
    label: "Projetos com Município/Estado",
    barClassName: "bg-amber-400",
    trackClassName: "bg-amber-50",
    iconClassName: "bg-amber-400",
  },
  SOCIAL: {
    label: "Projetos Sociais",
    barClassName: "bg-sky-500",
    trackClassName: "bg-sky-50",
    iconClassName: "bg-sky-500",
  },
  CULTURAL: {
    label: "Projetos Culturais",
    barClassName: "bg-fuchsia-500",
    trackClassName: "bg-fuchsia-50",
    iconClassName: "bg-fuchsia-500",
  },
  ENVIRONMENTAL: {
    label: "Projetos Ambientais",
    barClassName: "bg-emerald-500",
    trackClassName: "bg-emerald-50",
    iconClassName: "bg-emerald-500",
  },
}

const DASHBOARD_PROJECT_TYPES: ProjectType[] = [
  "TAX_INCENTIVE_LAW",
  "SOCIAL_INVESTMENT_LAW",
]

const FALLBACK_TYPE_DISPLAY = {
  label: "Outros",
  barClassName: "bg-slate-500",
  trackClassName: "bg-slate-100",
  iconClassName: "bg-slate-500",
}

export const ONG_DASHBOARD_FILTERS: Array<{ id: OngDashboardFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "ACTIVE", label: "Ativos" },
  { id: "COMPLETED", label: "Concluídos" },
  { id: "CANCELLED", label: "Cancelados" },
]

export function useOngDashboard(): UseOngDashboardResult {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
  const [projects, setProjects] = useState<OngDashboardProject[]>([])
  const [typeMetrics, setTypeMetrics] = useState<OngProjectTypeMetric[]>([])
  const [filter, setFilterState] = useState<OngDashboardFilter>("all")
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [npoId, setNpoId] = useState<number | null>(null)
  const requestIdRef = useRef(0)
  const pageRef = useRef(0)
  const filterRef = useRef<OngDashboardFilter>("all")

  const getAuth = useCallback(async () => {
    const token = await getAccessTokenSilently({
      authorizationParams: { audience: AUTH0_AUDIENCE },
    })
    const profile = await fetchAuthenticatedProfile(token)
    if (!profile.npoId) throw new Error("ONG não encontrada para o usuário autenticado.")
    setNpoId(profile.npoId)
    return { token, npoId: profile.npoId as number }
  }, [getAccessTokenSilently])

  // Recarrega tudo do zero: lista (com filtro) + métricas (sem filtro)
  const refetch = useCallback(async () => {
    if (isLoading) return

    const requestId = ++requestIdRef.current
    const isCurrent = () => requestIdRef.current === requestId
    pageRef.current = 0

    if (!isAuthenticated) {
      setProjects([])
      setTypeMetrics([])
      setError("Faça login para visualizar seus projetos.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { token, npoId } = await getAuth()
      if (!isCurrent()) return

      const statusParam = filterRef.current !== "all" ? filterRef.current : undefined

      const [listData, metricsData] = await Promise.all([
        fetchProjects({ npoId, size: PAGE_SIZE, page: 0, status: statusParam }, token),
        fetchProjects({ npoId, size: METRICS_SIZE }, token),
      ])
      if (!isCurrent()) return

      setProjects(listData.content.map(mapProjectToDashboardProject))
      setHasMore(!listData.last)
      setTypeMetrics(buildTypeMetrics(metricsData.content))
    } catch {
      if (!isCurrent()) return
      setProjects([])
      setTypeMetrics([])
      setError("Não foi possível carregar os dados do dashboard.")
    } finally {
      if (isCurrent()) setLoading(false)
    }
  }, [isLoading, isAuthenticated, getAuth])

  // Muda o filtro e recarrega apenas a lista (métricas não mudam)
  const setFilter = useCallback(
    (newFilter: OngDashboardFilter) => {
      filterRef.current = newFilter
      setFilterState(newFilter)
      pageRef.current = 0

      const requestId = ++requestIdRef.current
      const isCurrent = () => requestIdRef.current === requestId

      setLoading(true)
      setError(null)

      const run = async () => {
        try {
          const { token, npoId } = await getAuth()
          if (!isCurrent()) return

          const statusParam = newFilter !== "all" ? newFilter : undefined
          const data = await fetchProjects(
            { npoId, size: PAGE_SIZE, page: 0, status: statusParam },
            token,
          )
          if (!isCurrent()) return

          setProjects(data.content.map(mapProjectToDashboardProject))
          setHasMore(!data.last)
        } catch {
          if (!isCurrent()) return
          setProjects([])
          setError("Não foi possível carregar os dados do dashboard.")
        } finally {
          if (isCurrent()) setLoading(false)
        }
      }

      void run()
    },
    [getAuth],
  )

  const loadMore = useCallback(async () => {
    const nextPage = pageRef.current + 1
    pageRef.current = nextPage

    const requestId = ++requestIdRef.current
    const isCurrent = () => requestIdRef.current === requestId

    setLoadingMore(true)

    try {
      const { token, npoId } = await getAuth()
      if (!isCurrent()) return

      const statusParam = filterRef.current !== "all" ? filterRef.current : undefined
      const data = await fetchProjects(
        { npoId, size: PAGE_SIZE, page: nextPage, status: statusParam },
        token,
      )
      if (!isCurrent()) return

      setProjects((prev) => [...prev, ...data.content.map(mapProjectToDashboardProject)])
      setHasMore(!data.last)
    } catch {
      // não limpa projetos existentes em erro de loadMore
    } finally {
      if (requestIdRef.current === requestId) setLoadingMore(false)
    }
  }, [getAuth])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return {
    projects,
    typeMetrics,
    filter,
    setFilter,
    loading,
    loadingMore,
    hasMore,
    error,
    npoId,
    refetch,
    loadMore,
  }
}

function mapProjectToDashboardProject(project: ProjectListItem): OngDashboardProject {
  const display = project.type
    ? PROJECT_TYPE_DISPLAY[project.type] ?? FALLBACK_TYPE_DISPLAY
    : FALLBACK_TYPE_DISPLAY

  return {
    id: project.id,
    title: project.title,
    type: display.label,
    status: project.status,
    statusLabel: projectStatusLabel(project.status),
    progress: project.progress ?? 0,
    iconClassName: display.iconClassName,
  }
}

function buildTypeMetrics(projects: ProjectListItem[]): OngProjectTypeMetric[] {
  const dashboardProjects = projects.filter(
    (project) => project.type && DASHBOARD_PROJECT_TYPES.includes(project.type),
  )
  const total = dashboardProjects.length
  if (total === 0) return []

  const counts = dashboardProjects.reduce<Map<string, { count: number; display: typeof FALLBACK_TYPE_DISPLAY }>>(
    (acc, project) => {
      const display = PROJECT_TYPE_DISPLAY[project.type!] ?? FALLBACK_TYPE_DISPLAY
      const current = acc.get(display.label) ?? { count: 0, display }
      acc.set(display.label, { ...current, count: current.count + 1 })
      return acc
    },
    new Map(),
  )

  return Array.from(counts.values())
    .map(({ count, display }) => ({
      label: display.label,
      count,
      percentage: Math.round((count / total) * 100),
      barClassName: display.barClassName,
      trackClassName: display.trackClassName,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

function projectStatusLabel(status: ProjectStatus) {
  const labels: Record<ProjectStatus, string> = {
    ACTIVE: "Ativo",
    COMPLETED: "Concluído",
    CANCELLED: "Cancelado",
  }

  return labels[status] ?? status
}
