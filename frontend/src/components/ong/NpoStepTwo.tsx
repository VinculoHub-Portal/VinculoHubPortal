import type { Dispatch, SetStateAction } from "react";
import { Input } from "../general/SimpleTextInput";
import type { FieldErrors, WizardFormData } from "../../types/wizard.types";

type NpoStepTwoProps = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
  error?: string;
};

export function NpoStepTwo({ formData, setFormData, errors }: NpoStepTwoProps) {
  const inputFilledClass =
    "!bg-vinculo-light-gray !border-0 focus:!ring-1 focus:!ring-vinculo-dark";

  return (
    <>
      <h2 className="text-vinculo-dark font-semibold text-lg mb-6">
        Informações Básicas
      </h2>

      <div className="flex flex-col gap-5">
        <Input
          id="cnpj"
          label="CNPJ"
          isRequired
          value={formData.cnpj}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              cnpj: e.target.value,
            }))
          }
          error={errors.cnpj}
          className={inputFilledClass}
          placeholder="00.000.000/0000-00"
        />

        <Input
          id="email-cadastro"
          label="E-mail"
          isRequired
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
          error={errors.email}
          className={inputFilledClass}
          placeholder="seu@email.com"
        />

        <Input
          id="senha"
          label="Senha"
          isRequired
          type="password"
          autoComplete="new-password"
          value={formData.senha}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              senha: e.target.value,
            }))
          }
          error={errors.senha}
          className={inputFilledClass}
          placeholder="••••••••"
        />

        <Input
          id="confirmar-senha"
          label="Confirmar senha"
          isRequired
          type="password"
          autoComplete="new-password"
          value={formData.confirmarSenha}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              confirmarSenha: e.target.value,
            }))
          }
          error={errors.confirmarSenha}
          className={inputFilledClass}
          placeholder="••••••••"
        />
      </div>
    </>
  );
}
