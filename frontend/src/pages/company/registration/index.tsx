import { useState, useEffect } from "react";
import { WizardSteps } from "../../../components/auth/WizardSteps";
import { BackLink } from "../../../components/general/BackLink";
import { Input } from "../../../components/general/SimpleTextInput";
import { TextArea } from "../../../components/general/SimpleTextArea";
import { BaseButton } from "../../../components/general/BaseButton";
import { InfoBox } from "../../../components/general/InfoBox";
import { useZipCode } from "../../../hooks/useZipCode";
import { useCnpj } from "../../../hooks/useCnpj";
import { CompanyIcon, DescriptionIcon, CnpjIcon, AddressIcon, StateIcon, PhoneIcon } from "../../../components/icons";
import { validateCnpj } from "../../../utils/validateCnpj";
import { formatCnpj } from "../../../utils/formatCnpj";
import { formatZipCode } from "../../../utils/formatZipCode";

export default function CompanyRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(2);

  const [basicInfo, setBasicInfo] = useState({
    name: "",
    tradeName: "",
    description: "",
    cnpj: "",
  });

  const [cnpjError, setCnpjError] = useState("");

  const [contactInfo, setContactInfo] = useState({
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    state_code: "",
    phone: "",
  });

  const {
    data: cnpjData,
    isFetching: loadingCnpj,
    error: cnpjQueryError,
  } = useCnpj(basicInfo.cnpj);

  const {
    data: zipCodeData,
    isFetching: loadingZipCode,
    error: zipCodeQueryError,
  } = useZipCode(contactInfo.zip_code);

  useEffect(() => {
    if (cnpjData) {
      setBasicInfo((prev) => ({
        ...prev,
        name: cnpjData.legalName || prev.name,
        tradeName: cnpjData.tradeName || prev.tradeName,
      }));
    }
  }, [cnpjData]);

  useEffect(() => {
    if (zipCodeData) {
      setContactInfo((prev) => ({
        ...prev,
        street: zipCodeData.street || prev.street,
        complement: zipCodeData.complement || prev.complement,
        city: zipCodeData.city || prev.city,
        state: zipCodeData.state || prev.state,
        state_code: zipCodeData.stateCode || prev.state_code,
      }));
    }
  }, [zipCodeData]);

  const handleCnpjBlur = () => {
    if (!basicInfo.cnpj) return;
    if (!validateCnpj(basicInfo.cnpj)) {
      setCnpjError("CNPJ inválido");
    } else {
      setCnpjError("");
    }
  };

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    const formatted = id === "cnpj" ? formatCnpj(value) : value;
    setBasicInfo((prev) => ({ ...prev, [id]: formatted }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const formatted = id === "zip_code" ? formatZipCode(value) : value;
    setContactInfo((prev) => ({ ...prev, [id]: formatted }));
  };

  const stepTitles: Record<number, { heading: string; subtitle: string }> = {
    2: {
      heading: "Informações Básicas",
      subtitle: "Preencha os dados principais da sua empresa.",
    },
    3: {
      heading: "Informações de Contato",
      subtitle: "Preencha os dados de endereço e contato da sua empresa.",
    },
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <BackLink label="Voltar ao início" />
      </div>

      <WizardSteps currentStep={currentStep} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-vinculo-dark text-center mb-6">
          Cadastro de Empresa
        </h1>

        <h2 className="text-lg font-semibold text-vinculo-dark">
          {stepTitles[currentStep].heading}
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          {stepTitles[currentStep].subtitle}
        </p>

        {currentStep === 2 && (
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Razão Social"
                id="name"
                placeholder="Digite a razão social"
                maxLength={255}
                value={basicInfo.name}
                onChange={handleBasicChange}
                icon={<CompanyIcon />}
                isRequired
              />
              <Input
                label="Nome Fantasia"
                id="tradeName"
                placeholder="Nome fantasia"
                maxLength={255}
                value={basicInfo.tradeName}
                onChange={handleBasicChange}
                icon={<CompanyIcon />}
              />
            </div>

            <TextArea
              label="Descrição da Empresa"
              id="description"
              placeholder="Descreva brevemente a empresa..."
              maxLength={1000}
              value={basicInfo.description}
              onChange={handleBasicChange}
              icon={<DescriptionIcon />}
            />

            <div className="flex flex-col gap-1">
              <Input
                label="CNPJ"
                id="cnpj"
                placeholder="00.000.000/0000-00"
                maxLength={18}
                value={basicInfo.cnpj}
                onChange={handleBasicChange}
                onBlur={handleCnpjBlur}
                error={cnpjError || (cnpjQueryError ? "Erro ao consultar o CNPJ. Tente novamente." : "")}
                icon={<CnpjIcon />}
                isRequired
              />
              {loadingCnpj && (
                <span className="text-sm text-slate-400">
                  Consultando CNPJ...
                </span>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
              <BaseButton variant="ghost" className="w-28">
                Voltar
              </BaseButton>
              <BaseButton
                variant="secondary"
                className="w-28"
                onClick={() => setCurrentStep(3)}
              >
                Próximo
              </BaseButton>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Input
                label="CEP"
                id="zip_code"
                placeholder="00000-000"
                maxLength={9}
                value={contactInfo.zip_code}
                onChange={handleContactChange}
                icon={<AddressIcon />}
              />
              {loadingZipCode && (
                <span className="text-sm text-slate-400">
                  Consultando CEP...
                </span>
              )}
              {zipCodeQueryError && (
                <span className="text-sm text-error">
                  {(zipCodeQueryError as Error).message || "Erro ao consultar o CEP. Tente novamente."}
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
                  value={contactInfo.street}
                  onChange={handleContactChange}
                  icon={<AddressIcon />}
                />
              </div>
              <Input
                label="Número"
                id="number"
                placeholder="Ex: 123"
                maxLength={20}
                value={contactInfo.number}
                onChange={handleContactChange}
                icon={<AddressIcon />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Complemento"
                id="complement"
                placeholder="Apto, Sala..."
                maxLength={100}
                value={contactInfo.complement}
                onChange={handleContactChange}
                icon={<AddressIcon />}
              />
              <Input
                label="Cidade"
                id="city"
                placeholder="Ex: São Paulo"
                maxLength={50}
                value={contactInfo.city}
                onChange={handleContactChange}
                icon={<StateIcon />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Estado"
                id="state"
                placeholder="Ex: São Paulo"
                maxLength={50}
                value={contactInfo.state}
                onChange={handleContactChange}
                icon={<StateIcon />}
              />
              <Input
                label="UF"
                id="state_code"
                placeholder="Ex: SP"
                maxLength={2}
                value={contactInfo.state_code}
                onChange={handleContactChange}
                icon={<StateIcon />}
              />
            </div>

            <Input
              label="Telefone"
              id="phone"
              placeholder="(00) 00000-0000"
              maxLength={30}
              value={contactInfo.phone}
              onChange={handleContactChange}
              icon={<PhoneIcon />}
            />

            <InfoBox
              title="Importante"
              message="Essas informações serão visíveis no seu perfil público e utilizadas por ONGs para entrar em contato com sua empresa."
            />

            <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
              <BaseButton
                variant="ghost"
                className="w-28"
                onClick={() => setCurrentStep(2)}
              >
                Voltar
              </BaseButton>
              <BaseButton variant="secondary" className="w-28">
                Próximo
              </BaseButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
