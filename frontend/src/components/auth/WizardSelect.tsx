import { useMemo, useState } from "react";
import { Header } from "../general/Header";
import { BaseButton } from "../general/BaseButton";
import { WizardSteps } from "./WizardSteps";
import { WizardSingUp } from "./WizardSignUp";

type OrganizationType = "npo" | "enterprise";
{/* NPO Steps */}
function NpoStepTwo() {
  return <div>Passo 2 - ONG - Informações Básicas</div>;
}

function NpoStepThree() {
  return <div>Passo 3 - ONG - Informações Básicas 2</div>;
}

function NpoStepFour() {
  return <div>Passo 4 - ONG - Informações Básicas 3</div>;
}

function NpoStepFive() {
  return <div>Passo 5 - ONG - Cadastro de Projeto</div>;
}

{/* Enterprise Steps */}
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

{/* Deve ter uma tela de review das infos? */}

type GetStepsParams = {
  organizationType: OrganizationType;
  onSelectOrganizationType: (type: OrganizationType) => void;
};

function getSteps({
  organizationType,
  onSelectOrganizationType,
}: GetStepsParams) {
  const commonFirstStep = (
    <WizardSingUp
      key="signup"
      organizationType={organizationType}
      onSelectOrganizationType={onSelectOrganizationType}
    />
  );

  if (organizationType === "npo") {
    return [
      commonFirstStep,
      <NpoStepTwo key="npo-step-2" />,
      <NpoStepThree key="npo-step-3" />,
      <NpoStepFour key="npo-step-4" />,
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

export default function WizardSelect() {
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationType, setOrganizationType] =
    useState<OrganizationType>("npo");

  const steps = useMemo(
    () =>
      getSteps({
        organizationType,
        onSelectOrganizationType: setOrganizationType,
      }),
    [organizationType]
  );

  const totalSteps = steps.length;
  const currentStepContent = steps[currentStep - 1];

  function handleNext() {
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
          <WizardSteps
            currentStep={currentStep}
            totalSteps={totalSteps}
          />

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