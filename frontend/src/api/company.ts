import { api } from "../services/api";
import { logger } from "../utils/logger";

export interface CompanyAddress {
  id: number;
  state: string;
  stateCode: string;
  city: string;
  street: string;
  number: string;
  complement: string;
  zipCode: string;
}

export interface CompanyUser {
  id: number;
  name: string;
  email: string;
  userType: string;
}

export interface CompanyResult {
  id: number;
  legalName: string;
  socialName: string;
  description: string;
  logoUrl: string;
  cnpj: string;
  phone: string;
  user: CompanyUser;
  address: CompanyAddress;
}


export interface CompanyRegistrationPayload {
  cnpj: string;
  legalName: string;
  socialName: string;
  description: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  stateCode: string;
  phone: string;
  email: string;
}

type CompanyRegistrationRequest = {
  legalName: string;
  socialName: string;
  description: string;
  logoUrl: string;
  cnpj: string;
  phone: string;
  user: {
    name: string;
    email: string;
  };
  address: {
    state: string;
    stateCode: string;
    city: string;
    street: string;
    number: string;
    complement: string;
    zipCode: string;
  };
};

export async function registerCompany(
  payload: CompanyRegistrationPayload,
  token?: string,
): Promise<CompanyResult> {
  const requestBody = toCompanyRegistrationRequest(payload);
  logger.info("CompanyAPI", "Registering company", { cnpj: payload.cnpj, email: payload.email, hasToken: !!token });
  try {
    const { data } = await api.post<CompanyResult>(
      "/api/company-accounts",
      requestBody,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined,
    );
    logger.info("CompanyAPI", "Company registered successfully", { companyId: data.id });
    return data;
  } catch (error) {
    logger.error("CompanyAPI", "Company registration failed", error);
    throw error;
  }
}

function toCompanyRegistrationRequest(
  payload: CompanyRegistrationPayload,
): CompanyRegistrationRequest {
  const displayName = payload.socialName || payload.legalName;

  return {
    legalName: payload.legalName,
    socialName: payload.socialName || payload.legalName,
    description: payload.description,
    logoUrl: "",
    cnpj: payload.cnpj,
    phone: payload.phone,
    user: {
      name: displayName,
      email: payload.email,
    },
    address: {
      state: payload.state,
      stateCode: payload.stateCode,
      city: payload.city,
      street: payload.street,
      number: payload.number,
      complement: payload.complement,
      zipCode: payload.zipCode,
    },
  };
}
