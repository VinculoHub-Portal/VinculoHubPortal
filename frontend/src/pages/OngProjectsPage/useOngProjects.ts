import { useAuth0 } from "@auth0/auth0-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { fetchAuthenticatedProfile } from "../../api/me"
import {
  fetchNpoProjectSummary,
  fetchProjects,
  type NpoProjectSummary,
  type ProjectListItem,
  type ProjectStatus,
  type ProjectType,
} from "../../api/projects"
import type { OngProject, OngProjectFundingModel } from "./mockData"

const PAGE_SIZE = 10

interface UseOngProjectsResult {
  projects: OngProject[]
  summary: NpoProjectSummary
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
  refetch: () => Promise<void>
}

export function useOngProjects(): UseOngProjectsResult {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
  const [projects, setProjects] = useState<OngProject[]>([])
  const [summary, setSummary] = useState<NpoProjectSummary>({ total: 0, taxIncentiveLaw: 0, socialInvestmentLaw: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPageState] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const requestIdRef = useRef(0)

  const fetchPage = useCallback(
    async (page: number) => {
      if (isLoading) return

      const requestId = ++requestIdRef.current
      const isCurrent = () => requestIdRef.current === requestId

      if (!isAuthenticated) {
        if (!isCurrent()) return
        setProjects([])
        setError("Faça login para visualizar seus projetos.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const token = await getAccessTokenSilently()
        const profile = await fetchAuthenticatedProfile(token)
        if (!isCurrent()) return

        if (!profile.npoId) {
          throw new Error("ONG não encontrada para o usuário autenticado.")
        }

        const [projectsResult, summaryResult] = await Promise.allSettled([
          fetchProjects({ npoId: profile.npoId, size: PAGE_SIZE, page }, token),
          page === 0 ? fetchNpoProjectSummary(token) : Promise.resolve(null),
        ])
        if (!isCurrent()) return

        if (projectsResult.status === "rejected") throw projectsResult.reason

        setProjects(projectsResult.value.content.map(mapProjectListItemToOngProject))
        setTotalPages(projectsResult.value.totalPages)

        if (summaryResult.status === "fulfilled" && summaryResult.value) {
          setSummary(summaryResult.value)
        }
      } catch {
        if (!isCurrent()) return
        setError("Não foi possível carregar os projetos.")
        setProjects([])
      } finally {
        if (isCurrent()) setLoading(false)
      }
    },
    [getAccessTokenSilently, isAuthenticated, isLoading],
  )

  const setCurrentPage = useCallback(
    (page: number) => {
      setCurrentPageState(page)
      void fetchPage(page)
    },
    [fetchPage],
  )

  const refetch = useCallback(async () => {
    setCurrentPageState(0)
    await fetchPage(0)
  }, [fetchPage])

  useEffect(() => {
    void fetchPage(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPage])

  return { projects, summary, loading, error, currentPage, totalPages, setCurrentPage, refetch }
}

function mapProjectListItemToOngProject(project: ProjectListItem): OngProject {
  const amountNeeded = Number(project.budgetNeeded ?? 0)
  const investedAmount = Number(project.investedAmount ?? 0)

  return {
    id: project.id,
    status: projectStatusLabel(project.status),
    fundingModel: fundingModelFromType(project.type),
    amountNeeded,
    title: project.title,
    description:
      project.description ||
      "Descrição indisponível na listagem. Acesse os detalhes do projeto para mais informações.",
    generalProgress: project.progress ?? 0,
    captureProgress: calculateProgress(investedAmount, amountNeeded),
    tags: projectTags(project),
  }
}

function projectStatusLabel(status: ProjectStatus) {
  const labels: Record<ProjectStatus, string> = {
    ACTIVE: "Ativo",
    COMPLETED: "Concluído",
    CANCELLED: "Cancelado",
  }

  return labels[status] ?? status
}

function fundingModelFromType(type?: ProjectType | null): OngProjectFundingModel {
  if (type === "SOCIAL_INVESTMENT_LAW") return "privateInvestment"
  if (type === "TAX_INCENTIVE_LAW") return "incentiveLaw"
  return "directCapture"
}

function calculateProgress(investedAmount: number, amountNeeded: number) {
  if (!amountNeeded || amountNeeded <= 0) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round((investedAmount / amountNeeded) * 100)))
}

function projectTags(project: ProjectListItem) {
  const odsTags = project.ods?.map((ods) => ods.name).filter(Boolean) ?? []
  return odsTags
}
