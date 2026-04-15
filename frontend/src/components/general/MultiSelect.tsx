import { useEffect, useRef, useState } from "react";

type MultiSelectOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

interface MultiSelectProps<T extends string> {
  id?: string;
  name?: string;
  label: string;
  isRequired?: boolean;
  error?: string;
  options: MultiSelectOption<T>[];
  value: T[];
  onValueChange: (values: T[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect<T extends string>({
  id,
  name,
  label,
  isRequired,
  error,
  options,
  value,
  onValueChange,
  placeholder = "Selecione uma ou mais opções",
  className = "",
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const invalid = Boolean(error);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  function toggleOption(optionValue: T) {
    if (value.includes(optionValue)) {
      onValueChange(value.filter((item) => item !== optionValue));
      return;
    }

    onValueChange([...value, optionValue]);
  }

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col gap-1 w-full text-left relative"
    >
      <label htmlFor={id} className="text-base font-medium text-slate-800">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>

      <button
        id={id}
        name={name}
        type="button"
        aria-invalid={invalid}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full rounded-xl px-4 py-3 text-left outline-none transition-all
        border border-vinculo-gray bg-white
        focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
        flex items-center justify-between
        ${className}
        ${
          invalid
            ? "!border !border-error focus:!border-error focus:!ring-error"
            : ""
        }`}
      >
        <span
          className={
            selectedLabels.length ? "text-slate-700" : "text-slate-400"
          }
        >
          {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}
        </span>

        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="max-h-64 overflow-auto py-2">
            {options.map((option) => {
              const checked = value.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => toggleOption(option.value)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 disabled:opacity-50 flex items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="h-4 w-4"
                  />
                  <span className="text-slate-700">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
