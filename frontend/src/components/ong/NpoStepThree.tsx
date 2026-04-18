import type { Dispatch, SetStateAction } from "react";
import { Input } from "../general/Input";
import { TextArea } from "../general/TextArea";
import { CnpjIcon, DescriptionIcon } from "../icons";
import type { FieldErrors, WizardEsgOption, WizardFormData } from "../../types/wizard.types";

type NpoStepThreeProps = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
};

const PORTE_LABELS: Record<Exclude<WizardFormData["porteOng"], "">, string> = {
  pequena: "Pequena",
  media: "Média",
  grande: "Grande",
};

const ESG_OPTIONS: Array<{ value: WizardEsgOption; label: string; description: string }> = [
  { value: "ambiental", label: "Ambiental", description: "Práticas de preservação e sustentabilidade" },
  { value: "social", label: "Social", description: "Impacto na comunidade e bem-estar social" },
  { value: "governanca", label: "Governança", description: "Transparência e gestão responsável" },
];

export function NpoStepThree({ formData, setFormData, errors }: NpoStepThreeProps) {
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
        <h2 className="text-vinculo-dark font-semibold text-lg">Informações Básicas</h2>
        <p className="text-sm text-slate-500 mt-1">Preencha os dados principais da sua ONG.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          id="nomeInstituicao"
          label="Nome da Instituição"
          isRequired
          placeholder="Ex: Instituto Esperança"
          maxLength={200}
          value={formData.nomeInstituicao}
          onChange={(e) => setFormData((prev) => ({ ...prev, nomeInstituicao: e.target.value }))}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, cnpj: e.target.value }))}
              error={errors.cnpj}
              icon={<CnpjIcon />}
              iconPosition="left"
            />
          </div>
          <p className="text-xs text-slate-500">Informe o CPF, o CNPJ ou ambos. Ao menos um é obrigatório.</p>
        </div>

        <div className="flex flex-col gap-1 w-full text-left">
          <label htmlFor="porteOng" className="text-slate-700 font-semibold text-sm flex gap-1">
            Porte da ONG
            <span className="text-red-500">*</span>
          </label>
          <select
            id="porteOng"
            required
            value={formData.porteOng}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                porteOng: e.target.value as WizardFormData["porteOng"],
              }))
            }
            className={`w-full rounded-xl px-4 py-3 outline-none transition-all text-slate-900
              border border-vinculo-gray bg-white
              focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
              ${errors.porteOng ? "!border !border-error focus:!border-error focus:!ring-error" : ""}`}
          >
            <option value="" disabled hidden>Selecione</option>
            {(Object.keys(PORTE_LABELS) as Array<keyof typeof PORTE_LABELS>).map((key) => (
              <option key={key} value={key}>{PORTE_LABELS[key]}</option>
            ))}
          </select>
          {errors.porteOng && (
            <p className="text-sm text-error" role="alert">{errors.porteOng}</p>
          )}
        </div>

        <TextArea
          id="resumoInstitucional"
          label="Resumo Institucional (opcional)"
          placeholder="Descreva brevemente a missão e atuação da ONG..."
          maxLength={500}
          value={formData.resumoInstitucional}
          onChange={(e) => setFormData((prev) => ({ ...prev, resumoInstitucional: e.target.value }))}
          icon={<DescriptionIcon />}
        />
      </div>

      <fieldset className="border-t border-slate-100 pt-5 border-x-0 border-b-0">
        <legend className="text-vinculo-dark font-semibold text-base mb-1">
          Pilares ESG <span className="text-red-500" aria-hidden="true">*</span>
        </legend>
        <p className="text-sm text-slate-500 mb-4">Selecione os pilares em que a ONG atua.</p>

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
                  ${selected
                    ? "border-vinculo-green bg-vinculo-green/10 text-vinculo-dark"
                    : "border-vinculo-gray bg-white text-slate-600 hover:border-slate-300"
                  }`}
              >
                <span className="font-semibold text-sm">{option.label}</span>
                <span className="text-xs text-slate-500">{option.description}</span>
              </button>
            );
          })}
        </div>

        {errors.esg && (
          <p className="text-sm text-error mt-2" role="alert">{errors.esg}</p>
        )}
      </fieldset>
    </div>
  );
}
