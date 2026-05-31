export type OngProjectFundingModel =
  | "incentiveLaw"
  | "privateInvestment"
  | "directCapture"

export interface OngProject {
  id: number
  status: string
  fundingModel: OngProjectFundingModel
  amountNeeded: number
  title: string
  description: string
  progress: number
  tags: string[]
}

export interface OngProjectSummary {
  totalProjects: number
  incentiveLawProjects: number
  privateInvestmentProjects: number
}

export const mockOngProjects: OngProject[] = [
  {
    id: 1,
    status: "Ativo",
    fundingModel: "incentiveLaw",
    amountNeeded: 150000,
    title: "Educação Transformadora",
    description:
      "Programa de reforço escolar e formação profissionalizante para jovens em situação de vulnerabilidade social, oferecendo capacitação e desenvolvimento de habilidades.",
    progress: 75,
    tags: ["Educação", "Capacitação"],
  },
  {
    id: 2,
    status: "Ativo",
    fundingModel: "directCapture",
    amountNeeded: 200000,
    title: "Saúde Comunitária",
    description:
      "Unidade móvel de saúde para atendimento médico e odontológico em comunidades rurais com difícil acesso a serviços de saúde básica.",
    progress: 45,
    tags: ["Saúde", "Desenvolvimento Comunitário"],
  },
  {
    id: 3,
    status: "Ativo",
    fundingModel: "directCapture",
    amountNeeded: 80000,
    title: "Cultura para Todos",
    description:
      "Programa de incentivo à cultura e arte com oficinas de música, teatro e artes plásticas para crianças e adolescentes em situação de vulnerabilidade.",
    progress: 60,
    tags: ["Cultura", "Arte e Educação"],
  },
]

export function getOngProjectSummary(projects: OngProject[]): OngProjectSummary {
  return {
    totalProjects: projects.length,
    incentiveLawProjects: projects.filter(
      (project) => project.fundingModel === "incentiveLaw",
    ).length,
    privateInvestmentProjects: projects.filter(
      (project) => project.fundingModel === "privateInvestment",
    ).length,
  }
}
