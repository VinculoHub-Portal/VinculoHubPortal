import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Input } from "../../../components/general/Input";
import { AddressIcon, StateIcon, PhoneIcon } from "../../../components/icons";
import { useZipCode } from "../../../hooks/useZipCode";
import { formatZipCode } from "../../../utils/formatZipCode";
import { InfoBox } from "../../../components/general/InfoBox";
import type { FieldErrors, WizardFormData } from "../../../types/wizard.types";
import { getApiErrorMessage } from "../../../utils/logger";

type Step3Props = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
};

export function Step3({ formData, setFormData, errors }: Step3Props) {
  const {
    data: zipCodeData,
    isFetching: loadingZipCode,
    error: zipCodeQueryError,
  } = useZipCode(formData.zipCode);

  useEffect(() => {
    if (zipCodeData) {
      setFormData((prev) => ({
        ...prev,
        street: zipCodeData.street || prev.street,
        streetNumber:
          (zipCodeData.complement ?? "").slice(0, 20) || prev.streetNumber,
        city: zipCodeData.city || prev.city,
        state: zipCodeData.state || prev.state,
        stateCode: zipCodeData.stateCode || prev.stateCode,
      }));
    }
  }, [zipCodeData, setFormData]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    const formatted = id === "zipCode" ? formatZipCode(value) : value;

    if (id === "zipCode") {
      setFormData((prev) => ({
        ...prev,
        zipCode: formatted,
        street: "",
        city: "",
        state: "",
        stateCode: "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [id]: formatted }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-vinculo-dark font-semibold text-lg">Endereço</h2>
        <p className="text-sm text-slate-500 mt-1">
          Preencha os dados de localização da sua ONG.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input
            label="CEP"
            id="zipCode"
            placeholder="00000-000"
            maxLength={9}
            value={formData.zipCode}
            onChange={handleChange}
            error={errors.zipCode}
            icon={<AddressIcon />}
            iconPosition="left"
            isRequired
          />
          {loadingZipCode && (
            <span className="text-sm text-slate-400">Consultando CEP...</span>
          )}
          {zipCodeQueryError && (
            <span className="text-sm text-error">
              {getApiErrorMessage(
                zipCodeQueryError,
                "CEP não encontrado. Verifique e tente novamente.",
              )}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Logradouro"
              id="street"
              placeholder="Rua, Avenida..."
              maxLength={100}
              value={formData.street}
              onChange={handleChange}
              icon={<AddressIcon />}
              iconPosition="left"
              disabled={!!zipCodeData}
            />
          </div>
          <Input
            label="Número"
            id="streetNumber"
            placeholder="Ex: 123"
            maxLength={20}
            value={formData.streetNumber}
            onChange={handleChange}
            error={errors.streetNumber}
            icon={<AddressIcon />}
            iconPosition="left"
            isRequired
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Complemento"
            id="complement"
            placeholder="Apto, Sala..."
            maxLength={100}
            value={formData.complement}
            onChange={handleChange}
            icon={<AddressIcon />}
            iconPosition="left"
          />
          <Input
            label="Cidade"
            id="city"
            placeholder="Ex: São Paulo"
            maxLength={50}
            value={formData.city}
            onChange={handleChange}
            icon={<StateIcon />}
            iconPosition="left"
            disabled={!!zipCodeData}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Estado"
            id="state"
            placeholder="Ex: São Paulo"
            maxLength={50}
            value={formData.state}
            onChange={handleChange}
            icon={<StateIcon />}
            iconPosition="left"
            disabled={!!zipCodeData}
          />
          <Input
            label="UF"
            id="stateCode"
            placeholder="Ex: SP"
            maxLength={2}
            value={formData.stateCode}
            onChange={handleChange}
            icon={<StateIcon />}
            iconPosition="left"
            disabled={!!zipCodeData}
          />
        </div>

        <Input
          label="Telefone"
          id="phone"
          placeholder="(00) 00000-0000"
          maxLength={30}
          value={formData.phone}
          onChange={handleChange}
          icon={<PhoneIcon />}
          iconPosition="left"
        />

        <InfoBox
          title="Importante"
          message="Essas informações serão visíveis no seu perfil público e utilizadas por empresas para entrar em contato com a sua ONG."
        />
      </div>
    </div>
  );
}
