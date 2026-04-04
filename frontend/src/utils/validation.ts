/** E-mail em formato comum (evita espaços e exige domínio). */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Senha: mínimo 8 caracteres, pelo menos uma letra e um número. */
export const PASSWORD_REGEX = /^(?=.*[A-Za-zÀ-ÿ])(?=.*\d).{8,}$/;

export function isValidEmail(value: string): boolean {
  const t = value.trim();
  return t.length > 0 && EMAIL_REGEX.test(t);
}

export function isValidPassword(value: string): boolean {
  return PASSWORD_REGEX.test(value);
}

export function isValidInstitutionName(value: string): boolean {
  const t = value.trim();
  return t.length >= 2 && t.length <= 200;
}
