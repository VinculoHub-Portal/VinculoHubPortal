import LinkIcon from "@mui/icons-material/Link"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline"
import { Link, useLocation } from "react-router-dom"

interface PortalTopbarProps {
  userInitial?: string
  userLabel?: string
  vinculosCount?: number
  avatarVariant?: "initial" | "icon"
  homeHref?: string
  vinculosHref?: string
}

export function PortalTopbar({
  userInitial = "A",
  userLabel = "ABC",
  vinculosCount = 6,
  avatarVariant = "initial",
  homeHref = "/",
  vinculosHref = "/meus-vinculos",
}: PortalTopbarProps) {
  const location = useLocation()
  const isVinculosActive = location.pathname === vinculosHref

  return (
    <header className="bg-vinculo-dark text-white">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to={homeHref}
          className="text-xl font-semibold tracking-normal text-white transition-opacity hover:opacity-90 sm:text-2xl"
          aria-label="Ir para o dashboard"
        >
          VínculoHub Portal
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link
            to={vinculosHref}
            aria-current={isVinculosActive ? "page" : undefined}
            className="relative hidden items-center gap-2 rounded-full px-2 py-1 transition hover:bg-white/10 sm:flex"
          >
            <LinkIcon fontSize="small" />
            <span>Vínculos</span>
            <span className="absolute -right-3 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-xs font-bold text-vinculo-dark">
              {vinculosCount}
            </span>
          </Link>
          <span className="hidden font-medium sm:inline">{userLabel}</span>
          <span
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-sm font-semibold"
            aria-label={`Usuário ${userLabel}`}
          >
            {avatarVariant === "icon" ? (
              <PersonOutlineIcon fontSize="small" />
            ) : (
              userInitial
            )}
          </span>
        </div>
      </div>
    </header>
  )
}
