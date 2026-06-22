import { createContext, useContext } from "react"
import type {
  AdminRelationshipCard,
  AdminRelationshipStatusFilter,
} from "../../api/admin"

export interface AdminVinculosPageContextValue {
  relationships: AdminRelationshipCard[]
  page: number
  totalPages: number
  totalElements: number
  loading: boolean
  error: string
  companyNameFilter: string
  npoNameFilter: string
  projectTitleFilter: string
  statusFilter: AdminRelationshipStatusFilter
  setCompanyNameFilter: (value: string) => void
  setNpoNameFilter: (value: string) => void
  setProjectTitleFilter: (value: string) => void
  setPage: (page: number) => void
  handleStatusChange: (value: AdminRelationshipStatusFilter) => void
}

export const AdminVinculosPageContext =
  createContext<AdminVinculosPageContextValue | null>(null)

export function useAdminVinculosPage() {
  const context = useContext(AdminVinculosPageContext)

  if (!context) {
    throw new Error(
      "useAdminVinculosPage must be used within AdminVinculosPage",
    )
  }

  return context
}
