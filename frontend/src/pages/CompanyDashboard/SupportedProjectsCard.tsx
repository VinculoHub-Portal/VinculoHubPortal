import DescriptionIcon from "@mui/icons-material/Description"
import { Link } from "react-router-dom"
import type { CompanySupportedProjectsSummary } from "../../api/companyPortfolio"

interface SupportedProjectsCardProps {
  data: CompanySupportedProjectsSummary
  loading?: boolean
  error?: string | null
}

export function SupportedProjectsCard({
  data,
  loading = false,
  error = null,
}: SupportedProjectsCardProps) {
  const displayValue = (value: number) => (loading ? "..." : value)

  return (
    <div className="bg-vinculo-green rounded-2xl p-5 sm:p-8 flex flex-col justify-between gap-3 sm:gap-4">
      <div className="flex justify-between items-start">
        <p className="text-sm text-white/90">Projetos Apoiados</p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
          <DescriptionIcon sx={{ fontSize: 28 }} aria-hidden />
        </span>
      </div>

      {error && (
        <p className="rounded-lg bg-white/15 px-3 py-2 text-sm text-white">
          Não foi possível carregar os dados atualizados.
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-2xl sm:text-4xl font-semibold text-white">
            {displayValue(data.active)}
          </span>
          <span className="text-xs text-white/80 leading-tight">Projetos ativos</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl sm:text-4xl font-semibold text-white">
            {displayValue(data.incentiveLaws)}
          </span>
          <span className="text-xs text-white/80 leading-tight">Leis de incentivo</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl sm:text-4xl font-semibold text-white">
            {displayValue(data.privateInvestment)}
          </span>
          <span className="text-xs text-white/80 leading-tight">Investimento privado</span>
        </div>
      </div>

      <Link
        to="/meus-vinculos?filter=active"
        className="cursor-pointer bg-white text-vinculo-green font-semibold rounded-lg px-4 py-2.5 sm:py-3 w-full text-sm text-center transition-opacity hover:opacity-90"
      >
        Ver todos os projetos
      </Link>
    </div>
  )
}
