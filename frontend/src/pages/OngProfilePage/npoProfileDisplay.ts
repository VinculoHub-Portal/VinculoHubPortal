import type { NpoAddressData, NpoInstitutionalData, NpoSize } from "../../api/npo"

const NPO_SIZE_LABELS: Record<NpoSize, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
}

export function npoSizeLabel(size: NpoSize | null | undefined): string {
  if (!size) return ""
  return NPO_SIZE_LABELS[size] ?? size
}

export function buildBadges(institutionalData: NpoInstitutionalData): string[] {
  const badges: string[] = []
  if (institutionalData.npoSize) {
    badges.push(npoSizeLabel(institutionalData.npoSize))
  }
  if (institutionalData.environmental) badges.push("Ambiental")
  if (institutionalData.social) badges.push("Social")
  if (institutionalData.governance) badges.push("Governança")
  return badges
}

export function formatAddress(address: NpoAddressData | null | undefined): string {
  if (!address) return ""
  const parts: string[] = []
  if (address.street) {
    const streetLine = address.number
      ? `${address.street}, ${address.number}`
      : address.street
    parts.push(address.complement ? `${streetLine} - ${address.complement}` : streetLine)
  }
  if (address.city && address.stateCode) {
    parts.push(`${address.city} - ${address.stateCode}`)
  } else if (address.city) {
    parts.push(address.city)
  }
  if (address.zipCode) parts.push(address.zipCode)
  return parts.join(", ")
}

export function cnpjOrCpfLabel(
  cnpj: string | null | undefined,
  cpf: string | null | undefined,
): { label: string; value: string } | null {
  if (cnpj) return { label: "CNPJ", value: cnpj }
  if (cpf) return { label: "CPF", value: cpf }
  return null
}
