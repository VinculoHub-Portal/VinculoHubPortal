import type { FieldErrors, StepValidator } from "../types/wizard.types";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-zÀ-ÿ])(?=.*\d).{8,}$/;

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

{
  /* Validadores individuais, que podem ser usados em qualquer step */
}

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
    errors.cpf = "Informe um CPF válido.";
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

export const validateCpfOrCnpjField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  const cpfDigits = data.cpf.replace(/\D/g, "");
  const cnpjDigits = data.cnpj.replace(/\D/g, "");

  const hasCpf = cpfDigits.length > 0;
  const hasCnpj = cnpjDigits.length > 0;

  if (!hasCpf && !hasCnpj) {
    errors.cpf = "Informe o CPF ou o CNPJ.";
    return errors;
  }

  if (hasCpf && !isValidCpf(data.cpf)) {
    errors.cpf = "CPF inválido.";
  }

  if (hasCnpj && !isValidCnpj(data.cnpj)) {
    errors.cnpj = "CNPJ inválido.";
  }

  return errors;
};

export const validateOptionalCnpjField: StepValidator = (data) => {
  const errors: FieldErrors = {};
  const digits = onlyDigits(data.cnpj);

  if (digits.length > 0 && !isValidCnpj(data.cnpj)) {
    errors.cnpj = "Informe um CNPJ válido.";
  }

  return errors;
};

export const validatePorteOngField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.porteOng) {
    errors.porteOng = "Selecione o porte da ONG.";
  }

  return errors;
};

export const validateEsgField: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.esg || data.esg.length === 0) {
    errors.esg = "Selecione pelo menos um pilar ESG.";
  }

  return errors;
};

export const validateZipCodeField: StepValidator = (data) => {
  const errors: FieldErrors = {};
  const digits = data.zipCode.replace(/\D/g, "");
  if (!digits) {
    errors.zipCode = "Informe o CEP.";
  } else if (digits.length !== 8) {
    errors.zipCode = "CEP inválido.";
  }
  return errors;
};

export const validateStreetNumberField: StepValidator = (data) => {
  const errors: FieldErrors = {};
  if (!data.streetNumber.trim()) errors.streetNumber = "Informe o número.";
  return errors;
};

{
  /* Steps individuais com seus determinados validadores
     Se um step tiver um validador, que não é exportado para a tela, o step não vai prosseguir, pois requer determinada validação.
  */
}

export const validateNpoStepTwo = composeValidators(
  validateEmailField,
  validatePasswordField,
  validateConfirmPasswordField,
);

export const validateNpoStepThree = composeValidators(
  validateInstitutionName,
  validateCpfOrCnpjField,
  validatePorteOngField,
  validateEsgField,
);

export const validateNpoStepFour = composeValidators(
  validateZipCodeField,
  validateStreetNumberField,
);

export const validateNpoStepFive = composeValidators /*Primeiro Projeto*/();

export const validateEnterpriseStepTwo = composeValidators(validateCnpjField);

export const validateEnterpriseStepThree = composeValidators();

export const validateEnterpriseStepFour = composeValidators();

export const validateEnterpriseStepFive = composeValidators();
