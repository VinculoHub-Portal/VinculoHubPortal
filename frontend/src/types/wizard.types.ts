export type OrganizationType = "npo" | "enterprise";

export type WizardEsgOption = "ambiental" | "social" | "governanca";

export type NpoSize = "" | "small" | "medium" | "large";

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
<<<<<<< HEAD
  description: string;
  npo_size: NpoSize;
  ods: ODSOptions[];
  environmental: boolean;
  social: boolean;
  governance: boolean;
  capital: number;
  // ...campos dos próximos steps
=======
  cpf: string;
  porteOng: "" | "pequena" | "media" | "grande";
  resumoInstitucional: string;
  esg: WizardEsgOption[];
  // address
  zipCode: string;
  street: string;
  streetNumber: string;
  complement: string;
  city: string;
  state: string;
  stateCode: string;
  phone: string;
>>>>>>> origin/fix/clean-up
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
