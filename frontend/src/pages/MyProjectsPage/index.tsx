import { useNavigate } from "react-router-dom";
import { Header } from "../../components/general/Header";
import { BackLink } from "../../components/general/BackLink";
import { BaseButton } from "../../components/general/BaseButton";
import { ProjectCard } from "../../components/projects/ProjectCard";
import { ProjectSummaryCard } from "../../components/projects/ProjectSummaryCard";
import { useProjects } from "../../hooks/useProjects";

export function MyProjectsPage() {
  const navigate = useNavigate();
  const { projects, summary, isLoading, isError, refetch } = useProjects();

  return (
    <div className="min-h-screen bg-surface pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
        <BackLink
          label="Voltar ao Dashboard"
          onClick={() => navigate("/ong/dashboard")}
        />

        <section className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-vinculo-dark">Meus Projetos</h1>
          <p className="text-xl text-slate-500">
            Acompanhe todos os projetos da sua ONG em um só lugar.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ProjectSummaryCard label="Total de Projetos" value={summary.total} />
          <ProjectSummaryCard label="Projetos Ativos" value={summary.active} />
          <ProjectSummaryCard label="Projetos Concluídos" value={summary.completed} />
        </section>

        {isLoading && (
          <section className="grid grid-cols-1 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </section>
        )}

        {!isLoading && isError && (
          <section className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8">
            <h2 className="text-xl font-semibold text-red-700">
              Não foi possível carregar os projetos
            </h2>
            <p className="mt-2 text-red-600">
              Tente novamente para atualizar a listagem da sua ONG.
            </p>
            <div className="mt-5">
              <BaseButton variant="primary" onClick={() => void refetch()}>
                Tentar novamente
              </BaseButton>
            </div>
          </section>
        )}

        {!isLoading && !isError && projects.length === 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-vinculo-dark">
              Nenhum projeto cadastrado ainda
            </h2>
            <p className="mt-3 text-slate-500">
              Quando sua ONG criar projetos, eles aparecerão aqui com status,
              progresso e categorias.
            </p>
          </section>
        )}

        {!isLoading && !isError && projects.length > 0 && (
          <section className="grid grid-cols-1 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
