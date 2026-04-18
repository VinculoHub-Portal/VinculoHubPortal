import axios from "axios";

const PREFIX = "[VinculoHub]";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    const status = error.response?.status;
    if (status === 404) return fallback;
    if (status === 422) return fallback;
    if (!error.response) return "Erro de conexão. Verifique sua internet.";
  }
  return fallback;
}

export const logger = {
  info: (context: string, message: string, data?: unknown) =>
    data !== undefined
      ? console.log(`${PREFIX} [${context}] ${message}`, data)
      : console.log(`${PREFIX} [${context}] ${message}`),

  warn: (context: string, message: string, data?: unknown) =>
    data !== undefined
      ? console.warn(`${PREFIX} [${context}] ${message}`, data)
      : console.warn(`${PREFIX} [${context}] ${message}`),

  error: (context: string, message: string, data?: unknown) =>
    data !== undefined
      ? console.error(`${PREFIX} [${context}] ${message}`, data)
      : console.error(`${PREFIX} [${context}] ${message}`),
};
