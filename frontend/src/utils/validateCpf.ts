// Port of the CPF validation logic used in validation.ts
function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function hasSameDigits(value: string): boolean {
  return /^(\d)\1+$/.test(value);
}

export function validateCpf(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== 11 || hasSameDigits(digits)) {
    return false;
  }

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(digits[index]) * (10 - index);
  }

  const firstDigit = (sum * 10) % 11;
  if ((firstDigit === 10 ? 0 : firstDigit) !== Number(digits[9])) {
    return false;
  }

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += Number(digits[index]) * (11 - index);
  }

  const secondDigit = (sum * 10) % 11;
  return (secondDigit === 10 ? 0 : secondDigit) === Number(digits[10]);
}
