import { useState } from "react";
import { Header } from "../../components/general/Header";
import { BaseButton } from "../../components/general/BaseButton";
import { Input } from "../../components/general/SimpleTextInput";
import { WizardSteps } from "../../components/auth/WizardSteps";
import {
  isValidEmail,
  isValidInstitutionName,
  isValidPassword,
} from "../../utils/validation";

const TOTAL_STEPS = 5;

type FieldErrors = {
  nomeInstituicao?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
};

export default function CadastroInstituicaoPage() {
  const [currentStep, setCurrentStep] = useState(2);

  const [nomeInstituicao, setNomeInstituicao] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const inputFilledClass =
    "!bg-vinculo-light-gray !border-0 focus:!ring-1 focus:!ring-vinculo-dark";

  function validateStep2(): boolean {
    const next: FieldErrors = {};

    if (!isValidInstitutionName(nomeInstituicao)) {
      next.nomeInstituicao =
        "Informe o nome da instituição (entre 2 e 200 caracteres).";
    }
    if (!isValidEmail(email)) {
      next.email = "Informe um e-mail válido.";
    }
    if (!isValidPassword(senha)) {
      next.senha =
        "A senha deve ter no mínimo 8 caracteres, com letras e números.";
    }
    if (confirmarSenha !== senha) {
      next.confirmarSenha = "As senhas não coincidem.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleVoltar() {
    if (currentStep <= 1) return;
    setCurrentStep((s) => s - 1);
  }

  function handleProximo() {
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep >= TOTAL_STEPS) return;
    setCurrentStep((s) => s + 1);
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col pb-16">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 pt-8 md:pt-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-[var(--shadow-vinculo)] px-6 py-8 md:px-10 md:py-10 border border-slate-100">
          <h1 className="text-center text-vinculo-dark text-xl md:text-2xl font-bold mb-2">
            Cadastro de Instituição
          </h1>

          <WizardSteps currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {currentStep === 2 && (
            <>
              <h2 className="text-vinculo-dark font-semibold text-lg mb-6">
                Informações Básicas
              </h2>

              <div className="flex flex-col gap-5">
                <Input
                  id="nome-instituicao"
                  label="Nome da Instituição"
                  isRequired
                  autoComplete="organization"
                  value={nomeInstituicao}
                  onChange={(e) => {
                    setNomeInstituicao(e.target.value);
                    if (errors.nomeInstituicao)
                      setErrors((er) => ({ ...er, nomeInstituicao: undefined }));
                  }}
                  error={errors.nomeInstituicao}
                  className={inputFilledClass}
                  placeholder="Nome da sua ONG ou instituição"
                />

                <Input
                  id="email-cadastro"
                  label="E-mail"
                  isRequired
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((er) => ({ ...er, email: undefined }));
                  }}
                  error={errors.email}
                  className={inputFilledClass}
                  placeholder="seu@email.com"
                />

                <Input
                  id="senha"
                  label="Senha"
                  isRequired
                  type="password"
                  autoComplete="new-password"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    if (errors.senha)
                      setErrors((er) => ({ ...er, senha: undefined }));
                  }}
                  error={errors.senha}
                  className={inputFilledClass}
                  placeholder="••••••••"
                />

                <Input
                  id="confirmar-senha"
                  label="Confirmar senha"
                  isRequired
                  type="password"
                  autoComplete="new-password"
                  value={confirmarSenha}
                  onChange={(e) => {
                    setConfirmarSenha(e.target.value);
                    if (errors.confirmarSenha)
                      setErrors((er) => ({ ...er, confirmarSenha: undefined }));
                  }}
                  error={errors.confirmarSenha}
                  className={inputFilledClass}
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          {currentStep !== 2 && (
            <div className="text-center text-slate-600 py-10 text-sm">
              {currentStep === 1 && (
                <p>Etapa 1 — conteúdo anterior do fluxo de cadastro.</p>
              )}
              {currentStep > 2 && (
                <p>Etapa {currentStep} — próximas etapas do cadastro.</p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center gap-4 mt-10 pt-2">
            <BaseButton
              type="button"
              variant="outline"
              onClick={handleVoltar}
              disabled={currentStep <= 1}
              className="rounded-full !border-slate-300 !text-slate-700 !bg-white hover:!bg-slate-50 disabled:opacity-50"
            >
              Voltar
            </BaseButton>
            <BaseButton
              type="button"
              variant="secondary"
              onClick={handleProximo}
              disabled={currentStep >= TOTAL_STEPS}
              className="rounded-full px-8"
            >
              Próximo
            </BaseButton>
          </div>
        </div>
      </main>
    </div>
  );
}
