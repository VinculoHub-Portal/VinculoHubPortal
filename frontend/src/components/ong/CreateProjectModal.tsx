import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { BaseButton } from "../general/BaseButton";
import { Input } from "../general/Input";
import { TextArea } from "../general/TextArea";
import { ProjectOdsChips } from "./ProjectOdsChips";
import type { OdsCatalogItem } from "../../api/ods";

export type CreateProjectFormData = {
  projectName: string;
  projectDescription: string;
  projectType: string;
  budgetNeeded: string;
  odsSelection: number[];
};

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectFormData) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  odsOptions: OdsCatalogItem[];
};

type FormErrors = Partial<Record<keyof CreateProjectFormData, string>>;

const INITIAL_FORM_DATA: CreateProjectFormData = {
  projectName: "",
  projectDescription: "",
  projectType: "",
  budgetNeeded: "",
  odsSelection: [],
};

const PROJECT_TYPE_OPTIONS = [
  { value: "social_investment_law", label: "Investimento Social Privado" },
  { value: "tax_incentive_law", label: "Leis de Incentivo" },
];

function validateProject(data: CreateProjectFormData) {
  const errors: FormErrors = {};

  if (!data.projectName.trim()) {
    errors.projectName = "Informe o nome do projeto.";
  }

  if (!data.projectDescription.trim()) {
    errors.projectDescription = "Informe a descrição do projeto.";
  } else if (data.projectDescription.trim().length < 50) {
    errors.projectDescription = "A descrição deve ter no mínimo 50 caracteres.";
  }

  if (!data.projectType) {
    errors.projectType = "Selecione o tipo de projeto.";
  }

  if (data.projectType === "tax_incentive_law" && !data.budgetNeeded.trim()) {
    errors.budgetNeeded = "Informe o valor necessário.";
  }

  if (data.odsSelection.length === 0) {
    errors.odsSelection = "Selecione ao menos um ODS.";
  }

  return errors;
}

export function CreateProjectModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError = null,
  odsOptions,
}: CreateProjectModalProps) {
  const [formData, setFormData] =
    useState<CreateProjectFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});

  if (!open) return null;

  function updateField<Field extends keyof CreateProjectFormData>(
    field: Field,
    value: CreateProjectFormData[Field],
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleOds(id: number) {
    updateField(
      "odsSelection",
      formData.odsSelection.includes(id)
        ? formData.odsSelection.filter((item) => item !== id)
        : [...formData.odsSelection, id],
    );
  }

  function resetForm() {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateProject(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(formData);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-title"
    >
      <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl outline-none">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Cadastrar novo projeto
            </p>
            <h2
              id="create-project-title"
              className="mt-1 text-2xl font-bold text-vinculo-dark"
            >
              Cadastrar Novo Projeto
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Preencha os dados da nova iniciativa da ONG.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar modal"
          >
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {submitError && (
              <p
                className="mb-6 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error"
                role="alert"
              >
                {submitError}
              </p>
            )}

            <div className="flex flex-col gap-6">
              <Input
                id="projectName"
                label="Nome do Projeto"
                isRequired
                placeholder="Ex: Educação para o Futuro"
                maxLength={255}
                value={formData.projectName}
                onChange={(event) =>
                  updateField("projectName", event.target.value)
                }
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
                  onChange={(event) =>
                    updateField("projectDescription", event.target.value)
                  }
                  className="min-h-40"
                />
                {errors.projectDescription && (
                  <p className="mt-1 text-sm text-error" role="alert">
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
                <Input
                  id="budgetNeeded"
                  label="Valor Necessário (R$)"
                  inputMode="decimal"
                  placeholder="Ex: 150.000,00"
                  value={formData.budgetNeeded}
                  onChange={(event) =>
                    updateField("budgetNeeded", event.target.value)
                  }
                  error={errors.budgetNeeded}
                />
              )}

              <fieldset className="md:col-span-2">
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

              <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <BaseButton
                  type="button"
                  variant="ghost"
                  className="w-full bg-transparent! text-slate-600! hover:bg-slate-100! sm:w-fit"
                  onClick={handleClose}
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
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Projeto"}
                </BaseButton>
              </footer>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

type FormSelectProps = {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  onChange: (value: string) => void;
};

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
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border border-vinculo-gray bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark ${
          error ? "!border !border-error focus:!border-error focus:!ring-error" : ""
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
  );
}
