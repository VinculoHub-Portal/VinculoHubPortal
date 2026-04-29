export type OrganizationType = "npo" | "enterprise";
export type ProjectType = "" | "social" | "governamental";
export type WizardEsgOption = "ambiental" | "social" | "governanca";
export type ProjectOdsOption = "1" | "2" | "3";

export type WizardFormData = {
  nomeInstituicao: string;
  cnpj: string;
  razaoSocial: string;
  cpf: string;
  porteOng: "" | "pequena" | "media" | "grande";
  resumoInstitucional: string;
  esg: WizardEsgOption[];
  zipCode: string;
  street: string;
  streetNumber: string;
  complement: string;
  city: string;
  state: string;
  stateCode: string;
  phone: string;
  nomeProjeto: string;
  tipoProjeto: ProjectType;
  descricaoProjeto: string;
  metaCaptacao: string;
  odsProjeto: ProjectOdsOption[];
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
