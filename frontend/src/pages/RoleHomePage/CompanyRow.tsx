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

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-100 p-4 lg:grid-cols-[minmax(240px,2fr)_minmax(160px,1fr)_56px] lg:items-center lg:border-0 lg:p-0 lg:py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-vinculo-dark">
          {showLogo ? (
            <img
              src={company.logoUrl!}
              alt={company.legalName}
              className="h-full w-full object-cover"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <ApartmentIcon sx={{ fontSize: 28, color: "white" }} aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold leading-snug text-vinculo-dark">{company.legalName}</p>
          {company.socialName && (
            <p className="text-sm text-slate-500">{company.socialName}</p>
          )}
        </div>
      </div>

      <div>
        {location ? (
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <LocationOnIcon sx={{ fontSize: 16 }} aria-hidden />
            {location}
          </p>
        ) : (
          <p className="text-sm text-slate-400">—</p>
        )}
      </div>

      <div className="flex justify-end lg:justify-center">
        <button
          type="button"
          aria-label={`Ver perfil de ${company.legalName}`}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-vinculo-dark transition hover:bg-blue-50"
          onClick={() => navigate(`/empresa/publico/${company.id}`)}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </button>
      </div>
    </div>
  )
}
