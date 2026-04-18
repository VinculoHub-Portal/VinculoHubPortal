import React from "react";

type FormattedInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export function FormattedInput({
  label,
  id,
  value,
  onChange,
  onBlur,
  error,
  icon,
  iconPosition = "left",
  disabled,
  className,
  ...rest
}: FormattedInputProps) {
  // merge incoming className with default ones; callers can override by passing className
  const baseClasses = "w-full px-4 py-2 rounded";
  const errorClasses = error ? "border-red-500" : "border-slate-200";
  const iconPadding = icon ? "pl-10" : "";

  const combinedClassName = [className, baseClasses, iconPadding, errorClasses]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={id} className="block">
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      <div className={`relative flex items-center`}>
        {icon && iconPosition === "left" && (
          <span className="absolute left-3">{icon}</span>
        )}
        <input
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={combinedClassName}
          {...rest}
        />
        {icon && iconPosition === "right" && (
          <span className="absolute right-3">{icon}</span>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </label>
  );
}
