import {
  cloneElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type SVGProps,
} from "react";

type FlexibleButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "attention"
  | "warning"
  | "subtle";

type FlexibleButtonSize = "default" | "compact";

export interface FlexibleButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  variant?: FlexibleButtonVariant;
  size?: FlexibleButtonSize;
  icon: ReactElement<SVGProps<SVGSVGElement>>;
}

const VARIANT_CLASSES: Record<FlexibleButtonVariant, string> = {
  primary: "bg-vinculo-dark text-white border-vinculo-dark",
  secondary: "bg-vinculo-green text-white border-vinculo-green",
  outline: "bg-white text-vinculo-dark border-vinculo-dark",
  ghost: "bg-vinculo-light-gray text-slate-700 border-vinculo-light-gray",
  attention: "bg-white text-vinculo-red border-vinculo-red",
  warning: "bg-white text-vinculo-yellow border-vinculo-yellow",
  subtle:
    "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-vinculo-dark/20",
};

const SIZE_CLASSES: Record<FlexibleButtonSize, string> = {
  default:
    "gap-2 rounded-full border-2 px-4 py-2 text-sm leading-5 font-semibold",
  compact:
    "gap-1.5 rounded-lg border px-3 py-1.5 text-sm leading-5 font-medium",
};

const BASE_CLASSES = [
  "inline-flex",
  "items-center",
  "justify-center",
  "whitespace-nowrap",
  "transition-all",
  "duration-200",
  "cursor-pointer",
  "disabled:cursor-not-allowed",
  "disabled:opacity-60",
];

export function FlexibleButton({
  variant = "secondary",
  size = "default",
  icon,
  children,
  type = "button",
  ...props
}: FlexibleButtonProps) {
  const iconElement = cloneElement(icon, {
    className: [icon.props.className, "h-4 w-4"].filter(Boolean).join(" "),
    "aria-hidden": true,
  });

  return (
    <button
      type={type}
      className={[
        ...BASE_CLASSES,
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
      ].join(" ")}
      {...props}
    >
      {iconElement}
      {children}
    </button>
  );
}
