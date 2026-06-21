import { useState } from "react"
import CorporateFareIcon from "@mui/icons-material/CorporateFare"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import { useNavigate } from "react-router-dom"
import type { NpoListItem } from "../../api/npo"

function buildLocation(city: string | null, stateCode: string | null): string | null {
  if (city && stateCode) return `${city}, ${stateCode}`
  return city ?? stateCode ?? null
}

interface OngRowProps {
  npo: NpoListItem
}

export function OngRow({ npo }: OngRowProps) {
  const navigate = useNavigate()
  const [logoFailed, setLogoFailed] = useState(false)
  const location = buildLocation(npo.city, npo.stateCode)
  const showLogo = Boolean(npo.logoUrl) && !logoFailed
  const profilePath = `/ong/publico/${npo.id}`

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver perfil de ${npo.name}`}
      onClick={() => navigate(profilePath)}
      onKeyDown={(e) => e.key === "Enter" && navigate(profilePath)}
      className="grid cursor-pointer grid-cols-1 gap-4 rounded-lg border border-slate-100 p-4 transition hover:bg-slate-50 lg:grid-cols-[minmax(240px,2fr)_minmax(160px,1fr)_auto] lg:items-center lg:gap-0 lg:rounded-none lg:border-0 lg:p-0 lg:py-5 lg:hover:bg-transparent"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-vinculo-dark">
          {showLogo ? (
            <img
              src={npo.logoUrl!}
              alt={npo.name}
              className="h-full w-full object-cover"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <CorporateFareIcon sx={{ fontSize: 28, color: "white" }} aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold leading-snug text-vinculo-dark">{npo.name}</p>
          {npo.description && (
            <p className="line-clamp-2 text-sm text-slate-500">{npo.description}</p>
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

      <div className="flex lg:justify-end">
        <button
          type="button"
          aria-label={`Ver perfil de ${npo.name}`}
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
