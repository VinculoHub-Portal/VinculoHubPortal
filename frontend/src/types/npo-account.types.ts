/** Contrato JSON de POST /api/npo-accounts (NpoInstitutionalSignupRequest). */

export type NpoSize = "small" | "medium" | "large";

export type NpoAddressPayload = {
  zipCode: string;
  state: string;
  stateCode: string;
  city: string;
  street: string;
  number: string;
  complement: string;
};

/** Corpo enviado ao backend (campos raiz; sem objeto `esg` aninhado). */
export type NpoAccountRegistrationPayload = {
  name: string;
  email: string;
  cpf: string;
  cnpj: string;
  npoSize: NpoSize;
  description: string;
  phone: string;
  environmental: boolean;
  social: boolean;
  governance: boolean;
  address: NpoAddressPayload;
};
