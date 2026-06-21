import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import axios from "axios";
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createRelationship } from "../../api/relationships";
import { BaseButton } from "../../components/general/BaseButton";
import { Header } from "../../components/general/Header";
import { FlexibleButton } from "../../components/general/FlexibleButton";
import { DemonstrarInteresseModal } from "../../components/projects/DemonstrarInteresseModal";
import { ReportNpoModal } from "../../components/ong/ReportNpoModal";
import { useToast } from "../../context/ToastContext";
import { useExistingRelationship } from "../../hooks/useExistingRelationship";
import { resolveDashboardPath } from "../../utils/dashboardPath";
import { fetchProjectDetails } from "./fetchProjectDetails";
import { FundingProgress } from "./FundingProgress";
import { GeneralProgress } from "./GeneralProgress";
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
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dashboardPath = resolveDashboardPath(user);
  const companyUser = isCompanyUser(user);
  const { showToast } = useToast();
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
  const canViewPublicProfile = reportableNpoId != null;

  const numericProjectId = project ? Number(project.id) : null;
  const validProjectId =
    numericProjectId != null && Number.isFinite(numericProjectId) ? numericProjectId : null;
  const { exists: alreadyHasRelationship, loading: existingRelationshipLoading } =
    useExistingRelationship({
      projectId: validProjectId,
    });

  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [sentInThisSession, setSentInThisSession] = useState(false);

  const showInterestButton = companyUser && project != null && validProjectId != null;
  const interestButtonDisabled =
    alreadyHasRelationship ||
    sentInThisSession ||
    existingRelationshipLoading ||
    submittingInterest;
  const interestButtonLabel =
    alreadyHasRelationship || sentInThisSession
      ? "Interesse já enviado"
      : "Demonstrar Interesse";

  async function handleConfirmInterest() {
    if (!validProjectId) return;
    setSubmittingInterest(true);
    try {
      const token = await getAccessTokenSilently();
      await createRelationship(validProjectId, token);
      setSentInThisSession(true);
      setInterestModalOpen(false);
      showToast("Interesse enviado com sucesso!", "success");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setSentInThisSession(true);
        setInterestModalOpen(false);
        showToast("Já existe vínculo em andamento para este projeto.", "warning");
      } else {
        showToast(
          "Não foi possível enviar o interesse. Tente novamente.",
          "error",
        );
      }
    } finally {
      setSubmittingInterest(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-[960px] mx-auto w-full">
          {!showNotFound && isAuthenticated && (
            <Link
              to={returnTo}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-vinculo-dark hover:text-vinculo-dark-hover mb-4 sm:mb-6 transition-colors"
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
            <article className="bg-white rounded-2xl shadow-[var(--shadow-vinculo)] px-5 sm:px-8 py-6 sm:py-8 border border-slate-200">
              <ProjectHeader
                fundingType={project.fundingType}
                requiredAmountFormatted={isIncentiveLaw ? formatBrl(project.requiredAmount) : null}
                name={project.name}
              />

              <section className="mt-6 sm:mt-8">
                <h2 className="text-sm sm:text-base font-bold text-vinculo-dark mb-2 sm:mb-3">Sobre o Projeto</h2>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                  {project.description || "—"}
                </p>
              </section>

              <OdsTags labels={project.sdgLabels} />

              <GeneralProgress generalProgress={project.generalProgress} />

              {isIncentiveLaw && (
                <FundingProgress progressPercent={project.progressPercent} />
              )}

              {showInterestButton && (
                <div className="mt-8 flex justify-end">
                  <BaseButton
                    type="button"
                    variant="secondary"
                    onClick={() => setInterestModalOpen(true)}
                    disabled={interestButtonDisabled}
                    className="hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <HandshakeOutlinedIcon sx={{ fontSize: 18 }} aria-hidden />
                    {interestButtonLabel}
                  </BaseButton>
                </div>
              )}
            </article>
          )}

          {Boolean(projectId) && !query.isLoading && !query.isError && project && (
            <div className="mt-6">
              <ResponsibleInstitutionCard
                institution={project.responsibleInstitution}
                headerAction={
                  canViewPublicProfile || canReportInstitution ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      {canViewPublicProfile && (
                        <FlexibleButton
                          icon={<AccountCircleOutlinedIcon fontSize="small" />}
                          variant="outline"
                          size="compact"
                          onClick={() => navigate(`/ong/publico/${reportableNpoId}`)}
                        >
                          Ver perfil completo
                        </FlexibleButton>
                      )}
                      {canReportInstitution && (
                        <FlexibleButton
                          icon={<ReportProblemOutlinedIcon fontSize="small" />}
                          variant="attention"
                          size="compact"
                          onClick={() => setIsReportModalOpen(true)}
                        >
                          Denunciar
                        </FlexibleButton>
                      )}
                    </div>
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

          <DemonstrarInteresseModal
            open={interestModalOpen}
            onClose={() => setInterestModalOpen(false)}
            onConfirm={() => void handleConfirmInterest()}
            loading={submittingInterest}
          />
        </div>
      </div>
    </div>
  );
}
