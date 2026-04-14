import type { ReactNode } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isRequired?: boolean;
  error?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Input({
  label,
  id,
  isRequired,
  error,
  icon,
  iconPosition = "left",
  className = "",
  ...props
}: InputProps) {
  const invalid = Boolean(error);
  const hasLeftIcon = Boolean(icon) && iconPosition === "left";
  const hasRightIcon = Boolean(icon) && iconPosition === "right";

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label htmlFor={id} className="text-slate-700 font-semibold text-sm flex gap-1">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${
              iconPosition === "left" ? "left-3" : "right-3"
            }`}
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          required={isRequired}
          aria-invalid={invalid}
          className={`w-full rounded-xl py-3 outline-none transition-all placeholder:text-slate-400
          border border-vinculo-gray
          focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
          ${hasLeftIcon ? "pl-10 pr-4" : ""}
          ${hasRightIcon ? "pl-4 pr-10" : ""}
          ${!icon ? "px-4" : ""}
          ${className}
          ${
            invalid
              ? "!border !border-error focus:!border-error focus:!ring-error"
              : ""
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
