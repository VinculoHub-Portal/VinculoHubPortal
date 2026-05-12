import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

export type CreateNoticeFormData = {
  title: string;
  description: string;
  deadline: string;
  category: string;
  file: File | null;
};

type CreateNoticeModalProps = {
  open: boolean;
  onClose: () => void;

// TODO:
// Revisar integração real do submit com backend.
// - endpoint
// - service/API layer
// - action responsável pelo POST
// - contrato esperado pelo backend
// - tratamento de erro da request
//
// Exemplo futuro:
//
// await noticeService.create(payload);
//
// ou:
//
// await api.post("/notices", payload);
onSubmit: (data: FormData) => Promise<void>;

  isSubmitting?: boolean;
  submitError?: string | null;
};

type FormErrors = Partial<
  Record<keyof CreateNoticeFormData, string>
>;

const INITIAL_FORM_DATA: CreateNoticeFormData = {
  title: "",
  description: "",
  deadline: "",
  category: "",
  file: null,
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

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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

  if (!data.file) {
    errors.file = "Envie um arquivo.";
  }

  if (
    data.file &&
    !ACCEPTED_FILE_TYPES.includes(data.file.type)
  ) {
    errors.file =
      "Formato inválido. Utilize PDF, DOCX ou TXT.";
  }

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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const nextErrors = validateNotice(formData);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = new FormData();

    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("deadline", formData.deadline);
    payload.append("category", formData.category);

    if (formData.file) {
      payload.append("file", formData.file);
    }

    // TODO:
    // Revisar integração final da action/service/API.
    //
    // Dependências de domínio:
    // - implementação real da request HTTP
    // - endpoint do backend
    // - service responsável
    // - estratégia de tratamento de erro
    // - autenticação/interceptors (se existirem)
    //
    // Exemplo futuro:
    //
    // await noticeService.create(payload);
    //
    // ou:
    //
    // await api.post("/notices", payload);
    await onSubmit(payload);

    handleClose();
  }

  return (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-[2px]"
    role="dialog"
    aria-modal="true"
    aria-labelledby="create-notice-title"
  >
    {/* ===================================================== */}
    {/* MODAL CONTAINER                                       */}
    {/* ===================================================== */}

    <div className="w-full max-w-[580px] rounded-[20px] bg-[#F8F6F3] shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
      {/* ===================================================== */}
      {/* HEADER                                                */}
      {/* ===================================================== */}

      <header className="flex items-start justify-between px-6 pb-1 pt-6">
        <div>
          <h2
            id="create-notice-title"
            className="text-[1.65rem] font-bold tracking-[-0.02em] text-[#0056A6]"
          >
            Cadastrar Novo Edital
          </h2>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-200/70 hover:text-slate-700"
          aria-label="Fechar modal"
        >
          <CloseIcon sx={{ fontSize: 22 }} />
        </button>
      </header>

      {/* ===================================================== */}
      {/* FORM                                                  */}
      {/* ===================================================== */}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 px-6 pb-6 pt-3">
          {/* ===================================================== */}
          {/* SUBMIT ERROR                                          */}
          {/* ===================================================== */}

          {submitError && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
              role="alert"
            >
              {submitError}
            </div>
          )}

          {/* ===================================================== */}
          {/* TITLE FIELD                                           */}
          {/* ===================================================== */}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="title"
              className="text-[0.92rem] font-semibold text-[#232323]"
            >
              Título do Edital
              <span className="text-red-500"> *</span>
            </label>

            <input
              id="title"
              type="text"
              placeholder="Ex: Edital de Cultura 2026"
              maxLength={255}
              value={formData.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className={`h-[44px] rounded-[11px] border bg-white px-4 text-[14px] text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
                errors.title
                  ? "border-red-400 focus:ring-red-200"
                  : "border-slate-200 focus:border-[#0056A6] focus:ring-[#0056A6]/10"
              }`}
            />

            {errors.title && (
              <p className="text-sm text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          {/* ===================================================== */}
          {/* DESCRIPTION FIELD                                     */}
          {/* ===================================================== */}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-[0.92rem] font-semibold text-[#232323]"
            >
              Descrição
              <span className="text-red-500"> *</span>
            </label>

            <textarea
              id="description"
              placeholder="Descreva os objetivos e público-alvo do edital..."
              maxLength={1000}
              value={formData.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              className={`min-h-[78px] resize-none rounded-[11px] border bg-white px-4 py-3 text-[14px] text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
                errors.description
                  ? "border-red-400 focus:ring-red-200"
                  : "border-slate-200 focus:border-[#0056A6] focus:ring-[#0056A6]/10"
              }`}
            />

            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          {/* ===================================================== */}
          {/* DEADLINE + CATEGORY                                   */}
          {/* ===================================================== */}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* DEADLINE */}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="deadline"
                className="text-[0.92rem] font-semibold text-[#232323]"
              >
                Prazo de Inscrição
                <span className="text-red-500"> *</span>
              </label>

              <input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(event) =>
                  updateField(
                    "deadline",
                    event.target.value,
                  )
                }
                className={`h-[44px] rounded-[11px] border bg-white px-4 text-[14px] text-slate-700 outline-none transition-all focus:ring-2 ${
                  errors.deadline
                    ? "border-red-400 focus:ring-red-200"
                    : "border-slate-200 focus:border-[#0056A6] focus:ring-[#0056A6]/10"
                }`}
              />

              {errors.deadline && (
                <p className="text-sm text-red-600">
                  {errors.deadline}
                </p>
              )}
            </div>

            {/* CATEGORY */}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="category"
                className="text-[0.92rem] font-semibold text-[#232323]"
              >
                Categoria/ODS
                <span className="text-red-500"> *</span>
              </label>

              <select
                id="category"
                value={formData.category}
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target.value,
                  )
                }
                className={`h-[44px] rounded-[11px] border bg-white px-4 text-[14px] text-slate-700 outline-none transition-all focus:ring-2 ${
                  errors.category
                    ? "border-red-400 focus:ring-red-200"
                    : "border-slate-200 focus:border-[#0056A6] focus:ring-[#0056A6]/10"
                }`}
              >
                <option value="" disabled>
                  Selecione...
                </option>

                {CATEGORY_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="text-sm text-red-600">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* ===================================================== */}
          {/* FILE UPLOAD                                           */}
          {/* ===================================================== */}

          <div className="flex flex-col gap-2">
            <label className="text-[0.92rem] font-semibold text-[#232323]">
              Arquivo do Edital
              <span className="text-red-500"> *</span>
              <span className="font-medium text-slate-500">
                {" "}
                (PDF, DOCX, TXT)
              </span>
            </label>

            <label className="group flex min-h-[72px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-slate-300 bg-white px-4 py-4 transition-all hover:border-[#0056A6]/40 hover:bg-slate-50">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0] ?? null;

                  updateField("file", file);
                }}
              />

              <div className="flex flex-col items-center gap-1 text-center">
                <div className="text-[18px] text-slate-400 transition-all group-hover:text-[#0056A6]">
                  ↑
                </div>

                <div className="text-[13px] font-medium text-slate-600">
                  Clique para selecionar arquivo
                </div>
              </div>
            </label>

            <p className="text-[11px] text-slate-500">
              Formatos aceitos: PDF, DOCX, TXT.
              Tamanho máximo: 10MB
            </p>

            {formData.file && (
              <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
                Arquivo selecionado:
                <strong className="ml-1">
                  {formData.file.name}
                </strong>
              </div>
            )}

            {errors.file && (
              <p className="text-sm text-red-600">
                {errors.file}
              </p>
            )}
          </div>

          {/* ===================================================== */}
          {/* INFO BOX                                              */}
          {/* ===================================================== */}

          <div className="rounded-[12px] border border-[#B7D4FF] bg-[#EEF5FF] px-4 py-3 text-[12.5px] leading-5 text-[#295EC7]">
            <strong>Nota:</strong> Este edital será
            exibido como um mural informativo. As ONGs
            não poderão se candidatar diretamente pela
            plataforma.
          </div>

          {/* ===================================================== */}
          {/* FOOTER                                                */}
          {/* ===================================================== */}

          <footer className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-[40px] rounded-[11px] border border-slate-200 bg-white px-5 text-[13px] font-medium text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[40px] rounded-[11px] bg-[#69C36B] px-5 text-[13px] font-medium text-white transition-all hover:bg-[#58b35b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Publicando..."
                : "Publicar Edital"}
            </button>
          </footer>
        </div>
      </form>
    </div>
  </div>
  );
}

/*type FormSelectProps = {
  id: string;
  label: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  error?: string;
  onChange: (value: string) => void;
};*/

/*function FormSelect({
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
        onChange={(event) =>
          onChange(event.target.value)
        }
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
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}*/