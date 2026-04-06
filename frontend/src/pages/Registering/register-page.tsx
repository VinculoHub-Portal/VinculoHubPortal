import React, { useState } from "react";
import { WizardSteps } from "../../components/auth/WizardSteps";
import { BaseButton } from "../../components/general/BaseButton";

export default function CadastroInstituicao() {
  const [currentStep, setCurrentStep] = useState(4);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F6F3EC]">
      {/* Container principal */}
      <div className="bg-white p-8 rounded-xl shadow-md w-600 max-w-md space-y-6">
        {/* Texto de título */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#00467F]">
            Cadastro de Instituição
          </h1>
        </div>

        {/* Wizard Steps */}
        <WizardSteps currentStep={currentStep} />

        {/* Campos de input */}
        <div className="space-y-4">
          <h6 className="font-semibold text-[#00467F]">Informações básicas</h6>
          <div>
            <label className="block text-black mb-1">
              Telefone
              <span className="text-gray-500 ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Digite o telefone"
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#F3F3F5]"
            />
          </div>
          <div>
            <label className="block text-black mb-1">
              Endereço
              <span className="text-gray-500 ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Digite o endereço"
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#F3F3F5]"
            />
          </div>
        </div>

        {/* Botões “grudados” com hover */}
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