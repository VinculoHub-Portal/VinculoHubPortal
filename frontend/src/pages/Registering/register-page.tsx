import { useState } from "react";
import { WizardSteps } from "../../components/auth/WizardSteps";
import { BaseButton } from "../../components/general/BaseButton";
import { NPO_Registering_Step_4 } from "./Steps/Step4";

export default function CadastroInstituicao() {
  const [currentStep, setCurrentStep] = useState(4);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F6F3EC]">
      <div className="bg-white p-8 rounded-xl shadow-md w-600 max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#00467F]">
            Cadastro de Instituição
          </h1>
        </div>

        <WizardSteps currentStep={currentStep} />
        <NPO_Registering_Step_4/>
        <div className="flex gap-2">
          <BaseButton
            variant="outline"
            className="flex-1 hover:bg-gray-300 hover:text-gray-800 transition-colors duration-200"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Voltar
          </BaseButton>

          <BaseButton
            variant="secondary"
            className="flex-1 hover:bg-green-600 transition-colors duration-200"
            onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
          >
            Confirmar
          </BaseButton>
        </div>
      </div>
    </div>
  );
}

