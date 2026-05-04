import { useEffect, useRef, useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { createNewProject } from "../../api/newProject"
import { fetchOdsCatalog, type OdsCatalogItem } from "../../api/ods"
import { Header } from "../../components/general/Header"
import { ModalNewProject } from "../../components/modal/ModalNewProject"
import { OngDashboardMock } from "./OngDashboardMock"
import type { FieldErrors, WizardFormData } from "../../types/wizard.types"

type RoleHomePageProps = {
  title: string
  description: string
  showCreateProjectAction?: boolean
}

type NewProjectFormData = Pick<
  WizardFormData,
  "nomeProjeto" | "tipoProjeto" | "descricaoProjeto" | "metaCaptacao" | "odsProjeto"
>

const INITIAL_NEW_PROJECT_FORM_DATA: NewProjectFormData = {
  nomeProjeto: "",
  tipoProjeto: "",
  descricaoProjeto: "",
  metaCaptacao: "",
  odsProjeto: [],
}

const NEW_PROJECT_ERROR_FIELDS = [
  "nomeProjeto",
  "tipoProjeto",
  "descricaoProjeto",
  "metaCaptacao",
  "odsProjeto",
] as const

function createInitialNewProjectFormData(): NewProjectFormData {
  return {
    ...INITIAL_NEW_PROJECT_FORM_DATA,
    odsProjeto: [],
  }
}

function validateNewProjectForm(data: NewProjectFormData) {
  const errors: Pick<FieldErrors, (typeof NEW_PROJECT_ERROR_FIELDS)[number]> = {}

  if (!data.nomeProjeto.trim()) {
    errors.nomeProjeto = "Informe o nome do projeto."
  }

  if (!data.tipoProjeto) {
    errors.tipoProjeto = "Selecione o tipo do projeto."
  }

  if (!data.descricaoProjeto.trim()) {
    errors.descricaoProjeto = "Informe a descrição do projeto."
  }

  if (data.tipoProjeto === "governamental") {
    if (!data.metaCaptacao.trim()) {
      errors.metaCaptacao = "Informe a meta de captação."
    } else if (Number.isNaN(Number(data.metaCaptacao))) {
      errors.metaCaptacao = "Informe uma meta de captação válida."
    }
  }

  if (data.odsProjeto.length === 0) {
    errors.odsProjeto = "Selecione ao menos um ODS."
  }

  return errors
}

export function RoleHomePage({
  title,
  description,
  showCreateProjectAction = false,
}: RoleHomePageProps) {
  const { getAccessTokenSilently } = useAuth0()
  const timeoutRef = useRef<number | null>(null)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [projectFormData, setProjectFormData] = useState(
    createInitialNewProjectFormData,
  )
  const [projectFormErrors, setProjectFormErrors] = useState<
    Pick<FieldErrors, (typeof NEW_PROJECT_ERROR_FIELDS)[number]>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [odsOptions, setOdsOptions] = useState<OdsCatalogItem[]>([])
  const [isOdsLoading, setIsOdsLoading] = useState(false)
  const [isOdsError, setIsOdsError] = useState(false)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  function resetNewProjectForm() {
    setProjectFormData(createInitialNewProjectFormData())
    setProjectFormErrors({})
  }

  async function loadOdsCatalog() {
    setIsOdsLoading(true)
    setIsOdsError(false)

    try {
      const items = await fetchOdsCatalog()
      setOdsOptions(items)
    } catch {
      setIsOdsError(true)
    } finally {
      setIsOdsLoading(false)
    }
  }

  function openCreateProjectModal() {
    setSubmitError(null)
    resetNewProjectForm()
    setIsCreateProjectModalOpen(true)
    void loadOdsCatalog()
  }

  function closeCreateProjectModal() {
    setIsCreateProjectModalOpen(false)
    setSubmitError(null)
    resetNewProjectForm()
  }

  const setProjectFormDataWithReset = (
    nextState:
      | NewProjectFormData
      | ((prevState: NewProjectFormData) => NewProjectFormData),
  ) => {
    setProjectFormData(nextState)
    setProjectFormErrors({})
  }

  async function handleCreateProject(data: NewProjectFormData) {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const token = await getAccessTokenSilently()
      await createNewProject(data, token)

      closeCreateProjectModal()
      setSuccessMessage("Projeto cadastrado com sucesso!")

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        setSuccessMessage(null)
        timeoutRef.current = null
      }, 5000)
    } catch {
      setSubmitError("Não foi possível cadastrar o projeto. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleConfirm() {
    const errors = validateNewProjectForm(projectFormData)
    setProjectFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    void handleCreateProject(projectFormData)
  }

  if (showCreateProjectAction) {
    return (
      <>
        <OngDashboardMock
          successMessage={successMessage}
          onCreateProject={openCreateProjectModal}
        />
        <ModalNewProject
          open={isCreateProjectModalOpen}
          formData={projectFormData}
          setFormData={setProjectFormDataWithReset}
          errors={projectFormErrors}
          odsOptions={odsOptions}
          isOdsLoading={isOdsLoading}
          isOdsError={isOdsError}
          onClose={closeCreateProjectModal}
          onConfirm={handleConfirm}
          isLoading={isSubmitting}
          submitError={submitError}
        />
      </>
    )
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
  )
}
