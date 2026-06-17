import type { NpoExportData, VinculoExportData } from "../api/admin"
import type { NpoSize } from "../api/npo"

const NPO_SIZE_LABELS: Record<NpoSize, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
}

const VINCULO_STATUS_LABELS: Record<VinculoExportData["status"], string> = {
  pending: "Pendente",
  active: "Ativo",
  inactive: "Inativo",
  negotiation: "Negociação",
}

export function npoSizeLabel(size: NpoSize | null | undefined): string {
  if (!size) return ""
  return NPO_SIZE_LABELS[size] ?? size
}

export function vinculoStatusLabel(status: VinculoExportData["status"]): string {
  return VINCULO_STATUS_LABELS[status] ?? status
}

export function mapNposForCsvExport(npos: NpoExportData[]) {
  return npos.map(({ npoSize, ...rest }) => ({
    ...rest,
    npoSize: npoSizeLabel(npoSize),
  }))
}

export function mapVinculosForCsvExport(vinculos: VinculoExportData[]) {
  return vinculos.map(({ status, ...rest }) => ({
    ...rest,
    status: vinculoStatusLabel(status),
  }))
}
