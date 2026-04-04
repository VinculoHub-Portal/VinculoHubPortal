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
  const invalid = Boolean(error);

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label
        htmlFor={id}
        className="text-slate-700 font-medium text-sm flex gap-1"
      >
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>

      <input
        id={id}
        required={isRequired}
        aria-invalid={invalid}
        className={`rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400
        border border-vinculo-gray
        focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
        ${className}
        ${
          invalid
            ? "!border !border-error focus:!border-error focus:!ring-error"
            : ""
        }`}
        {...props}
      />
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
