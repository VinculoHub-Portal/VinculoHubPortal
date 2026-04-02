import type { ReactNode } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isRequired?: boolean;
  icon?: ReactNode;
  error?: string;
}

export function Input({
  label,
  id,
  isRequired,
  icon,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label
        htmlFor={id}
        className="text-slate-700 font-semibold text-sm flex gap-1"
      >
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vinculo-green">
            {icon}
          </span>
        )}
        <input
          id={id}
          required={isRequired}
          className={`border rounded-xl px-4 py-3 outline-none w-full
          focus:ring-1 transition-all placeholder:text-slate-400
          ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-vinculo-gray focus:border-vinculo-dark focus:ring-vinculo-dark"}
          ${icon ? "pl-9" : ""}
          ${className}`}
          {...props}
        />
      </div>

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
