import { useState } from "react"
import ApartmentIcon from "@mui/icons-material/Apartment"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import { useNavigate } from "react-router-dom"
import type { CompanyListItem } from "../../api/companies"

function buildLocation(city: string | null, state: string | null): string | null {
  if (city && state) return `${city}, ${state}`
  return city ?? state ?? null
}

interface CompanyRowProps {
  company: CompanyListItem
}

export function CompanyRow({ company }: CompanyRowProps) {
  const navigate = useNavigate()
  const [logoFailed, setLogoFailed] = useState(false)
  const location = buildLocation(company.city, company.state)
  const showLogo = Boolean(company.logoUrl) && !logoFailed
  const profilePath = `/empresa/publico/${company.id}`

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver perfil de ${company.legalName}`}
      onClick={() => navigate(profilePath)}
      onKeyDown={(e) => e.key === "Enter" && navigate(profilePath)}
      className="grid cursor-pointer grid-cols-1 gap-3 rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50 sm:p-4 lg:grid-cols-[minmax(240px,2fr)_minmax(160px,1fr)_auto] lg:items-center lg:gap-0 lg:rounded-none lg:border-0 lg:p-0 lg:py-4 lg:hover:bg-transparent"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center overflow-hidden rounded-xl bg-vinculo-dark sm:h-12 sm:w-12">
          {showLogo ? (
            <img
              src={company.logoUrl!}
              alt={company.legalName}
              className="h-full w-full object-cover"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <ApartmentIcon sx={{ fontSize: 22, color: "white" }} aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-snug text-vinculo-dark sm:text-base">{company.legalName}</p>
          {company.socialName && (
            <p className="text-xs text-slate-500 sm:text-sm">{company.socialName}</p>
          )}
        </div>
      </div>

      <div>
        {location ? (
          <p className="flex items-center gap-1 text-xs text-slate-500 sm:text-sm">
            <LocationOnIcon sx={{ fontSize: 14 }} aria-hidden />
            {location}
          </p>
        ) : (
          <p className="text-sm text-slate-400">—</p>
        )}
      </div>

      <div className="flex lg:justify-end">
        <button
          type="button"
          aria-label={`Ver perfil de ${company.legalName}`}
          onClick={(e) => { e.stopPropagation(); navigate(profilePath) }}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-vinculo-dark transition hover:border-vinculo-dark hover:bg-blue-50 lg:w-auto"
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
          Ver perfil
        </button>
      </div>
    </div>
  )
}
