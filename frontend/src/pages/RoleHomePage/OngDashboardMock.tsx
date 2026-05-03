import AddIcon from "@mui/icons-material/Add"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BaseButton } from "../../components/general/BaseButton"
import { PortalTopbar } from "../../components/general/PortalTopbar"
import { ProgressBar } from "../../components/general/ProgressBar"
import {
  ongDashboardProjects,
  ongProjectTypeMetrics,
  type OngDashboardStatus,
} from "./ongDashboardMock"

type OngDashboardFilter = "all" | "active" | "fundraising"

interface OngDashboardMockProps {
  onCreateProject: () => void
}

const FILTERS: Array<{ id: OngDashboardFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Ativos" },
  { id: "fundraising", label: "Em Captação" },
]

function statusMatchesFilter(
  status: OngDashboardStatus,
  filter: OngDashboardFilter,
) {
  if (filter === "all") return true
  if (filter === "active") return status === "Ativo"
  return status === "Em captação"
}

export function OngDashboardMock({ onCreateProject }: OngDashboardMockProps) {
  const navigate = useNavigate()
  const [selectedFilter, setSelectedFilter] = useState<OngDashboardFilter>("all")

  const filteredProjects = useMemo(
    () =>
      ongDashboardProjects.filter((project) =>
        statusMatchesFilter(project.status, selectedFilter),
      ),
    [selectedFilter],
  )

  return (
    <div className="min-h-screen bg-surface pb-20">
      <PortalTopbar
        userLabel="ONG Exemplo"
        avatarVariant="icon"
        vinculosCount={6}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-10 sm:px-6">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold leading-tight text-vinculo-dark">
              Dashboard da ONG
            </h1>
            <p className="mt-3 text-base text-slate-500">
              Bem-vindo ao seu painel de controle de projetos e impacto social
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-fit">
            <BaseButton
              type="button"
              variant="secondary"
              className="min-h-14 w-full px-8 text-lg shadow-md hover:bg-emerald-600 sm:w-fit"
              onClick={onCreateProject}
            >
              <AddIcon fontSize="small" />
              Novo Projeto
            </BaseButton>
            <BaseButton
              type="button"
              variant="outline"
              className="min-h-14 w-full border-slate-200 bg-white px-8 text-lg shadow-md hover:bg-slate-50 sm:w-fit"
            >
              <FileUploadOutlinedIcon fontSize="small" />
              Upload de Documentos
            </BaseButton>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[448px_minmax(0,1fr)]">
          <ProjectsByTypeCard onDetails={() => navigate("/ong/projetos")} />
          <ProjectStatusCard
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            projects={filteredProjects}
            onViewProject={() => navigate("/ong/projetos")}
          />
        </section>

        <FundingOpportunitiesBanner />
      </main>
    </div>
  )
}

function ProjectsByTypeCard({ onDetails }: { onDetails: () => void }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold text-vinculo-dark">
        Projetos por Tipo
      </h2>

      <div className="mt-8 flex flex-col gap-6">
        {ongProjectTypeMetrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between gap-4 text-base">
              <span className="text-slate-600">{metric.label}</span>
              <span className="shrink-0 font-semibold text-slate-600">
                {metric.count} projetos
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={metric.percentage}
                colorClass={metric.barClassName}
                trackClass={metric.trackClassName}
                ariaLabel={`Projetos por tipo: ${metric.label}`}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mx-auto mt-8 flex items-center gap-1 rounded-lg px-3 py-2 text-base font-semibold text-vinculo-dark transition hover:bg-blue-50"
        onClick={onDetails}
      >
        Ver detalhes
        <ArrowForwardIcon fontSize="small" />
      </button>
    </article>
  )
}

interface ProjectStatusCardProps {
  selectedFilter: OngDashboardFilter
  onFilterChange: (filter: OngDashboardFilter) => void
  projects: typeof ongDashboardProjects
  onViewProject: () => void
}

function ProjectStatusCard({
  selectedFilter,
  onFilterChange,
  projects,
  onViewProject,
}: ProjectStatusCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <h2 className="text-xl font-semibold text-vinculo-dark">
          Status dos Projetos
        </h2>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                className={`min-h-11 rounded-lg border px-5 text-sm font-semibold transition ${
                  isSelected
                    ? "border-vinculo-dark bg-vinculo-dark text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => onFilterChange(filter.id)}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-7 hidden grid-cols-[minmax(210px,1.6fr)_minmax(120px,0.9fr)_minmax(110px,0.75fr)_minmax(130px,1fr)_56px] border-b border-slate-200 pb-4 text-sm font-semibold text-slate-500 lg:grid">
        <span>Projeto</span>
        <span>Tipo</span>
        <span>Status</span>
        <span>Progresso</span>
        <span>Ações</span>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:mt-2 lg:gap-0 lg:divide-y-0">
        {projects.map((project) => (
          <div
            key={project.id}
            className="grid grid-cols-1 gap-4 rounded-lg border border-slate-100 p-4 lg:grid-cols-[minmax(210px,1.6fr)_minmax(120px,0.9fr)_minmax(110px,0.75fr)_minmax(130px,1fr)_56px] lg:items-center lg:border-0 lg:p-0 lg:py-5"
          >
            <div className="flex items-center gap-4">
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-white ${project.iconClassName}`}
              >
                <DescriptionOutlinedIcon fontSize="small" />
              </span>
              <span className="font-semibold text-vinculo-dark">
                {project.title}
              </span>
            </div>
            <span className="flex items-center justify-between gap-3 text-slate-600 lg:block">
              <span className="text-xs font-semibold uppercase text-slate-400 lg:hidden">
                Tipo
              </span>
              {project.type}
            </span>
            <span className="flex items-center justify-between gap-3 lg:block">
              <span className="text-xs font-semibold uppercase text-slate-400 lg:hidden">
                Status
              </span>
              <StatusBadge status={project.status} />
            </span>
            <div className="flex items-center justify-between gap-3 lg:justify-start">
              <span className="text-xs font-semibold uppercase text-slate-400 lg:hidden">
                Progresso
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
              <div className="w-full min-w-20 max-w-28">
                <ProgressBar
                  value={project.progress}
                  trackClass="bg-slate-200"
                  ariaLabel={`Progresso de ${project.title}`}
                />
              </div>
              <span className="text-sm text-slate-500">{project.progress}%</span>
              </div>
            </div>
            <button
              type="button"
              className="flex h-10 w-full items-center justify-center rounded-lg text-vinculo-dark transition hover:bg-blue-50 lg:w-10"
              aria-label={`Ver ${project.title}`}
              onClick={onViewProject}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mx-auto mt-5 flex items-center gap-1 rounded-lg px-3 py-2 text-base font-semibold text-vinculo-dark transition hover:bg-blue-50"
        onClick={onViewProject}
      >
        Ver todos os projetos
        <ArrowForwardIcon fontSize="small" />
      </button>
    </article>
  )
}

function StatusBadge({ status }: { status: OngDashboardStatus }) {
  const isActive = status === "Ativo"

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
        isActive
          ? "bg-green-100 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {status}
    </span>
  )
}

function FundingOpportunitiesBanner() {
  return (
    <section className="rounded-lg bg-gradient-to-r from-vinculo-dark to-blue-600 p-6 text-white shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-white/20">
          <CampaignOutlinedIcon fontSize="large" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold leading-8">
            Novas Oportunidades de Financiamento Disponíveis
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-white/90">
            Explore editais ativos e descubra oportunidades de captação de recursos
            para seus projetos. Confira prazos, requisitos e documentos necessários.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <BaseButton
              type="button"
              variant="primary"
              className="min-h-12 bg-white! px-6 text-vinculo-dark! hover:bg-slate-100"
            >
              <DescriptionOutlinedIcon fontSize="small" />
              Acessar Mural de Editais
            </BaseButton>
            <span className="w-fit rounded-full bg-vinculo-green px-4 py-2 text-sm font-semibold text-white">
              3 editais ativos
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
