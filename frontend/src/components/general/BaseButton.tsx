interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  fullWidth?: boolean;
}

export function BaseButton({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: BaseButtonProps) {
  const variants = {
    primary: "bg-vinculo-dark text-white",
    secondary: "bg-vinculo-green text-white",
    outline: "border-2 border-vinculo-dark text-vinculo-dark",
    ghost: "bg-vinculo-light-gray text-slate-700",
  };

  return (
    <button
      className={`
        rounded-lg font-semibold transition-all duration-200
        flex items-center justify-center gap-2
        px-6 py-2 cursor-pointer
        ${variants[variant]} 
        ${fullWidth ? "w-full" : "w-fit"}
        ${className} 
      `}
      {...props}
    >
      {children}
    </button>
  );
}
