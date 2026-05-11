import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

import { BaseButton } from "../general/BaseButton";
import { Input } from "../general/Input";
import { TextArea } from "../general/TextArea";

export type CreateNoticeFormData = {
  title: string;
  description: string;
  deadline: string;
  category: string;

  // TODO:
  // Adicionar tipagem real do arquivo posteriormente.
  // Exemplo:
  // file: File | null;
};

type CreateNoticeModalProps = {
  open: boolean;
  onClose: () => void;

  onSubmit: (data: CreateNoticeFormData) => void;

  isSubmitting?: boolean;
  submitError?: string | null;
};

type FormErrors = Partial<Record<keyof CreateNoticeFormData, string>>;

const INITIAL_FORM_DATA: CreateNoticeFormData = {
  title: "",
  description: "",
  deadline: "",
  category: "",

  // TODO:
  // file: null,
};

const CATEGORY_OPTIONS = [
  {
    value: "technology",
    label: "Tecnologia",
  },
  {
    value: "education",
    label: "Educação",
  },
  {
    value: "innovation",
    label: "Inovação",
  },
];

function validateNotice(data: CreateNoticeFormData) {
  const errors: FormErrors = {};

  if (!data.title.trim()) {
    errors.title = "Informe o título.";
  }

  if (!data.description.trim()) {
    errors.description = "Informe a descrição.";
  }

  if (!data.deadline.trim()) {
    errors.deadline = "Informe o prazo.";
  }

  if (!data.category.trim()) {
    errors.category = "Selecione uma categoria.";
  }

  // TODO:
  // Adicionar validação do arquivo.
  //
  // Exemplo:
  //
  // if (!data.file) {
  //   errors.file = "Envie um arquivo.";
  // }

  return errors;
}

export function CreateNoticeModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}: CreateNoticeModalProps) {
  const [formData, setFormData] =
    useState<CreateNoticeFormData>(INITIAL_FORM_DATA);

  const [errors, setErrors] = useState<FormErrors>({});

  if (!open) return null;

  function updateField<Field extends keyof CreateNoticeFormData>(
    field: Field,
    value: CreateNoticeFormData[Field],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
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

    const nextErrors = validateNotice(formData);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // TODO:
    // Converter para FormData ao integrar com backend.
    //
    // Exemplo:
    //
    // const payload = new FormData();
    //
    // payload.append("title", formData.title);
    // payload.append("description", formData.description);
    // payload.append("deadline", formData.deadline);
    // payload.append("category", formData.category);
    // payload.append("file", formData.file);
    //
    // onSubmit(payload);

    onSubmit(formData);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-notice-title"
    >
      <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl outline-none">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="create-notice-title"
              className="mt-1 text-2xl font-bold text-slate-900"
            >
              Criar Edital
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Preencha os dados para publicar um novo edital.
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

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {submitError && (
              <p
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {submitError}
              </p>
            )}

            {/* ===================================================== */}
            {/* BOX INFORMATIVO - CRITÉRIO DE ACEITAÇÃO               */}
            {/* ===================================================== */}

            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-800">
              <strong className="block font-semibold">
                Informação Importante
              </strong>

              <p className="mt-1 leading-6">
                Os editais publicados ficarão disponíveis no mural da
                plataforma para visualização dos usuários.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <Input
                id="title"
                label="Título"
                isRequired
                placeholder="Digite o título do edital"
                maxLength={255}
                value={formData.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                error={errors.title}
              />

              <div>
                <TextArea
                  id="description"
                  label="Descrição"
                  isRequired
                  placeholder="Descreva os detalhes do edital..."
                  maxLength={1000}
                  value={formData.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  className="min-h-40"
                />

                {errors.description && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.description}
                  </p>
                )}
              </div>

              <Input
                id="deadline"
                label="Prazo"
                type="date"
                isRequired
                value={formData.deadline}
                onChange={(event) =>
                  updateField("deadline", event.target.value)
                }
                error={errors.deadline}
              />

              <FormSelect
                id="category"
                label="Categoria"
                value={formData.category}
                options={CATEGORY_OPTIONS}
                error={errors.category}
                onChange={(value) => updateField("category", value)}
              />

              {/* ===================================================== */}
              {/* PLACEHOLDER - UPLOAD                                 */}
              {/* ===================================================== */}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-900">
                  Arquivo
                  <span className="text-red-500"> *</span>
                </label>

                {/* TODO:
                    Implementar upload posteriormente.
                    
                    Requisitos:
                    - aceitar PDF, DOCX e TXT
                    - armazenar File no estado
                    - integrar com FormData
                    - exibir nome do arquivo
                    - validar obrigatoriedade
                    
                    Exemplo:
                    
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                */}

                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                  Área reservada para upload de arquivo
                </div>
              </div>

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
                  {isSubmitting ? "Publicando..." : "Publicar Edital"}
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
  options: Array<{
    value: string;
    label: string;
  }>;
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
        className="flex gap-1 text-sm font-semibold text-slate-900"
      >
        {label}
        <span className="text-red-500">*</span>
      </label>

      <select
        id={id}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
          error
            ? "!border !border-red-500 focus:!border-red-500 focus:!ring-red-500"
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
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}