import { ProgressBar } from "./ProgressBar"
import type { EsgPillar } from "./types"

interface EsgImpactSectionProps {
  pillars: EsgPillar[]
}

export function EsgImpactSection({ pillars }: EsgImpactSectionProps) {
  return (
    <section className="flex flex-col gap-4 sm:gap-6">
      <h2 className="text-xl sm:text-2xl font-medium leading-tight sm:leading-9 text-vinculo-dark">
        Impacto ESG
      </h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8">
        {pillars.map((pillar) => (
          <div
            key={pillar.label}
            className="flex flex-row items-center gap-3 md:flex-col md:gap-3 md:text-center"
          >
            <div
              className={`aspect-square w-9 h-9 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center ${pillar.iconBgClass}`}
            >
              <pillar.Icon className={pillar.iconColorClass} fontSize="small" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col md:w-full md:flex-none md:items-center md:gap-1">
              <div className="flex w-full items-baseline justify-between gap-2 md:flex-col md:items-center md:gap-1">
                <span className="text-sm md:text-base font-medium text-slate-800 truncate">
                  {pillar.label}
                </span>
                <span className="shrink-0 text-sm font-semibold text-slate-700 md:hidden">
                  {pillar.percentageOfTotal}%
                </span>
              </div>
              <span className="text-xs md:text-sm text-slate-500">
                {pillar.projects} projetos apoiados
              </span>
            </div>

            <div className="hidden w-full flex-col gap-1 md:flex">
              <ProgressBar value={pillar.percentageOfTotal} colorClass={pillar.barColorClass} />
              <span className="text-xs text-slate-500">
                {pillar.percentageOfTotal}% do investimento total
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
