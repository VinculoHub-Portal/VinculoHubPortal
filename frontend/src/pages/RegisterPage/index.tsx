import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Header } from "../../components/general/Header";
import { BaseButton } from "../../components/general/BaseButton";
import { WizardSteps } from "../../components/auth/WizardSteps";
import { WizardSingUp } from "../../components/wizard/WizardSignUp";
import { NpoStepThree } from "../../components/ong/NpoStepThree";
import { stepValidators } from "../../config/wizard.config";
import type {
  FieldErrors,
  OrganizationType,
  WizardEsgOption,
  WizardFormData,
} from "../../types/wizard.types";

const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const npoSignupDraftKey = "vinculohub:npo-signup-draft";

type NpoSignupDraft = {
  currentStep?: number;
  organizationType?: OrganizationType;
  formData?: WizardFormData;
};

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

type NpoStepFourProps = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
};

const esgOptions: Array<{ value: WizardEsgOption; label: string }> = [
  { value: "ambiental", label: "Ambiental" },
  { value: "social", label: "Social" },
  { value: "governanca", label: "Governanca" },
];

function NpoStepFour({ formData, setFormData, errors }: NpoStepFourProps) {
  function toggleEsg(value: WizardEsgOption) {
    setFormData((prev) => {
      const selected = prev.esg.includes(value);

      return {
        ...prev,
        esg: selected
          ? prev.esg.filter((option) => option !== value)
          : [...prev.esg, value],
      };
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-vinculo-dark font-semibold text-lg">Pilares ESG</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {esgOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 rounded-lg border border-vinculo-gray px-4 py-3 text-vinculo-dark"
          >
            <input
              type="checkbox"
              checked={formData.esg.includes(option.value)}
              onChange={() => toggleEsg(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>

      {errors.esg && (
        <p className="text-sm text-error" role="alert">
          {errors.esg}
        </p>
      )}
    </div>
  );
}

function NpoStepFive() {
  return <div>Passo 5 - ONG - Cadastro de Projeto</div>;
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
      <NpoStepFour
        key="npo-step-4"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />,
      <NpoStepFive key="npo-step-5" />,
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
  const [initialDraft] = useState(readNpoSignupDraft);
  const [currentStep, setCurrentStep] = useState(initialDraft?.currentStep ?? 1);
  const [organizationType, setOrganizationType] =
    useState<OrganizationType | null>(initialDraft?.organizationType ?? null);
  const [formData, setFormData] = useState<WizardFormData>({
    ...emptyFormData,
    ...initialDraft?.formData,
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const steps = useMemo(
    () =>
      getSteps({
        organizationType: organizationType ?? "npo",
        onSelectOrganizationType: setOrganizationType,
        formData,
        setFormData,
        errors,
      }),
    [organizationType, formData, errors],
  );

  const totalSteps = steps.length;
  const currentStepContent = steps[currentStep - 1];

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
            <BaseButton variant="secondary" className="w-32" onClick={handleNext}>
              {currentStep === totalSteps ? "Finalizar" : "Proximo"}
            </BaseButton>
          </div>
        </section>
      </main>
    </div>
  );
}
