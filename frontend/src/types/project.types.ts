export type ProjectType = "tax_incentive_law" | "private_social_investment";

export type ProjectStatus = "active" | "completed" | "cancelled";

export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  type: ProjectType;
  city: string;
  state: string;
  progress: number;
  tags: string[];
}

export interface ProjectsSummary {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  byType: Record<ProjectType, number>;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  tax_incentive_law: "Leis de Incentivo",
  private_social_investment: "Investimento Social Privado",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
};
