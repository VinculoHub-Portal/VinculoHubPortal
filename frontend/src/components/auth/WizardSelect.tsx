import { useMemo, useState, useCallback } from "react";
import { Header } from "../general/Header";
import { BaseButton } from "../general/BaseButton";
import { WizardSteps } from "./WizardSteps";
import { WizardSingUp } from "./WizardSignUp";
import { NpoStepOne } from "./NpoStepOne";

type OrganizationType = "npo" | "enterprise";
type StepProps = { onNext: () => void; onBack: () => void };

function PlaceholderStep({ title, onNext, onBack }: { title: string } & StepProps) {
  return (
    <div>
      <h2 className="text-vinculo-dark font-semibold text-lg mb-6">{title}</h2>
      <div className="flex justify-center gap-4 mt-8">
        <BaseButton variant="ghost" className="w-32" onClick={onBack}>Voltar</BaseButton>
        <BaseButton variant="secondary" className="w-32" onClick={onNext}>Próximo</BaseButton>
      </div>
    </div>
  );
}

type GetStepsParams = {
  organizationType: OrganizationType;
  onSelectOrganizationType: (type: OrganizationType) => void;
  onNext: () => void;
  onBack: () => void;
};

function getSteps({
  organizationType,
  onSelectOrganizationType,
  onNext,
  onBack,
}: GetStepsParams) {
  const commonFirstStep = (
    <WizardSingUp
      key="signup"
      organizationType={organizationType}
      onSelectOrganizationType={onSelectOrganizationType}
      onNext={onNext}
    />
  );

  if (organizationType === "npo") {
    return [
      commonFirstStep,
      <NpoStepOne key="npo-step-2" onNext={onNext} onBack={onBack} />,
      <PlaceholderStep key="npo-step-3" title="Passo 3 - ONG - Informações Básicas 2" onNext={onNext} onBack={onBack} />,
      <PlaceholderStep key="npo-step-4" title="Passo 4 - ONG - Informações Básicas 3" onNext={onNext} onBack={onBack} />,
      <PlaceholderStep key="npo-step-5" title="Passo 5 - ONG - Cadastro de Projeto" onNext={onNext} onBack={onBack} />,
    ];
  }

  return [
    commonFirstStep,
    <PlaceholderStep key="ent-step-2" title="Passo 2 - Empresa - Cadastro da Empresa" onNext={onNext} onBack={onBack} />,
    <PlaceholderStep key="ent-step-3" title="Passo 3 - Empresa - Cadastro da Empresa 2" onNext={onNext} onBack={onBack} />,
    <PlaceholderStep key="ent-step-4" title="Passo 4 - Empresa - Cadastro da Empresa 3" onNext={onNext} onBack={onBack} />,
    <PlaceholderStep key="ent-step-5" title="Passo 5 - Empresa - Cadastro da Empresa 4" onNext={onNext} onBack={onBack} />,
  ];
}

export default function WizardSelect() {
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationType, setOrganizationType] =
    useState<OrganizationType>("npo");

  const totalSteps = 5;

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  }, [totalSteps]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  const steps = useMemo(
    () =>
      getSteps({
        organizationType,
        onSelectOrganizationType: setOrganizationType,
        onNext: handleNext,
        onBack: handleBack,
      }),
    [organizationType, handleNext, handleBack]
  );

  const currentStepContent = steps[currentStep - 1];

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
        </section>
      </main>
    </div>
  );
}