import type { RelationshipStatus } from "../../../api/relationships"

const STATUS_LABELS: Record<RelationshipStatus, string> = {
  pending: "Pendente",
  negotiation: "Em negociação",
  active: "Ativo",
  inactive: "Inativo",
}

const STATUS_CLASSES: Record<RelationshipStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  negotiation: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-100 text-slate-700",
}

type RelationshipStatusBadgeProps = {
  status: RelationshipStatus
}

export function RelationshipStatusBadge({
  status,
}: RelationshipStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}