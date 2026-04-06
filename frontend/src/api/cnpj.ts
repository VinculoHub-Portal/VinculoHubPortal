import { api } from "../services/api";

export interface CnpjResult {
  cnpj: string;
  legalName: string;
  tradeName: string;
  situation: string;
}

export async function fetchCnpjData(digits: string): Promise<CnpjResult> {
  const { data } = await api.get<CnpjResult>(`/cnpj/${digits}`);
  return data;
}
