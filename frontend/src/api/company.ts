import { api } from "../services/api";

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

export async function registerCompany(
  payload: CompanyRegistrationPayload
): Promise<CompanyResult> {
  const { data } = await api.post<CompanyResult>(
    "/public/company/register",
    payload
  );
  return data;
}
