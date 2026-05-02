import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { BaseButton } from "../general/BaseButton";
import { Input } from "../general/Input";
import { TextArea } from "../general/TextArea";
import {
  ProjectOdsChips,
  type ProjectOdsOption,
} from "./ProjectOdsChips";

export type CreateProjectFormData = {
  nomeProjeto: string;
  descricaoProjeto: string;
  tipoProjeto: string;
  areaAtuacao: string;
  valorNecessario: string;
  prazoCaptacao: string;
  numeroBeneficiados: string;
  localidade: string;
  odsProjeto: ProjectOdsOption[];
  objetivoPrincipal: string;
};

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectFormData) => void;
};

type FormErrors = Partial<Record<keyof CreateProjectFormData, string>>;

const INITIAL_FORM_DATA: CreateProjectFormData = {
  nomeProjeto: "",
  descricaoProjeto: "",
  tipoProjeto: "",
  areaAtuacao: "",
  valorNecessario: "",
  prazoCaptacao: "",
  numeroBeneficiados: "",
  localidade: "",
  odsProjeto: [],
  objetivoPrincipal: "",
};

const PROJECT_TYPE_OPTIONS = [
  { value: "social", label: "Social" },
  { value: "governamental", label: "Governamental" },
  { value: "cultural", label: "Cultural" },
  { value: "ambiental", label: "Ambiental" },
];

const AREA_OPTIONS = [
  { value: "educacao", label: "Educacao" },
  { value: "saude", label: "Saude" },
  { value: "cultura", label: "Cultura" },
  { value: "meio-ambiente", label: "Meio ambiente" },
  { value: "assistencia-social", label: "Assistencia social" },
];

function validateProject(data: CreateProjectFormData) {
  const errors: FormErrors = {};

  if (!data.nomeProjeto.trim()) {
    errors.nomeProjeto = "Informe o nome do projeto.";
  }

  if (!data.descricaoProjeto.trim()) {
    errors.descricaoProjeto = "Informe a descricao do projeto.";
  }

  if (!data.tipoProjeto) {
    errors.tipoProjeto = "Selecione o tipo de projeto.";
  }

  if (!data.areaAtuacao) {
    errors.areaAtuacao = "Selecione a area de atuacao.";
  }

  return errors;
}

export function CreateProjectModal({
  open,
  onClose,
  onSubmit,
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

  function toggleOds(value: ProjectOdsOption) {
    updateField(
      "odsProjeto",
      formData.odsProjeto.includes(value)
        ? formData.odsProjeto.filter((item) => item !== value)
        : [...formData.odsProjeto, value],
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
    resetForm();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 md:px-8">
          <div>
            <h2
              id="create-project-title"
              className="text-2xl font-bold text-vinculo-dark"
            >
              Cadastrar Novo Projeto
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Preencha os dados da nova iniciativa da ONG.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-vinculo-dark"
            aria-label="Fechar modal"
          >
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-7 md:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  id="nomeProjeto"
                  label="Nome do Projeto"
                  isRequired
                  placeholder="Ex: Educacao para o Futuro"
                  maxLength={255}
                  value={formData.nomeProjeto}
                  onChange={(event) =>
                    updateField("nomeProjeto", event.target.value)
                  }
                  error={errors.nomeProjeto}
                />
              </div>

              <div className="md:col-span-2">
                <TextArea
                  id="descricaoProjeto"
                  label="Descricao do Projeto"
                  isRequired
                  placeholder="Descreva os objetivos e publico-alvo do projeto..."
                  maxLength={1000}
                  value={formData.descricaoProjeto}
                  onChange={(event) =>
                    updateField("descricaoProjeto", event.target.value)
                  }
                  className="min-h-40"
                />
                {errors.descricaoProjeto && (
                  <p className="mt-1 text-sm text-error" role="alert">
                    {errors.descricaoProjeto}
                  </p>
                )}
              </div>

              <FormSelect
                id="tipoProjeto"
                label="Tipo de Projeto"
                value={formData.tipoProjeto}
                options={PROJECT_TYPE_OPTIONS}
                error={errors.tipoProjeto}
                onChange={(value) => updateField("tipoProjeto", value)}
              />

              <FormSelect
                id="areaAtuacao"
                label="Area de Atuacao"
                value={formData.areaAtuacao}
                options={AREA_OPTIONS}
                error={errors.areaAtuacao}
                onChange={(value) => updateField("areaAtuacao", value)}
              />

              <Input
                id="valorNecessario"
                label="Valor Necessario (R$)"
                inputMode="decimal"
                placeholder="Ex: 150.000,00"
                value={formData.valorNecessario}
                onChange={(event) =>
                  updateField("valorNecessario", event.target.value)
                }
              />

              <Input
                id="prazoCaptacao"
                label="Prazo de Captacao"
                placeholder="Ex: 6 meses"
                value={formData.prazoCaptacao}
                onChange={(event) =>
                  updateField("prazoCaptacao", event.target.value)
                }
              />

              <Input
                id="numeroBeneficiados"
                label="Numero de Beneficiados"
                inputMode="numeric"
                placeholder="Ex: 120"
                value={formData.numeroBeneficiados}
                onChange={(event) =>
                  updateField("numeroBeneficiados", event.target.value)
                }
              />

              <Input
                id="localidade"
                label="Localidade"
                placeholder="Ex: Sao Paulo, SP"
                value={formData.localidade}
                onChange={(event) =>
                  updateField("localidade", event.target.value)
                }
              />

              <fieldset className="md:col-span-2">
                <legend className="mb-3 text-sm font-semibold text-vinculo-dark">
                  Objetivos de Desenvolvimento Sustentavel (ODS)
                </legend>
                <ProjectOdsChips
                  selectedValues={formData.odsProjeto}
                  onToggle={toggleOds}
                />
              </fieldset>

              <div className="md:col-span-2">
                <TextArea
                  id="objetivoPrincipal"
                  label="Objetivo Principal"
                  placeholder="Descreva o principal objetivo que este projeto pretende alcancar..."
                  maxLength={600}
                  value={formData.objetivoPrincipal}
                  onChange={(event) =>
                    updateField("objetivoPrincipal", event.target.value)
                  }
                  className="min-h-36"
                />
              </div>
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:justify-end md:px-8">
            <BaseButton
              type="button"
              variant="ghost"
              className="w-full bg-transparent! text-slate-600! hover:bg-slate-100! sm:w-fit"
              onClick={handleClose}
            >
              Cancelar
            </BaseButton>
            <BaseButton
              type="submit"
              variant="secondary"
              className="w-full px-8 py-3 shadow-sm sm:w-fit"
            >
              Cadastrar Projeto
            </BaseButton>
          </footer>
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
