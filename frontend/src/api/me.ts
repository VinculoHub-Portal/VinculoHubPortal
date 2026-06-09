import { api } from "../services/api"
import { logger } from "../utils/logger"

export type AuthenticatedUserType = "admin" | "npo" | "company"

export interface AuthenticatedProfile {
  auth0Id: string
  email: string | null
  userId: number | null
  userType: AuthenticatedUserType | null
  npoId: number | null
  companyId: number | null
  companyName: string | null
  registrationCompleted: boolean
}

export async function fetchAuthenticatedProfile(
  token: string,
): Promise<AuthenticatedProfile> {
  logger.info("MeAPI", "Fetching authenticated profile")
  try {
    const { data } = await api.get<AuthenticatedProfile>("/api/me/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("MeAPI", "Authenticated profile fetched", {
      userType: data.userType,
      npoId: data.npoId,
      companyId: data.companyId,
      companyName: data.companyName,
    })
    return data
  } catch (error) {
    logger.error("MeAPI", "Failed to fetch authenticated profile", error)
    throw error
  }
}
