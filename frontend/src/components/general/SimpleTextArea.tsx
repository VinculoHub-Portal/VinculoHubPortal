import type { ReactNode } from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  isRequired?: boolean;
  icon?: ReactNode;
}

export function TextArea({
  label,
  id,
  isRequired,
  icon,
  maxLength,
  className = "",
  ...props
}: TextAreaProps) {
  const currentLength = String(props.value ?? "").length;

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
          <span className="absolute left-3 top-3 text-vinculo-green">
            {icon}
          </span>
        )}
        <textarea
          id={id}
          required={isRequired}
          maxLength={maxLength}
          rows={4}
          className={`border border-vinculo-gray rounded-xl px-4 py-3 outline-none w-full
          focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
          transition-all placeholder:text-slate-400 resize-none
          ${icon ? "pl-9" : ""}
          ${className}`}
          {...props}
        />
      </div>

      {maxLength && (
        <span className={`text-xs text-right ${currentLength >= maxLength ? "text-error" : "text-slate-400"}`}>
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  );
}
