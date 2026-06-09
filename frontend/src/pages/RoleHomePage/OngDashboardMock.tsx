import AddIcon from "@mui/icons-material/Add"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined"
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { uploadDocument } from "../../api/document"
import type { ProjectStatus } from "../../api/projects"
import { BaseButton } from "../../components/general/BaseButton"
import { Header } from "../../components/general/Header"
import { ProgressBar } from "../../components/general/ProgressBar"
import { useToast } from "../../context/ToastContext"
import UploadModal from "./UploadModal"
import {
  ONG_DASHBOARD_FILTERS,
  statusMatchesFilter,
  useOngDashboard,
  type OngDashboardFilter,
  type OngDashboardProject,
  type OngProjectTypeMetric,
} from "./useOngDashboard"

interface OngDashboardMockProps {
  onCreateProject: () => void
  successMessage?: string | null
  refreshKey?: number
}

export function OngDashboardMock({
  onCreateProject,
  successMessage = null,
  refreshKey = 0,
}: OngDashboardMockProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { getAccessTokenSilently } = useAuth0()
  const [selectedFilter, setSelectedFilter] = useState<OngDashboardFilter>("all")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const { projects, typeMetrics, loading, error, refetch } = useOngDashboard()
  const previousRefreshKeyRef = useRef(refreshKey)

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        statusMatchesFilter(project.status, selectedFilter),
      ),
    [projects, selectedFilter],
  )

  useEffect(() => {
    if (previousRefreshKeyRef.current === refreshKey) {
      return
    }

    previousRefreshKeyRef.current = refreshKey
    void refetch()
  }, [refetch, refreshKey])

  async function handleConfirmUpload(file: File, title: string, description: string) {
    try {
      const token = await getAccessTokenSilently()

      await uploadDocument(
        file,
        {
          title,
          description,
          npoId: 1,
        },
        token,
      )

      showToast("Documento enviado com sucesso!", "success")
      setIsUploadModalOpen(false)
    } catch (error) {
      console.error("Upload Error:", error)
      showToast("Não foi possível realizar o upload. Verifique sua conexão e tente novamente.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold leading-tight text-vinculo-dark">
              Dashboard da ONG
            </h1>
            <p className="mt-3 text-base text-slate-500">
              Bem-vindo ao seu painel de controle de projetos e impacto social
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-fit lg:flex-nowrap">
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
              onClick={() => setIsUploadModalOpen(true)}
            >
              <FileUploadOutlinedIcon fontSize="small" />
              Upload de Documentos
            </BaseButton>

            <BaseButton
              type="button"
              variant="outline"
              className="min-h-14 w-full border-slate-200 bg-white px-8 text-lg shadow-md hover:bg-slate-50 sm:w-fit"
              onClick={() => navigate("/ong/perfil")}
            >
              <AccountCircleOutlinedIcon fontSize="small" />
              Meu Perfil
            </BaseButton>

            <BaseButton
              type="button"
              variant="outline"
              className="min-h-14 w-full border-slate-200 bg-white px-8 text-lg shadow-md hover:bg-slate-50 sm:w-fit"
              onClick={() => navigate("/vinculos")}
            >
              <LinkOutlinedIcon fontSize="small" />
              Ver vínculos
            </BaseButton>
          </div>
        </section>

        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-medium text-green-800">
            {successMessage}
          </div>
        )}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[448px_minmax(0,1fr)]">
          <ProjectsByTypeCard
            loading={loading}
            error={error}
            metrics={typeMetrics}
            onRetry={refetch}
            onDetails={() => navigate("/ong/projetos")}
          />
          <ProjectStatusCard
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            projects={filteredProjects}
            loading={loading}
            error={error}
            onRetry={refetch}
            onViewProject={(projectId) => navigate(`/projeto/${projectId}`)}
          />
        </section>

        <FundingOpportunitiesBanner />

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleConfirmUpload}
        />
      </main>
    </div>
  )
}

function ProjectsByTypeCard({
  loading,
  error,
  metrics,
  onRetry,
  onDetails,
}: {
  loading: boolean
  error: string | null
  metrics: OngProjectTypeMetric[]
  onRetry: () => Promise<void>
  onDetails: () => void
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold text-vinculo-dark">Projetos por Tipo</h2>
      <DashboardCardState
        loading={loading}
        error={error}
        isEmpty={metrics.length === 0}
        emptyMessage="Nenhum projeto cadastrado ainda."
        onRetry={onRetry}
      >
        <div className="mt-8 flex flex-col gap-6">
          {metrics.map((metric) => (
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
      </DashboardCardState>
      <button
        type="button"
        className="mx-auto mt-8 flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-base font-semibold text-vinculo-dark transition hover:bg-blue-50"
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
  projects: OngDashboardProject[]
  loading: boolean
  error: string | null
  onRetry: () => Promise<void>
  onViewProject: (projectId: number) => void
}

function ProjectStatusCard({
  selectedFilter,
  onFilterChange,
  projects,
  loading,
  error,
  onRetry,
  onViewProject,
}: ProjectStatusCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <h2 className="text-xl font-semibold text-vinculo-dark">Status dos Projetos</h2>
        <div className="flex flex-wrap gap-2">
          {ONG_DASHBOARD_FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                className={`min-h-11 cursor-pointer rounded-lg border px-5 text-sm font-semibold transition ${
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

      <DashboardCardState
        loading={loading}
        error={error}
        isEmpty={projects.length === 0}
        emptyMessage="Nenhum projeto encontrado para este filtro."
        onRetry={onRetry}
      >
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
                <span className="font-semibold text-vinculo-dark">{project.title}</span>
              </div>
              <span className="text-slate-600">{project.type}</span>
              <StatusBadge status={project.status} label={project.statusLabel} />
              <div className="flex items-center gap-3">
                <div className="flex-1 max-w-28">
                  <ProgressBar
                    value={project.progress}
                    trackClass="bg-slate-200"
                    ariaLabel={`Progresso de ${project.title}`}
                  />
                </div>
                <span className="text-sm text-slate-500">{project.progress}%</span>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-vinculo-dark transition hover:bg-blue-50"
                onClick={() => onViewProject(project.id)}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
      </DashboardCardState>
    </article>
  )
}

function StatusBadge({ status, label }: { status: ProjectStatus; label: string }) {
  const classNameByStatus: Record<ProjectStatus, string> = {
    ACTIVE: "bg-green-100 text-emerald-700",
    COMPLETED: "bg-blue-50 text-blue-700",
    CANCELLED: "bg-slate-100 text-slate-600",
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${classNameByStatus[status]}`}
    >
      {label}
    </span>
  )
}

function DashboardCardState({
  loading,
  error,
  isEmpty,
  emptyMessage,
  onRetry,
  children,
}: {
  loading: boolean
  error: string | null
  isEmpty: boolean
  emptyMessage: string
  onRetry: () => Promise<void>
  children: ReactNode
}) {
  if (loading) {
    return (
      <div className="mt-8 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500">
        Carregando projetos...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-5 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button
          type="button"
          className="mt-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          onClick={() => void onRetry()}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="mt-8 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500">
        {emptyMessage}
      </div>
    )
  }

  return <>{children}</>
}

function FundingOpportunitiesBanner() {
  const navigate = useNavigate()
  return (
    <section className="rounded-lg bg-linear-to-r from-vinculo-dark to-blue-600 p-6 text-white shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-white/20">
          <CampaignOutlinedIcon fontSize="large" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold leading-8">
            Novas Oportunidades de Financiamento Disponíveis
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-white/90">
            Explore editais ativos e descubra oportunidades de captação de recursos para seus projetos.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <BaseButton
              variant="primary"
              className="min-h-12 bg-white! px-6 text-vinculo-dark! hover:bg-slate-100"
              onClick={() => navigate('/editais')}
            >
              <DescriptionOutlinedIcon fontSize="small" />
              Acessar Mural de Editais
            </BaseButton>
          </div>
        </div>
      </div>
    </section>
  )
}
