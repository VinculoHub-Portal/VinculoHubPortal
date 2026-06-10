export type VinculoFilter = "all" | "pending" | "negotiation" | "active"

export type VinculoStatus =
  | "active"
  | "negotiation"
  | "pending_waiting"
  | "pending_interest"

export interface VinculoContact {
  email: string
  phone: string
  websiteLabel: string
  websiteHref: string
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
  id: number
  projectId: number
  projectName: string
  partnerInstitutionName: string
  partnerType: "ONG" | "EMPRESA"
  partnerId: number
  status: VinculoStatus
  secondaryBadgeLabel?: string
  requestedAt: string
  activeSince?: string
  contact?: VinculoContact
  optionalActionLabel?: string
  infoBanner?: VinculoInfoBanner
}

export const mockVinculos: VinculoConnection[] = [
  {
    id: 1,
    projectId: 321,
    projectName: "Biblioteca Comunitária Sementes do Saber",
    partnerInstitutionName: "Instituto Educação para Todos",
    partnerType: "ONG",
    partnerId: 101,
    status: "active",
    requestedAt: "10/01/2026",
    activeSince: "15/01/2026",
    contact: {
      email: "contato@educacaoparatodos.org.br",
      phone: "(11) 1234-5678",
      websiteLabel: "www.educacaoparatodos.org.br",
      websiteHref: "https://www.educacaoparatodos.org.br",
    },
  },
  {
    id: 2,
    projectId: 322,
    projectName: "Saúde em Movimento",
    partnerInstitutionName: "Saúde Solidária",
    partnerType: "ONG",
    partnerId: 102,
    status: "active",
    requestedAt: "28/01/2026",
    activeSince: "01/02/2026",
    contact: {
      email: "contato@saudesolidaria.org.br",
      phone: "(81) 9876-5432",
      websiteLabel: "www.saudesolidaria.org.br",
      websiteHref: "https://www.saudesolidaria.org.br",
    },
  },
  {
    id: 3,
    projectId: 323,
    projectName: "Educação Ambiental nas Escolas",
    partnerInstitutionName: "Eco Futuro",
    partnerType: "ONG",
    partnerId: 103,
    status: "negotiation",
    secondaryBadgeLabel: "Aguardando confirmação da ONG",
    requestedAt: "15/03/2026",
    contact: {
      email: "contato@ecofuturo.org.br",
      phone: "(31) 2345-6789",
      websiteLabel: "www.ecofuturo.org.br",
      websiteHref: "https://www.ecofuturo.org.br",
    },
  },
  {
    id: 4,
    projectId: 324,
    projectName: "Inclusão Digital para Todos",
    partnerInstitutionName: "Acesso Digital",
    partnerType: "ONG",
    partnerId: 104,
    status: "negotiation",
    requestedAt: "18/03/2026",
    optionalActionLabel: "Efetivar Parceria",
    contact: {
      email: "contato@acessodigital.org.br",
      phone: "(51) 3456-7890",
      websiteLabel: "www.acessodigital.org.br",
      websiteHref: "https://www.acessodigital.org.br",
    },
  },
  {
    id: 5,
    projectId: 325,
    projectName: "Esporte e Cidadania",
    partnerInstitutionName: "Jovens em Ação",
    partnerType: "ONG",
    partnerId: 105,
    status: "pending_waiting",
    requestedAt: "20/03/2026",
    infoBanner: {
      tone: "warning",
      text: "Aguardando resposta da ONG. Você será notificado quando houver uma atualização.",
    },
  },
  {
    id: 6,
    projectId: 326,
    projectName: "Arte e Transformação",
    partnerInstitutionName: "Instituto Educação para Todos",
    partnerType: "ONG",
    partnerId: 101,
    status: "pending_waiting",
    requestedAt: "21/03/2026",
    infoBanner: {
      tone: "warning",
      text: "Aguardando resposta da ONG. Você será notificado quando houver uma atualização.",
    },
  },
  {
    id: 7,
    projectId: 327,
    projectName: "Oficinas de Música Comunitária",
    partnerInstitutionName: "Harmonia Social",
    partnerType: "ONG",
    partnerId: 106,
    status: "pending_interest",
    requestedAt: "19/03/2026",
    infoBanner: {
      tone: "success",
      prefix: "A ONG ",
      highlightedPartner: "Harmonia Social",
      suffix:
        " demonstrou interesse em sua organização. Clique em \"Confirmar Primeiro Aperto de Mão\" para iniciar a negociação.",
    },
  },
  {
    id: 8,
    projectId: 328,
    projectName: "Alimentação Saudável nas Escolas",
    partnerInstitutionName: "Nutrir Vidas",
    partnerType: "ONG",
    partnerId: 107,
    status: "pending_interest",
    requestedAt: "22/03/2026",
    infoBanner: {
      tone: "success",
      prefix: "A ONG ",
      highlightedPartner: "Nutrir Vidas",
      suffix:
        " demonstrou interesse em sua organização. Clique em \"Confirmar Primeiro Aperto de Mão\" para iniciar a negociação.",
    },
  },
]

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
