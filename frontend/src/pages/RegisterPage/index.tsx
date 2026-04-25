import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/general/Header";
import { BaseButton } from "../../components/general/BaseButton";
import { WizardSteps } from "../../components/auth/WizardSteps";
import { WizardSingUp } from "../../components/wizard/WizardSignUp";
import { stepValidators } from "../../config/wizard.config";
import type {
  FieldErrors,
  OrganizationType,
  WizardFormData,
} from "../../types/wizard.types";
import { NPORegisteringStep2 } from "./Steps/Step2";
import { NPORegisteringStep3 } from "./Steps/Step3";
import { NPORegisteringStep4 } from "./Steps/Step4";
import { NPORegisteringStep5 } from "./Steps/Step5";

const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const npoSignupDraftKey = "vinculohub:npo-signup-draft";

type NpoSignupDraft = {
  currentStep?: number;
  organizationType?: OrganizationType;
  formData?: WizardFormData;
};

function readNpoSignupDraft(): NpoSignupDraft | null {
  const savedDraft = sessionStorage.getItem(npoSignupDraftKey);

  if (!savedDraft) {
    return null;
  }

  try {
    return JSON.parse(savedDraft) as NpoSignupDraft;
  } catch {
    sessionStorage.removeItem(npoSignupDraftKey);
    return null;
  }
}

{
  /* NPO Steps
  Agora são chamados diretamente no return!
  Só tem a func salva, para não quebrar o código.
  */
}

function NpoStepTwo({
  formData,
  setFormData,
  errors,
}: {
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
  errors: FieldErrors;
}) {
  return (
    <div>
      <NPORegisteringStep2
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
    </div>
  );
}

function NpoStepThree({
  formData,
  setFormData,
  errors,
}: {
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
  errors: FieldErrors;
}) {
  return (
    <div>
      <NPORegisteringStep3
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
    </div>
  );
}
function NpoStepFour() {
  return (
    <div>
      <NPORegisteringStep4 />
    </div>
  );
}
function NpoStepFive({
  formData,
  setFormData,
  errors,
}: {
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
  errors: FieldErrors;
}) {
  return (
    <div>
      <NPORegisteringStep5
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
    </div>
  );
}

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
  organizationType: OrganizationType;
  onSelectOrganizationType: (type: OrganizationType) => void;
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
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
      <NpoStepFour key="npo-step-4" />,
      <NpoStepFive
        key="npo-step-5"
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
  const [initialDraft] = useState(readNpoSignupDraft);
  const [currentStep, setCurrentStep] = useState(
    initialDraft?.currentStep ?? 1,
  );
  const [organizationType, setOrganizationType] =
    useState<OrganizationType | null>(initialDraft?.organizationType ?? null);
  const [formData, setFormData] = useState<WizardFormData>({
    nomeInstituicao: "",
    nomeProjeto: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    cnpj: "",
    razaoSocial: "",
    description: "",
    npo_size: "",
    ods: [],
    environmental: false,
    social: false,
    governance: false,
    capital: 0,
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const steps = useMemo(
    () =>
      getSteps({
        organizationType: organizationType ?? null,
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
      JSON.stringify({
        currentStep,
        organizationType,
        formData,
      }),
    );

    await loginWithRedirect({
      appState: {
        returnTo: "/ong/dashboard",
      },
      authorizationParams: {
        audience: auth0Audience,
        role: "NPO",
        screen_hint: "signup",
      },
    });
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

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (organizationType === "enterprise") {
      navigate("/company/register");
      return;
    }

    if (organizationType === "npo" && currentStep === totalSteps) {
      void handleNpoSignup();
      return;
    }

    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="max-w-4xl mx-auto w-full flex flex-col gap-12 px-6">
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <WizardSteps currentStep={currentStep} totalSteps={totalSteps} />

          {currentStepContent}

          <div className="flex justify-center gap-4 mt-8">
            <BaseButton
              variant="ghost"
              className="w-32"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Voltar
            </BaseButton>
            <BaseButton
              variant="secondary"
              className="w-32"
              onClick={handleNext}
            >
              {currentStep === totalSteps ? "Finalizar" : "Proximo"}
            </BaseButton>
          </div>
        </section>
      </main>
    </div>
  );
}
