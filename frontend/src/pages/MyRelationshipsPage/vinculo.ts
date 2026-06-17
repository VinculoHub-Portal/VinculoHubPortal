import type { AuthenticatedUserType } from "../../api/me"
import type {
  RelationshipListItem,
  RelationshipStatus,
} from "../../api/relationships"

export type VinculoFilter = "all" | "pending" | "negotiation" | "active"

export type VinculoStatus =
  | "active"
  | "negotiation"
  | "pending_waiting"
  | "pending_interest"

export type VinculoPartnerType = "ONG" | "EMPRESA"

export interface VinculoContact {
  email: string
  phone: string | null
  websiteLabel?: string
  websiteHref?: string
}

export interface VinculoInfoBannerWarning {
  tone: "warning"
  text: string
}

export interface VinculoInfoBannerSuccess {
  tone: "success"
  prefix: string
  highlightedPartner: string
  suffix: string
}

export type VinculoInfoBanner = VinculoInfoBannerWarning | VinculoInfoBannerSuccess

export interface VinculoConnection {
  id: string
  projectId: number
  companyId: number | null
  projectName: string
  partnerInstitutionName: string
  partnerType: VinculoPartnerType
  partnerId: number
  status: VinculoStatus
  secondaryBadgeLabel?: string
  requestedAt?: string
  activeSince?: string
  contact?: VinculoContact
  optionalActionLabel?: string
  infoBanner?: VinculoInfoBanner
}

export function isPendingStatus(status: VinculoStatus) {
  return status === "pending_waiting" || status === "pending_interest"
}

export function getVinculoFilterCounts(vinculos: VinculoConnection[]) {
  const counts = {
    all: vinculos.length,
    pending: 0,
    negotiation: 0,
    active: 0,
  }

  vinculos.forEach((vinculo) => {
    if (isPendingStatus(vinculo.status)) {
      counts.pending += 1
      return
    }

    if (vinculo.status === "negotiation") {
      counts.negotiation += 1
      return
    }

    counts.active += 1
  })

  return counts
}

export function getOpenVinculoCount(vinculos: VinculoConnection[]) {
  return vinculos.filter(
    (vinculo) => vinculo.status === "negotiation" || isPendingStatus(vinculo.status),
  ).length
}

export function filterVinculos(
  vinculos: VinculoConnection[],
  filter: VinculoFilter,
) {
  if (filter === "all") {
    return vinculos
  }

  return vinculos.filter((vinculo) => {
    if (filter === "active") {
      return vinculo.status === "active"
    }

    if (filter === "negotiation") {
      return vinculo.status === "negotiation"
    }

    return isPendingStatus(vinculo.status)
  })
}

// --------------------------------------------------------------------------------------------
// Backend (RelationshipListItemResponse) → UI model mapping.
//
// The backend exposes 3 statuses (active / negotiation / pending) while the UI distinguishes 4
// sub-statuses. A `pending` row becomes `pending_interest` when the viewer is the receptor and may
// respond (`canRespond`), or `pending_waiting` otherwise. The partner type is derived from the
// viewer's own type, since each relationship is always Company <-> NPO.
// --------------------------------------------------------------------------------------------

function mapStatus(status: RelationshipStatus, canRespond: boolean): VinculoStatus {
  switch (status) {
    case "active":
      return "active"
    case "negotiation":
      return "negotiation"
    case "pending":
    default:
      return canRespond ? "pending_interest" : "pending_waiting"
  }
}

export function mapRelationshipToVinculo(
  item: RelationshipListItem,
  viewerType: AuthenticatedUserType | null,
): VinculoConnection {
  const partnerType: VinculoPartnerType = viewerType === "npo" ? "EMPRESA" : "ONG"
  const partnerNounDa = partnerType === "ONG" ? "da ONG" : "da empresa"
  const status = mapStatus(item.status, item.canRespond)

  const contact: VinculoContact | undefined =
    item.partnerContactEmail || item.partnerContactPhone
      ? { email: item.partnerContactEmail ?? "", phone: item.partnerContactPhone }
      : undefined

  let infoBanner: VinculoInfoBanner | undefined
  let secondaryBadgeLabel: string | undefined
  let optionalActionLabel: string | undefined

  if (status === "pending_interest") {
    infoBanner = {
      tone: "success",
      prefix: partnerType === "ONG" ? "A ONG " : "A Empresa ",
      highlightedPartner: item.partnerInstitutionName,
      suffix:
        ' demonstrou interesse em sua organização. Clique em "Aceitar Contato" para iniciar a negociação.',
    }
  } else if (status === "pending_waiting") {
    infoBanner = {
      tone: "warning",
      text: `Aguardando resposta ${partnerNounDa}. Você será notificado quando houver uma atualização.`,
    }
  } else if (status === "negotiation") {
    if (item.canConfirm) {
      optionalActionLabel = "Efetivar Parceria"
    } else {
      secondaryBadgeLabel = `Aguardando confirmação ${partnerNounDa}`
    }
  }

  return {
    id: `${item.partnerInstitutionId}-${item.projectId}`,
    projectId: item.projectId,
    companyId: viewerType === "npo" ? item.partnerInstitutionId : null,
    projectName: item.projectName,
    partnerInstitutionName: item.partnerInstitutionName,
    partnerType,
    partnerId: item.partnerInstitutionId,
    status,
    secondaryBadgeLabel,
    contact,
    optionalActionLabel,
    infoBanner,
  }
}

/**
 * Maps the visible relationships returned by the API to the UI model, dropping `inactive` rows
 * defensively (the backend already excludes them from the visible list).
 */
export function mapRelationshipsToVinculos(
  items: RelationshipListItem[],
  viewerType: AuthenticatedUserType | null,
): VinculoConnection[] {
  return items
    .filter((item) => item.status !== "inactive")
    .map((item) => mapRelationshipToVinculo(item, viewerType))
}
