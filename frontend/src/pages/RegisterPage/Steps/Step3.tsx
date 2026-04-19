import type { Dispatch, SetStateAction } from "react";
import { Input } from "../../../components/general/Input";
import { TextArea } from "../../../components/general/TextArea";
import { CnpjIcon, DescriptionIcon } from "../../../components/icons";
import { formatCpf } from "../../../utils/formatCpf";
import { validateCpf } from "../../../utils/validateCpf";
import { formatCnpj } from "../../../utils/formatCnpj";
import { validateCnpj } from "../../../utils/validateCnpj";
import type {
  FieldErrors,
  WizardEsgOption,
  WizardFormData,
} from "../../../types/wizard.types";

type NpoStepThreeProps = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
};

const PORTE_LABELS: Record<Exclude<WizardFormData["npoSize"], "">, string> = {
  small: "Pequena",
  medium: "Média",
  large: "Grande",
};

const ESG_OPTIONS: Array<{
  value: WizardEsgOption;
  label: string;
  description: string;
}> = [
  {
    value: "ambiental",
    label: "Ambiental",
    description: "Práticas de preservação e sustentabilidade",
  },
  {
    value: "social",
    label: "Social",
    description: "Impacto na comunidade e bem-estar social",
  },
  {
    value: "governanca",
    label: "Governança",
    description: "Transparência e gestão responsável",
  },
];

export function NPORegisteringStep3({
  formData,
  setFormData,
  errors,
}: NpoStepThreeProps) {
  function handleCpfChange(value: string) {
    setFormData((prev) => ({
      ...prev,
      cpf: formatCpf(value),
    }));
  }
  function handleCnpjChange(value: string) {
    setFormData((prev) => ({
      ...prev,
      cnpj: formatCnpj(value),
    }));
  }
  function toggleEsg(value: WizardEsgOption) {
    setFormData((prev) => ({
      ...prev,
      esg: prev.esg.includes(value)
        ? prev.esg.filter((o) => o !== value)
        : [...prev.esg, value],
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-vinculo-dark font-semibold text-lg">
          Informações Básicas
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Preencha os dados principais da sua ONG.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          id="nomeInstituicao"
          label="Nome da Instituição"
          isRequired
          placeholder="Ex: Instituto Esperança"
          maxLength={200}
          value={formData.nomeInstituicao}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              nomeInstituicao: e.target.value,
            }))
          }
          error={errors.nomeInstituicao}
        />

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="cpf"
              label="CPF do Responsável"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              maxLength={14}
              value={formData.cpf}
              onChange={(e) => handleCpfChange(e.target.value)}
              //onBlur={handleCpfBlur}
              error={errors.cpf}
            />

            <Input
              id="cnpj"
              label="CNPJ"
              inputMode="numeric"
              autoComplete="off"
              placeholder="00.000.000/0000-00"
              maxLength={18}
              value={formData.cnpj}
              onChange={(e) => handleCnpjChange(e.target.value)}
              //onBlur={handleCpfBlur}
              error={errors.cnpj}
              icon={<CnpjIcon />}
              iconPosition="left"
            />
          </div>
          <p className="text-xs text-slate-500">
            Informe o CPF, o CNPJ ou ambos. Ao menos um é obrigatório.
          </p>
        </div>

        <div className="flex flex-col gap-1 w-full text-left">
          <label
            htmlFor="npoSize"
            className="text-slate-700 font-semibold text-sm flex gap-1"
          >
            Tamanho
            <span className="text-red-500">*</span>
          </label>
          <select
            id="npoSize"
            required
            value={formData.npoSize}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                npoSize: e.target.value as WizardFormData["npoSize"],
              }))
            }
            className={`w-full rounded-xl px-4 py-3 outline-none transition-all text-slate-900
              border border-vinculo-gray bg-white
              focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
              ${errors.npoSize ? "!border !border-error focus:!border-error focus:!ring-error" : ""}`}
          >
            <option value="" disabled hidden>
              Selecione
            </option>
            {(
              Object.keys(PORTE_LABELS) as Array<keyof typeof PORTE_LABELS>
            ).map((key) => (
              <option key={key} value={key}>
                {PORTE_LABELS[key]}
              </option>
            ))}
          </select>
          {errors.npoSize && (
            <p className="text-sm text-error" role="alert">
              {errors.npoSize}
            </p>
          )}
        </div>

        <TextArea
          id="resumoInstitucional"
          label="Resumo Institucional (opcional)"
          placeholder="Descreva brevemente a missão e atuação da ONG..."
          maxLength={500}
          value={formData.resumoInstitucional}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              resumoInstitucional: e.target.value,
            }))
          }
          icon={<DescriptionIcon />}
        />
      </div>

      <fieldset className="border-t border-slate-100 pt-5 border-x-0 border-b-0">
        <legend className="text-vinculo-dark font-semibold text-base mb-1">
          Pilares ESG{" "}
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </legend>
        <p className="text-sm text-slate-500 mb-4">
          Selecione os pilares em que a ONG atua.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ESG_OPTIONS.map((option) => {
            const selected = formData.esg.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleEsg(option.value)}
                className={`flex flex-col gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all
                  ${
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

        {errors.esg && (
          <p className="text-sm text-error mt-2" role="alert">
            {errors.esg}
          </p>
        )}
      </fieldset>
    </div>
  );
}
