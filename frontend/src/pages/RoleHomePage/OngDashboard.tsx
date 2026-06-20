import AddIcon from "@mui/icons-material/Add"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined"
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { uploadDocument } from "../../api/document"
import type { ProjectStatus } from "../../api/projects"
import { BaseButton } from "../../components/general/BaseButton"
import { CompanyShowcaseCard } from "./CompanyShowcaseCard"
import { Header } from "../../components/general/Header"
import { ProgressBar } from "../../components/general/ProgressBar"
import { useToast } from "../../context/ToastContext"
import UploadModal from "./UploadModal"
import {
  ONG_DASHBOARD_FILTERS,
  useOngDashboard,
  type OngDashboardFilter,
  type OngDashboardProject,
  type OngProjectTypeMetric,
} from "./useOngDashboard"

interface OngDashboardProps {
  onCreateProject: () => void
  successMessage?: string | null
  refreshKey?: number
}

export function OngDashboard({
  onCreateProject,
  successMessage = null,
  refreshKey = 0,
}: OngDashboardProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { getAccessTokenSilently } = useAuth0()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const { projects, typeMetrics, filter, setFilter, loading, error, npoId, refetch } =
    useOngDashboard()
  const previousRefreshKeyRef = useRef(refreshKey)

  useEffect(() => {
    if (previousRefreshKeyRef.current === refreshKey) {
      return
    }
    previousRefreshKeyRef.current = refreshKey
    void refetch()
  }, [refetch, refreshKey])

  async function handleConfirmUpload(file: File, title: string, description: string) {
    if (!npoId) {
      showToast("ONG não encontrada para o usuário autenticado.")
      return
    }
    try {
      const token = await getAccessTokenSilently()
      await uploadDocument(file, { title, description, npoId }, token)
      showToast("Documento enviado com sucesso!", "success")
      setIsUploadModalOpen(false)
    } catch (error) {
      console.error("Upload Error:", error)
      showToast("Não foi possível realizar o upload. Verifique sua conexão e tente novamente.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-6 sm:gap-8 pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6">
        {/* Page header */}
        <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-vinculo-dark">
              Dashboard da ONG
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Bem-vindo ao seu painel de controle de projetos e impacto social
            </p>
          </div>

          {/* Action toolbar */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
            {/* Primary */}
            <button
              type="button"
              onClick={onCreateProject}
              className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-vinculo-green px-4 text-[14px] font-semibold text-white transition hover:bg-emerald-600 lg:w-auto"
            >
              <AddIcon style={{ fontSize: 16 }} />
              Novo Projeto
            </button>

            {/* Secondaries */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 text-[14px] font-medium text-slate-700 transition hover:bg-slate-50 lg:w-auto"
            >
              <FileUploadOutlinedIcon style={{ fontSize: 16 }} />
              Upload de Documentos
            </button>

            <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-3">
              <button
                type="button"
                onClick={() => navigate("/ong/perfil")}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 text-[14px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <AccountCircleOutlinedIcon style={{ fontSize: 16 }} />
                Meu Perfil
              </button>
              <button
                type="button"
                onClick={() => navigate("/meus-vinculos")}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 text-[14px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LinkOutlinedIcon style={{ fontSize: 16 }} />
                Ver vínculos
              </button>
            </div>
          </div>
        </section>

        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-medium text-green-800">
            {successMessage}
          </div>
        )}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-5 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              className="mt-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              onClick={() => void refetch()}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[448px_minmax(0,1fr)]">
            <ProjectsByTypeCard
              loading={loading}
              metrics={typeMetrics}
              onRetry={refetch}
              onDetails={() => navigate("/ong/projetos")}
            />
            <ProjectStatusCard
              selectedFilter={filter}
              onFilterChange={setFilter}
              projects={projects}
              loading={loading}
              onRetry={refetch}
              onViewProject={(projectId) => navigate(`/projeto/${projectId}`)}
              onViewAll={() => navigate("/ong/projetos")}
            />
          </section>
        )}

        <FundingOpportunitiesBanner />

        <section>
          <CompanyShowcaseCard />
        </section>

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
  metrics,
  onRetry,
  onDetails,
}: {
  loading: boolean
  metrics: OngProjectTypeMetric[]
  onRetry: () => Promise<void>
  onDetails: () => void
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-semibold text-vinculo-dark">Projetos por Tipo</h2>
      <DashboardCardState
        loading={loading}
        error={null}
        isEmpty={metrics.length === 0}
        emptyMessage="Nenhum projeto cadastrado ainda."
        onRetry={onRetry}
      >
        <div className="mt-5 sm:mt-6 flex flex-col gap-4 sm:gap-5">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex items-center justify-between gap-4 text-sm sm:text-base">
                <span className="text-slate-600">{metric.label}</span>
                <span className="shrink-0 font-semibold text-slate-600">
                  {metric.count} projetos
                </span>
              </div>
              <div className="mt-2">
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
        className="mx-auto mt-5 sm:mt-6 flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm sm:text-base font-semibold text-vinculo-dark transition hover:bg-blue-50"
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
  onRetry: () => Promise<void>
  onViewProject: (projectId: number) => void
  onViewAll: () => void
}

function ProjectStatusCard({
  selectedFilter,
  onFilterChange,
  projects,
  loading,
  onRetry,
  onViewProject,
  onViewAll,
}: ProjectStatusCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-xl font-semibold text-vinculo-dark">Status dos Projetos</h2>
        {/* Horizontally scrollable filter chips on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ONG_DASHBOARD_FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                className={`cursor-pointer rounded-lg border px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
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
        error={null}
        isEmpty={projects.length === 0}
        emptyMessage="Nenhum projeto encontrado para este filtro."
        onRetry={onRetry}
      >
        {/* Desktop table header */}
        <div className="mt-6 hidden grid-cols-[minmax(210px,1.6fr)_minmax(120px,0.9fr)_minmax(110px,0.75fr)_minmax(130px,1fr)_56px] border-b border-slate-200 pb-3 text-sm font-semibold text-slate-500 lg:grid">
          <span>Projeto</span>
          <span>Tipo</span>
          <span>Status</span>
          <span>Progresso</span>
          <span>Ações</span>
        </div>

        <div className="mt-3 flex flex-col gap-3 lg:mt-1 lg:gap-0">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:p-4 lg:grid lg:grid-cols-[minmax(210px,1.6fr)_minmax(120px,0.9fr)_minmax(110px,0.75fr)_minmax(130px,1fr)_56px] lg:items-center lg:gap-0 lg:rounded-none lg:border-0 lg:p-0 lg:py-4"
            >
              {/* Col 1: icon + title (+ mobile view button) */}
              <div className="flex items-center justify-between gap-2 lg:block">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 aspect-square place-items-center rounded-full text-white ${project.iconClassName}`}
                  >
                    <DescriptionOutlinedIcon fontSize="small" />
                  </span>
                  <span className="font-semibold text-vinculo-dark text-sm sm:text-base leading-snug">{project.title}</span>
                </div>
                <button
                  type="button"
                  className="lg:hidden flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-vinculo-dark transition hover:bg-blue-50"
                  onClick={() => onViewProject(project.id)}
                >
                  <VisibilityOutlinedIcon fontSize="small" />
                </button>
              </div>

              {/* Col 2: type */}
              <span className="text-xs text-slate-500 lg:text-sm lg:text-slate-600">{project.type}</span>

              {/* Col 3: status (wrapped so it doesn't stretch full-width on mobile) */}
              <div className="flex">
                <StatusBadge status={project.status} label={project.statusLabel} />
              </div>

              {/* Col 4: progress */}
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="flex-1 lg:flex-none lg:max-w-28">
                  <ProgressBar
                    value={project.progress}
                    trackClass="bg-slate-200"
                    ariaLabel={`Progresso de ${project.title}`}
                  />
                </div>
                <span className="text-xs sm:text-sm text-slate-500 shrink-0">{project.progress}%</span>
              </div>

              {/* Col 5: desktop view button */}
              <button
                type="button"
                className="hidden lg:flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-vinculo-dark transition hover:bg-blue-50"
                onClick={() => onViewProject(project.id)}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => onViewAll()}
            className="min-h-9 min-w-28 cursor-pointer rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Ver todos
          </button>
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
      className={`inline-flex rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold ${classNameByStatus[status]}`}
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
      <div className="mt-6 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500">
        Carregando projetos...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-5 text-center">
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
      <div className="mt-6 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500">
        {emptyMessage}
      </div>
    )
  }

  return <>{children}</>
}

function FundingOpportunitiesBanner() {
  const navigate = useNavigate()
  return (
    <section className="rounded-lg bg-linear-to-r from-vinculo-dark to-blue-600 p-5 sm:p-6 text-white shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="grid h-11 w-11 sm:h-14 sm:w-14 shrink-0 aspect-square place-items-center rounded-lg bg-white/20">
          <CampaignOutlinedIcon />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold leading-tight">
            Novas Oportunidades de Financiamento Disponíveis
          </h2>
          <p className="mt-2 sm:mt-3 max-w-3xl text-sm sm:text-base leading-6 sm:leading-7 text-white/90">
            Explore editais ativos e descubra oportunidades de captação de recursos para seus projetos.
          </p>
          <div className="mt-4 sm:mt-5">
            <BaseButton
              variant="primary"
              className="w-full sm:w-fit bg-white! px-6 text-vinculo-dark! hover:bg-slate-100"
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
