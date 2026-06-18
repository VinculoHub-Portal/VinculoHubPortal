import type { RelationshipListItem } from "../../../api/relationships"
import { BaseButton } from "../../../components/general/BaseButton"
import { RelationshipStatusBadge } from "./RelationshipStatusBadge"

type RelationshipCardProps = {
  relationship: RelationshipListItem
  isSubmitting?: boolean
  onAccept: (relationship: RelationshipListItem) => void
  onReject: (relationship: RelationshipListItem) => void
}

export function RelationshipCard({
  relationship,
  isSubmitting = false,
  onAccept,
  onReject,
}: RelationshipCardProps) {
  const hasContact =
    relationship.partnerContactEmail !== null ||
    relationship.partnerContactPhone !== null
  const canRespond =
    relationship.status === "pending" && relationship.canRespond

  return (
    <article
      className="flex h-full w-full flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-label={`Relacionamento do projeto ${relationship.projectName}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Projeto
          </p>
          <h3 className="mt-1 text-lg font-bold text-vinculo-dark">
            {relationship.projectName}
          </h3>
        </div>
        <RelationshipStatusBadge status={relationship.status} />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Instituição parceira
        </p>
        <p className="mt-1 text-sm font-medium text-slate-700">
          {relationship.partnerInstitutionName}
        </p>
      </div>

      {hasContact ? (
        <div aria-label="Contato da instituição parceira">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Contato
          </p>
          <div className="mt-1 flex flex-col gap-1 text-sm text-slate-700">
            {relationship.partnerContactEmail !== null ? (
              <a
                href={`mailto:${relationship.partnerContactEmail}`}
                className="w-fit break-all underline decoration-slate-300 underline-offset-2 hover:text-vinculo-dark"
              >
                {relationship.partnerContactEmail}
              </a>
            ) : null}
            {relationship.partnerContactPhone !== null ? (
              <a
                href={`tel:${relationship.partnerContactPhone}`}
                className="w-fit underline decoration-slate-300 underline-offset-2 hover:text-vinculo-dark"
              >
                {relationship.partnerContactPhone}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {canRespond ? (
        <div className="mt-auto flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <BaseButton
            type="button"
            variant="attention"
            className="w-full sm:w-fit"
            disabled={isSubmitting}
            onClick={() => onReject(relationship)}
          >
            Recusar
          </BaseButton>
          <BaseButton
            type="button"
            variant="secondary"
            className="w-full sm:w-fit"
            disabled={isSubmitting}
            onClick={() => onAccept(relationship)}
          >
            Aceitar Contato
          </BaseButton>
        </div>
      ) : null}
    </article>
  )
}
