import axios from "axios"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import { useCallback, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import { BackLink } from "../../components/general/BackLink"
import { Header } from "../../components/general/Header"
import { Pagination } from "../../components/general/Pagination"
import { ConfirmDeleteProjectModal } from "../../components/ong/ConfirmDeleteProjectModal"
import { OngProjectCard } from "../../components/projects/OngProjectCard"
import { useToast } from "../../context/ToastContext"
import { deleteProject } from "../../api/projects"
import { useProjectDetailsNavigation } from "../ProjectDetailsPage/projectDetailsNavigation"
import { type OngProject } from "./mockData"
import { SummaryCard } from "./SummaryCard"
import { useOngProjects } from "./useOngProjects"

export function OngProjectsPage() {
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()
  const { showToast } = useToast()
  const openProjectDetails = useProjectDetailsNavigation("/ong/projetos")
  const editProject = useCallback(
    (id: number) => navigate(`/ong/projetos/${id}/editar`),
    [navigate],
  )
  const { projects, summary, loading, error, currentPage, totalPages, setCurrentPage, refetch } = useOngProjects()

  const [projectToDelete, setProjectToDelete] = useState<OngProject | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = useCallback(
    (id: number) => {
      const project = projects.find((p) => p.id === id)
      if (project) setProjectToDelete(project)
    },
    [projects],
  )

  async function handleConfirmDelete() {
    if (!projectToDelete) return
    setIsDeleting(true)
    try {
      const token = await getAccessTokenSilently()
      await deleteProject(projectToDelete.id, token)
      showToast("Projeto excluído", "success")
      await refetch()
      setProjectToDelete(null)
    } catch (err) {
      let msg = "Falha ao excluir projeto. Tente novamente."
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403)
          msg = "Você não tem permissão para excluir este projeto."
        else if (err.response?.status === 404) msg = "Projeto não encontrado."
      }
      showToast(msg, "error")
      setProjectToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6">
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
            value={loading ? "..." : summary.total}
          />
          <SummaryCard
            label="Leis de Incentivo"
            value={loading ? "..." : summary.taxIncentiveLaw}
          />
          <SummaryCard
            label="Investimento Privado"
            value={loading ? "..." : summary.socialInvestmentLaw}
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
                fundingModel={project.fundingModel}
                amountNeeded={project.amountNeeded}
                title={project.title}
                description={project.description}
                generalProgress={project.generalProgress}
                captureProgress={project.captureProgress}
                tags={project.tags}
                onDetails={openProjectDetails}
                onEdit={editProject}
                onDelete={handleDeleteClick}
              />
            ))}

          </section>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={(page) => {
              setCurrentPage(page)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          />
        </ProjectListState>
      </main>

      <ConfirmDeleteProjectModal
        open={projectToDelete !== null}
        projectTitle={projectToDelete?.title ?? ""}
        isDeleting={isDeleting}
        onCancel={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
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
