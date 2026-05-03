import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { checkCnpjAvailable, checkCpfAvailable } from "../../api/documentCheck";
import { Header } from "../../components/general/Header";
import { BackLink } from "../../components/general/BackLink";
import { BaseButton } from "../../components/general/BaseButton";
import { AuthRedirectModal } from "../../components/auth/AuthRedirectModal";
import { WizardSteps } from "../../components/auth/WizardSteps";
import { WizardSignUp } from "../../components/wizard/WizardSignUp";
import { Step2 } from "./Steps/Step2";
import { Step3 } from "./Steps/Step3";
import { Step4 } from "./Steps/Step4";
import type { OdsCatalogItem } from "../../api/ods";
import { stepValidators } from "../../config/wizard.config";
import { useOdsCatalog } from "../../hooks/useOdsCatalog";
import { useWizardPersistence } from "../../hooks/useWizardPersistence";
import type {
  FieldErrors,
  OrganizationType,
  WizardFormData,
} from "../../types/wizard.types";

const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const npoSignupDraftKey = "vinculohub:npo-signup-draft";
const npoWizardProgressKey = "vinculohub:npo-wizard-progress";

type NpoWizardProgress = {
  currentStep: number;
  organizationType: OrganizationType | null;
  formData: WizardFormData;
};

const emptyFormData: WizardFormData = {
  nomeInstituicao: "",
  cnpj: "",
  razaoSocial: "",
  cpf: "",
  porteOng: "",
  resumoInstitucional: "",
  esg: [],
  zipCode: "",
  street: "",
  streetNumber: "",
  complement: "",
  city: "",
  state: "",
  stateCode: "",
  phone: "",
  nomeProjeto: "",
  tipoProjeto: "",
  descricaoProjeto: "",
  metaCaptacao: "",
  odsProjeto: [],
};

function EnterpriseStepTwo() {
  return <div>Passo 2 - Empresa - Cadastro da Empresa</div>;
}

function EnterpriseStepThree() {
  return <div>Passo 3 - Empresa - Cadastro da Empresa 2</div>;
}

function EnterpriseStepFour() {
  return <div>Passo 4 - Empresa - Cadastro da Empresa 3</div>;
}

function EnterpriseStepFive() {
  return <div>Passo 5 - Empresa - Cadastro da Empresa 4</div>;
}

type GetStepsParams = {
  organizationType: OrganizationType | null;
  onSelectOrganizationType: (type: OrganizationType) => void;
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
  errors: FieldErrors;
  odsOptions: OdsCatalogItem[];
  isOdsLoading: boolean;
  isOdsError: boolean;
};

function getSteps({
  organizationType,
  onSelectOrganizationType,
  formData,
  setFormData,
  errors,
  odsOptions,
  isOdsLoading,
  isOdsError,
}: GetStepsParams) {
  const commonFirstStep = (
    <WizardSignUp
      key="signup"
      organizationType={organizationType}
      onSelectOrganizationType={onSelectOrganizationType}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
    />
  );

  if (organizationType === "npo") {
    return [
      commonFirstStep,
      <Step2
        key="npo-step-2"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />,
      <Step3
        key="npo-step-3"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />,
      <Step4
        key="npo-step-4"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        odsOptions={odsOptions}
        isOdsLoading={isOdsLoading}
        isOdsError={isOdsError}
      />,
    ];
  }

  return [
    commonFirstStep,
    <EnterpriseStepTwo key="enterprise-step-2" />,
    <EnterpriseStepThree key="enterprise-step-3" />,
    <EnterpriseStepFour key="enterprise-step-4" />,
    <EnterpriseStepFive key="enterprise-step-5" />,
  ];
}

export function RegisterPage() {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [wizardProgress, setWizardProgress, clearWizardProgress] =
    useWizardPersistence<NpoWizardProgress>(npoWizardProgressKey, {
      currentStep: 1,
      organizationType: null,
      formData: { ...emptyFormData },
    });

  const { currentStep, organizationType, formData } = wizardProgress;
  const {
    data: odsOptions = [],
    isLoading: isOdsLoading,
    isError: isOdsError,
  } = useOdsCatalog(organizationType === "npo");

  const setCurrentStep = useCallback(
    (step: number | ((prev: number) => number)) => {
      setWizardProgress((prev) => ({
        ...prev,
        currentStep: typeof step === "function" ? step(prev.currentStep) : step,
      }));
    },
    [setWizardProgress],
  );

  const setOrganizationType = useCallback(
    (type: OrganizationType | null) => {
      setWizardProgress((prev) => ({ ...prev, organizationType: type }));
    },
    [setWizardProgress],
  );

  const setFormData = useCallback(
    (data: WizardFormData | ((prev: WizardFormData) => WizardFormData)) => {
      setWizardProgress((prev) => ({
        ...prev,
        formData: typeof data === "function" ? data(prev.formData) : data,
      }));
    },
    [setWizardProgress],
  );

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isAuthRedirectModalOpen, setIsAuthRedirectModalOpen] = useState(false);
  const [isSubmittingNpo, setIsSubmittingNpo] = useState(false);

  const steps = useMemo(
    () =>
      getSteps({
        organizationType,
        onSelectOrganizationType: setOrganizationType,
        formData,
        setFormData,
        errors,
        odsOptions,
        isOdsLoading,
        isOdsError,
      }),
    [
      organizationType,
      formData,
      errors,
      odsOptions,
      isOdsLoading,
      isOdsError,
      setOrganizationType,
      setFormData,
    ],
  );

  const totalSteps = steps.length;
  const currentStepContent = steps[currentStep - 1];
  const isOdsCatalogBlocking =
    organizationType === "npo" &&
    currentStep === totalSteps &&
    (isOdsLoading || isOdsError || odsOptions.length === 0);

  useEffect(() => {
    if (organizationType === "enterprise" && currentStep > 1) {
      navigate("/company/register", { replace: true });
    }
  }, [currentStep, navigate, organizationType]);

  async function handleNpoSignup() {
    try {
      if (formData.cnpj) {
        const cnpjOk = await checkCnpjAvailable(formData.cnpj);
        if (!cnpjOk) {
          showToast("Este CNPJ já está cadastrado na plataforma.");
          return;
        }
      }
      if (formData.cpf) {
        const cpfOk = await checkCpfAvailable(formData.cpf);
        if (!cpfOk) {
          showToast("Este CPF já está cadastrado na plataforma.");
          return;
        }
      }

      sessionStorage.setItem(
        npoSignupDraftKey,
        JSON.stringify({ currentStep, organizationType, formData }),
      );

      await loginWithRedirect({
        appState: { returnTo: "/ong/dashboard" },
        authorizationParams: {
          audience: auth0Audience,
          projectType: formData.tipoProjeto,
          role: "NPO",
          screen_hint: "signup",
          ui_locales: "pt-BR",
        },
      });
    } catch {
      sessionStorage.removeItem(npoSignupDraftKey);
      showToast("Não foi possível iniciar o cadastro. Tente novamente.");
    }
  }

  async function handleConfirmNpoSignup() {
    setIsSubmittingNpo(true);

    try {
      await handleNpoSignup();
    } finally {
      setIsSubmittingNpo(false);
      setIsAuthRedirectModalOpen(false);
    }
  }

  function openNpoSignupRedirectNotice() {
    setIsAuthRedirectModalOpen(true);
  }

  function handleNext() {
    if (!organizationType) {
      setErrors({ organizationType: "Selecione o tipo de cadastro." });
      return;
    }

    const validator = stepValidators[organizationType][currentStep - 1];
    const nextErrors = validator
      ? validator(formData, { organizationType })
      : {};

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (organizationType === "enterprise") {
      navigate("/company/register");
      return;
    }

    if (organizationType === "npo" && currentStep === totalSteps) {
      openNpoSignupRedirectNotice();
      return;
    }

    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }

  function handleResetToFirstStep() {
    clearWizardProgress();
    sessionStorage.removeItem(npoSignupDraftKey);
    setWizardProgress({
      currentStep: 1,
      organizationType: null,
      formData: { ...emptyFormData },
    });
    setErrors({});
    navigate("/cadastro", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="max-w-4xl mx-auto w-full flex flex-col gap-12 px-6">
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <BackLink label="Voltar ao início" onClick={handleResetToFirstStep} />

          <WizardSteps currentStep={currentStep} totalSteps={totalSteps} />

          {currentStepContent}

          <div className="flex justify-center gap-4 mt-8">
            {currentStep > 1 && (
              <BaseButton variant="ghost" className="w-32" onClick={handleBack}>
                Voltar
              </BaseButton>
            )}
            <BaseButton
              variant="secondary"
              className="w-32"
              onClick={handleNext}
              disabled={isOdsCatalogBlocking}
            >
              {currentStep === totalSteps ? "Finalizar" : "Próximo"}
            </BaseButton>
          </div>
        </section>
      </main>

      <AuthRedirectModal
        open={isAuthRedirectModalOpen}
        title="Você será redirecionado para concluir o acesso"
        description="Na próxima etapa, abriremos o ambiente seguro de autenticação para criar sua conta e concluir a entrada no VinculoHubPortal."
        confirmLabel="Continuar"
        isLoading={isSubmittingNpo}
        onCancel={() => setIsAuthRedirectModalOpen(false)}
        onConfirm={() => {
          void handleConfirmNpoSignup();
        }}
      />
    </div>
  );
}
