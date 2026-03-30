interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export function BaseButton({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', // A "chave" para a customização externa
  ...props 
}: BaseButtonProps) {
  
  const variants = {
    primary: 'bg-vinculo-dark text-white hover:bg-opacity-90 active:bg-blue-900',
    secondary: 'bg-vinculo-green text-white hover:bg-opacity-90 active:bg-green-700',
    outline: 'border-2 border-vinculo-dark text-vinculo-dark bg-transparent hover:bg-blue-50',
    ghost: 'bg-vinculo-light-gray text-slate-700 hover:bg-gray-200'
  };

  return (
    <button
      className={`
        rounded-lg font-semibold transition-all duration-200 active:scale-95
        flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : 'w-fit'}
        /* Removi o px-6 py-2 daqui para permitir customização via className */
        ${variants[variant]}
        ${className} 
      `}
      {...props}
    >
      {children}
    </button>
  );
}