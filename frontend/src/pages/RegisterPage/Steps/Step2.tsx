import type { Dispatch, SetStateAction } from "react";
import { Input } from "../../../components/general/Input";
import type { FieldErrors, WizardFormData } from "../../../types/wizard.types";

type Step2Props = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
};

export function Step2({ formData, setFormData, errors }: Step2Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-vinculo-dark font-semibold text-lg">Informações Básicas</h2>
        <p className="text-sm text-slate-500 mt-1">
          Crie as credenciais de acesso da ONG.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          id="email"
          label="E-mail"
          isRequired
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
          error={errors.email}
        />

        <Input
          id="senha"
          label="Senha"
          isRequired
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={formData.senha}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              senha: e.target.value,
            }))
          }
          error={errors.senha}
        />

        <Input
          id="confirmarSenha"
          label="Confirmar senha"
          isRequired
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={formData.confirmarSenha}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              confirmarSenha: e.target.value,
            }))
          }
          error={errors.confirmarSenha}
        />
      </div>
    </div>
  );
}
