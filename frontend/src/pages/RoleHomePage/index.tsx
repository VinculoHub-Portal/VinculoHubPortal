import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Header } from "../../components/general/Header";
import {
  CreateProjectModal,
  type CreateProjectFormData,
} from "../../components/ong/CreateProjectModal";
import { OngDashboardMock } from "./OngDashboardMock";
import { createProject, type CreateProjectPayload } from "../../api/projects";
import { fetchOdsCatalog, type OdsCatalogItem } from "../../api/ods";
import { normalizeCurrencyValue } from "../../utils/formatCurrency";

type RoleHomePageProps = {
  title: string;
  description: string;
  showCreateProjectAction?: boolean;
};

export function RoleHomePage({
  title,
  description,
  showCreateProjectAction = false,
}: RoleHomePageProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [odsOptions, setOdsOptions] = useState<OdsCatalogItem[]>([]);

  useEffect(() => {
    if (!showCreateProjectAction) {
      return;
    }

    fetchOdsCatalog().then(setOdsOptions).catch(() => {});
  }, [showCreateProjectAction]);

  function openCreateProjectModal() {
    setSubmitError(null);
    setIsCreateProjectModalOpen(true);
  }

  function closeCreateProjectModal() {
    setIsCreateProjectModalOpen(false);
    setSubmitError(null);
    setModalKey((current) => current + 1);
  }

  async function handleCreateProject(data: CreateProjectFormData) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getAccessTokenSilently();
      const budgetRaw = normalizeCurrencyValue(data.budgetNeeded);
      const typeMap: Record<string, CreateProjectPayload["type"]> = {
        social_investment_law: "SOCIAL_INVESTMENT_LAW",
        tax_incentive_law: "TAX_INCENTIVE_LAW",
      };
      await createProject(
        {
          title: data.projectName,
          description: data.projectDescription,
          budgetNeeded: budgetRaw ? Number(budgetRaw) : null,
          odsIds: data.odsSelection,
          type: typeMap[data.projectType] ?? "SOCIAL_INVESTMENT_LAW",
        },
        token,
      );
      setIsCreateProjectModalOpen(false);
      setModalKey((k) => k + 1);
      setSuccessMessage("Projeto cadastrado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setSubmitError("Não foi possível cadastrar o projeto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (showCreateProjectAction) {
    return (
      <>
        <OngDashboardMock
          successMessage={successMessage}
          onCreateProject={openCreateProjectModal}
        />
        <CreateProjectModal
          key={modalKey}
          open={isCreateProjectModalOpen}
          onClose={closeCreateProjectModal}
          onSubmit={handleCreateProject}
          isSubmitting={isSubmitting}
          submitError={submitError}
          odsOptions={odsOptions}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      {successMessage && (
        <div className="max-w-4xl mx-auto w-full px-6">
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-medium text-green-800">
            {successMessage}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto w-full px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-vinculo-dark">{title}</h1>
            <p className="mt-4 text-slate-700">{description}</p>
          </div>
        </div>

      </main>
    </div>
  );
}
