export type NpoResponsible = {
  name: string
  role: string
  email: string
  phone: string
}

export type NpoProfile = {
  slug: string
  name: string
  organizationType: string
  badges: string[]
  description: string
  cnpj: string
  actionArea: string
  organizationSize: string
  foundationYear: number
  annualBudget: string
  address: string
  email: string
  phone: string
  website: string
  responsible: NpoResponsible
  mission: string
}

export const mockNpoProfile: NpoProfile = {
  slug: "instituto-educacao",
  name: "Instituto Educação para Todos",
  organizationType: "ONG I",
  badges: ["Educação", "Médio", "Fundada em 2010"],
  description:
    "Organização dedicada à promoção da educação de qualidade para crianças e adolescentes em situação de vulnerabilidade social. Atuamos em todo o território nacional, promovendo a inovação e o impacto social positivo.",
  cnpj: "12.345.678/0001-90",
  actionArea: "Educação",
  organizationSize: "Médio",
  foundationYear: 2010,
  annualBudget: "R$ 2.500.000",
  address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
  email: "contato@educacaoparatodos.org.br",
  phone: "(11) 3000-0000",
  website: "www.educacaoparatodos.org.br",
  responsible: {
    name: "Maria Silva Santos",
    role: "Diretora Executiva",
    email: "maria.santos@educacaoparatodos.org.br",
    phone: "(11) 3000-0001",
  },
  mission:
    "Nossa organização está comprometida com práticas que promovam um impacto positivo na sociedade. Investimos anualmente em projetos sociais alinhados aos ODS da ONU, com foco em educação, saúde e desenvolvimento comunitário.",
}

export const npoProfilesBySlug: Record<string, NpoProfile> = {
  [mockNpoProfile.slug]: mockNpoProfile,
}
