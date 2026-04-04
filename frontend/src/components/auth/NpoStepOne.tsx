import { useState } from "react";
import { Input } from "../general/SimpleTextInput";
import { BaseButton } from "../general/BaseButton";
import {
  isValidEmail,
  isValidInstitutionName,
  isValidPassword,
} from "../../utils/validation";

type NpoStepOneProps = {
  onNext: () => void;
  onBack: () => void;
};

type FieldErrors = {
  nomeInstituicao?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
};

export function NpoStepOne({ onNext, onBack }: NpoStepOneProps) {
  const [nomeInstituicao, setNomeInstituicao] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const inputFilledClass =
    "!bg-vinculo-light-gray !border-0 focus:!ring-1 focus:!ring-vinculo-dark";

  function validate(): boolean {
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

  function handleNext() {
    if (validate()) {
      onNext();
    }
  }

  return (
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

      <div className="flex justify-center gap-4 mt-8">
        <BaseButton
          variant="ghost"
          className="w-32"
          onClick={onBack}
        >
          Voltar
        </BaseButton>
        <BaseButton
          variant="secondary"
          className="w-32"
          onClick={handleNext}
        >
          Próximo
        </BaseButton>
      </div>
    </>
  );
}
