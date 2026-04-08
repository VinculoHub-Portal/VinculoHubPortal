import { useState, useEffect } from "react";
import { WizardSteps } from "../../../components/auth/WizardSteps";
import { BackLink } from "../../../components/general/BackLink";
import { Input } from "../../../components/general/SimpleTextInput";
import { TextArea } from "../../../components/general/SimpleTextArea";
import { BaseButton } from "../../../components/general/BaseButton";
import { InfoBox } from "../../../components/general/InfoBox";
import { LogoUpload } from "../../../components/general/LogoUpload";
import { useZipCode } from "../../../hooks/useZipCode";
import { useCnpj } from "../../../hooks/useCnpj";
import { CompanyIcon, DescriptionIcon, CnpjIcon, AddressIcon, StateIcon, PhoneIcon, EmailIcon, LockIcon } from "../../../components/icons";
import { RegistrationSummary } from "../../../components/register/RegistrationSummary";
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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [cnpjError, setCnpjError] = useState("");

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [credentialsErrors, setCredentialsErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({ ...prev, [id]: value }));
    setCredentialsErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleCredentialsBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setCredentialsErrors((prev) => ({ ...prev, email: "E-mail inválido" }));
    }
    if (id === "confirmPassword" && value && value !== credentials.password) {
      setCredentialsErrors((prev) => ({ ...prev, confirmPassword: "As senhas não coincidem" }));
    }
  };

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
    4: {
      heading: "Acesso à Conta",
      subtitle: "Defina o e-mail e a senha de acesso da empresa.",
    },
    5: {
      heading: "Cadastro Concluído!",
      subtitle: "Revise o resumo e finalize o cadastro da sua empresa.",
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
            { /*
            <LogoUpload
              label="Logo da Empresa"
              preview={logoPreview}
              onChange={(file, previewUrl) => {
                setLogoFile(file);
                setLogoPreview(previewUrl);
              }}
              onRemove={() => {
                setLogoFile(null);
                setLogoPreview(null);
              }}
            />
            */ }

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Razão Social"
                id="name"
                placeholder="Digite a razão social"
                maxLength={255}
                value={basicInfo.name}
                onChange={handleBasicChange}
                icon={<CompanyIcon />}
                disabled
              />
              <Input
                label="Nome Fantasia"
                id="tradeName"
                placeholder="Nome fantasia"
                maxLength={255}
                value={basicInfo.tradeName}
                onChange={handleBasicChange}
                icon={<CompanyIcon />}
                disabled
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
                isRequired
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
                  disabled
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
                disabled
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
                disabled
              />
              <Input
                label="UF"
                id="state_code"
                placeholder="Ex: SP"
                maxLength={2}
                value={contactInfo.state_code}
                onChange={handleContactChange}
                icon={<StateIcon />}
                disabled
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
              <BaseButton
                variant="secondary"
                className="w-28"
                onClick={() => setCurrentStep(4)}
              >
                Próximo
              </BaseButton>
            </div>
          </form>
        )}

        {currentStep === 4 && (
          <form className="flex flex-col gap-4">
            <Input
              label="E-mail"
              id="email"
              type="email"
              placeholder="empresa@exemplo.com"
              maxLength={255}
              value={credentials.email}
              onChange={handleCredentialsChange}
              onBlur={handleCredentialsBlur}
              error={credentialsErrors.email}
              icon={<EmailIcon />}
              isRequired
            />

            <Input
              label="Senha"
              id="password"
              type="password"
              placeholder="Crie uma senha"
              maxLength={128}
              value={credentials.password}
              onChange={handleCredentialsChange}
              icon={<LockIcon />}
              isRequired
            />

            <Input
              label="Confirmar Senha"
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              maxLength={128}
              value={credentials.confirmPassword}
              onChange={handleCredentialsChange}
              onBlur={handleCredentialsBlur}
              error={credentialsErrors.confirmPassword}
              icon={<LockIcon />}
              isRequired
            />

            <InfoBox
              title="Importante"
              message="Essas credenciais serão utilizadas para acessar o painel da empresa. Guarde-as em local seguro."
            />

            <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
              <BaseButton
                variant="ghost"
                className="w-28"
                onClick={() => setCurrentStep(3)}
              >
                Voltar
              </BaseButton>
              <BaseButton
                variant="secondary"
                className="w-28"
                onClick={() => setCurrentStep(5)}
              >
                Próximo
              </BaseButton>
            </div>
          </form>
        )}

        {currentStep === 5 && (
          <RegistrationSummary
            entityName={basicInfo.tradeName || basicInfo.name}
            entitySubtitle={basicInfo.cnpj}
            // entityIcon={<CompanyIcon sx={{ fontSize: 36 }} className="text-vinculo-green" />}
            completedSteps={5}
            totalSteps={5}
            sections={[
              {
                title: "Informações Básicas",
                fields: [
                  { label: "CNPJ", value: basicInfo.cnpj, icon: <CnpjIcon fontSize="small" />, required: true },
                  { label: "Razão Social", value: basicInfo.name, icon: <CompanyIcon fontSize="small" />, required: true },
                  { label: "Nome Fantasia", value: basicInfo.tradeName, icon: <CompanyIcon fontSize="small" /> },
                  { label: "Descrição", value: basicInfo.description, icon: <DescriptionIcon fontSize="small" /> },
                ],
              },
              {
                title: "Informações de Contato",
                fields: [
                  { label: "CEP", value: contactInfo.zip_code, icon: <AddressIcon fontSize="small" />, required: true },
                  { label: "Endereço", value: [contactInfo.street, contactInfo.number].filter(Boolean).join(", "), icon: <AddressIcon fontSize="small" />, required: true },
                  { label: "Complemento", value: contactInfo.complement, icon: <AddressIcon fontSize="small" /> },
                  { label: "Cidade / UF", value: [contactInfo.city, contactInfo.state_code].filter(Boolean).join(" - "), icon: <StateIcon fontSize="small" /> },
                  { label: "Telefone", value: contactInfo.phone, icon: <PhoneIcon fontSize="small" /> },
                ],
              },
              {
                title: "Acesso à Conta",
                fields: [
                  { label: "E-mail", value: credentials.email, icon: <EmailIcon fontSize="small" />, required: true },
                  { label: "Senha", value: credentials.password ? "••••••••" : "", icon: <LockIcon fontSize="small" />, required: true },
                ],
              },
            ]}
            onBack={() => setCurrentStep(4)}
            onSubmit={() => {}}
          />
        )}
      </div>
    </div>
  );
}
