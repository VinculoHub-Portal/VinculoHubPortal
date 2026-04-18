import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useCnpj } from "../../../hooks/useCnpj";
import { CnpjInput } from "../../../components/inputs/CnpjInput";
import { CpfInput } from "../../../components/inputs/CpfInput";
import { Input } from "../../../components/general/Input";
import { Select } from "../../../components/general/SimpleSelect";
import type { NpoSize } from "../../../types/wizard.types";
import type { FieldErrors, WizardFormData } from "../../../types/wizard.types";

export function EnterpriseRegisteringStep3() {}

type NPORegisteringStep3Props = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
  // allow parent to set errors via setErrors if needed
  setErrors?: (next: FieldErrors) => void;
};

const NPO_SIZE_LABELS: Record<
  Exclude<WizardFormData["npo_size"], "">,
  string
> = {
  small: "Pequena",
  medium: "Média",
  large: "Grande",
};

export function NPORegisteringStep3({
  formData,
  setFormData,
  errors,
  setErrors,
}: NPORegisteringStep3Props) {
  const inputFilledClass =
    "!bg-vinculo-light-gray !border-0 focus:!ring-1 focus:!ring-vinculo-dark";

  // Debounced CNPJ for lookup (parent-level lookup in this step)
  const debouncedCnpj = useDebouncedValue(formData.cnpj ?? "", 400);
  const cnpjDigits = debouncedCnpj.replace(/\D/g, "");
  const {
    data: cnpjData,
    isFetching: cnpjLoading,
    error: cnpjQueryError,
  } = useCnpj(cnpjDigits.length === 14 ? debouncedCnpj : "");

  // If (for this step) you want to auto-fill some fields when lookup returns:
  useEffect(() => {
    if (cnpjData) {
      // For NPO step CNPJ is optional; you may want to pre-fill some fields only if empty
      // setFormData(prev => ({ ...prev, ... }))
      // In many cases you may opt to NOT auto-fill in NPO flow; keep this commented or minimal.
    }
  }, [cnpjData, setFormData]);

  return (
    <>
      <div>
        <h2 className="text-vinculo-dark font-semibold text-lg mb-6">
          Informações Básicas
        </h2>

        <div className="flex flex-col gap-5">
          <Input
            id="nome-instituicao"
            label="Nome Instituição"
            isRequired
            type="name"
            autoComplete="name"
            value={formData.nomeInstituicao}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                nomeInstituicao: e.target.value,
              }))
            }
            error={errors.nomeInstituicao}
            className={inputFilledClass}
            placeholder="Instituição das Boas Causas"
          />

          <CpfInput
            id="cpf"
            label="CPF"
            value={formData.cpf}
            onChange={(next) =>
              setFormData((prev) => ({
                ...prev,
                cpf: next,
              }))
            }
            error={errors.cpf}
            // optional: to surface errors in parent error bag:
            setError={(msg) => setErrors?.({ ...errors, cpf: msg })}
            className={inputFilledClass}
            // placeholder preserved by CpfInput's formatted input config
          />

          <div className="flex col-auto justify-between">
            <div>
              <Select
                id="size"
                name="size"
                label="Tamanho"
                isRequired
                value={formData.npo_size}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    npo_size: e.target.value as NpoSize,
                  }))
                }
                error={errors.npo_size}
                className={inputFilledClass}
                placeholder="Selecione o porte"
                options={Object.entries(NPO_SIZE_LABELS).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            </div>

            <CnpjInput
              id="cnpj"
              label="CNPJ (Opcional)"
              value={formData.cnpj}
              onChange={(next) =>
                setFormData((prev) => ({
                  ...prev,
                  cnpj: next,
                }))
              }
              error={errors.cnpj}
              setError={(msg) => setErrors?.({ ...errors, cnpj: msg })}
              // pass lookup state from this step's query
              lookupLoading={cnpjLoading}
              lookupError={cnpjQueryError}
              // keep autoLookup disabled in NPO flow if you prefer:
              // (we already do the lookup here, so input doesn't do its own)
              className={inputFilledClass}
            />
          </div>
        </div>

        <Input
          id="descricao"
          label="Resumo Institucional"
          type="text"
          autoComplete="name"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          error={errors.description}
          className={inputFilledClass}
          placeholder="Resumo Institucional"
        />
      </div>
    </>
  );
}
