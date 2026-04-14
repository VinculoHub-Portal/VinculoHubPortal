import type { NpoAccountRegistrationPayload } from "../types/npo-account.types";
import type { WizardFormData } from "../types/wizard.types";

const PORTE_TO_SIZE: Record<
  Exclude<WizardFormData["porteOng"], "">,
  NpoAccountRegistrationPayload["npoSize"]
> = {
  pequena: "small",
  media: "medium",
  grande: "large",
};

const DEFAULT_SIZE: NpoAccountRegistrationPayload["npoSize"] = "small";

/**
 * Monta o body do POST /api/npo-accounts a partir do estado do wizard.
 */
export function mapWizardToNpoPayload(
  data: WizardFormData,
): NpoAccountRegistrationPayload {
  const npoSize =
    data.porteOng !== "" ? PORTE_TO_SIZE[data.porteOng] : DEFAULT_SIZE;

  return {
    name: data.nomeInstituicao.trim(),
    email: data.email.trim(),
    cpf: data.cpf.trim(),
    cnpj: data.cnpj.trim(),
    npoSize,
    description: data.resumoInstitucional.trim(),
    phone: data.phone.trim(),
    environmental: data.esg.includes("ambiental"),
    social: data.esg.includes("social"),
    governance: data.esg.includes("governanca"),
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
