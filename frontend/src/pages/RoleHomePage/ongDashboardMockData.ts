export type OngDashboardStatus = "Ativo" | "Em captação"

export interface OngProjectTypeMetric {
  label: string
  count: number
  percentage: number
  barClassName: string
  trackClassName: string
}

export interface OngDashboardProject {
  id: number
  title: string
  type: string
  status: OngDashboardStatus
  progress: number
  iconClassName: string
}

export const ongProjectTypeMetrics: OngProjectTypeMetric[] = [
  {
    label: "Leis de Incentivo",
    count: 10,
    percentage: 42,
    barClassName: "bg-vinculo-dark",
    trackClassName: "bg-blue-50",
  },
  {
    label: "Investimento Social Privado",
    count: 8,
    percentage: 33,
    barClassName: "bg-vinculo-green",
    trackClassName: "bg-green-50",
  },
  {
    label: "Projetos com Município/Estado",
    count: 6,
    percentage: 25,
    barClassName: "bg-amber-400",
    trackClassName: "bg-amber-50",
  },
]

export const ongDashboardProjects: OngDashboardProject[] = [
  {
    id: 1,
    title: "Educação Transformadora",
    type: "Lei de Incentivo",
    status: "Ativo",
    progress: 75,
    iconClassName: "bg-vinculo-dark",
  },
  {
    id: 2,
    title: "Saúde Comunitária",
    type: "Investimento Social",
    status: "Em captação",
    progress: 45,
    iconClassName: "bg-vinculo-green",
  },
  {
    id: 3,
    title: "Cultura para Todos",
    type: "Município",
    status: "Ativo",
    progress: 60,
    iconClassName: "bg-amber-400",
  },
]
