import type { ReactNode } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isRequired?: boolean;
  error?: string; 
}

export function Input({
  label,
  id,
  isRequired,
  error, 
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label htmlFor={id} className="...">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>

      <input
        id={id}
        required={isRequired}
        className={`... ${error ? 'border-red-500' : 'border-vinculo-gray'} ${className}`}
        {...props}
      />

      
      {error && (
        <span className="text-red-500 text-xs mt-1 font-medium">
          {error}
        </span>
      )}
    </div>
  );
}