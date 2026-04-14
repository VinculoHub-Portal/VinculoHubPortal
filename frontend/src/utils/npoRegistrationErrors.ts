import axios from "axios";

const GENERIC_BAD_REQUEST =
  "Não foi possível validar os dados. Confira os campos e tente novamente.";
const GENERIC_CONFLICT =
  "Este e-mail, CPF ou CNPJ já está cadastrado. Use outros dados ou faça login.";
const GENERIC_NETWORK = "Não foi possível concluir o cadastro. Tente novamente.";

function pickMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.message === "string" && o.message.trim()) return o.message;
  if (typeof o.error === "string" && o.error.trim()) return o.error;
  return null;
}

export function getFriendlyNpoRegistrationError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data;
    const fromApi = pickMessage(body);
    if (status === 400) return fromApi ?? GENERIC_BAD_REQUEST;
    if (status === 409) return fromApi ?? GENERIC_CONFLICT;
    if (error.code === "ERR_NETWORK") return GENERIC_NETWORK;
    if (fromApi) return fromApi;
  }
  return GENERIC_NETWORK;
}
