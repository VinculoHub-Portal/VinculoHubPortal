export const validateCnpj = (value: string): boolean => {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;

  const calc = (d: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(d[i]) * w, 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const first = calc(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calc(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return parseInt(digits[12]) === first && parseInt(digits[13]) === second;
};
