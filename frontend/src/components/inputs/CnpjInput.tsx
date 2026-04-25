import React, { useEffect } from "react";
import { FormattedInput } from "./FormattedInput";
import { formatCnpj } from "../../utils/formatCnpj";
import { validateCnpj } from "../../utils/validateCnpj";

type CnpjInputProps = {
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
  setError?: (msg: string) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
  // lookup state (provided by parent pages that perform lookups)
  lookupLoading?: boolean;
  lookupError?: unknown;
  className?: string; // <-- accept className
};

export function CnpjInput({
  value,
  onChange,
  onBlur,
  error,
  setError,
  id = "cnpj",
  label = "CNPJ",
  disabled = false,
  lookupLoading = false,
  lookupError,
  className, // <-- receive it
}: CnpjInputProps) {
  useEffect(() => {
    if (lookupError && setError) {
      setError("CNPJ não encontrado");
    }
  }, [lookupError, setError]);

  function localOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCnpj(e.target.value);
    onChange(formatted);
    setError?.("");
  }

  function localOnBlur() {
    if (!value) return onBlur?.();
    if (!validateCnpj(value)) {
      setError?.("CNPJ inválido");
    } else {
      setError?.("");
    }
    onBlur?.();
  }

  // forward className down to FormattedInput
  return (
    <FormattedInput
      id={id}
      label={label}
      value={value}
      onChange={(e) => localOnChange(e as any)}
      onBlur={localOnBlur}
      error={error || undefined}
      disabled={disabled || lookupLoading}
      className={className} // <-- forward here
    />
  );
}
