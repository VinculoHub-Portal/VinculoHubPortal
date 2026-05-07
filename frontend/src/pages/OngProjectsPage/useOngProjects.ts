import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { fetchAuthenticatedProfile } from "../../api/me"
import {
  fetchProjects,
  type ProjectListItem,
  type ProjectStatus,
  type ProjectType,
} from "../../api/projects"
import type { OngProject, OngProjectFundingModel } from "./mockData"

interface UseOngProjectsResult {
  projects: OngProject[]
  loading: boolean
  error: string | null
}

export function useOngProjects(): UseOngProjectsResult {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
  const [projects, setProjects] = useState<OngProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadProjects() {
      if (isLoading) {
        return
      }

      if (!isAuthenticated) {
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

        if (!profile.npoId) {
          throw new Error("ONG não encontrada para o usuário autenticado.")
        }

        const data = await fetchProjects({ npoId: profile.npoId, size: 50 }, token)

        if (active) {
          setProjects(data.content.map(mapProjectListItemToOngProject))
        }
      } catch {
        if (active) {
          setError("Não foi possível carregar os projetos.")
          setProjects([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadProjects()

    return () => {
      active = false
    }
  }, [getAccessTokenSilently, isAuthenticated, isLoading])

  return { projects, loading, error }
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
    progress: project.progressPercent ?? calculateProgress(investedAmount, amountNeeded),
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
