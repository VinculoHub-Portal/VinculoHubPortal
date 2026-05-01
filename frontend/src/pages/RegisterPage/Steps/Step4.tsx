import { useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Input } from "../../../components/general/Input";
import { TextArea } from "../../../components/general/TextArea";
import type {
  FieldErrors,
  ProjectOdsOption,
  WizardFormData,
} from "../../../types/wizard.types";
import {
  formatCurrencyValue,
  normalizeCurrencyValue,
} from "../../../utils/formatCurrency";

type Step4Props = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
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
    description:
      "Iniciativas de segurança alimentar e agricultura sustentável.",
  },
  {
    value: "3",
    label: "ODS 3 - Saúde e Bem-Estar",
    description: "Ações voltadas à saúde, prevenção e qualidade de vida.",
  },
];

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

export function Step4({ formData, setFormData, errors }: Step4Props) {
  const metaCaptacaoInputRef = useRef<HTMLInputElement | null>(null);

  function moveCaretToEnd(input: HTMLInputElement) {
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }

  function toggleOds(value: ProjectOdsOption) {
    setFormData((prev) => ({
      ...prev,
      odsProjeto: prev.odsProjeto.includes(value)
        ? prev.odsProjeto.filter((item) => item !== value)
        : [...prev.odsProjeto, value],
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-vinculo-dark font-semibold text-lg">
          Primeiro projeto
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Informe o projeto inicial que será cadastrado junto com a ONG.
        </p>
      </div>

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
              metaCaptacao: nextType === "governamental" ? prev.metaCaptacao : "",
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
                metaCaptacao: normalizeCurrencyValue(`${prev.metaCaptacao}${key}`),
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

            if (key === "ArrowLeft" || key === "ArrowRight" || key === "Home" || key === "End") {
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
            const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "");

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

      <fieldset className="border-t border-slate-100 pt-5 border-x-0 border-b-0">
        <legend className="text-vinculo-dark font-semibold text-base mb-1">
          ODS{" "}
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
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
    </div>
  );
}
