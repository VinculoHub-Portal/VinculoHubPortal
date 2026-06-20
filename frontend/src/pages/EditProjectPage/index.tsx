import axios from "axios"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import { BackLink } from "../../components/general/BackLink"
import { BaseButton } from "../../components/general/BaseButton"
import { Header } from "../../components/general/Header"
import { Input } from "../../components/general/Input"
import { ProgressBar } from "../../components/general/ProgressBar"
import { TextArea } from "../../components/general/TextArea"
import { ProjectOdsChips } from "../../components/ong/ProjectOdsChips"
import { useToast } from "../../context/ToastContext"
import { fetchOdsCatalog, type OdsCatalogItem } from "../../api/ods"
import {
  fetchProjectById,
  updateProject,
  type UpdateProjectPayload,
} from "../../api/projects"
import {
  formatCurrencyValue,
  normalizeCurrencyValue,
} from "../../utils/formatCurrency"

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

type EditProjectFormData = {
  projectName: string
  projectDescription: string
  projectType: string
  budgetNeeded: string
  investedAmount: string
  odsSelection: number[]
  progress: string
}

type FormErrors = Partial<Record<keyof EditProjectFormData, string>>

const PROJECT_TYPE_OPTIONS = [
  { value: "social_investment_law", label: "Investimento Social Privado" },
  { value: "tax_incentive_law", label: "Leis de Incentivo" },
]

const TYPE_MAP: Record<string, UpdateProjectPayload["type"]> = {
  social_investment_law: "SOCIAL_INVESTMENT_LAW",
  tax_incentive_law: "TAX_INCENTIVE_LAW",
}

function validateProject(data: EditProjectFormData, currentInvestedAmount: number): FormErrors {
  const errors: FormErrors = {}

  if (!data.projectName.trim()) {
    errors.projectName = "Informe o nome do projeto."
  }

  if (!data.projectDescription.trim()) {
    errors.projectDescription = "Informe a descrição do projeto."
  } else if (data.projectDescription.trim().length < 50) {
    errors.projectDescription = "A descrição deve ter no mínimo 50 caracteres."
  }

  if (!data.projectType) {
    errors.projectType = "Selecione o tipo de projeto."
  }

  if (data.projectType === "tax_incentive_law") {
    const trimmed = data.budgetNeeded.trim()
    if (!trimmed) {
      errors.budgetNeeded = "Informe o valor necessário."
    } else if (Number(trimmed) <= 0) {
      errors.budgetNeeded = "O valor necessário deve ser maior que zero."
    }
  }

  const progressNum = Number(data.progress)
  if (data.progress.trim() !== "" && (!Number.isInteger(progressNum) || progressNum < 0 || progressNum > 100)) {
    errors.progress = "O progresso deve ser um número inteiro entre 0 e 100."
  }

  if (data.projectType === "tax_incentive_law" && data.investedAmount.trim() !== "") {
    const delta = Number(data.investedAmount)
    if (!Number.isFinite(delta)) {
      errors.investedAmount = "Informe um valor válido."
    } else {
      const newTotal = Math.max(0, currentInvestedAmount + delta)
      const budget = Number(data.budgetNeeded) || 0
      if (budget > 0 && newTotal > budget) {
        errors.investedAmount = `O total captado (${BRL.format(newTotal)}) não pode ultrapassar a meta (${BRL.format(budget)}).`
      }
    }
  }

  if (data.odsSelection.length === 0) {
    errors.odsSelection = "Selecione ao menos um ODS."
  }

  return errors
}

export function EditProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()
  const { showToast } = useToast()
  const projectIdNumber = projectId ? Number(projectId) : Number.NaN
  const hasValidProjectId =
    Number.isFinite(projectIdNumber) && projectIdNumber > 0

  const [loadState, setLoadState] = useState<
    "loading" | "error" | "not-found" | "ready"
  >("loading")
  const [formData, setFormData] = useState<EditProjectFormData>({
    projectName: "",
    projectDescription: "",
    projectType: "",
    budgetNeeded: "",
    investedAmount: "",
    odsSelection: [],
    progress: "0",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [odsOptions, setOdsOptions] = useState<OdsCatalogItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentInvestedAmount, setCurrentInvestedAmount] = useState(0)
  const budgetNeededInputRef = useRef<HTMLInputElement | null>(null)
  const effectiveLoadState = !hasValidProjectId ? "not-found" : loadState

  useEffect(() => {
    if (!hasValidProjectId) {
      return
    }

    let active = true

    async function load() {
      try {
        const token = await getAccessTokenSilently()
        const [project, ods] = await Promise.all([
          fetchProjectById(projectIdNumber, token),
          fetchOdsCatalog(),
        ])

        if (!active) return

        setOdsOptions(ods)

        const rawType = project.type ?? ""
        const formType =
          rawType === "SOCIAL_INVESTMENT_LAW"
            ? "social_investment_law"
            : rawType === "TAX_INCENTIVE_LAW"
              ? "tax_incentive_law"
              : ""

        setCurrentInvestedAmount(project.investedAmount != null ? Number(project.investedAmount) : 0)

        setFormData({
          projectName: project.title ?? "",
          projectDescription: project.description ?? "",
          projectType: formType,
          budgetNeeded: project.budgetNeeded != null ? String(project.budgetNeeded) : "",
          investedAmount: "",
          odsSelection: project.ods?.map((o) => o.id) ?? [],
          progress: project.progress != null ? String(project.progress) : "0",
        })
        setLoadState("ready")
      } catch (err) {
        if (!active) return
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setLoadState("not-found")
        } else {
          setLoadState("error")
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [getAccessTokenSilently, hasValidProjectId, projectIdNumber])

  const previewInvestedTotal = useMemo(() => {
    const delta = Number(formData.investedAmount)
    if (!formData.investedAmount.trim() || !Number.isFinite(delta)) return null
    return Math.max(0, currentInvestedAmount + delta)
  }, [formData.investedAmount, currentInvestedAmount])

  function updateField<K extends keyof EditProjectFormData>(
    field: K,
    value: EditProjectFormData[K],
  ) {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function toggleOds(id: number) {
    updateField(
      "odsSelection",
      formData.odsSelection.includes(id)
        ? formData.odsSelection.filter((item) => item !== id)
        : [...formData.odsSelection, id],
    )
  }

  function moveCaretToEnd(input: HTMLInputElement) {
    const end = input.value.length
    input.setSelectionRange(end, end)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateProject(formData, currentInvestedAmount)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const token = await getAccessTokenSilently()
      const apiType = TYPE_MAP[formData.projectType] ?? "SOCIAL_INVESTMENT_LAW"
      const budgetRaw = normalizeCurrencyValue(formData.budgetNeeded)

      const progressValue = formData.progress.trim() !== "" ? Number(formData.progress) : 0
      const investedDelta = formData.investedAmount.trim() ? Number(formData.investedAmount) : null

      await updateProject(
        Number(projectId),
        {
          title: formData.projectName,
          description: formData.projectDescription,
          budgetNeeded:
            apiType === "TAX_INCENTIVE_LAW" && budgetRaw
              ? Number(budgetRaw)
              : null,
          investedAmount:
            apiType === "TAX_INCENTIVE_LAW" && investedDelta != null
              ? investedDelta
              : null,
          odsIds: formData.odsSelection,
          type: apiType,
          progress: progressValue,
        },
        token,
      )

      showToast("Projeto atualizado", "success")
      navigate("/ong/projetos")
    } catch (err) {
      let msg = "Falha ao atualizar projeto. Tente novamente."
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          msg = "Você não tem permissão para editar este projeto."
        } else if (err.response?.status === 404) {
          msg = "Projeto não encontrado."
        }
      }
      setSubmitError(msg)
      showToast(msg, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 sm:px-6">
        <BackLink
          label="Voltar para Meus Projetos"
          onClick={() => navigate("/ong/projetos")}
        />

        {effectiveLoadState === "loading" && (
          <p className="text-sm text-slate-500" aria-live="polite">
            Carregando projeto...
          </p>
        )}

        {effectiveLoadState === "not-found" && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-vinculo-dark">
              Projeto não encontrado.
            </p>
            <BaseButton
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/ong/projetos")}
            >
              Voltar para Meus Projetos
            </BaseButton>
          </div>
        )}

        {effectiveLoadState === "error" && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700"
            role="alert"
          >
            Não foi possível carregar o projeto. Tente novamente.
          </div>
        )}

        {effectiveLoadState === "ready" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-vinculo-dark">
              Editar Projeto
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Atualize as informações do projeto
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
              {submitError && (
                <p
                  className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error"
                  role="alert"
                >
                  {submitError}
                </p>
              )}

              <Input
                id="projectName"
                label="Nome do Projeto"
                isRequired
                placeholder="Ex: Educação para o Futuro"
                maxLength={255}
                value={formData.projectName}
                onChange={(e) => updateField("projectName", e.target.value)}
                error={errors.projectName}
              />

              <div>
                <TextArea
                  id="projectDescription"
                  label="Descrição do Projeto"
                  isRequired
                  placeholder="Descreva os objetivos e público-alvo do projeto..."
                  maxLength={500}
                  value={formData.projectDescription}
                  onChange={(e) =>
                    updateField("projectDescription", e.target.value)
                  }
                  className="min-h-40"
                  aria-invalid={Boolean(errors.projectDescription)}
                  aria-describedby={
                    errors.projectDescription
                      ? "projectDescription-error"
                      : undefined
                  }
                />
                {errors.projectDescription && (
                  <p
                    id="projectDescription-error"
                    className="mt-1 text-sm text-error"
                    role="alert"
                  >
                    {errors.projectDescription}
                  </p>
                )}
              </div>

              <FormSelect
                id="projectType"
                label="Tipo de Projeto"
                value={formData.projectType}
                options={PROJECT_TYPE_OPTIONS}
                error={errors.projectType}
                onChange={(value) => updateField("projectType", value)}
              />

              {formData.projectType === "tax_incentive_law" && (
                <>
                <Input
                  id="budgetNeeded"
                  label="Valor Necessário (R$)"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="R$ 0,00"
                  value={formatCurrencyValue(formData.budgetNeeded)}
                  inputRef={budgetNeededInputRef}
                  onChange={(e) =>
                    updateField(
                      "budgetNeeded",
                      normalizeCurrencyValue(e.target.value),
                    )
                  }
                  onKeyDown={(e) => {
                    const key = e.key
                    if (/^\d$/.test(key)) {
                      e.preventDefault()
                      updateField(
                        "budgetNeeded",
                        normalizeCurrencyValue(
                          `${formData.budgetNeeded}${key}`,
                        ),
                      )
                      return
                    }
                    if (key === "Backspace" || key === "Delete") {
                      e.preventDefault()
                      updateField(
                        "budgetNeeded",
                        formData.budgetNeeded.slice(0, -1),
                      )
                      return
                    }
                    if (
                      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)
                    ) {
                      requestAnimationFrame(() => {
                        if (budgetNeededInputRef.current)
                          moveCaretToEnd(budgetNeededInputRef.current)
                      })
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault()
                    const pastedDigits = e.clipboardData
                      .getData("text")
                      .replace(/\D/g, "")
                    if (!pastedDigits) return
                    updateField(
                      "budgetNeeded",
                      normalizeCurrencyValue(
                        `${formData.budgetNeeded}${pastedDigits}`,
                      ),
                    )
                  }}
                  onClick={() => {
                    if (budgetNeededInputRef.current)
                      moveCaretToEnd(budgetNeededInputRef.current)
                  }}
                  onFocus={(e) => moveCaretToEnd(e.currentTarget)}
                  onMouseUp={(e) => moveCaretToEnd(e.currentTarget)}
                  error={errors.budgetNeeded}
                />

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="investedAmount"
                    className="text-sm font-semibold text-vinculo-dark"
                  >
                    Registrar aporte captado (R$)
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Captado atual:{" "}
                    <strong className="text-vinculo-dark">
                      {BRL.format(currentInvestedAmount)}
                    </strong>
                    {" · "}
                    Meta:{" "}
                    <strong className="text-vinculo-dark">
                      {BRL.format(Number(formData.budgetNeeded) || 0)}
                    </strong>
                  </div>
                  <p className="text-sm text-slate-500">
                    Informe o valor do aporte. Use um número negativo para corrigir o total para baixo.
                  </p>
                  <input
                    id="investedAmount"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5000 ou -2000"
                    value={formData.investedAmount}
                    onChange={(e) => updateField("investedAmount", e.target.value)}
                    className={`w-full rounded-xl border border-vinculo-gray bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark${
                      errors.investedAmount
                        ? " !border !border-error focus:!border-error focus:!ring-error"
                        : ""
                    }`}
                  />
                  {previewInvestedTotal != null && (
                    <p className="text-sm text-slate-500">
                      Novo total após ajuste:{" "}
                      <strong className="text-vinculo-dark">
                        {BRL.format(previewInvestedTotal)}
                      </strong>
                    </p>
                  )}
                  {errors.investedAmount && (
                    <p className="text-sm text-error" role="alert">
                      {errors.investedAmount}
                    </p>
                  )}
                </div>
                </>
              )}

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-vinculo-dark">
                  Objetivos de Desenvolvimento Sustentável (ODS)
                  <span className="text-red-500"> *</span>
                </legend>
                <p className="mb-4 text-sm text-slate-500">
                  Selecione um ou mais ODS relacionados ao projeto.
                </p>
                <ProjectOdsChips
                  options={odsOptions}
                  selectedIds={formData.odsSelection}
                  onToggle={toggleOds}
                />
                {errors.odsSelection && (
                  <p className="mt-2 text-sm text-error" role="alert">
                    {errors.odsSelection}
                  </p>
                )}
              </fieldset>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="progress"
                  className="text-sm font-semibold text-vinculo-dark"
                >
                  Progresso do Projeto (%)
                </label>
                <p className="text-sm text-slate-500">
                  Informe o percentual de conclusão geral do projeto (0 a 100).
                </p>
                <ProgressBar
                  value={Number(formData.progress)}
                  ariaLabel="Progresso do projeto"
                />
                <div className="flex items-center gap-3 mt-3">
                  <input
                    id="progress"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={formData.progress}
                    onChange={(e) => updateField("progress", e.target.value)}
                    aria-hidden
                    className="flex-1 accent-vinculo-green"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.progress}
                    onChange={(e) => updateField("progress", e.target.value)}
                    className={`w-20 rounded-xl border border-vinculo-gray bg-white px-3 py-2 text-center text-slate-900 outline-none transition-all focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark ${
                      errors.progress
                        ? "!border !border-error focus:!border-error focus:!ring-error"
                        : ""
                    }`}
                  />
                  <span className="text-sm text-slate-500">%</span>
                </div>
                {errors.progress && (
                  <p className="mt-1 text-sm text-error" role="alert">
                    {errors.progress}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <BaseButton
                  type="button"
                  variant="ghost"
                  className="w-full bg-transparent! text-slate-600! hover:bg-slate-100! sm:w-fit"
                  onClick={() => navigate("/ong/projetos")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </BaseButton>
                <BaseButton
                  type="submit"
                  variant="secondary"
                  className="w-full px-8 py-3 shadow-sm sm:w-fit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </BaseButton>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

type FormSelectProps = {
  id: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  error?: string
  onChange: (value: string) => void
}

function FormSelect({
  id,
  label,
  value,
  options,
  error,
  onChange,
}: FormSelectProps) {
  return (
    <div className="flex w-full flex-col gap-1 text-left">
      <label
        htmlFor={id}
        className="flex gap-1 text-sm font-semibold text-vinculo-dark"
      >
        {label}
        <span className="text-red-500">*</span>
      </label>
      <select
        id={id}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-vinculo-gray bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark ${
          error
            ? "!border !border-error focus:!border-error focus:!ring-error"
            : ""
        }`}
      >
        <option value="" disabled>
          Selecione
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
