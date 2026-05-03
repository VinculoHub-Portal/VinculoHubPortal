import type { ProjectListItem } from "../../api/projects"

export const INCENTIVE_LAWS = [
  { id: "todas", label: "Todas" },
  { id: "rouanet", label: "Lei Rouanet" },
  { id: "esporte", label: "Lei do Esporte" },
  { id: "funcrianca", label: "Funcriança" },
  { id: "idoso", label: "Lei do Idoso" },
  { id: "pronas-pcd", label: "PRONAS/PCD" },
  { id: "pronon", label: "PRONON" },
] as const

export type IncentiveLawId = (typeof INCENTIVE_LAWS)[number]["id"]

const SPECIFIC_LAWS = INCENTIVE_LAWS.filter((l) => l.id !== "todas")

export interface EnrichedProject {
  id: number
  title: string
  description: string
  lawId: IncentiveLawId
  lawLabel: string
  targetAmount: number
  progressPercent: number
  location: string
}

// Projetos mockados para teste visual da página — remover quando usar a service real.
export const MOCK_PROJECTS: EnrichedProject[] = [
  {
    id: 1,
    title: "Biblioteca Comunitária Sementes do Saber",
    description:
      "Projeto de criação de uma biblioteca comunitária com programas de incentivo à leitura e reforço escolar para crianças e adolescentes.",
    lawId: "funcrianca",
    lawLabel: "Funcriança",
    targetAmount: 50000,
    progressPercent: 65,
    location: "São Paulo, SP",
  },
  {
    id: 2,
    title: "Reciclagem Comunitária",
    description:
      "Implementação de um centro de reciclagem gerido pela comunidade, gerando renda e promovendo consciência ambiental.",
    lawId: "rouanet",
    lawLabel: "Lei Rouanet",
    targetAmount: 120000,
    progressPercent: 25,
    location: "Belo Horizonte, MG",
  },
  {
    id: 3,
    title: "Esporte e Cidadania",
    description:
      "Programa esportivo multidisciplinar para jovens em situação de risco social, promovendo inclusão e desenvolvimento pessoal.",
    lawId: "esporte",
    lawLabel: "Lei do Esporte",
    targetAmount: 90000,
    progressPercent: 55,
    location: "Rio de Janeiro, RJ",
  },
  {
    id: 4,
    title: "Arte e Transformação",
    description:
      "Oficinas de arte e cultura para crianças e adolescentes, desenvolvendo habilidades criativas e socioemocionais.",
    lawId: "rouanet",
    lawLabel: "Lei Rouanet",
    targetAmount: 60000,
    progressPercent: 70,
    location: "Salvador, BA",
  },
  {
    id: 5,
    title: "Cuidado ao Idoso Ativo",
    description:
      "Programa de atividades físicas, culturais e de convivência para idosos em situação de vulnerabilidade social.",
    lawId: "idoso",
    lawLabel: "Lei do Idoso",
    targetAmount: 75000,
    progressPercent: 40,
    location: "Curitiba, PR",
  },
  {
    id: 6,
    title: "Inclusão e Tecnologia",
    description:
      "Capacitação em tecnologia assistiva e inclusão digital para pessoas com deficiência, ampliando oportunidades no mercado de trabalho.",
    lawId: "pronas-pcd",
    lawLabel: "PRONAS/PCD",
    targetAmount: 85000,
    progressPercent: 30,
    location: "Brasília, DF",
  },
]

// TODO(backend): atribuição de lei específica é mockada deterministicamente (id % 6).
//   ProjectListItemDTO precisa expor o tipo de lei (campo novo, ex.: "incentiveLawType").
//   ProjectType hoje só tem TAX_INCENTIVE_LAW / SOCIAL_INVESTMENT_LAW — sem granularidade.
export function enrichProjectWithMocks(project: ProjectListItem): EnrichedProject {
  const law = SPECIFIC_LAWS[project.id % SPECIFIC_LAWS.length]
  return {
    id: project.id,
    title: project.title,
    // TODO(backend): description não existe em ProjectListItemDTO.
    //   Adicionar campo 'description' ao DTO (já existe na entidade Project).
    description:
      "Apoie este projeto através de leis de incentivo fiscal e obtenha benefícios tributários para sua empresa.",
    lawId: law.id,
    lawLabel: law.label,
    // TODO(backend): targetAmount não existe em ProjectListItemDTO.
    //   Adicionar campo 'budgetNeeded' (já existe na entidade Project) ao DTO.
    targetAmount: 50000,
    // TODO(backend): progressPercent não existe em ProjectListItemDTO.
    //   Calcular no backend como (investedAmount / budgetNeeded * 100) e expor no DTO.
    progressPercent: 50,
    // TODO(backend): location não existe em ProjectListItemDTO.
    //   Project entity não tem cidade/estado — requer modelagem nova ou relacionamento com endereço da ONG.
    location: "Brasil",
  }
}
