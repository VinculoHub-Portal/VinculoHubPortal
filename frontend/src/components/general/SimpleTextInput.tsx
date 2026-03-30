interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label htmlFor={id} className="text-slate-700 font-medium text-sm">
        {label}
      </label>
      <input
        id={id}
        className="border border-vinculo-gray rounded-xl px-4 py-3 outline-none focus:border-vinculo-dark focus:ring-1 focus:ring-vinculo-dark transition-all placeholder:text-slate-400"
        {...props}
      />
    </div>
  );
}