import { useMemo, useState } from "react";
import { WizardFormProvider } from "../../contexts/WizardFormContext";
import { Header } from "../../components/general/Header";
import { WizardSteps } from "../../components/auth/WizardSteps";
import { WizardSingUp } from "../../components/wizard/WizardSignUp";
import { NpoStepTwo } from "../../components/ong/NpoStepTwo";
import { NPOStepFour } from "../../components/ong/NpoStepFour";
import {
  NpoRegistrationFeedback,
  NpoWizardFooter,
} from "../../components/npo-registration";
import { useNpoAccountRegistration } from "../../hooks/useNpoAccountRegistration";
import { stepValidators } from "../../config/wizard.config";
import type {
  FieldErrors,
  WizardFormData,
  OrganizationType,
} from "../../types/wizard.types";

{
  /* NPO Steps
  Agora são chamados diretamente no return!
  Só tem a func salva, para não quebrar o código.

function NpoStepTwoDisplay() { ERRADO!
  return (
    <div><NpoStepTwo /></div>
  );
}
*/
}

function NpoStepThree() {
  return <div>Passo 3 - ONG - Informações Básicas 2</div>;
}
function NpoStepFive() {
  return <div>Passo 5 - ONG - Cadastro de Projeto</div>;
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
      <NpoStepTwo
        key="npo-step-2"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />,
      <NpoStepThree key="npo-step-3" />,
      <NPOStepFour key="npo-step-4" />,
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

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationType, setOrganizationType] =
    useState<OrganizationType | null>(null);

  //
  const [formData, setFormData] = useState<WizardFormData>({
    nomeInstituicao: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cnpj: "",
    razaoSocial: "",
    cpf: "",
    description: "",
    phone: "",
    npoSize: "",
    esgEnvironmental: false,
    esgSocial: false,
    esgGovernance: false,
    addressZipCode: "",
    addressState: "",
    addressStateCode: "",
    addressCity: "",
    addressStreet: "",
    addressNumber: "",
    addressComplement: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});

  const npoRegistration = useNpoAccountRegistration();

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

  function handleFinalizeNpo() {
    void npoRegistration.submit(formData);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="max-w-4xl mx-auto w-full flex flex-col gap-12 px-6">
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <WizardFormProvider
            value={{ formData, setFormData, errors }}
          >
            <WizardSteps currentStep={currentStep} totalSteps={totalSteps} />

            {currentStepContent}

            <NpoRegistrationFeedback
              success={npoRegistration.success}
              errorMessage={npoRegistration.errorMessage}
            />

            <NpoWizardFooter
              currentStep={currentStep}
              totalSteps={totalSteps}
              organizationType={organizationType}
              isSubmitting={npoRegistration.isSubmitting}
              onBack={handleBack}
              onNext={handleNext}
              onFinalizeNpo={handleFinalizeNpo}
            />
          </WizardFormProvider>
        </section>
      </main>
    </div>
  );
}
