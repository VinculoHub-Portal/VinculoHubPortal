const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function normalizeCurrencyValue(value: string) {
  const digits = value.replace(/\D/g, "");
  const trimmed = digits.replace(/^0+(?=\d)/, "");
  if (trimmed.length > 0) {
    return trimmed;
  }

  return digits.length > 0 ? "0" : "";
}

export function formatCurrencyValue(value: string) {
  const normalized = normalizeCurrencyValue(value);

  if (!normalized) {
    return "";
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return "";
  }

  return BRL_FORMATTER.format(parsed);
}
