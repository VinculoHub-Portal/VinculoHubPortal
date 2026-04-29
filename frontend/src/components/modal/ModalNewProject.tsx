import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BaseButton } from "../general/BaseButton";
import { Input } from "../general/Input";
import { TextArea } from "../general/TextArea";
import type { FieldErrors, ProjectOdsOption, WizardFormData } from "../../types/wizard.types";

type ModalNewProjectProps = {
  open: boolean;
  formData: Pick<WizardFormData, "nomeProjeto" | "descricaoProjeto" | "metaCaptacao" | "odsProjeto">;
  setFormData: Dispatch<
    SetStateAction<
      Pick<WizardFormData, "nomeProjeto" | "descricaoProjeto" | "metaCaptacao" | "odsProjeto">
    >
  >;
  errors: Pick<FieldErrors, "nomeProjeto" | "descricaoProjeto" | "metaCaptacao" | "odsProjeto">;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
};

const ODS_OPTIONS: Array<{
  value: ProjectOdsOption;
  label: string;
  description: string;
}> = [
  {
    value: "1",
    label: "ODS 1 - Erradicação da Pobreza",
    description: "Projetos de redução de desigualdades e vulnerabilidade.",
  },
  {
    value: "2",
    label: "ODS 2 - Fome Zero",
    description: "Iniciativas de segurança alimentar e agricultura sustentável.",
  },
  {
    value: "3",
    label: "ODS 3 - Saúde e Bem-Estar",
    description: "Ações voltadas à saúde, prevenção e qualidade de vida.",
  },
];

export function ModalNewProject({
  open,
  formData,
  setFormData,
  errors,
  onClose,
  onConfirm,
  isLoading = false,
  confirmLabel = "Finalizar",
  cancelLabel = "Cancelar",
}: ModalNewProjectProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    dialogRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  function toggleOds(value: ProjectOdsOption) {
    setFormData((prev) => ({
      ...prev,
      odsProjeto: prev.odsProjeto.includes(value)
        ? prev.odsProjeto.filter((item) => item !== value)
        : [...prev.odsProjeto, value],
    }));
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-new-project-title"
        tabIndex={-1}
        className="w-full max-w-3xl max-h-[calc(100vh-3rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Novo projeto
            </p>
            <h2
              id="modal-new-project-title"
              className="mt-1 text-2xl font-bold text-vinculo-dark"
            >
              Preencha os dados do projeto
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Informe apenas as informações do projeto e finalize quando estiver pronto.
            </p>
          </div>

          <button
            type="button"
            aria-label="Fechar modal"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <form
          className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-6"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          <div className="flex flex-col gap-6">
            <Input
              id="nomeProjeto"
              label="Nome do projeto"
              isRequired
              placeholder="Ex: Educação para Todos"
              maxLength={255}
              value={formData.nomeProjeto}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  nomeProjeto: e.target.value,
                }))
              }
              error={errors.nomeProjeto}
            />

            <TextArea
              id="descricaoProjeto"
              label="Descrição do projeto"
              isRequired
              placeholder="Descreva o objetivo, impacto e público beneficiado."
              maxLength={1000}
              value={formData.descricaoProjeto}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  descricaoProjeto: e.target.value,
                }))
              }
            />
            {errors.descricaoProjeto && (
              <p className="text-sm text-error -mt-4" role="alert">
                {errors.descricaoProjeto}
              </p>
            )}

            <Input
              id="metaCaptacao"
              label="Meta de captação"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={formData.metaCaptacao}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  metaCaptacao: e.target.value,
                }))
              }
              error={errors.metaCaptacao}
            />

            <fieldset className="border-t border-slate-100 pt-5 border-x-0 border-b-0">
              <legend className="text-vinculo-dark font-semibold text-base mb-1">
                ODS <span className="text-red-500" aria-hidden="true">*</span>
              </legend>
              <p className="text-sm text-slate-500 mb-4">
                Selecione um ou mais ODS relacionados ao primeiro projeto.
              </p>

              <div className="grid grid-cols-1 gap-3">
                {ODS_OPTIONS.map((option) => {
                  const selected = formData.odsProjeto.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleOds(option.value)}
                      className={`flex flex-col gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                        selected
                          ? "border-vinculo-green bg-vinculo-green/10 text-vinculo-dark"
                          : "border-vinculo-gray bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-semibold text-sm">{option.label}</span>
                      <span className="text-xs text-slate-500">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errors.odsProjeto && (
                <p className="text-sm text-error mt-2" role="alert">
                  {errors.odsProjeto}
                </p>
              )}
            </fieldset>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <BaseButton variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
                {cancelLabel}
              </BaseButton>
              <BaseButton
                variant="secondary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Finalizando..." : confirmLabel}
              </BaseButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
