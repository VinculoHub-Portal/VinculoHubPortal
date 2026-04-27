import type { Dispatch, SetStateAction } from "react";
import { Input } from "../../../components/general/Input";
import { TextArea } from "../../../components/general/TextArea";
import type {
  FieldErrors,
  ProjectOdsOption,
  WizardFormData,
} from "../../../types/wizard.types";

type Step5Props = {
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
    description: "Iniciativas de segurança alimentar e agricultura sustentável.",
  },
  {
    value: "3",
    label: "ODS 3 - Saúde e Bem-Estar",
    description: "Ações voltadas à saúde, prevenção e qualidade de vida.",
  },
];

export function Step5({ formData, setFormData, errors }: Step5Props) {
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
    </div>
  );
}
