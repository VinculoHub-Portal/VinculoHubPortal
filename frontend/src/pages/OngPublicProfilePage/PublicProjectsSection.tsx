import type { NpoProfileProject } from "../../api/npo"
import type { ProjectStatus } from "../../api/projects"

interface PublicProjectsSectionProps {
  projects: NpoProfileProject[]
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: "Ativo",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

export function PublicProjectsSection({ projects }: PublicProjectsSectionProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-base font-semibold text-vinculo-dark">Projetos da ONG</h2>
        <span className="text-sm text-slate-500">
          {projects.length} projeto{projects.length === 1 ? "" : "s"}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Esta ONG ainda não possui projetos publicados.
        </div>
      ) : (
        <div className="rounded-lg border border-slate-100">
          {projects.map((project) => (
            <article
              key={project.id}
              className="border-b border-slate-100 p-4 last:border-b-0"
              aria-label={`Projeto ${project.title}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="break-words text-base font-semibold text-vinculo-dark">
                    {project.title}
                  </h3>
                </div>
                <span className="inline-flex w-fit shrink-0 rounded-full bg-vinculo-dark px-3 py-1 text-xs font-semibold text-white">
                  {STATUS_LABELS[project.status] ?? project.status}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  ODS associados
                </p>
                {(project.ods ?? []).length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(project.ods ?? []).map((ods) => (
                      <span
                        key={ods.id}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {ods.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Nenhum ODS associado.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </article>
  )
}
