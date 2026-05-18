import type { SvgIconComponent } from "@mui/icons-material"
import PublicIcon from "@mui/icons-material/Public"
import PeopleIcon from "@mui/icons-material/People"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"

export interface InvestmentBudget {
  totalDisplay: string
  usedDisplay: string
  usedPercentage: number
}

export interface EsgPillar {
  label: string
  projects: number
  percentageOfTotal: number
  Icon: SvgIconComponent
  iconBgClass: string
  iconColorClass: string
  barColorClass: string
}

// TODO(backend): substituir pelo nome da empresa logada.
//   Endpoint a criar: estender GET /api/me/profile (MeController) para incluir
//   companyName/legalName/socialName, OU novo GET /api/me/company retornando CompanyDTO.
//   Hoje /api/me/profile só retorna companyId (Integer), sem o nome.
export const mockCompanyName = "Empresa ABC"

// TODO(backend): substituir pelo saldo de investimento da empresa.
//   Endpoint a criar: GET /api/me/company/budget retornando
//   { totalDisplay: string, usedDisplay: string, usedPercentage: number }
//   (valores monetários formatados pt-BR; backend é responsável pela formatação).
//   Não existe modelo de orçamento por empresa hoje — requer campo novo na entidade
//   Company ou nova entidade CompanyBudget.
export const mockBudget: InvestmentBudget = {
  totalDisplay: "R$ 250.000",
  usedDisplay: "R$ 150.000",
  usedPercentage: 60,
}

// TODO(backend): substituir pelas métricas de pilares ESG da empresa.
//   Endpoint a criar: GET /api/me/company/esg-pillars retornando array de
//   { label, projects, percentageOfTotal } para Ambiental/Social/Governança.
//   Flags ESG hoje vivem em Npo (environmental/social/governance), não em Project —
//   depende do relacionamento Empresa↔Projeto e de propagar pilares para Project
//   ou agregar via Npo. Os campos visuais (Icon/iconBgClass/iconColorClass/
//   barColorClass) permanecem definidos no frontend mesmo após a integração.
export const mockEsgPillars: EsgPillar[] = [
  {
    label: "Ambiental",
    projects: 3,
    percentageOfTotal: 45,
    Icon: PublicIcon,
    iconBgClass: "bg-blue-50",
    iconColorClass: "text-blue-500",
    barColorClass: "bg-vinculo-dark",
  },
  {
    label: "Social",
    projects: 4,
    percentageOfTotal: 35,
    Icon: PeopleIcon,
    iconBgClass: "bg-green-50",
    iconColorClass: "text-vinculo-green",
    barColorClass: "bg-vinculo-green",
  },
  {
    label: "Governança",
    projects: 2,
    percentageOfTotal: 20,
    Icon: EmojiEventsIcon,
    iconBgClass: "bg-amber-50",
    iconColorClass: "text-amber-500",
    barColorClass: "bg-red-700",
  },
]
