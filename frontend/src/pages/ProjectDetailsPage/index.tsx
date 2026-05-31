import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Header } from "../../components/general/Header";
import { FlexibleButton } from "../../components/general/FlexibleButton";
import { ReportNpoModal } from "../../components/ong/ReportNpoModal";
import { resolveDashboardPath } from "../../utils/dashboardPath";
import { fetchProjectDetails } from "./fetchProjectDetails";
import { FundingProgress } from "./FundingProgress";
import { OdsTags } from "./OdsTags";
import { ProjectDetailsNotFound } from "./ProjectDetailsNotFound";
import { ProjectDetailsSkeleton } from "./ProjectDetailsSkeleton";
import { ProjectHeader } from "./ProjectHeader";
import { ResponsibleInstitutionCard } from "./ResponsibleInstitutionCard";

const ROLES_CLAIM = "https://vinculohub/roles";

function isCompanyUser(user: unknown) {
  const rawRoles = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM];
  const userRoles: string[] = Array.isArray(rawRoles) ? rawRoles : [];
  return userRoles.some((role) => String(role).toUpperCase() === "COMPANY");
}

function formatBrl(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function ProjectDetailsPage() {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const { user, getAccessTokenSilently } = useAuth0();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const location = useLocation();
  const dashboardPath = resolveDashboardPath(user);
  const companyUser = isCompanyUser(user);
  const locationState = location.state as { returnTo?: unknown } | null;
  const returnTo =
    typeof locationState?.returnTo === "string"
      ? locationState.returnTo
      : dashboardPath;
  const returnLabel =
    returnTo === "/ong/projetos" ? "Voltar aos Projetos" : "Voltar ao Dashboard";

  const query = useQuery({
    queryKey: ["project-details", projectId],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      return fetchProjectDetails(projectId, token);
    },
    enabled: Boolean(projectId),
  });

  const project = query.data;

  const showNotFound =
    !projectId ||
    (Boolean(projectId) && !query.isLoading && !query.isError && !project);

  const isIncentiveLaw = project?.fundingType === "Lei de Incentivo";
  const reportableNpoId = project?.responsibleInstitution?.npoId ?? null;
  const canReportInstitution = companyUser && reportableNpoId != null;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <div className="flex-1 w-full px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-3xl mx-auto w-full">
          {!showNotFound && (
            <Link
              to={returnTo}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-vinculo-dark hover:text-vinculo-dark-hover mb-6 transition-colors"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} aria-hidden />
              {returnLabel}
            </Link>
          )}

          {showNotFound && <ProjectDetailsNotFound dashboardPath={returnTo} />}

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
                requiredAmountFormatted={isIncentiveLaw ? formatBrl(project.requiredAmount) : null}
                name={project.name}
              />

              <section className="mt-10">
                <h2 className="text-base font-bold text-vinculo-dark mb-3">Sobre o Projeto</h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                  {project.description || "—"}
                </p>
              </section>

              <OdsTags labels={project.sdgLabels} />

              {isIncentiveLaw && (
                <FundingProgress progressPercent={project.progressPercent} />
              )}
            </article>
          )}

          {Boolean(projectId) && !query.isLoading && !query.isError && project && (
            <div className="mt-6">
              <ResponsibleInstitutionCard
                institution={project.responsibleInstitution}
                headerAction={
                  canReportInstitution ? (
                    <FlexibleButton
                      icon={<ReportProblemOutlinedIcon fontSize="small" />}
                      variant="subtle"
                      size="compact"
                      onClick={() => setIsReportModalOpen(true)}
                    >
                      Denunciar
                    </FlexibleButton>
                  ) : null
                }
              />
            </div>
          )}

          {canReportInstitution && (
            <ReportNpoModal
              npoId={reportableNpoId}
              open={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
