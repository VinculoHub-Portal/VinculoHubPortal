import { useAuth0 } from "@auth0/auth0-react"
import { type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthProfile } from "../../hooks/useAuthProfile"

const ROLES_CLAIM = "https://vinculohub/roles"

export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth0()
  const { data: profile, isLoading: isProfileLoading } = useAuthProfile()

  if (isLoading || (isAuthenticated && isProfileLoading)) {
    return null
  }

  if (!isAuthenticated) {
    return children
  }

  const rawRoles = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM]
  const roles: string[] = Array.isArray(rawRoles) ? rawRoles.map((r: unknown) => String(r).toUpperCase()) : []

  if (roles.includes("ADMIN")) return <Navigate to="/admin/dashboard" replace />

  if (!profile?.registrationCompleted || profile.userId === null) {
    return children
  }
  if (roles.includes("NPO")) return <Navigate to="/ong/dashboard" replace />
  if (roles.includes("COMPANY")) return <Navigate to="/empresa/dashboard" replace />

  return children
}
