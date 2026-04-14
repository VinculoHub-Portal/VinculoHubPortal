/** Alinhar com o DTO do POST /api/npo-accounts (backend #71) quando estiver fechado. */

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

export type NpoEsgPayload = {
  environmental: boolean;
  social: boolean;
  governance: boolean;
};

export type NpoAccountRegistrationPayload = {
  name: string;
  email: string;
  /** Incluir se o contrato do #71 exigir senha no mesmo POST. */
  password?: string;
  cpf: string;
  cnpj: string;
  npoSize: NpoSize;
  description: string;
  phone: string;
  esg: NpoEsgPayload;
  address: NpoAddressPayload;
};
