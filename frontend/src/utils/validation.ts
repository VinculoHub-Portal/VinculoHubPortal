import type { FieldErrors, StepValidator } from "../types/wizard.types";

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

export function isValidCpf(value: string): boolean {
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

export function isValidCnpj(value: string): boolean {
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
      "Informe o nome da instituição (entre 2 e 200 caracteres).";
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

function isValidOptionalCapital(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0;
}

export const validateFirstProjectName: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.nomeProjeto.trim()) {
    errors.nomeProjeto = "Informe o nome do projeto.";
  }

  return errors;
};

export const validateFirstProjectDescription: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.descricaoProjeto.trim()) {
    errors.descricaoProjeto = "Informe a descrição do projeto.";
  }

  return errors;
};

export const validateFirstProjectCapital: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (data.tipoProjeto === "social") {
    return errors;
  }

  if (data.tipoProjeto === "governamental" && !data.metaCaptacao.trim()) {
    errors.metaCaptacao = "Informe a meta de captação.";
    return errors;
  }

  if (!isValidOptionalCapital(data.metaCaptacao)) {
    errors.metaCaptacao = "Informe uma meta de captação válida.";
  }

  return errors;
};

export const validateFirstProjectOds: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.odsProjeto || data.odsProjeto.length === 0) {
    errors.odsProjeto = "Selecione ao menos um ODS.";
  }

  return errors;
};

export const validateProjectType: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.tipoProjeto) {
    errors.tipoProjeto = "Selecione o tipo do projeto.";
  }

  return errors;
};

export const validateNpoStepTwo = composeValidators(
  validateInstitutionName,
  validateCpfOrCnpjField,
  validatePorteOngField,
  validateEsgField,
);

export const validateNpoStepThree = composeValidators(
  validateZipCodeField,
  validateStreetNumberField,
);

export const validateNpoStepFour = composeValidators(
  validateFirstProjectName,
  validateProjectType,
  validateFirstProjectDescription,
  validateFirstProjectCapital,
  validateFirstProjectOds,
);

export const validateEnterpriseStepTwo = composeValidators(
  validateRazaoSocialField,
);
