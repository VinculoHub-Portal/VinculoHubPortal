import AccessTimeIcon from "@mui/icons-material/AccessTime"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import { BaseButton } from "../general/BaseButton"
import { ProgressBar } from "../general/ProgressBar"
import type { OngProjectFundingModel } from "../../pages/OngProjectsPage/mockData"

export interface OngProjectCardProps {
  id: number
  status: string
  fundingModel: OngProjectFundingModel
  amountNeeded: number
  title: string
  description: string
  progress: number
  tags: string[]
  onTimeline?: (id: number) => void
  onDetails?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

function formatAmount(value: number) {
  return CURRENCY_FORMATTER.format(value)
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function OngProjectCard({
  id,
  status,
  fundingModel,
  amountNeeded,
  title,
  description,
  progress,
  tags,
  onTimeline,
  onDetails,
  onEdit,
  onDelete,
}: OngProjectCardProps) {
  const percent = clampProgress(progress)
  const isIncentiveLaw = fundingModel === "incentiveLaw"

  return (
    <article
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      aria-label={`Projeto ${title}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-vinculo-green px-3 py-1.5 text-sm font-medium text-white">
          {status}
        </span>
        {isIncentiveLaw && (
          <span className="rounded-lg bg-amber-300 px-3 py-1.5 text-sm font-semibold text-slate-950">
            {formatAmount(amountNeeded)}
          </span>
        )}
      </div>

      <h2 className="mt-5 text-xl font-semibold leading-7 text-vinculo-dark">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>

      {isIncentiveLaw && (
        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <TrendingUpIcon className="text-vinculo-green" fontSize="small" />
            <span>Progresso do Projeto</span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-500">Conclusão</span>
            <span className="font-medium text-vinculo-green">{percent}%</span>
          </div>

          <div className="mt-3">
            <ProgressBar
              value={percent}
              trackClass="bg-slate-200"
              ariaLabel={`Progresso de ${title}`}
            />
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <BaseButton
          type="button"
          variant="secondary"
          fullWidth
          className="min-h-12 py-3 hover:bg-emerald-600"
          onClick={() => onTimeline?.(id)}
        >
          <AccessTimeIcon fontSize="small" />
          Ver Linha do Tempo
        </BaseButton>
        <BaseButton
          type="button"
          variant="outline"
          fullWidth
          className="min-h-12 bg-white py-3 hover:bg-blue-50"
          onClick={() => onDetails?.(id)}
        >
          Detalhes do Projeto
        </BaseButton>
        <BaseButton
          type="button"
          variant="outline"
          fullWidth
          className="min-h-12 border-slate-300 bg-white py-3 text-slate-700 hover:bg-slate-50"
          onClick={() => onEdit?.(id)}
        >
          Editar Projeto
        </BaseButton>
        <BaseButton
          type="button"
          variant="outline"
          fullWidth
          className="min-h-12 border-vinculo-red bg-white py-3 text-vinculo-red hover:bg-red-50"
          onClick={() => onDelete?.(id)}
        >
          Excluir Projeto
        </BaseButton>
      </div>
    </article>
  )
}
