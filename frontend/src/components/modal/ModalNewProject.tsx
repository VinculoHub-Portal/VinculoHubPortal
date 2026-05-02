import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BaseButton } from "../general/BaseButton";
import { Input } from "../general/Input";
import { OdsCards } from "../register/OdsCards";
import { TextArea } from "../general/TextArea";
import type { OdsCatalogItem } from "../../api/ods";
import type { FieldErrors, WizardFormData } from "../../types/wizard.types";
import {
  formatCurrencyValue,
  normalizeCurrencyValue,
} from "../../utils/formatCurrency";

type ModalNewProjectProps = {
  open: boolean;
  formData: Pick<
    WizardFormData,
    "nomeProjeto" | "tipoProjeto" | "descricaoProjeto" | "metaCaptacao" | "odsProjeto"
  >;
  setFormData: Dispatch<
    SetStateAction<
      Pick<
        WizardFormData,
        "nomeProjeto" | "tipoProjeto" | "descricaoProjeto" | "metaCaptacao" | "odsProjeto"
      >
    >
  >;
  errors: Pick<
    FieldErrors,
    "nomeProjeto" | "tipoProjeto" | "descricaoProjeto" | "metaCaptacao" | "odsProjeto"
  >;
  odsOptions: OdsCatalogItem[];
  isOdsLoading: boolean;
  isOdsError: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
};

const PROJECT_TYPE_OPTIONS: Array<{
  value: Exclude<WizardFormData["tipoProjeto"], "">;
  label: string;
  description: string;
}> = [
  {
    value: "social",
    label: "Social",
    description: "Não exige meta de captação.",
  },
  {
    value: "governamental",
    label: "Governamental",
    description: "Exige meta de captação.",
  },
];

export function ModalNewProject({
  open,
  formData,
  setFormData,
  errors,
  odsOptions,
  isOdsLoading,
  isOdsError,
  onClose,
  onConfirm,
  isLoading = false,
  confirmLabel = "Finalizar",
  cancelLabel = "Cancelar",
}: ModalNewProjectProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const metaCaptacaoInputRef = useRef<HTMLInputElement | null>(null);
  const isOdsCatalogUnavailable =
    isOdsLoading || isOdsError || odsOptions.length === 0;
  const isConfirmDisabled = isLoading || isOdsCatalogUnavailable;

  function moveCaretToEnd(input: HTMLInputElement) {
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }

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

  function toggleOds(value: string) {
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
            if (isConfirmDisabled) {
              return;
            }
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

            <div className="flex flex-col gap-1 w-full text-left">
              <label
                htmlFor="tipoProjeto"
                className="text-slate-700 font-semibold text-sm flex gap-1"
              >
                Tipo do projeto
                <span className="text-red-500">*</span>
              </label>
              <select
                id="tipoProjeto"
                required
                value={formData.tipoProjeto}
                onChange={(e) => {
                  const nextType = e.target.value as WizardFormData["tipoProjeto"];

                  setFormData((prev) => ({
                    ...prev,
                    tipoProjeto: nextType,
                    metaCaptacao:
                      nextType === "governamental" ? prev.metaCaptacao : "",
                  }));
                }}
                className={`w-full rounded-xl px-4 py-3 outline-none transition-all text-slate-900
                  border border-vinculo-gray bg-white
                  focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
                  ${errors.tipoProjeto ? "!border !border-error focus:!border-error focus:!ring-error" : ""}`}
              >
                <option value="" disabled hidden>
                  Selecione
                </option>
                {PROJECT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {formData.tipoProjeto
                  ? PROJECT_TYPE_OPTIONS.find(
                      (option) => option.value === formData.tipoProjeto,
                    )?.description
                  : "Escolha se o projeto terá ou não meta de captação."}
              </p>
              {errors.tipoProjeto && (
                <p className="text-sm text-error" role="alert">
                  {errors.tipoProjeto}
                </p>
              )}
            </div>

            {formData.tipoProjeto === "governamental" && (
              <Input
                id="metaCaptacao"
                label="Meta de captação"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="R$ 0,00"
                value={formatCurrencyValue(formData.metaCaptacao)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metaCaptacao: normalizeCurrencyValue(e.target.value),
                  }))
                }
                onKeyDown={(event) => {
                  const key = event.key;

                  if (/^\d$/.test(key)) {
                    event.preventDefault();
                    setFormData((prev) => ({
                      ...prev,
                      metaCaptacao: normalizeCurrencyValue(
                        `${prev.metaCaptacao}${key}`,
                      ),
                    }));
                    return;
                  }

                  if (key === "Backspace" || key === "Delete") {
                    event.preventDefault();
                    setFormData((prev) => ({
                      ...prev,
                      metaCaptacao: prev.metaCaptacao.slice(0, -1),
                    }));
                    return;
                  }

                  if (
                    key === "ArrowLeft" ||
                    key === "ArrowRight" ||
                    key === "Home" ||
                    key === "End"
                  ) {
                    requestAnimationFrame(() => {
                      const input = metaCaptacaoInputRef.current;
                      if (!input) {
                        return;
                      }

                      moveCaretToEnd(input);
                    });
                  }
                }}
                onPaste={(event) => {
                  event.preventDefault();
                  const pastedDigits = event.clipboardData
                    .getData("text")
                    .replace(/\D/g, "");

                  if (!pastedDigits) {
                    return;
                  }

                  setFormData((prev) => ({
                    ...prev,
                    metaCaptacao: normalizeCurrencyValue(
                      `${prev.metaCaptacao}${pastedDigits}`,
                    ),
                  }));
                }}
                onClick={() => {
                  const input = metaCaptacaoInputRef.current;

                  if (!input) {
                    return;
                  }

                  moveCaretToEnd(input);
                }}
                onFocus={(event) => {
                  moveCaretToEnd(event.currentTarget);
                }}
                onMouseUp={(event) => {
                  moveCaretToEnd(event.currentTarget);
                }}
                inputRef={metaCaptacaoInputRef}
                error={errors.metaCaptacao}
                isRequired
              />
            )}

            {isOdsLoading && (
              <p className="text-sm text-slate-500" role="status">
                Carregando os ODS do catálogo...
              </p>
            )}

            {isOdsError && (
              <p className="text-sm text-error" role="alert">
                Não foi possível carregar os ODS do catálogo.
              </p>
            )}

            {!isOdsLoading && !isOdsError && (
              <OdsCards
                options={odsOptions}
                selectedIds={formData.odsProjeto}
                onToggle={toggleOds}
                error={errors.odsProjeto}
                legend="ODS do projeto"
                description="Selecione um ou mais ODS relacionados ao projeto."
              />
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <BaseButton variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
                {cancelLabel}
              </BaseButton>
              <BaseButton
                variant="secondary"
                type="submit"
                disabled={isConfirmDisabled}
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
