import type { FieldErrors, StepValidator } from "../types/wizard.types";

/** E-mail em formato comum (evita espaços e exige domínio). */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Senha: mínimo 8 caracteres, pelo menos uma letra e um número. */
export const PASSWORD_REGEX = /^(?=.*[A-Za-zÀ-ÿ])(?=.*\d).{8,}$/;

export function isValidEmail(value: string): boolean {
  const t = value.trim();
  return t.length > 0 && EMAIL_REGEX.test(t);
}

export function isValidPassword(value: string): boolean {
  return PASSWORD_REGEX.test(value);
}

export function isValidInstitutionName(value: string): boolean {
  const t = value.trim();
  return t.length >= 2 && t.length <= 200;
}

function mergeErrors(...errorsList: FieldErrors[]): FieldErrors {
  return errorsList.reduce((acc, current) => ({ ...acc, ...current }), {});
}

export function composeValidators(
  ...validators: StepValidator[]
): StepValidator {
  return (data, context) =>
    mergeErrors(...validators.map((validator) => validator(data, context)));
}

/* Regras pequenas e reaproveitáveis */
export const validateInstitutionName: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!isValidInstitutionName(data.nomeInstituicao)) {
    errors.nomeInstituicao =
      "Informe o nome da instituição (entre 2 e 200 caracteres).";
  }

  return errors;
};

export const validateEmailField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!isValidEmail(data.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  return errors;
};

export const validatePasswordField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!isValidPassword(data.senha)) {
    errors.senha =
      "A senha deve ter no mínimo 8 caracteres, com letras e números.";
  }

  return errors;
};

export const validateConfirmPasswordField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (data.confirmarSenha !== data.senha) {
    errors.confirmarSenha = "As senhas não coincidem.";
  }

  return errors;
};

export const validateCpfField: StepValidator = (data) => {
  const errors: FieldErrors = {};
  const digits = data.cpf.replace(/\D/g, "");
  if (!data.cpf.trim() && digits.length !== 11) {
    errors.cpf = "Informe um CPF válido (11 dígitos).";
  }
  return errors;
};

export const validateCnpjField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.cnpj.trim()) {
    errors.cnpj = "Informe o CNPJ.";
  }

  return errors;
};

export const validateRazaoSocialField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.razaoSocial.trim()) {
    errors.razaoSocial = "Informe a razão social.";
  }

  return errors;
};

export const validateSizeField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.size.trim()) {
    errors.size = "Informe o tamanho da empresa.";
  }

  return errors;
};

export const validateNpoSizeField: StepValidator = (data) => {
  const errors: FieldErrors = {};
  if (!data.porteOng) {
    errors.porteOng = "Selecione o porte da ONG.";
  }
  return errors;
};

{
  /* Validadores por step */
}

/* Validação para a primeira tela */
export const validateSignupStep: StepValidator = (_data, context) => {
  const errors: FieldErrors = {};

  if (!context.organizationType) {
    errors.organizationType = "Selecione o tipo de cadastro.";
  }
  return errors;
};

export const validateNpoStepTwo = composeValidators(
  validateEmailField,
  validatePasswordField,
  validateConfirmPasswordField,
);

export const validateNpoStepThree = composeValidators(
  validateInstitutionName,
  validateCpfField,
  validateNpoSizeField,
);

export const validateEnterpriseStepTwo = composeValidators();

// Trava sem mostrar os campos, pois não foi implementado.
// Colocar os campos corretos ou remover para teste.
