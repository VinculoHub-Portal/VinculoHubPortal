import type { ReactNode } from "react"

export type MetricCardVariant = "brand" | "success" | "accent" | "warning"

interface MetricCardProps {
  label: string
  value: number | string
  description: string
  icon: ReactNode
  variant?: MetricCardVariant
  href?: string
}

const variantStyles: Record<MetricCardVariant, { iconBgClass: string; iconTextClass: string }> = {
  brand: {
    iconBgClass: "bg-vinculo-dark/10",
    iconTextClass: "text-vinculo-dark",
  },
  success: {
    iconBgClass: "bg-vinculo-green/15",
    iconTextClass: "text-vinculo-green",
  },
  accent: {
    iconBgClass: "bg-violet-100",
    iconTextClass: "text-violet-600",
  },
  warning: {
    iconBgClass: "bg-amber-100",
    iconTextClass: "text-amber-600",
  },
}

export function MetricCard({
  label,
  value,
  description,
  icon,
  variant = "brand",
  href,
}: MetricCardProps) {
  const { iconBgClass, iconTextClass } = variantStyles[variant]

  return (
    <article
      className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold leading-none text-vinculo-dark">
            {value}
          </p>
        </div>

        <span
          data-testid="metric-card-icon"
          className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBgClass} ${iconTextClass}`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm leading-6 text-slate-500">{description}</p>
        {href && (
          <a
            href={href}
            className="shrink-0 text-xs font-medium text-vinculo-dark hover:underline"
          >
            Ver todos
          </a>
        )}
      </div>
    </article>
  )
}
