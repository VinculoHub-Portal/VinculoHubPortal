import type { NpoSize } from "./npo-account.types";

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
  cpf: string;
  description: string;
  phone: string;
  /** Vazio até o utilizador escolher no passo correspondente. */
  npoSize: NpoSize | "";
  esgEnvironmental: boolean;
  esgSocial: boolean;
  esgGovernance: boolean;
  addressZipCode: string;
  addressState: string;
  addressStateCode: string;
  addressCity: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
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
