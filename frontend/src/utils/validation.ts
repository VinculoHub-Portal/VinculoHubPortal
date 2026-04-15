import type { FieldErrors, StepValidator } from "../types/wizard.types";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function hasSameDigits(value: string): boolean {
  return /^(\d)\1+$/.test(value);
}

function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== 11 || hasSameDigits(digits)) {
    return false;
  }

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(digits[index]) * (10 - index);
  }

  const firstDigit = (sum * 10) % 11;
  if ((firstDigit === 10 ? 0 : firstDigit) !== Number(digits[9])) {
    return false;
  }

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += Number(digits[index]) * (11 - index);
  }

  const secondDigit = (sum * 10) % 11;
  return (secondDigit === 10 ? 0 : secondDigit) === Number(digits[10]);
}

function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== 14 || hasSameDigits(digits)) {
    return false;
  }

  const calculateDigit = (weights: number[]) => {
    const sum = weights.reduce(
      (total, weight, index) => total + Number(digits[index]) * weight,
      0,
    );
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return (
    firstDigit === Number(digits[12]) && secondDigit === Number(digits[13])
  );
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

export const validateInstitutionName: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!isValidInstitutionName(data.nomeInstituicao)) {
    errors.nomeInstituicao =
      "Informe o nome da instituicao (entre 2 e 200 caracteres).";
  }

  return errors;
};

export const validateEmailField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!isValidEmail(data.email)) {
    errors.email = "Informe um e-mail valido.";
  }

  return errors;
};

export const validatePasswordField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!isValidPassword(data.senha)) {
    errors.senha =
      "A senha deve ter no minimo 8 caracteres, com letras e numeros.";
  }

  return errors;
};

export const validateConfirmPasswordField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (data.confirmarSenha !== data.senha) {
    errors.confirmarSenha = "As senhas nao coincidem.";
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
    errors.razaoSocial = "Informe a razao social.";
  }

  return errors;
};

export const validateSizeField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.npo_size.trim()) {
    errors.npo_size = "Informe o tamanho da empresa.";
  }

  return errors;
};

export const validateNpoSizeField: StepValidator = (data) => {
  const errors: FieldErrors = {};
  if (!data.npo_size) {
    errors.npo_size = "Selecione o porte da ONG.";
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

export const validateCpfField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!isValidCpf(data.cpf)) {
    errors.cpf = "Informe um CPF valido.";
  }

  return errors;
};

export const validateOptionalCnpjField: StepValidator = (data) => {
  const errors: FieldErrors = {};
  const digits = onlyDigits(data.cnpj);

  if (digits.length > 0 && !isValidCnpj(data.cnpj)) {
    errors.cnpj = "Informe um CNPJ valido.";
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
  validateOptionalCnpjField,
  validateNpoSizeField,
);

export const validateNpoStepFour: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (data.esg.length === 0) {
    errors.esg = "Selecione pelo menos um pilar ESG.";
  }

  return errors;
};

export const validateEnterpriseStepTwo = composeValidators();

// Trava sem mostrar os campos, pois não foi implementado.
// Colocar os campos corretos ou remover para teste.
