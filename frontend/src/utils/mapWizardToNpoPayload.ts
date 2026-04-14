import type { NpoAccountRegistrationPayload } from "../types/npo-account.types";
import type { WizardFormData } from "../types/wizard.types";

const DEFAULT_SIZE: NpoAccountRegistrationPayload["npoSize"] = "small";

/**
 * Monta o body do POST /api/npo-accounts a partir do estado do wizard.
 * Campos ainda não preenchidos nos passos viram string vazia / defaults seguros.
 */
export function mapWizardToNpoPayload(
  data: WizardFormData,
): NpoAccountRegistrationPayload {
  const npoSize =
    data.npoSize === "small" ||
    data.npoSize === "medium" ||
    data.npoSize === "large"
      ? data.npoSize
      : DEFAULT_SIZE;

  return {
    name: data.nomeInstituicao.trim(),
    email: data.email.trim(),
    password: data.senha || undefined,
    cpf: data.cpf.trim(),
    cnpj: data.cnpj.trim(),
    npoSize,
    description: data.description.trim(),
    phone: data.phone.trim(),
    esg: {
      environmental: data.esgEnvironmental,
      social: data.esgSocial,
      governance: data.esgGovernance,
    },
    address: {
      zipCode: data.addressZipCode.trim(),
      state: data.addressState.trim(),
      stateCode: data.addressStateCode.trim(),
      city: data.addressCity.trim(),
      street: data.addressStreet.trim(),
      number: data.addressNumber.trim(),
      complement: data.addressComplement.trim(),
    },
  };
}
