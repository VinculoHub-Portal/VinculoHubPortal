interface ProgressBarProps {
  value: number
  colorClass?: string
  trackClass?: string
}

export function ProgressBar({
  value,
  colorClass = "bg-vinculo-green",
  trackClass = "bg-slate-200",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={`w-full h-2 rounded-full overflow-hidden ${trackClass}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
