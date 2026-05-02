import type { ProjectListItem } from "../../api/projects"

export const INVESTMENT_THEMES = [
  { id: "educacao", label: "Educação" },
  { id: "saude", label: "Saúde" },
  { id: "meio-ambiente", label: "Meio Ambiente" },
  { id: "cultura", label: "Cultura" },
  { id: "esporte", label: "Esporte" },
  { id: "inclusao", label: "Inclusão" },
  { id: "desenvolvimento-comunitario", label: "Desenvolvimento Comunitário" },
] as const

export type ThemeId = (typeof INVESTMENT_THEMES)[number]["id"]

// TODO(backend): interesses do usuário hoje hardcoded.
//   Não existe endpoint para retornar os temas/interesses cadastrados pela empresa logada.
//   Quando existir, substituir por GET /api/me/company/interests ou similar.
export const MOCK_USER_INTERESTS: ThemeId[] = ["educacao", "meio-ambiente", "saude"]

export const MOCK_USER_INTEREST_LABELS = MOCK_USER_INTERESTS
  .map((id) => INVESTMENT_THEMES.find((t) => t.id === id)?.label ?? id)
  .join(", ")

// TODO(backend): "Match com seus interesses" hoje hardcoded em 85%.
//   Backend deveria calcular esse percentual com base na sobreposição entre
//   interesses cadastrados da empresa e temas dos projetos disponíveis.
export const MOCK_INTEREST_MATCH_PERCENT = 85

export interface SocialEnrichedProject {
  id: number
  title: string
  description: string
  themes: ThemeId[]
  primaryThemeLabel: string
  targetAmount: number
  progressPercent: number
  location: string
}

// Projetos mockados para demonstração — remover quando usar a service real.
export const MOCK_PROJECTS: SocialEnrichedProject[] = [
  {
    id: 1,
    title: "Saúde em Movimento",
    description:
      "Unidade móvel de saúde para atendimento médico e odontológico em comunidades rurais.",
    themes: ["saude", "desenvolvimento-comunitario"],
    primaryThemeLabel: "Saúde",
    targetAmount: 75000,
    progressPercent: 40,
    location: "Recife, PE",
  },
  {
    id: 2,
    title: "Tecnologia Inclusiva",
    description:
      "Laboratório de tecnologia adaptativa para pessoas com deficiência, oferecendo formação e oportunidades no mercado de trabalho.",
    themes: ["inclusao", "educacao"],
    primaryThemeLabel: "Inclusão",
    targetAmount: 85000,
    progressPercent: 80,
    location: "Porto Alegre, RS",
  },
]

// TODO(backend): atribuição de temas mockada deterministicamente (id % 7).
//   ProjectListItemDTO precisa expor um array de temas (ex.: "themes": string[]).
//   Hoje o DTO não retorna nada relacionado a categorias ou temas.
export function enrichProjectWithMocks(project: ProjectListItem): SocialEnrichedProject {
  const themeIndex = project.id % INVESTMENT_THEMES.length
  const theme = INVESTMENT_THEMES[themeIndex]
  return {
    id: project.id,
    title: project.title,
    // TODO(backend): description não existe em ProjectListItemDTO.
    //   Adicionar campo 'description' ao DTO (já existe na entidade Project).
    description: "Apoie este projeto investindo diretamente na causa, sem intermediários.",
    themes: [theme.id],
    primaryThemeLabel: theme.label,
    // TODO(backend): targetAmount não existe em ProjectListItemDTO.
    //   Adicionar campo 'budgetNeeded' ao DTO (já existe na entidade Project).
    targetAmount: 50000,
    // TODO(backend): progressPercent não existe em ProjectListItemDTO.
    //   Backend deve calcular (investedAmount / budgetNeeded * 100) e expor no DTO.
    progressPercent: 50,
    // TODO(backend): location não existe em ProjectListItemDTO.
    //   Project entity não tem cidade/estado — requer modelagem nova ou endereço da NPO.
    location: "Brasil",
  }
}

export function countProjectsByTheme(
  projects: SocialEnrichedProject[],
): Record<ThemeId, number> {
  const counts = Object.fromEntries(
    INVESTMENT_THEMES.map((t) => [t.id, 0]),
  ) as Record<ThemeId, number>
  for (const p of projects) {
    for (const t of p.themes) {
      counts[t]++
    }
  }
  return counts
}
