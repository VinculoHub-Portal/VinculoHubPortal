import { api } from "../services/api"
import { logger } from "../utils/logger"

export type NpoReportStatus = "OPEN" | "RESOLVED" | "DISMISSED"

export interface NpoReportCreatePayload {
  reason: string
}

export interface NpoReportStatusUpdatePayload {
  status: NpoReportStatus
}

export interface NpoReportResponse {
  id: number
  npo: {
    id: number
    name: string
  }
  reporterCompany: {
    id: number
    name: string
    cnpj: string | null
  }
  reporterUser: {
    id: number
    name: string
    email: string
  }
  reason: string
  status: NpoReportStatus
  createdAt: string
}

export async function createNpoReport(
  npoId: number,
  payload: NpoReportCreatePayload,
  token: string,
): Promise<NpoReportResponse> {
  logger.info("NpoReportsAPI", "Creating NPO report", { npoId })
  try {
    const { data } = await api.post<NpoReportResponse>(
      `/api/npos/${npoId}/reports`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    logger.info("NpoReportsAPI", "NPO report created", { id: data.id, npoId })
    return data
  } catch (error) {
    logger.error("NpoReportsAPI", "Failed to create NPO report", error)
    throw error
  }
}

export async function fetchAdminNpoReports(
  token: string,
): Promise<NpoReportResponse[]> {
  logger.info("NpoReportsAPI", "Fetching admin NPO reports")
  try {
    const { data } = await api.get<NpoReportResponse[]>("/api/admin/npo-reports", {
      headers: { Authorization: `Bearer ${token}` },
    })
    logger.info("NpoReportsAPI", "Admin NPO reports fetched", { count: data.length })
    return data
  } catch (error) {
    logger.error("NpoReportsAPI", "Failed to fetch admin NPO reports", error)
    throw error
  }
}

export async function updateAdminNpoReportStatus(
  reportId: number,
  payload: NpoReportStatusUpdatePayload,
  token: string,
): Promise<NpoReportResponse> {
  logger.info("NpoReportsAPI", "Updating NPO report status", {
    reportId,
    status: payload.status,
  })
  try {
    const { data } = await api.patch<NpoReportResponse>(
      `/api/admin/npo-reports/${reportId}/status`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    logger.info("NpoReportsAPI", "NPO report status updated", {
      reportId,
      status: data.status,
    })
    return data
  } catch (error) {
    logger.error("NpoReportsAPI", "Failed to update NPO report status", error)
    throw error
  }
}
