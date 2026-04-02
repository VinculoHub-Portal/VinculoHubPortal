import { useState } from "react";
import { WizardSteps } from "../../../components/auth/WizardSteps";
import { BackLink } from "../../../components/general/BackLink";
import { Input } from "../../../components/general/SimpleTextInput";
import { TextArea } from "../../../components/general/SimpleTextArea";
import { BaseButton } from "../../../components/general/BaseButton";

export default function CompanyRegistrationPage() {
  const [formData, setFormData] = useState({
    legalName: "",
    tradeName: "",
    description: "",
    cnpj: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <BackLink label="Voltar ao início" />
      </div>

      <WizardSteps currentStep={2} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-vinculo-dark text-center mb-6">
          Cadastro de Empresa
        </h1>

        <h2 className="text-lg font-semibold text-vinculo-dark">
          Informações Básicas
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Preencha os dados principais da sua empresa.
        </p>

        <form className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Razão Social"
              id="legalName"
              placeholder="Digite a razão social"
              value={formData.legalName}
              onChange={handleChange}
              isRequired={true}
            />
            <Input
              label="Nome Fantasia"
              id="tradeName"
              placeholder="Digite o nome fantasia"
              value={formData.tradeName}
              onChange={handleChange}
              isRequired={true}
            />
          </div>

          <TextArea
            label="Descrição da Empresa"
            id="description"
            placeholder="Descreva brevemente a empresa..."
            value={formData.description}
            onChange={handleChange}
            isRequired={true}
          />

          <Input
            label="CNPJ"
            id="cnpj"
            placeholder="00.000.000/0000-00"
            maxLength={18}
            value={formData.cnpj}
            onChange={handleChange}
            isRequired={true}
          />

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
            <BaseButton variant="ghost" className="w-28">
              Voltar
            </BaseButton>
            <BaseButton variant="secondary" className="w-28">
              Próximo
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  );
}
