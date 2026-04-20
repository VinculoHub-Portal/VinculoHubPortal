import React, { useEffect } from "react";
import { FormattedInput } from "./FormattedInput";
import { formatCpf } from "../../utils/formatCpf";
import { validateCpf } from "../../utils/validateCpf";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

type CpfInputProps = {
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
  setError?: (msg: string) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function CpfInput({
  value,
  onChange,
  onBlur,
  error,
  setError,
  id = "cpf",
  label = "CPF",
  disabled = false,
  className,
}: CpfInputProps) {
  useDebouncedValue(value, 300);

  useEffect(() => {
    // clear lookup-related errors if value changes
    if (setError) setError("");
  }, [value, setError]);

  function localOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCpf(e.target.value);
    onChange(formatted);
    if (setError) setError("");
  }

  function localOnBlur() {
    const digits = (value || "").replace(/\D/g, "");
    if (!digits) {
      setError?.("Informe o CPF.");
    } else if (digits.length !== 11 || !validateCpf(value)) {
      setError?.("CPF inválido.");
    } else {
      setError?.("");
    }
    onBlur?.();
  }

  return (
    <FormattedInput
      id={id}
      label={label}
      value={value}
      onChange={(e) => localOnChange(e as any)}
      onBlur={localOnBlur}
      error={error || undefined}
      disabled={disabled}
      className={className}
    />
  );
}
