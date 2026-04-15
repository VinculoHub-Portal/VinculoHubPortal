import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/general/Header";
import { BackLink } from "../../components/general/BackLink";
import { BaseButton } from "../../components/general/BaseButton";
import { AuthRedirectModal } from "../../components/auth/AuthRedirectModal";
import { WizardSteps } from "../../components/auth/WizardSteps";
import { WizardSingUp } from "../../components/wizard/WizardSignUp";
import { NpoStepThree } from "../../components/ong/NpoStepThree";
import { NpoStepFour } from "../../components/ong/NpoStepFour";
import { stepValidators } from "../../config/wizard.config";
import type {
  FieldErrors,
  OrganizationType,
  WizardFormData,
} from "../../types/wizard.types";

const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const npoSignupDraftKey = "vinculohub:npo-signup-draft";

const emptyFormData: WizardFormData = {
  nomeInstituicao: "",
  email: "",
  senha: "",
  confirmarSenha: "",
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
};

function getSteps({
  organizationType,
  onSelectOrganizationType,
  formData,
  setFormData,
  errors,
}: GetStepsParams) {
  const commonFirstStep = (
    <WizardSingUp
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
      <NpoStepThree
        key="npo-step-3"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />,
      <NpoStepFour
        key="npo-step-4"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
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

export default function RegisterPage() {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationType, setOrganizationType] =
    useState<OrganizationType | null>(null);
  const [formData, setFormData] = useState<WizardFormData>({ ...emptyFormData });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isAuthRedirectModalOpen, setIsAuthRedirectModalOpen] = useState(false);

  const steps = useMemo(
    () =>
      getSteps({
        organizationType,
        onSelectOrganizationType: setOrganizationType,
        formData,
        setFormData,
        errors,
      }),
    [organizationType, formData, errors],
  );

  const totalSteps = steps.length;
  const currentStepContent = steps[currentStep - 1];

  useEffect(() => {
    if (organizationType === "enterprise" && currentStep > 1) {
      navigate("/company/register", { replace: true });
    }
  }, [currentStep, navigate, organizationType]);

  async function handleNpoSignup() {
    sessionStorage.setItem(
      npoSignupDraftKey,
      JSON.stringify({ currentStep, organizationType, formData }),
    );

    await loginWithRedirect({
      appState: { returnTo: "/ong/dashboard" },
      authorizationParams: {
        audience: auth0Audience,
        role: "NPO",
        screen_hint: "signup",
        ui_locales: "pt-BR",
      },
    });
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
    const nextErrors = validator ? validator(formData, { organizationType }) : {};

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
    sessionStorage.removeItem(npoSignupDraftKey);
    setCurrentStep(1);
    setOrganizationType(null);
    setFormData({ ...emptyFormData });
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
            <BaseButton variant="secondary" className="w-32" onClick={handleNext}>
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
        onCancel={() => setIsAuthRedirectModalOpen(false)}
        onConfirm={() => {
          setIsAuthRedirectModalOpen(false);
          void handleNpoSignup();
        }}
      />
    </div>
  );
}
