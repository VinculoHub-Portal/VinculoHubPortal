import React, { useEffect } from "react";
import { FormattedInput } from "./FormattedInput";
import { formatZipCode } from "../../../utils/formatZipCode";

type ZipCodeInputProps = {
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
  setError?: (msg: string) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
  // lookup state (provided by parent)
  lookupLoading?: boolean;
  lookupError?: unknown;
  className?: string;
};

export function ZipCodeInput({
  value,
  onChange,
  onBlur,
  error,
  setError,
  id = "zip_code",
  label = "CEP",
  disabled = false,
  lookupLoading = false,
  lookupError,
  className,
}: ZipCodeInputProps) {
  useEffect(() => {
    if (lookupError && setError) {
      setError("CEP não encontrado");
    }
  }, [lookupError, setError]);

  function localOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatZipCode(e.target.value);
    onChange(formatted);
    setError?.("");
  }

  function localOnBlur() {
    const digits = (value || "").replace(/\D/g, "");
    if (!digits) {
      setError?.("Informe o CEP.");
    } else if (digits.length !== 8) {
      setError?.("CEP inválido.");
    } else {
      setError?.("");
    }
    onBlur?.();
  }

  return (
    <FormattedInput
      id={id}
      className={className}
      label={label}
      value={value}
      onChange={(e) => localOnChange(e as any)}
      onBlur={localOnBlur}
      error={error || undefined}
      disabled={disabled || lookupLoading}
    />
  );
}
