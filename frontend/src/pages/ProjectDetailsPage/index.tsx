import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import { Link, useParams } from "react-router-dom";
import { Header } from "../../components/general/Header";
import { fetchProjectDetails } from "./fetchProjectDetails";
import { FundingProgress } from "./FundingProgress";
import { OdsTags } from "./OdsTags";
import { ProjectDetailsNotFound } from "./ProjectDetailsNotFound";
import { ProjectDetailsSkeleton } from "./ProjectDetailsSkeleton";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectInfoGrid } from "./ProjectInfoGrid";

const ROLES_CLAIM = "https://vinculohub/roles";

function formatBrl(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function resolveDashboardPath(user: ReturnType<typeof useAuth0>["user"]) {
  const raw = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM];
  const roles: string[] = Array.isArray(raw) ? raw : [];
  const upper = roles.map((r) => String(r).toUpperCase());
  if (upper.includes("ADMIN")) return "/admin/dashboard";
  if (upper.includes("NPO")) return "/ong/dashboard";
  if (upper.includes("COMPANY")) return "/empresa/dashboard";
  return "/";
}

export function ProjectDetailsPage() {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const { user } = useAuth0();
  const dashboardPath = resolveDashboardPath(user);

  const query = useQuery({
    queryKey: ["project-details", projectId],
    queryFn: () => fetchProjectDetails(projectId),
    enabled: Boolean(projectId),
  });

  const project = query.data;

  const showNotFound =
    !projectId ||
    (Boolean(projectId) && !query.isLoading && !query.isError && !project);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <div className="flex-1 w-full px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-3xl mx-auto w-full">
          {!showNotFound && (
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-vinculo-dark hover:text-vinculo-dark-hover mb-6 transition-colors"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} aria-hidden />
              Voltar ao Dashboard
            </Link>
          )}

          {showNotFound && <ProjectDetailsNotFound dashboardPath={dashboardPath} />}

          {Boolean(projectId) && query.isLoading && <ProjectDetailsSkeleton />}

          {Boolean(projectId) && query.isError && (
            <div
              className="bg-white rounded-2xl border border-slate-200 px-6 py-12 text-center shadow-sm"
              role="alert"
            >
              <p className="text-slate-700 mb-4">
                Não foi possível carregar os dados do projeto. Verifique sua conexão e tente novamente.
              </p>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="inline-flex items-center justify-center rounded-lg bg-vinculo-dark px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {Boolean(projectId) && !query.isLoading && !query.isError && project && (
            <article className="bg-white rounded-2xl shadow-[var(--shadow-vinculo)] px-6 sm:px-10 py-8 sm:py-10 border border-slate-100">
              <ProjectHeader
                fundingType={project.fundingType}
                category={project.category}
                requiredAmountFormatted={formatBrl(project.requiredAmount)}
                name={project.name}
                city={project.city}
                stateUf={project.stateUf}
              />

              <section className="mt-10">
                <h2 className="text-base font-bold text-vinculo-dark mb-3">Sobre o Projeto</h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                  {project.description || "—"}
                </p>
              </section>

              <section className="mt-10">
                <h2 className="text-base font-bold text-vinculo-dark mb-3 flex items-center gap-2">
                  <TrackChangesOutlinedIcon className="text-vinculo-dark" sx={{ fontSize: 22 }} aria-hidden />
                  Objetivo Principal
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                  {project.mainObjective || "—"}
                </p>
              </section>

              <ProjectInfoGrid targetAudience={project.targetAudience} scopeArea={project.scopeArea} />

              <OdsTags labels={project.sdgLabels} />

              <FundingProgress progressPercent={project.progressPercent} />
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
