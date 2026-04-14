import { api } from "../services/api";

export interface CnpjResult {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
}

export async function fetchCnpjData(digits: string): Promise<CnpjResult> {
  const { data } = await api.get<CnpjResult>(`/cnpj/${digits}`);
  return data;
}
