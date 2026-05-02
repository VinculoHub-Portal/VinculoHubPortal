import { ProjectCard } from "../../components/projects/ProjectCard"
import type { SocialEnrichedProject } from "./mockData"

interface ProjectsGridProps {
  projects: SocialEnrichedProject[]
  loading: boolean
  error: string | null
}

export function ProjectsGrid({ projects, loading, error }: ProjectsGridProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-baseline flex-wrap gap-2">
        <h2 className="text-2xl font-medium leading-9 text-vinculo-dark">
          Todos os Projetos Sugeridos
        </h2>
        {!loading && !error && (
          <span className="text-sm text-slate-500">
            {projects.length}{" "}
            {projects.length === 1 ? "projeto encontrado" : "projetos encontrados"}
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
          Nenhum projeto encontrado para os temas selecionados.
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
              // TODO(backend): tema do projeto (Saúde/Inclusão/etc) não existe na API.
              //   ProjectListItemDTO não retorna categorias/temas. Atribuição mockada
              //   por id % 7 em enrichProjectWithMocks.
              type={project.primaryThemeLabel}
              fundingType="investimento-social-privado"
              // TODO(backend): targetAmount mockado — ProjectListItemDTO precisa expor
              //   'budgetNeeded' (já existe na entidade Project).
              targetAmount={project.targetAmount}
              // TODO(backend): progressPercent mockado — backend deve calcular
              //   (investedAmount / budgetNeeded * 100) e expor no DTO.
              progressPercent={project.progressPercent}
              // TODO(backend): location mockado — Project entity não tem cidade/estado.
              //   Requer modelagem nova ou derivar do endereço da NPO responsável.
              location={project.location}
            />
          ))}
        </div>
      )}
    </section>
  )
}
