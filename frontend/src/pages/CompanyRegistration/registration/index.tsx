import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { logger, getApiErrorMessage } from "../../../utils/logger";
import { WizardSteps } from "../../../components/auth/WizardSteps";
import { AuthRedirectModal } from "../../../components/auth/AuthRedirectModal";
import { BackLink } from "../../../components/general/BackLink";
import { Input } from "../../../components/general/Input";
import { TextArea } from "../../../components/general/TextArea";
import { BaseButton } from "../../../components/general/BaseButton";
import { InfoBox } from "../../../components/general/InfoBox";
import { useZipCode } from "../../../hooks/useZipCode";
import { useCnpj } from "../../../hooks/useCnpj";
import { CompanyIcon, DescriptionIcon, CnpjIcon, AddressIcon, StateIcon, PhoneIcon, EmailIcon } from "../../../components/icons";
import { RegistrationSummary } from "../../../components/register/RegistrationSummary";
import { validateCnpj } from "../../../utils/validateCnpj";
import { formatCnpj } from "../../../utils/formatCnpj";
import { formatZipCode } from "../../../utils/formatZipCode";
import type { CompanyRegistrationPayload } from "../../../api/company";

const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const companySignupDraftKey = "vinculohub:company-signup-draft";

const LOG = "CompanyRegistration";

export function CompanyRegistrationPage() {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const [currentStep, _setCurrentStep] = useState(2);
  const setCurrentStep = useCallback((step: number | ((prev: number) => number)) => {
    _setCurrentStep((prev) => {
      const next = typeof step === "function" ? step(prev) : step;
      logger.info(LOG, `Step ${prev} → ${next}`);
      return next;
    });
  }, []);
  const [signupError, setSignupError] = useState("");
  const [isRedirectingToAuth0, setIsRedirectingToAuth0] = useState(false);
  const [isAuthRedirectModalOpen, setIsAuthRedirectModalOpen] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    name: "",
    tradeName: "",
    description: "",
    cnpj: "",
  });

  const [cnpjError, setCnpjError] = useState("");

  const [contactErrors, setContactErrors] = useState({
    zip_code: "",
    number: "",
  });

  const validateContactStep = () => {
    const errors = { zip_code: "", number: "" };
    let valid = true;

    if (contactInfo.zip_code.replace(/\D/g, "").length !== 8) {
      errors.zip_code = "Informe um CEP válido";
      valid = false;
    }

    if (!contactInfo.number.trim()) {
      errors.number = "Informe o número";
      valid = false;
    }

    setContactErrors(errors);
    return valid;
  };

  const [credentials, setCredentials] = useState({
    email: "",
  });

  const [credentialsErrors, setCredentialsErrors] = useState({
    email: "",
  });

  const validateCredentialsStep = () => {
    const email = credentials.email.trim();
    logger.info(LOG, "Validating credentials", { email });

    if (!email) {
      logger.warn(LOG, "Credentials validation failed: empty email");
      setCredentialsErrors({ email: "Informe um e-mail" });
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      logger.warn(LOG, "Credentials validation failed: invalid email format");
      setCredentialsErrors({ email: "E-mail inválido" });
      return false;
    }

    logger.info(LOG, "Credentials validation passed");
    setCredentials((prev) => ({ ...prev, email }));
    setCredentialsErrors({ email: "" });
    return true;
  };

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

  const resetCompanyWizard = () => {
    logger.warn(LOG, "Wizard reset triggered");
    sessionStorage.removeItem(companySignupDraftKey);
    setCurrentStep(2);
    setSignupError("");
    setIsRedirectingToAuth0(false);
    setBasicInfo({
      name: "",
      tradeName: "",
      description: "",
      cnpj: "",
    });
    setCnpjError("");
    setContactErrors({ zip_code: "", number: "" });
    setCredentials({
      email: "",
    });
    setCredentialsErrors({
      email: "",
    });
    setContactInfo({
      zip_code: "",
      street: "",
      number: "",
      complement: "",
      city: "",
      state: "",
      state_code: "",
      phone: "",
    });
    navigate("/cadastro", { replace: true });
  };

  const {
    data: cnpjData,
    isFetching: loadingCnpj,
    error: cnpjQueryError,
  } = useCnpj(currentStep === 2 ? basicInfo.cnpj : "");

  const {
    data: zipCodeData,
    isFetching: loadingZipCode,
    error: zipCodeQueryError,
  } = useZipCode(currentStep === 3 ? contactInfo.zip_code : "");

  useEffect(() => {
    if (cnpjData) {
      logger.info(LOG, "CNPJ data received", { razao: cnpjData.razao_social, fantasia: cnpjData.nome_fantasia });
      const timeoutId = window.setTimeout(() => {
        setBasicInfo((prev) => ({
          ...prev,
          name: cnpjData.razao_social || prev.name,
          tradeName: cnpjData.nome_fantasia || prev.tradeName,
        }));
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [cnpjData]);

  useEffect(() => {
    if (zipCodeData) {
      logger.info(LOG, "ZIP code data received", { city: zipCodeData.city, state: zipCodeData.stateCode });
      const timeoutId = window.setTimeout(() => {
        setContactInfo((prev) => ({
          ...prev,
          street: zipCodeData.street || prev.street,
          number: (zipCodeData.complement ?? "").slice(0, 20) || prev.number,
          city: zipCodeData.city || prev.city,
          state: zipCodeData.state || prev.state,
          state_code: zipCodeData.stateCode || prev.state_code,
        }));
      }, 0);

      return () => window.clearTimeout(timeoutId);
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

  const handleStepTwoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger.info(LOG, "Step 2 submit", { cnpj: basicInfo.cnpj, name: basicInfo.name });

    if (!basicInfo.cnpj) {
      setCnpjError("Informe o CNPJ");
      return;
    }

    if (!validateCnpj(basicInfo.cnpj)) {
      setCnpjError("CNPJ inválido");
      return;
    }

    setCnpjError("");
    setCurrentStep(3);
  };

  const buildCompanyPayload = (): CompanyRegistrationPayload => ({
    cnpj: basicInfo.cnpj,
    legalName: basicInfo.name,
    socialName: basicInfo.tradeName,
    description: basicInfo.description,
    zipCode: contactInfo.zip_code,
    street: contactInfo.street,
    number: contactInfo.number,
    complement: contactInfo.complement,
    city: contactInfo.city,
    state: contactInfo.state,
    stateCode: contactInfo.state_code,
    phone: contactInfo.phone,
    email: credentials.email,
  });

  const handleCompanySignup = async () => {
    logger.info(LOG, "handleCompanySignup called", { email: credentials.email, hasError: !!credentialsErrors.email });

    if (!credentials.email || credentialsErrors.email) {
      logger.warn(LOG, "Signup blocked: email missing or has error");
      setCredentialsErrors((prev) => ({
        ...prev,
        email: prev.email || "Informe um e-mail válido",
      }));
      return;
    }

    setSignupError("");
    setIsRedirectingToAuth0(true);

    try {
      const payload = buildCompanyPayload();
      logger.info(LOG, "Saving company draft to sessionStorage", { cnpj: payload.cnpj, email: payload.email });
      sessionStorage.setItem(
        companySignupDraftKey,
        JSON.stringify({ payload }),
      );

      logger.info(LOG, "Redirecting to Auth0 for signup");
      await loginWithRedirect({
        appState: {
          returnTo: "/empresa/dashboard",
        },
        authorizationParams: {
          audience: auth0Audience,
          login_hint: credentials.email,
          role: "COMPANY",
          screen_hint: "signup",
          ui_locales: 'pt-BR',
        },
      });
    } catch (error) {
      logger.error(LOG, "Auth0 redirect failed", error);
      setIsRedirectingToAuth0(false);
      setSignupError("Não foi possível abrir a próxima etapa do cadastro. Tente novamente.");
    }
  };

  const openCompanySignupRedirectNotice = () => {
    setSignupError("");
    setIsAuthRedirectModalOpen(true);
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
      subtitle: "Informe o e-mail que será usado para criar o acesso à conta.",
    },
    5: {
      heading: "Cadastro Concluído!",
      subtitle: "Revise o resumo e finalize o cadastro da sua empresa.",
    },
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <BackLink label="Voltar ao início" onClick={resetCompanyWizard} />
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
          <form className="flex flex-col gap-4" onSubmit={handleStepTwoSubmit}>
            <div className="flex flex-col gap-1">
              <Input
                label="CNPJ"
                id="cnpj"
                placeholder="00.000.000/0000-00"
                maxLength={18}
                value={basicInfo.cnpj}
                onChange={handleBasicChange}
                onBlur={handleCnpjBlur}
                error={cnpjError || (cnpjQueryError ? getApiErrorMessage(cnpjQueryError, "CNPJ não encontrado. Verifique e tente novamente.") : "")}
                icon={<CnpjIcon />}
                iconPosition="left"
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
                iconPosition="left"
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
                iconPosition="left"
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
              <BaseButton
                type="button"
                variant="ghost"
                className="w-28"
                onClick={resetCompanyWizard}
              >
                Voltar
              </BaseButton>
              <BaseButton
                type="submit"
                variant="secondary"
                className="w-28"
              >
                Próximo
              </BaseButton>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-1">
              <Input
                label="CEP"
                id="zip_code"
                placeholder="00000-000"
                maxLength={9}
                value={contactInfo.zip_code}
                onChange={(e) => {
                  handleContactChange(e);
                  setContactErrors((prev) => ({ ...prev, zip_code: "" }));
                }}
                error={contactErrors.zip_code}
                icon={<AddressIcon />}
                iconPosition="left"
                isRequired
              />
              {loadingZipCode && (
                <span className="text-sm text-slate-400">
                  Consultando CEP...
                </span>
              )}
              {zipCodeQueryError && (
                <span className="text-sm text-error">
                  {getApiErrorMessage(zipCodeQueryError, "CEP não encontrado. Verifique e tente novamente.")}
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
                  iconPosition="left"
                  disabled={!!zipCodeData}
                />
              </div>
              <Input
                label="Número"
                id="number"
                placeholder="Ex: 123"
                maxLength={20}
                value={contactInfo.number}
                onChange={(e) => {
                  handleContactChange(e);
                  setContactErrors((prev) => ({ ...prev, number: "" }));
                }}
                error={contactErrors.number}
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
                value={contactInfo.complement}
                onChange={handleContactChange}
                icon={<AddressIcon />}
                iconPosition="left"
              />
              <Input
                label="Cidade"
                id="city"
                placeholder="Ex: São Paulo"
                maxLength={50}
                value={contactInfo.city}
                onChange={handleContactChange}
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
                value={contactInfo.state}
                onChange={handleContactChange}
                icon={<StateIcon />}
                iconPosition="left"
                disabled={!!zipCodeData}
              />
              <Input
                label="UF"
                id="state_code"
                placeholder="Ex: SP"
                maxLength={2}
                value={contactInfo.state_code}
                onChange={handleContactChange}
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
              value={contactInfo.phone}
              onChange={handleContactChange}
              icon={<PhoneIcon />}
              iconPosition="left"
            />

            <InfoBox
              title="Importante"
              message="Essas informações serão visíveis no seu perfil público e utilizadas por ONGs para entrar em contato com sua empresa."
            />

            <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
              <BaseButton
                type="button"
                variant="ghost"
                className="w-28"
                onClick={() => setCurrentStep(2)}
              >
                Voltar
              </BaseButton>
              <BaseButton
                type="button"
                variant="secondary"
                className="w-28"
                onClick={() => {
                  if (!validateContactStep()) return;
                  setCurrentStep(4);
                }}
              >
                Próximo
              </BaseButton>
            </div>
          </form>
        )}

        {currentStep === 4 && (
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
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
              iconPosition="left"
              isRequired
            />



            <InfoBox
              title="Importante"
              message="A senha será criada na próxima etapa, em um ambiente seguro. Aqui usamos seu e-mail para iniciar esse cadastro."
            />

            <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
              <BaseButton
                type="button"
                variant="ghost"
                className="w-28"
                onClick={() => setCurrentStep(3)}
              >
                Voltar
              </BaseButton>
              <BaseButton
                type="button"
                variant="secondary"
                className="w-28"
                onClick={() => {
                  if (!validateCredentialsStep()) return;
                  setCurrentStep(5);
                }}
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
                ],
              },
            ]}
            onBack={() => setCurrentStep(4)}
            onSubmit={openCompanySignupRedirectNotice}
            isLoading={isRedirectingToAuth0}
            errorMessage={signupError || undefined}
          />
        )}
      </div>

      <AuthRedirectModal
        open={isAuthRedirectModalOpen}
        title="Você será redirecionado para concluir o acesso"
        description="Na próxima etapa, abriremos o ambiente seguro de autenticação para criar sua conta e concluir a entrada no VinculoHubPortal."
        confirmLabel="Continuar"
        isLoading={isRedirectingToAuth0}
        onCancel={() => setIsAuthRedirectModalOpen(false)}
        onConfirm={() => {
          setIsAuthRedirectModalOpen(false);
          void handleCompanySignup();
        }}
      />
    </div>
  );
}
