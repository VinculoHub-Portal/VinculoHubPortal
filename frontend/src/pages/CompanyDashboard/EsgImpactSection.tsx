import { ProgressBar } from "./ProgressBar"
import type { EsgFooterStats, EsgPillar } from "./mockData"

interface EsgImpactSectionProps {
  pillars: EsgPillar[]
  footerStats: EsgFooterStats
}

export function EsgImpactSection({ pillars, footerStats }: EsgImpactSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-medium leading-9 text-vinculo-dark">Impacto ESG</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pillars.map((pillar) => (
          <div key={pillar.label} className="flex flex-col items-center gap-3 text-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${pillar.iconBgClass}`}
            >
              <pillar.Icon className={pillar.iconColorClass} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-slate-800">{pillar.label}</span>
              <span className="text-sm text-slate-500">{pillar.projects} projetos apoiados</span>
            </div>
            <div className="w-full flex flex-col gap-1">
              <ProgressBar value={pillar.percentageOfTotal} colorClass={pillar.barColorClass} />
              <span className="text-xs text-slate-500">
                {pillar.percentageOfTotal}% do investimento total
              </span>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-slate-200" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-semibold text-vinculo-dark">
            {footerStats.beneficiaries}
          </span>
          <span className="text-sm text-slate-500">Pessoas beneficiadas</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-semibold text-vinculo-dark">
            {footerStats.communities}
          </span>
          <span className="text-sm text-slate-500">Comunidades impactadas</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-semibold text-vinculo-dark">{footerStats.sdgs}</span>
          <span className="text-sm text-slate-500">ODS atendidos</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-semibold text-vinculo-dark">{footerStats.states}</span>
          <span className="text-sm text-slate-500">Estados alcançados</span>
        </div>
      </div>
    </div>
  )
}
