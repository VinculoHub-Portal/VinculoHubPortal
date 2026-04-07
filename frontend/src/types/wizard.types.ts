export type OrganizationType = "npo" | "enterprise";

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
