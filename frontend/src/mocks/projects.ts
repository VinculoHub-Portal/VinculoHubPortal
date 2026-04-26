import type {
  ProjectListItem,
  ProjectsSummary,
  ProjectType,
} from "../types/project.types";

export const mockProjects: ProjectListItem[] = [
  {
    id: "education-transformadora",
    name: "Educação Transformadora",
    description:
      "Programa de reforço escolar e formação profissionalizante para jovens em situação de vulnerabilidade social.",
    status: "active",
    type: "tax_incentive_law",
    city: "São Paulo",
    state: "SP",
    progress: 75,
    tags: ["Educação", "Capacitação"],
  },
  {
    id: "saude-comunitaria",
    name: "Saúde Comunitária",
    description:
      "Unidade móvel de saúde para atendimento médico e odontológico em comunidades com acesso reduzido a serviços básicos.",
    status: "completed",
    type: "private_social_investment",
    city: "Rio de Janeiro",
    state: "RJ",
    progress: 100,
    tags: ["Saúde", "Comunidade"],
  },
  {
    id: "cultura-para-todos",
    name: "Cultura para Todos",
    description:
      "Oficinas de música, teatro e artes visuais para crianças e adolescentes da rede pública.",
    status: "cancelled",
    type: "tax_incentive_law",
    city: "Belo Horizonte",
    state: "MG",
    progress: 60,
    tags: ["Cultura", "Arte e Educação"],
  },
  {
    id: "escola-verde",
    name: "Escola Verde",
    description:
      "Projeto de educação ambiental com hortas pedagógicas e oficinas de reciclagem para escolas municipais.",
    status: "active",
    type: "private_social_investment",
    city: "Curitiba",
    state: "PR",
    progress: 42,
    tags: ["Meio Ambiente", "Educação"],
  },
];

export function buildProjectsSummary(projects: ProjectListItem[]): ProjectsSummary {
  return projects.reduce(
    (summary, project) => {
      summary.total += 1;
      summary[project.status] += 1;
      summary.byType[project.type] += 1;
      return summary;
    },
    {
      total: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      byType: {
        tax_incentive_law: 0,
        private_social_investment: 0,
      } satisfies Record<ProjectType, number>,
    },
  );
}
