type FundingProgressProps = {
  progressPercent: number;
};

export function FundingProgress({ progressPercent }: FundingProgressProps) {
  const pct = Math.min(100, Math.max(0, Math.round(progressPercent)));

  return (
    <section className="mt-10">
      <h2 className="text-base font-bold text-vinculo-dark mb-4">Progresso de Captação</h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-3">
        <span className="text-slate-600 text-sm">Meta de investimento</span>
        <span className="text-vinculo-green font-semibold text-sm">{pct}% alcançado</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-vinculo-green min-w-0 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </section>
  );
}
