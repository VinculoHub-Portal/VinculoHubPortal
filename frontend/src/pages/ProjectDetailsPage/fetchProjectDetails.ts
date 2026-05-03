import axios from "axios";
import { api } from "../../services/api";
import type { ProjectDetails } from "./projectDetails.types";
import { mapApiPayloadToProjectDetails } from "./projectDetailsMapping";

/** Mock por `projectId` quando `VITE_USE_PROJECT_DETAILS_MOCK=1`. */
const PROJECT_DETAILS_MOCKS: Record<string, ProjectDetails> = {
  "1": {
    id: "1",
    fundingType: "Lei de Incentivo",
    category: "Educação",
    requiredAmount: 150_000,
    name: "Educação Transformadora",
    city: "São Paulo",
    stateUf: "SP",
    description:
      "Programa de reforço escolar e formação profissionalizante para jovens em situação de vulnerabilidade social, oferecendo capacitação e desenvolvimento de habilidades.",
    mainObjective:
      "Aumentar a taxa de aprovação escolar e formar jovens para o mercado de trabalho, promovendo inclusão social e desenvolvimento de competências técnicas e comportamentais.",
    targetAudience: "Jovens de 14 a 18 anos em situação de vulnerabilidade social",
    scopeArea: "Educação",
    sdgLabels: ["Educação de Qualidade", "Redução das Desigualdades"],
    progressPercent: 75,
  },
  "2": {
    id: "2",
    fundingType: "Investimento Social Privado",
    category: "Saúde",
    requiredAmount: 320_000,
    name: "Saúde na Comunidade",
    city: "Porto Alegre",
    stateUf: "RS",
    description:
      "Texto longo de exemplo: ".repeat(12) +
      "Atendimento multidisciplinar e campanhas de prevenção em comunidades periféricas.",
    mainObjective: "Ampliar o acesso a consultas e vacinação para famílias em vulnerabilidade.",
    targetAudience: "Famílias com renda per capita inferior a meio salário mínimo.",
    scopeArea: "Saúde comunitária",
    sdgLabels: ["Saúde e Bem-Estar", "Redução das Desigualdades", "Cidades e Comunidades Sustentáveis"],
    progressPercent: 42,
  },
};

const useProjectDetailsMock =
  import.meta.env.VITE_USE_PROJECT_DETAILS_MOCK === "true" ||
  import.meta.env.VITE_USE_PROJECT_DETAILS_MOCK === "1";

export async function fetchProjectDetails(
  projectId: string,
  token?: string,
): Promise<ProjectDetails | null> {
  if (!projectId) return null;

  if (useProjectDetailsMock) {
    return PROJECT_DETAILS_MOCKS[projectId] ?? null;
  }

  try {
    const { data } = await api.get<unknown>(`/api/projects/${projectId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return mapApiPayloadToProjectDetails(data, projectId);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return null;
    }
    throw e;
  }
}
