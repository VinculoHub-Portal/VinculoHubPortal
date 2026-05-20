import {
  cloneElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";

type FlexibleButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "attention"
  | "warning";

export interface FlexibleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: FlexibleButtonVariant;
  icon: ReactElement;
}

const VARIANT_CLASSES: Record<FlexibleButtonVariant, string> = {
  primary: "bg-vinculo-dark text-white border-vinculo-dark",
  secondary: "bg-vinculo-green text-white border-vinculo-green",
  outline: "bg-white text-vinculo-dark border-vinculo-dark",
  ghost: "bg-vinculo-light-gray text-slate-700 border-vinculo-light-gray",
  attention: "bg-white text-vinculo-red border-vinculo-red",
  warning: "bg-white text-vinculo-yellow border-vinculo-yellow",
}

const BASE_CLASSES = [
  "inline-flex",
  "items-center",
  "justify-center",
  "gap-2",
  "whitespace-nowrap",
  "rounded-full",
  "border-2",
  "px-4",
  "py-2",
  "text-sm",
  "leading-5",
  "font-semibold",
  "transition-all",
  "duration-200",
  "cursor-pointer",
  "disabled:cursor-not-allowed",
  "disabled:opacity-60",
]

export function FlexibleButton({
  variant = "secondary",
  icon,
  children,
  type = "button",
  ...props
}: FlexibleButtonProps) {
  const iconElement = cloneElement(icon, {
    className: [icon.props.className, "h-4 w-4"].filter(Boolean).join(" "),
    "aria-hidden": true,
  })

  return (
    <button
      type={type}
      className={[...BASE_CLASSES, VARIANT_CLASSES[variant]].join(" ")}
      {...props}
    >
      {iconElement}
      {children}
    </button>
  )
}
