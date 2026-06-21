type GeneralProgressProps = {
  generalProgress: number;
};

export function GeneralProgress({ generalProgress }: GeneralProgressProps) {
  const pct = Math.min(100, Math.max(0, Math.round(generalProgress)));

  return (
    <section className="mt-6 sm:mt-8">
      <h2 className="text-sm sm:text-base font-bold text-vinculo-dark mb-2 sm:mb-3">Progresso do Projeto</h2>
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-slate-600 text-sm">Conclusão</span>
        <span className="text-vinculo-green font-semibold text-sm">{pct}% concluído</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-vinculo-green min-w-0 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do projeto"
        />
      </div>
    </section>
  );
}
