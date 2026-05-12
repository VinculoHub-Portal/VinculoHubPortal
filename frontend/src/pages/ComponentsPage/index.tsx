import { useState } from "react"
import { Header } from "../../components/general/Header"
import { BaseButton } from "../../components/general/BaseButton"
import { Input } from "../../components/general/Input"
import { WizardSteps } from "../../components/auth/WizardSteps"

export function ComponentsPage() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="max-w-4xl mx-auto w-full flex flex-col gap-12 px-6">
        {/* Seção 1: Indicador de Progresso (Wizard) */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-vinculo-dark text-xl font-bold mb-6 border-b pb-2">
            Progresso de Cadastro (WizardSteps)
          </h2>

          <WizardSteps currentStep={currentStep} />

          <div className="flex justify-center gap-4 mt-8">
            <BaseButton
              variant="ghost"
              className="w-32" // Exemplo de largura customizada
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              Voltar
            </BaseButton>
            <BaseButton
              variant="secondary"
              className="w-32"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              disabled={currentStep === 5}
            >
              Próximo
            </BaseButton>
          </div>
        </section>

        {/* Seção 2: Inputs com validação visual isRequired */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-vinculo-dark text-xl font-bold mb-6 border-b pb-2">
            Formulário & Inputs (Com isRequired)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="email"
              label="E-mail"
              isRequired
              placeholder="seu@email.com"
              type="email"
            />
            <Input
              id="password"
              label="Senha"
              isRequired
              placeholder="........"
              type="password"
            />
            <Input
              id="valor"
              label="Investimento Desejado"
              placeholder="15000"
              type="number"
            />
            <Input
              id="fantasia"
              label="Nome Fantasia"
              placeholder="Digite o nome fantasia"
            />
          </div>
        </section>

        {/* Seção 3: Galeria de Estilos de Botão */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-vinculo-dark text-xl font-bold mb-6 border-b pb-2">
            Galeria de Botões (BaseButton)
          </h2>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500 uppercase font-bold">
                Primary
              </span>
              <BaseButton variant="primary">Entrar</BaseButton>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500 uppercase font-bold">
                Secondary
              </span>
              <BaseButton variant="secondary">Confirmar</BaseButton>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500 uppercase font-bold">
                Ghost
              </span>
              <BaseButton variant="ghost">Cancelar</BaseButton>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500 uppercase font-bold">
                Outline
              </span>
              <BaseButton variant="outline">Criar Conta</BaseButton>
            </div>
          </div>

          {/* Teste de Largura Total (Responsividade) */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col gap-4">
            <span className="text-xs text-slate-500 uppercase font-bold">
              Full Width (Ideal para Mobile)
            </span>
            <BaseButton variant="primary" fullWidth className="h-12">
              Acessar Portal VinculoHub
            </BaseButton>
          </div>
        </section>
      </main>
    </div>
  )
}
