import { api } from "../services/api";

export async function checkCnpjAvailable(cnpj: string): Promise<boolean> {
  const digits = cnpj.replace(/\D/g, "");
  const response = await api.get<{ available: boolean }>(`/public/validate/cnpj/${digits}`);
  return response.data.available;
}

export async function checkCpfAvailable(cpf: string): Promise<boolean> {
  const digits = cpf.replace(/\D/g, "");
  const response = await api.get<{ available: boolean }>(`/public/validate/cpf/${digits}`);
  return response.data.available;
}

export async function checkEmailAvailable(email: string): Promise<boolean> {
  const response = await api.get<{ available: boolean }>("/public/validate/email", {
    params: { value: email.trim() },
  });
  return response.data.available;
}
