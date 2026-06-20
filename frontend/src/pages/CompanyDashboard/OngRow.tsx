import { useState } from "react"
import CorporateFareIcon from "@mui/icons-material/CorporateFare"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import { Link } from "react-router-dom"
import type { NpoListItem } from "../../api/npo"

function buildLocation(city: string | null, stateCode: string | null): string | null {
  if (city && stateCode) return `${city}, ${stateCode}`
  return city ?? stateCode ?? null
}

interface OngRowProps {
  npo: NpoListItem
}

export function OngRow({ npo }: OngRowProps) {
  const [logoFailed, setLogoFailed] = useState(false)
  const location = buildLocation(npo.city, npo.stateCode)
  const showLogo = Boolean(npo.logoUrl) && !logoFailed

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-100 p-4 lg:grid-cols-[minmax(240px,2fr)_minmax(160px,1fr)_56px] lg:items-center lg:border-0 lg:p-0 lg:py-5">
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

      <div className="flex justify-end lg:justify-center">
        <Link
          to={`/ong/publico/${npo.id}`}
          aria-label={`Ver perfil de ${npo.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-vinculo-dark transition hover:bg-blue-50"
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </Link>
      </div>
    </div>
  )
}
