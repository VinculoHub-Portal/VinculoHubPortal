import { api } from "../services/api";

export interface ZipCodeResult {
  zipCode: string;
  street: string;
  complement: string;
  city: string;
  state: string;
  stateCode: string;
}

export async function fetchZipCodeData(digits: string): Promise<ZipCodeResult> {
  const { data } = await api.get<ZipCodeResult>(`/cep/${digits}`);
  return data;
}
