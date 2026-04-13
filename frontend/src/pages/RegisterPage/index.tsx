import { useMemo, useState } from "react";
import { Header } from "../../components/general/Header";
import { BaseButton } from "../../components/general/BaseButton";
import { WizardSteps } from "../../components/auth/WizardSteps";
import { WizardSingUp } from "../../components/wizard/WizardSignUp";
import { stepValidators } from "../../config/wizard.config";
import type {
  FieldErrors,
  WizardFormData,
  OrganizationType,
} from "../../types/wizard.types";
import { NPORegisteringStep2 } from "./Steps/Step2";
import { NPORegisteringStep3 } from "./Steps/Step3";
import { NPORegisteringStep4 } from "./Steps/Step4";
import { NPORegisteringStep5 } from "./Steps/Step5";

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

{
  /* Enterprise Steps - Mesma lógica dos NPOs*/
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

{
  /* Deve ter uma tela de review das infos? */
}

type GetStepsParams = {
  organizationType: OrganizationType;
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
      <NpoStepTwo
        key="npo-step-2"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />,
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

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationType, setOrganizationType] =
    useState<OrganizationType | null>(null);

  //
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
              disabled={currentStep === totalSteps}
            >
              Próximo
            </BaseButton>
          </div>
        </section>
      </main>
    </div>
  );
}
