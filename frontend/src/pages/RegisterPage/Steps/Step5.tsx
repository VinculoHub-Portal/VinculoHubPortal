import type { Dispatch, SetStateAction } from "react";
import { Input } from "../../../components/general/Input";
import type {
  FieldErrors,
  WizardFormData,
  ODSOptions,
} from "../../../types/wizard.types";
import { MultiSelect } from "../../../components/general/MultiSelect";

export function EnterpriseRegisteringStep5() {}

type NPORegisteringStep5Props = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
};

export function NPORegisteringStep5({
  formData,
  setFormData,
  errors,
}: NPORegisteringStep5Props) {
  const inputFilledClass =
    "!bg-vinculo-light-gray !border-0 focus:!ring-1 focus:!ring-vinculo-dark";

  const odsOptions = [
    { value: "1", label: "ODS 1 - Erradicação da Pobreza" },
    { value: "2", label: "ODS 2 - Fome Zero" },
    { value: "3", label: "ODS 3 - Saúde e Bem-Estar" },
  ] as const satisfies {
    value: ODSOptions;
    label: string;
    disabled?: boolean;
  }[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-vinculo-dark">
          Projeto da ONG <span className="text-red-500">*</span>
        </h2>
      </div>

      <Input
        id="nome-projeto"
        label="Nome do Projeto"
        isRequired
        type="text"
        autoComplete="off"
        value={formData.nomeProjeto}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            nomeProjeto: e.target.value,
          }))
        }
        error={errors.nomeProjeto}
        className={inputFilledClass}
        placeholder="Digite o nome do projeto"
      />

      <Input
        id="description"
        label="Descrição do Projeto"
        isRequired
        type="text"
        autoComplete="off"
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
        error={errors.description}
        className={`${inputFilledClass} min-h-[100px]`}
        placeholder="Descreva o projeto..."
      />

      <Input
        id="capital"
        label="Meta de captação (opcional)"
        type="number"
        autoComplete="off"
        value={formData.capital}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            capital: e.target.value === "" ? 0 : Number(e.target.value),
          }))
        }
        error={errors.capital}
        className={inputFilledClass}
        placeholder="R$ 0,00"
      />

      <MultiSelect<ODSOptions>
        id="ods"
        name="ods"
        label="ODS"
        isRequired
        value={formData.ods}
        onValueChange={(ods) =>
          setFormData((prev) => ({
            ...prev,
            ods,
          }))
        }
        error={errors.ods}
        className={inputFilledClass}
        placeholder="Selecione um ou mais ODS"
        options={odsOptions}
      />
    </div>
  );
}
