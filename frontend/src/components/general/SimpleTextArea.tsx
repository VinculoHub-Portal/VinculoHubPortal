interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  isRequired?: boolean;
}

export function TextArea({
  label,
  id,
  isRequired,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label
        htmlFor={id}
        className="text-slate-700 font-semibold text-sm flex gap-1"
      >
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>

      <textarea
        id={id}
        required={isRequired}
        rows={4}
        className={`border border-vinculo-gray rounded-xl px-4 py-3 outline-none
        focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark
        transition-all placeholder:text-slate-400 resize-none ${className}`}
        {...props}
      />
    </div>
  );
}
