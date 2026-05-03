import { ProjectCard } from "../../components/projects/ProjectCard"
import type { EnrichedProject } from "./mockData"

interface ProjectsGridProps {
  projects: EnrichedProject[]
  loading: boolean
  error: string | null
}

export function ProjectsGrid({ projects, loading, error }: ProjectsGridProps) {
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
          Nenhum projeto encontrado para este filtro.
        </p>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              // TODO(backend): description vem mockada — ProjectListItemDTO precisa expor
              //   'description' (já existe na entidade Project, basta incluir no DTO).
              description={project.description}
              // TODO(backend): tipo de lei específico (Rouanet/Esporte/etc) não existe na API.
              //   ProjectType enum só tem TAX_INCENTIVE_LAW/SOCIAL_INVESTMENT_LAW.
              //   Valor atual atribuído deterministicamente por id % 6 em enrichProjectWithMocks.
              type={project.lawLabel}
              fundingType="lei-incentivo"
              // TODO(backend): targetAmount mockado em R$ 50.000.
              //   ProjectListItemDTO precisa expor 'budgetNeeded' (já existe na entidade Project).
              targetAmount={project.targetAmount}
              // TODO(backend): progressPercent mockado em 50%.
              //   Backend deve calcular (investedAmount / budgetNeeded * 100) e expor no DTO.
              progressPercent={project.progressPercent}
              // TODO(backend): location mockado como "Brasil".
              //   Project entity não tem cidade/estado — requer modelagem nova ou usar endereço da NPO.
              location={project.location}
            />
          ))}
        </div>
      )}
    </section>
  )
}
