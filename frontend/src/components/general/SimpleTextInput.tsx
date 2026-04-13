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
  iconPosition = "right",
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label htmlFor={id} className="text-slate-700 font-semibold text-sm flex gap-1">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>

      <div className={`relative flex items-center ${props.disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
        {icon && iconPosition === "left" && (
          <span className="absolute left-3 flex items-center text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}

        <input
          id={id}
          required={isRequired}
          className={`border rounded-xl px-4 py-3 outline-none w-full focus:ring-1 transition-all placeholder:text-slate-400
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-vinculo-gray focus:border-vinculo-dark focus:ring-vinculo-dark'}
          ${icon && iconPosition === "left" ? "pl-10" : ""}
          ${icon && iconPosition === "right" ? "pr-10" : ""}
          ${className}`}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <span className="absolute right-3 flex items-center text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
      </div>

      {error && (
        <span className="text-red-500 text-xs mt-1 font-medium">
          {error}
        </span>
      )}
    </div>
  );
}