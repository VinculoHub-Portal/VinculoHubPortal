import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import { ProgressBar } from "./ProgressBar"
import type { InvestmentBudget } from "./mockData"

interface InvestmentBudgetCardProps {
  data: InvestmentBudget
}

export function InvestmentBudgetCard({ data }: InvestmentBudgetCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col gap-4">
      <p className="text-sm text-slate-500">Investimento Disponível</p>

      <div className="flex items-center gap-2">
        <span className="text-3xl sm:text-4xl font-semibold text-vinculo-green">
          {data.totalDisplay}
        </span>
        <TrendingUpIcon className="text-vinculo-green" fontSize="small" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Total disponível</span>
          <span className="text-slate-700 font-medium">
            {data.totalDisplay}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Utilizado</span>
          <span className="text-vinculo-green font-medium">
            {data.usedDisplay}
          </span>
        </div>
      </div>

      <ProgressBar value={data.usedPercentage} colorClass="bg-vinculo-green" />

      <div className="flex justify-between text-xs text-slate-500">
        <span>{data.usedPercentage}% utilizado</span>
        <span>100%</span>
      </div>
    </div>
  )
}
