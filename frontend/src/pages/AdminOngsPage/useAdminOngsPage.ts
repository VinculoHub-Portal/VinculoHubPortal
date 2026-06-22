import { createContext, useContext } from "react"
import type {
  AdminNpoAreaFilter,
  AdminNpoCard,
  AdminNpoStatusFilter,
} from "../../api/admin"

export interface AdminOngsPageContextValue {
  npos: AdminNpoCard[]
  page: number
  totalPages: number
  totalElements: number
  loading: boolean
  error: string
  searchFilter: string
  areaFilter: AdminNpoAreaFilter | "all"
  statusFilter: AdminNpoStatusFilter
  setSearchFilter: (value: string) => void
  setPage: (page: number) => void
  handleAreaChange: (value: AdminNpoAreaFilter | "all") => void
  handleStatusChange: (value: AdminNpoStatusFilter) => void
}

export const AdminOngsPageContext =
  createContext<AdminOngsPageContextValue | null>(null)

export function useAdminOngsPage() {
  const context = useContext(AdminOngsPageContext)

  if (!context) {
    throw new Error("useAdminOngsPage must be used within AdminOngsPage")
  }

  return context
}
