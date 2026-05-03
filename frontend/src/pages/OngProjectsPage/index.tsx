import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import { useMemo, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { BackLink } from "../../components/general/BackLink"
import { PortalTopbar } from "../../components/general/PortalTopbar"
import { OngProjectCard } from "../../components/projects/OngProjectCard"
import { getOngProjectSummary } from "./mockData"
import { SummaryCard } from "./SummaryCard"
import { useOngProjects } from "./useOngProjects"

export function OngProjectsPage() {
  const navigate = useNavigate()
  const { projects, loading, error } = useOngProjects()
  const summary = useMemo(() => getOngProjectSummary(projects), [projects])

  return (
    <div className="min-h-screen bg-surface pb-20">
      <PortalTopbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-8 sm:px-6">
        <BackLink
          label="Voltar ao Dashboard"
          onClick={() => navigate("/ong/dashboard")}
        />

        <header>
          <h1 className="text-2xl font-semibold leading-9 text-vinculo-dark">
            Meus Projetos
          </h1>
          <p className="mt-2 text-base leading-6 text-slate-500">
            Acompanhe todos os projetos da sua ONG.
          </p>
        </header>

        <section
          className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
          aria-label="Resumo dos projetos"
        >
          <SummaryCard
            label="Total de Projetos"
            value={loading ? "..." : summary.totalProjects}
          />
          <SummaryCard
            label="Leis de Incentivo"
            value={loading ? "..." : summary.incentiveLawProjects}
          />
          <SummaryCard
            label="Investimento Privado"
            value={loading ? "..." : summary.privateInvestmentProjects}
          />
        </section>

        <ProjectListState
          loading={loading}
          error={error}
          isEmpty={projects.length === 0}
        >
          <section className="flex flex-col gap-5" aria-label="Lista de projetos">
            {projects.map((project) => (
              <OngProjectCard
                key={project.id}
                id={project.id}
                status={project.status}
                amountNeeded={project.amountNeeded}
                title={project.title}
                location={project.location}
                description={project.description}
                progress={project.progress}
                tags={project.tags}
              />
            ))}
          </section>
        </ProjectListState>
      </main>
    </div>
  )
}

interface ProjectListStateProps {
  loading: boolean
  error: string | null
  isEmpty: boolean
  children: ReactNode
}

function ProjectListState({
  loading,
  error,
  isEmpty,
  children,
}: ProjectListStateProps) {
  if (loading) {
    return (
      <section
        className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-slate-600">
          Carregando projetos...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section
        className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm"
        role="alert"
      >
        <ErrorOutlineIcon fontSize="small" />
        <p className="text-sm font-medium">{error}</p>
      </section>
    )
  }

  if (isEmpty) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Inventory2OutlinedIcon className="text-slate-400" />
        <h2 className="mt-3 text-lg font-semibold text-vinculo-dark">
          Nenhum projeto encontrado
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Cadastre um projeto para acompanhar captação, progresso e detalhes por aqui.
        </p>
      </section>
    )
  }

  return children
}
