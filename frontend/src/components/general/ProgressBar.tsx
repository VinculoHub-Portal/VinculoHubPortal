interface ProgressBarProps {
  value: number
  colorClass?: string
  trackClass?: string
  ariaLabel?: string
}

export function ProgressBar({
  value,
  colorClass = "bg-vinculo-green",
  trackClass = "bg-slate-200",
  ariaLabel = "Progresso",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div
      className={`w-full h-2 rounded-full overflow-hidden ${trackClass}`}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
