interface SummaryCardProps {
  label: string
  value: number | string
}

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <article
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      aria-label={`${label}: ${value}`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold leading-none text-vinculo-dark">
        {value}
      </p>
    </article>
  )
}
