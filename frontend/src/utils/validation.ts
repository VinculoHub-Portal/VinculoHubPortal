import type { FieldErrors, StepValidator } from "../types/wizard.types";
import { validateCpf } from "./validateCpf";
import { validateCnpj } from "./validateCnpj";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-zÀ-ÿ])(?=.*\d).{8,}$/;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
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
  if (!data.npoSize) {
    errors.npoSize = "Selecione o porte da ONG.";
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
  const digits = data.cpf.replace(/\D/g, "");

  if (!digits) {
    errors.cpf = "Informe o CPF.";
  } else if (!validateCpf(data.cpf)) {
    errors.cpf = "Informe um CPF válido.";
  }

  return errors;
};

export const validateCnpjField: StepValidator = (data) => {
  const errors: FieldErrors = {};
  const digits = data.cnpj.replace(/\D/g, "");

  if (digits.length > 0 && !validateCnpj(data.cnpj)) {
    errors.cnpj = "Informe um CNPJ válido.";
  }

  return errors;
};

export const validateOptionalCnpjField: StepValidator = (data) => {
  const errors: FieldErrors = {};
  const digits = onlyDigits(data.cnpj);

  if (digits.length > 0 && !validateCnpj(data.cnpj)) {
    errors.cnpj = "Informe um CNPJ válido.";
  }

  return errors;
};

export const validateCpfOrCnpjField: StepValidator = (data) => {
  const errors: FieldErrors = {};
  const cpfDigits = data.cpf.replace(/\D/g, "");
  const cnpjDigits = data.cnpj.replace(/\D/g, "");

  // at least one required
  if (!cpfDigits && !cnpjDigits) {
    errors.cpf = "Informe o CPF ou o CNPJ.";
    return errors;
  }

  if (cpfDigits && !validateCpf(data.cpf)) {
    errors.cpf = "Informe um CPF válido.";
  }

  if (cnpjDigits && !validateCnpj(data.cnpj)) {
    errors.cnpj = "Informe um CNPJ válido.";
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

export const validateProjectName: StepValidator = (data) => {
  const errors: FieldErrors = {};
  const name = data.nomeProjeto?.trim() || "";

  if (!name) {
    errors.nomeProjeto = "Informe o nome do projeto.";
  } else if (name.length < 3) {
    errors.nomeProjeto = "O nome do projeto deve ter no mínimo 3 caracteres.";
  } else if (name.length > 100) {
    errors.nomeProjeto = "O nome do projeto deve ter no máximo 100 caracteres.";
  }

  return errors;
};

export const validateProjectDescription: StepValidator = (data) => {
  const errors: FieldErrors = {};
  const description = data.description?.trim() || "";

  if (!description) {
    errors.description = "Informe a descrição do projeto.";
  } else if (description.length < 10) {
    errors.description = "A descrição deve ter no mínimo 10 caracteres.";
  } else if (description.length > 500) {
    errors.description = "A descrição deve ter no máximo 500 caracteres.";
  }

  return errors;
};

export const validateProjectCapital: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (
    data.capital !== undefined &&
    data.capital !== null &&
    data.capital !== 0
  ) {
    if (typeof data.capital === "number" && data.capital < 0) {
      errors.capital = "A meta de captação não pode ser negativa.";
    }
  }

  return errors;
};

export const validateProjectODS: StepValidator = (data) => {
  const errors: FieldErrors = {};

  if (!data.ods || data.ods.length === 0) {
    errors.ods = "Selecione pelo menos uma ODS.";
  }

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
  validateNpoSizeField,
  validateEsgField,
);

export const validateNpoStepFour = composeValidators(
  validateZipCodeField,
  validateStreetNumberField,
);
/*Primeiro Projeto*/
export const validateNpoStepFive = composeValidators(
  validateProjectName,
  validateProjectDescription,
  validateProjectCapital,
  validateProjectODS,
);

export const validateEnterpriseStepTwo = composeValidators(validateCnpjField);

export const validateEnterpriseStepThree = composeValidators();

export const validateEnterpriseStepFour = composeValidators();

export const validateEnterpriseStepFive = composeValidators();
