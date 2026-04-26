import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EastOutlinedIcon from "@mui/icons-material/EastOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link } from "react-router-dom";
import { Header } from "../../components/general/Header";
import { BaseButton } from "../../components/general/BaseButton";
import { useProjects } from "../../hooks/useProjects";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_TYPE_LABELS,
  type ProjectStatus,
} from "../../types/project.types";
import { ProjectProgress } from "../../components/projects/ProjectProgress";

const statusClassNames: Record<ProjectStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-sky-100 text-sky-700",
  cancelled: "bg-slate-200 text-slate-700",
};

function TypeProgressRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const progress = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 text-lg">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-600">{value} projetos</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function NpoDashboardPage() {
  const { projects, summary, isLoading, isError } = useProjects();
  const previewProjects = projects.slice(0, 3);

  return (
    <div className="min-h-screen bg-surface pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <section className="flex flex-col gap-3">
          <h1 className="text-5xl font-bold text-vinculo-dark">Dashboard da ONG</h1>
          <p className="text-xl text-slate-500">
            Bem-vindo ao seu painel de controle de projetos e impacto social.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.4fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-vinculo-dark">Projetos por Tipo</h2>

            {isLoading ? (
              <div className="mt-8 h-52 animate-pulse rounded-2xl bg-slate-100" />
            ) : (
              <div className="mt-10 flex flex-col gap-8">
                <TypeProgressRow
                  label="Leis de Incentivo"
                  value={summary.byType.tax_incentive_law}
                  total={summary.total}
                  tone="bg-vinculo-dark"
                />
                <TypeProgressRow
                  label="Investimento Social Privado"
                  value={summary.byType.private_social_investment}
                  total={summary.total}
                  tone="bg-vinculo-green"
                />
              </div>
            )}

            <div className="mt-12">
              <Link
                to="/ong/projetos"
                className="inline-flex items-center gap-2 text-2xl font-semibold text-vinculo-dark hover:text-vinculo-dark-hover"
              >
                Ver detalhes
                <EastOutlinedIcon fontSize="inherit" />
              </Link>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-bold text-vinculo-dark">Status dos Projetos</h2>

              <div className="flex flex-wrap gap-3">
                <span className="rounded-2xl bg-vinculo-dark px-6 py-3 text-lg font-semibold text-white">
                  Todos
                </span>
                <span className="rounded-2xl border border-slate-200 px-6 py-3 text-lg text-slate-500">
                  Ativos
                </span>
                <span className="rounded-2xl border border-slate-200 px-6 py-3 text-lg text-slate-500">
                  Concluídos
                </span>
              </div>
            </div>

            {isLoading && (
              <div className="mt-8 h-64 animate-pulse rounded-2xl bg-slate-100" />
            )}

            {!isLoading && isError && (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-red-700">
                Não foi possível carregar o resumo de projetos agora.
              </div>
            )}

            {!isLoading && !isError && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100">
                <div className="hidden grid-cols-[1.3fr_1fr_0.9fr_1fr_auto] gap-6 border-b border-slate-100 px-6 py-5 text-lg font-medium text-slate-500 md:grid">
                  <span>Projeto</span>
                  <span>Tipo</span>
                  <span>Status</span>
                  <span>Progresso</span>
                  <span>Ações</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {previewProjects.map((project) => (
                    <div
                      key={project.id}
                      className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-[1.3fr_1fr_0.9fr_1fr_auto] md:items-center md:gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-vinculo-dark text-white">
                          <DescriptionOutlinedIcon />
                        </span>
                        <span className="text-2xl font-semibold text-vinculo-dark">
                          {project.name}
                        </span>
                      </div>

                      <span className="text-lg text-slate-600">
                        {PROJECT_TYPE_LABELS[project.type]}
                      </span>

                      <span
                        className={`w-fit rounded-full px-4 py-2 text-base font-semibold ${statusClassNames[project.status]}`}
                      >
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>

                      <ProjectProgress value={project.progress} />

                      <Link
                        to="/ong/projetos"
                        aria-label={`Ver detalhes de ${project.name}`}
                        className="inline-flex items-center justify-start text-vinculo-dark hover:text-vinculo-dark-hover"
                      >
                        <VisibilityOutlinedIcon />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <Link
                to="/ong/projetos"
                className="inline-flex items-center gap-2 text-2xl font-semibold text-vinculo-dark hover:text-vinculo-dark-hover"
              >
                Ver todos os projetos
                <EastOutlinedIcon fontSize="inherit" />
              </Link>
            </div>
          </article>
        </section>

        <section className="rounded-3xl bg-vinculo-dark px-8 py-10 text-white shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold">
                Centralize o acompanhamento da sua carteira de projetos
              </h2>
              <p className="mt-4 text-xl text-slate-100/90">
                Consulte o progresso, o tipo de investimento e o status de cada
                iniciativa sem sair do painel da ONG.
              </p>
            </div>

            <Link to="/ong/projetos">
              <BaseButton className="min-h-12 bg-white! text-vinculo-dark! hover:bg-slate-100">
                Acessar listagem completa
              </BaseButton>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
