import { Input } from "../general/SimpleTextInput";
import { useWizardForm } from "../../contexts/WizardFormContext";

/**
 * Passo do wizard: apenas os campos. Estado em {@link WizardFormProvider} na página de registro.
 */
export function NPOStepFour() {
  const { formData, setFormData, errors } = useWizardForm();

  const inputFilledClass =
    "!bg-vinculo-light-gray !border-0 focus:!ring-1 focus:!ring-vinculo-dark";

  return (
    <div className="space-y-4">
      <Input
        id="phone"
        label="Telefone"
        type="text"
        value={formData.phone}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, phone: e.target.value }))
        }
        error={errors.phone}
        className={inputFilledClass}
        placeholder="Digite o telefone"
      />
      <Input
        id="address-street"
        label="Endereço (logradouro)"
        value={formData.addressStreet}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, addressStreet: e.target.value }))
        }
        error={errors.addressStreet}
        className={inputFilledClass}
        placeholder="Rua, avenida…"
      />
    </div>
  );
}
