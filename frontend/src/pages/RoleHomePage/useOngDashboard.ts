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
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const PROJECT_TYPE_DISPLAY: Record<
  ProjectType,
  { label: string; barClassName: string; trackClassName: string; iconClassName: string }
> = {
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const refetch = useCallback(async () => {
    if (isLoading) {
      return
    }

    const requestId = ++requestIdRef.current
    const isCurrent = () => requestIdRef.current === requestId

    if (!isAuthenticated) {
      if (!isCurrent()) return
      setProjects([])
      setTypeMetrics([])
      setError("Faça login para visualizar seus projetos.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: AUTH0_AUDIENCE,
        },
      })
      const profile = await fetchAuthenticatedProfile(token)
      if (!isCurrent()) return

      if (!profile.npoId) {
        throw new Error("ONG não encontrada para o usuário autenticado.")
      }

      const data = await fetchProjects({ npoId: profile.npoId, size: 50 }, token)
      if (!isCurrent()) return

      const mappedProjects = data.content.map(mapProjectToDashboardProject)
      setProjects(mappedProjects)
      setTypeMetrics(buildTypeMetrics(data.content))
    } catch {
      if (!isCurrent()) return
      setProjects([])
      setTypeMetrics([])
      setError("Não foi possível carregar os dados do dashboard.")
    } finally {
      if (isCurrent()) {
        setLoading(false)
      }
    }
  }, [getAccessTokenSilently, isAuthenticated, isLoading])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { projects, typeMetrics, loading, error, refetch }
}

export function statusMatchesFilter(
  status: ProjectStatus,
  filter: OngDashboardFilter,
) {
  return filter === "all" || status === filter
}

function mapProjectToDashboardProject(project: ProjectListItem): OngDashboardProject {
  const display = project.type
    ? PROJECT_TYPE_DISPLAY[project.type] ?? FALLBACK_TYPE_DISPLAY
    : FALLBACK_TYPE_DISPLAY
  const amountNeeded = Number(project.budgetNeeded ?? 0)
  const investedAmount = Number(project.investedAmount ?? 0)

  return {
    id: project.id,
    title: project.title,
    type: display.label,
    status: project.status,
    statusLabel: projectStatusLabel(project.status),
    progress: project.progressPercent ?? calculateProgress(investedAmount, amountNeeded),
    iconClassName: display.iconClassName,
  }
}

function buildTypeMetrics(projects: ProjectListItem[]): OngProjectTypeMetric[] {
  const total = projects.length
  if (total === 0) return []

  const counts = projects.reduce<Map<string, { count: number; display: typeof FALLBACK_TYPE_DISPLAY }>>(
    (acc, project) => {
      const display = project.type
        ? PROJECT_TYPE_DISPLAY[project.type] ?? FALLBACK_TYPE_DISPLAY
        : FALLBACK_TYPE_DISPLAY
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

function calculateProgress(investedAmount: number, amountNeeded: number) {
  if (!amountNeeded || amountNeeded <= 0) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round((investedAmount / amountNeeded) * 100)))
}
