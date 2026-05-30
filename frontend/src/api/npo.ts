import { api } from "../services/api"
import { logger } from "../utils/logger"

export type ViewerContext = "OWNER" | "EXTERNAL"
export type NpoSize = "small" | "medium" | "large"
export type NpoUserType = "admin" | "npo" | "company"

export interface NpoInstitutionalData {
  id: number
  name: string
  description: string | null
  logoUrl: string | null
  npoSize: NpoSize | null
  cnpj: string | null
  cpf: string | null
  environmental: boolean | null
  social: boolean | null
  governance: boolean | null
}

export interface NpoContactData {
  email: string | null
  phone: string | null
}

export interface NpoAddressData {
  id: number | null
  state: string | null
  stateCode: string | null
  city: string | null
  street: string | null
  number: string | null
  complement: string | null
  zipCode: string | null
}

export interface NpoResponsibleData {
  id: number | null
  name: string | null
  email: string | null
  auth0Id: string | null
  userType: NpoUserType | null
}

export interface NpoProfileResponse {
  viewerContext: ViewerContext
  institutionalData: NpoInstitutionalData
  contact: NpoContactData
  address: NpoAddressData | null
  responsible: NpoResponsibleData | null
}

export interface NpoInstitutionalUpdate {
  name?: string
  description?: string
  logoUrl?: string
  npoSize?: NpoSize
  cnpj?: string
  cpf?: string
  environmental?: boolean
  social?: boolean
  governance?: boolean
}

export interface NpoContactUpdate {
  email?: string
  phone?: string
}

export interface NpoAddressUpdate {
  state?: string
  stateCode?: string
  city?: string
  street?: string
  number?: string
  complement?: string
  zipCode?: string
}

export interface NpoResponsibleUpdate {
  name?: string
  email?: string
}

export interface NpoProfileUpdateRequest {
  institutionalData?: NpoInstitutionalUpdate
  contact?: NpoContactUpdate
  address?: NpoAddressUpdate
  responsible?: NpoResponsibleUpdate
}

export async function fetchNpoProfile(
  id: number,
  token: string,
): Promise<NpoProfileResponse> {
  logger.info("NpoAPI", `Fetching profile for npo ${id}`)
  try {
    const { data } = await api.get<NpoProfileResponse>(`/api/npos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("NpoAPI", `Profile fetched for npo ${id}`, {
      viewerContext: data.viewerContext,
    })
    return data
  } catch (error) {
    logger.error("NpoAPI", `Failed to fetch profile for npo ${id}`, error)
    throw error
  }
}

export async function updateNpoProfile(
  id: number,
  payload: NpoProfileUpdateRequest,
  token: string,
): Promise<NpoProfileResponse> {
  logger.info("NpoAPI", `Updating profile for npo ${id}`)
  try {
    const { data } = await api.put<NpoProfileResponse>(`/api/npos/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("NpoAPI", `Profile updated for npo ${id}`)
    return data
  } catch (error) {
    logger.error("NpoAPI", `Failed to update profile for npo ${id}`, error)
    throw error
  }
}
