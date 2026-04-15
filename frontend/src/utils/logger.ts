const PREFIX = "[VinculoHub]";

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
