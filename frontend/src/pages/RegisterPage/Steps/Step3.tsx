import type { Dispatch, SetStateAction } from "react";
import { Input } from "../../../components/general/SimpleTextInput";
import { Select } from "../../../components/general/SimpleSelect";
import type { NpoSize } from "../../../types/wizard.types";
import type { FieldErrors, WizardFormData } from "../../../types/wizard.types";

export function EnterpriseRegisteringStep3() {}

type NPORegisteringStep3Props = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
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
}: NPORegisteringStep3Props) {
  const inputFilledClass =
    "!bg-vinculo-light-gray !border-0 focus:!ring-1 focus:!ring-vinculo-dark";

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

          <Input
            id="cpf"
            label="CPF"
            isRequired
            value={formData.cpf}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                cpf: e.target.value,
              }))
            }
            error={errors.cpf}
            className={inputFilledClass}
            placeholder="000.000.000-00"
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

            <Input
              id="cnpj"
              label="CNPJ (Opcional)"
              type="text"
              autoComplete=""
              value={formData.cnpj}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cnpj: e.target.value,
                }))
              }
              className={inputFilledClass}
              placeholder="00.000.000/0000-00"
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
