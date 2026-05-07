import { ProjectCard } from "../../components/projects/ProjectCard"
import type { ProjectListItem } from "../../api/projects"

interface ProjectsGridProps {
  projects: ProjectListItem[]
  loading: boolean
  error: string | null
  onDetails: (id: number | string) => void
}

export function ProjectsGrid({ projects, loading, error, onDetails }: ProjectsGridProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-baseline flex-wrap gap-2">
        <h2 className="text-2xl font-medium leading-9 text-vinculo-dark">Todos os Projetos</h2>
        {!loading && !error && (
          <span className="text-sm text-slate-500">
            {projects.length} {projects.length === 1 ? "projeto encontrado" : "projetos encontrados"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              fundingType="lei-incentivo"
              targetAmount={project.budgetNeeded}
              progressPercent={project.progressPercent}
              onDetails={onDetails}
            />
          ))}
        </div>
      )}
    </section>
  )
}
