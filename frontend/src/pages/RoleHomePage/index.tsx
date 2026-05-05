import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Header } from "../../components/general/Header";
import { ModalNewProject } from "../../components/modal/ModalNewProject";
import { OngDashboardMock } from "./OngDashboardMock";
import { createProject, type CreateProjectPayload } from "../../api/projects";
import { fetchOdsCatalog, type OdsCatalogItem } from "../../api/ods";
import type { FieldErrors, WizardFormData } from "../../types/wizard.types";

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
  type NewProjectFormData = Pick<
    WizardFormData,
    | "nomeProjeto"
    | "tipoProjeto"
    | "descricaoProjeto"
    | "metaCaptacao"
    | "odsProjeto"
  >;

  type NewProjectErrors = Pick<
    FieldErrors,
    | "nomeProjeto"
    | "tipoProjeto"
    | "descricaoProjeto"
    | "metaCaptacao"
    | "odsProjeto"
  >;

  const INITIAL_NEW_PROJECT_FORM: NewProjectFormData = {
    nomeProjeto: "",
    tipoProjeto: "",
    descricaoProjeto: "",
    metaCaptacao: "",
    odsProjeto: [],
  };

  const { getAccessTokenSilently } = useAuth0();
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [odsOptions, setOdsOptions] = useState<OdsCatalogItem[]>([]);
  const [newProjectFormData, setNewProjectFormData] =
    useState<NewProjectFormData>(INITIAL_NEW_PROJECT_FORM);
  const [newProjectErrors, setNewProjectErrors] = useState<NewProjectErrors>(
    {},
  );

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
    setNewProjectErrors({});
    setNewProjectFormData(INITIAL_NEW_PROJECT_FORM);
    setModalKey((current) => current + 1);
  }

  function validateNewProject(data: NewProjectFormData) {
    const errors: NewProjectErrors = {};

    if (!data.nomeProjeto.trim()) {
      errors.nomeProjeto = "Informe o nome do projeto.";
    }

    if (!data.descricaoProjeto.trim()) {
      errors.descricaoProjeto = "Informe a descrição do projeto.";
    } else if (data.descricaoProjeto.trim().length < 50) {
      errors.descricaoProjeto = "A descrição deve ter no mínimo 50 caracteres.";
    }

    if (!data.tipoProjeto) {
      errors.tipoProjeto = "Selecione o tipo do projeto.";
    }

    if (data.tipoProjeto === "governamental" && !data.metaCaptacao.trim()) {
      errors.metaCaptacao = "Informe a meta de captação.";
    }

    if (!data.odsProjeto.length) {
      errors.odsProjeto = "Selecione ao menos um ODS.";
    }

    return errors;
  }

  async function handleCreateProject() {
    const nextErrors = validateNewProject(newProjectFormData);
    setNewProjectErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getAccessTokenSilently();
      const budgetValue =
        newProjectFormData.tipoProjeto === "governamental"
          ? Number(newProjectFormData.metaCaptacao) / 100
          : 0;
      const typeMap: Record<string, CreateProjectPayload["type"]> = {
        social: "SOCIAL",
        governamental: "GOVERNMENTAL",
      };

      await createProject(
        {
          title: newProjectFormData.nomeProjeto,
          description: newProjectFormData.descricaoProjeto,
          budgetNeeded: budgetValue,
          odsIds: newProjectFormData.odsProjeto.map(Number),
          type: typeMap[newProjectFormData.tipoProjeto] ?? "SOCIAL",
          focusArea: newProjectFormData.tipoProjeto,
          mainObjective: newProjectFormData.descricaoProjeto,
        },
        token,
      );
      setIsCreateProjectModalOpen(false);
      setModalKey((k) => k + 1);
      setNewProjectErrors({});
      setNewProjectFormData(INITIAL_NEW_PROJECT_FORM);
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
        <ModalNewProject
          key={modalKey}
          open={isCreateProjectModalOpen}
          formData={newProjectFormData}
          setFormData={setNewProjectFormData}
          errors={newProjectErrors}
          isOdsLoading={false}
          isOdsError={false}
          onClose={closeCreateProjectModal}
          onConfirm={handleCreateProject}
          isLoading={isSubmitting}
          submitError={submitError}
          odsOptions={odsOptions}
          confirmLabel="Cadastrar Projeto"
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
