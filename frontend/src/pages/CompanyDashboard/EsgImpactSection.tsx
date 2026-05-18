import { ProgressBar } from "./ProgressBar"
import type { EsgPillar } from "./mockData"

interface EsgImpactSectionProps {
  pillars: EsgPillar[]
}

export function EsgImpactSection({ pillars }: EsgImpactSectionProps) {
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
    </div>
  )
}
