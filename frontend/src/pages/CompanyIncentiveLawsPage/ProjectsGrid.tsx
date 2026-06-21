import { ProjectCard } from "../../components/projects/ProjectCard"
import type { ProjectListItem } from "../../api/projects"

interface ProjectsGridProps {
  projects: ProjectListItem[]
  totalElements: number
  loading: boolean
  error: string | null
  onDetails: (id: number | string) => void
}

export function ProjectsGrid({ projects, totalElements, loading, error, onDetails }: ProjectsGridProps) {
  const gridClass =
    projects.length === 1
      ? "max-w-[500px] w-full"
      : projects.length === 2
      ? "grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"

  return (
    <section className="flex flex-col gap-3 sm:gap-4">
      <div className="flex justify-between items-baseline flex-wrap gap-1.5 sm:gap-2">
        <h2 className="text-xl sm:text-2xl font-medium leading-tight sm:leading-9 text-vinculo-dark">
          Todos os Projetos
        </h2>
        {!loading && !error && totalElements > 0 && (
          <span className="text-sm text-slate-500">
            {projects.length < totalElements
              ? `${projects.length} de ${totalElements} projetos`
              : `${totalElements} ${totalElements === 1 ? "projeto encontrado" : "projetos encontrados"}`}
          </span>
        )}
      </div>

      {loading && (
        <p className="text-slate-500 text-sm py-8 text-center">Carregando projetos...</p>
      )}

      {!loading && error && (
        <p className="text-red-600 text-sm py-8 text-center">
          Erro ao carregar projetos: {error}
        </p>
      )}

      {!loading && !error && projects.length === 0 && (
        <p className="text-slate-500 text-sm py-8 text-center">
          Nenhum projeto disponível no momento.
        </p>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className={gridClass}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              fundingType="lei-incentivo"
              targetAmount={project.budgetNeeded}
              progressPercent={project.progressPercent}
              generalProgress={project.progress}
              onDetails={onDetails}
            />
          ))}
        </div>
      )}
    </section>
  )
}
