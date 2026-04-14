export const validateCpf = (value: string): boolean => {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

  const calc = (d: string, length: number) => {
    const sum = Array.from({ length }, (_, i) => parseInt(d[i]) * (length + 1 - i)).reduce((a, b) => a + b, 0);
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };

  return parseInt(digits[9]) === calc(digits, 9) && parseInt(digits[10]) === calc(digits, 10);
};
