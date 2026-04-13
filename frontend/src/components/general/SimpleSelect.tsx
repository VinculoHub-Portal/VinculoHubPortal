import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  isRequired?: boolean;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  id,
  isRequired,
  error,
  className = "",
  options,
  placeholder,
  ...props
}: SelectProps) {
  const invalid = Boolean(error);

  return (
    <div className="flex flex-col gap-1 text-left mr-5 mb-5">
      <label htmlFor={id} className="...">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>

      <select
        id={id}
        required={isRequired}
        aria-invalid={invalid}
        className={`rounded-xl px-4 py-3 outline-none transition-all
        border border-vinculo-gray bg-white
        focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
        ${className}
        ${
          invalid
            ? "!border !border-error focus:!border-error focus:!ring-error"
            : ""
        }`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
