import type { Dispatch, SetStateAction } from "react";
import { Input } from "../general/SimpleTextInput";
import type { FieldErrors, WizardFormData } from "../../types/wizard.types";

type NpoStepThreeProps = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
};

const PORTE_LABELS: Record<Exclude<WizardFormData["porteOng"], "">, string> =
  {
    pequena: "Pequena",
    media: "Média",
    grande: "Grande",
  };

export function NpoStepThree({
  formData,
  setFormData,
  errors,
}: NpoStepThreeProps) {
  const inputFilledClass =
    "!bg-vinculo-light-gray !border-0 focus:!ring-1 focus:!ring-vinculo-dark";

  const invalidResumo = Boolean(errors.resumoInstitucional);
  const invalidCnpj = Boolean(errors.cnpj);

  return (
    <>
      <h2 className="text-vinculo-dark font-semibold text-lg mb-6">
        Informações Básicas
      </h2>

      <div className="flex flex-col gap-5">
        <Input
          id="nome-instituicao"
          label="Nome da Instituição"
          isRequired
          value={formData.nomeInstituicao}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              nomeInstituicao: e.target.value,
            }))
          }
          error={errors.nomeInstituicao}
          className={inputFilledClass}
        />

        <Input
          id="cpf"
          label="CPF"
          isRequired
          inputMode="numeric"
          autoComplete="off"
          value={formData.cpf}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, cpf: e.target.value }))
          }
          error={errors.cpf}
          className={inputFilledClass}
          placeholder="000.000.000-00"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1 w-full text-left">
            <label
              htmlFor="porte-ong"
              className="text-slate-700 font-medium text-sm flex gap-1"
            >
              Porte da ONG
              <span className="text-red-500">*</span>
            </label>
            <select
              id="porte-ong"
              required
              value={formData.porteOng}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  porteOng: e.target.value as WizardFormData["porteOng"],
                }))
              }
              className={`rounded-xl px-4 py-3 outline-none transition-all text-slate-900
                border border-vinculo-gray
                focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
                ${inputFilledClass}
                ${
                  errors.porteOng
                    ? "!border !border-error focus:!border-error focus:!ring-error"
                    : ""
                }`}
            >
              <option value="" disabled hidden>
                Selecione
              </option>
              {(Object.keys(PORTE_LABELS) as Array<keyof typeof PORTE_LABELS>).map(
                (key) => (
                  <option key={key} value={key}>
                    {PORTE_LABELS[key]}
                  </option>
                ),
              )}
            </select>
            {errors.porteOng && (
              <p className="text-sm text-error" role="alert">
                {errors.porteOng}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full text-left">
            <label
              htmlFor="cnpj"
              className="text-slate-700 font-medium text-sm flex gap-1 flex-wrap items-baseline"
            >
              CNPJ{" "}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              id="cnpj"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={invalidCnpj}
              value={formData.cnpj}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cnpj: e.target.value,
                }))
              }
              placeholder="00.000.000/0000-00"
              className={`rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 w-full
                border border-vinculo-gray
                focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
                ${inputFilledClass}
                ${
                  invalidCnpj
                    ? "!border !border-error focus:!border-error focus:!ring-error"
                    : ""
                }`}
            />
            {errors.cnpj && (
              <p className="text-sm text-error" role="alert">
                {errors.cnpj}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full text-left">
          <label
            htmlFor="resumo-institucional"
            className="text-slate-700 font-medium text-sm flex gap-1 flex-wrap items-baseline"
          >
            Resumo Institucional{" "}
            <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <textarea
            id="resumo-institucional"
            rows={5}
            aria-invalid={invalidResumo}
            value={formData.resumoInstitucional}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                resumoInstitucional: e.target.value,
              }))
            }
            className={`rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 resize-y min-h-[120px]
              border border-vinculo-gray
              focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
              ${inputFilledClass}
              ${
                invalidResumo
                  ? "!border !border-error focus:!border-error focus:!ring-error"
                  : ""
              }`}
          />
          {errors.resumoInstitucional && (
            <p className="text-sm text-error" role="alert">
              {errors.resumoInstitucional}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
