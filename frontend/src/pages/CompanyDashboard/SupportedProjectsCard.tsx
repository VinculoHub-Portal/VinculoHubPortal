import DescriptionIcon from "@mui/icons-material/Description"
import type { SupportedProjectsStats } from "./mockData"

interface SupportedProjectsCardProps {
  data: SupportedProjectsStats
}

export function SupportedProjectsCard({ data }: SupportedProjectsCardProps) {
  return (
    <div className="bg-vinculo-green rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-4">
      <div className="flex justify-between items-start">
        <p className="text-sm text-white/90">Projetos Apoiados</p>
        <DescriptionIcon className="text-white/80" fontSize="small" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-3xl sm:text-4xl font-semibold text-white">
            {data.active}
          </span>
          <span className="text-xs text-white/80 leading-tight">Projetos ativos</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-3xl sm:text-4xl font-semibold text-white">
            {data.incentiveLaws}
          </span>
          <span className="text-xs text-white/80 leading-tight">Leis de incentivo</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-3xl sm:text-4xl font-semibold text-white">
            {data.privateInvestment}
          </span>
          <span className="text-xs text-white/80 leading-tight">Investimento privado</span>
        </div>
      </div>

      <button className="bg-white text-vinculo-green font-semibold rounded-lg px-4 py-3 w-full text-sm">
        Ver todos os projetos
      </button>
    </div>
  )
}
