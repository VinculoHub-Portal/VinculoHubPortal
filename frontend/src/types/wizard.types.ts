export type OrganizationType = "npo" | "enterprise";

export type WizardEsgOption = "ambiental" | "social" | "governanca";
export type ProjectOdsOption = "1" | "2" | "3";

/* Se precisar de campos opcionais utilize "pick". EXs:
type SignupFields = Pick<
  WizardFormData,
  "nomeInstituicao" | "email" | "senha" | "confirmarSenha"
>;
type NpoFields = Pick<WizardFormData, "cnpj">;
type EnterpriseFields = Pick<WizardFormData, "razaoSocial">;
*/

export type WizardFormData = {
  nomeInstituicao: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  cnpj: string;
  razaoSocial: string;
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
  nomeProjeto: string;
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
