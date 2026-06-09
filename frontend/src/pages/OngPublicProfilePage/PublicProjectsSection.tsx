import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined"
import { useMemo, useState } from "react"
import { Pagination } from "../../components/general/Pagination"
import type { NpoProfileProject } from "../../api/npo"
import type { ProjectStatus } from "../../api/projects"

interface ProjectsSectionProps {
  loading?: boolean
  projects: NpoProfileProject[]
}

interface ProjectCardProps {
  project: NpoProfileProject
}

interface StatusChipProps {
  status: ProjectStatus
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: "Ativo",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
}

const PROJECTS_PER_PAGE = 5

function formatPublishedDate(value: string | null) {
  if (!value) return "data indisponível"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "data indisponível"

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function StatusChip({ status }: StatusChipProps) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_CLASSES[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function ProjectCard({ project }: ProjectCardProps) {
  const odsList = project.ods ?? []

  return (
    <article
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-label={`Projeto ${project.title}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-vinculo-dark">{project.title}</h3>
        </div>
        <StatusChip status={project.status} />
      </div>

      {project.description ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {project.description}
        </p>
      ) : null}

      <div className="mt-4 flex min-w-0 flex-col gap-3 text-sm text-slate-700">
        <div className="flex min-w-0 items-start gap-2">
          <LabelOutlinedIcon className="mt-0.5 shrink-0 text-vinculo-dark" fontSize="small" />
          {odsList.length > 0 ? (
            <div className="flex min-w-0 flex-wrap gap-2">
              {odsList.map((ods) => (
                <span
                  key={ods.id}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                >
                  {ods.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="min-w-0 break-words text-slate-500">Nenhum ODS associado</span>
          )}
        </div>
      </div>

      <hr className="my-4 border-slate-200" />
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <CalendarTodayOutlinedIcon fontSize="inherit" />
        <span>Publicado em {formatPublishedDate(project.createdAt)}</span>
      </p>
    </article>
  )
}

function ProjectCardSkeleton() {
  return (
    <article
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-label="Carregando projeto"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200" />
      </div>
      <hr className="my-4 border-slate-200" />
      <div className="h-3 w-36 animate-pulse rounded bg-slate-200" />
    </article>
  )
}

export function PublicProjectsSection({ loading = false, projects }: ProjectsSectionProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE)
  const safeCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0
  const visibleProjects = useMemo(() => {
    const start = safeCurrentPage * PROJECTS_PER_PAGE
    return projects.slice(start, start + PROJECTS_PER_PAGE)
  }, [safeCurrentPage, projects])

  return (
    <section aria-labelledby="public-projects-title">
      <h2 id="public-projects-title" className="mb-5 text-base font-semibold text-vinculo-dark">
        Projetos Publicados ({loading ? 0 : projects.length})
      </h2>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm">
          Esta ONG ainda não possui projetos cadastrados.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        </>
      )}
    </section>
  )
}
