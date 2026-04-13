export type OrganizationType = "npo" | "enterprise";

export type OrganizationSize = "" | "small" | "medium" | "large";

export type ODSOptions = "" | "1" | "2" | "3";

export type WizardFormData = {
  nomeInstituicao: string;
  nomeProjeto: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  cpf: string;
  cnpj: string;
  razaoSocial: string;
  size: OrganizationSize;
  description: string;
  ods: ODSOptions[];
  capital: number;
  // ...campos dos próximos steps
};

export type FieldErrors = Partial<
  Record<keyof WizardFormData | "organizationType", string>
>;

export type StepValidatorContext = {
  organizationType: OrganizationType | null;
};

export type StepValidator = (
  data: WizardFormData,
  context: StepValidatorContext,
) => FieldErrors;
