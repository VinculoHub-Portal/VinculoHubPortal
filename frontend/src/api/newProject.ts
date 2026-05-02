import { api } from "../services/api";
import type { WizardFormData } from "../types/wizard.types";

type NewProjectFormPayload = Pick<
  WizardFormData,
  "nomeProjeto" | "tipoProjeto" | "descricaoProjeto" | "metaCaptacao" | "odsProjeto"
>;

export type NewProjectRequest = {
  name: string;
  description: string;
  type: "SOCIAL_INVESTMENT_LAW" | "TAX_INCENTIVE_LAW";
  capital: number | null;
  ods: string[];
};

export type NewProjectResponse = {
  id: number;
  name: string;
  description: string;
  type: "SOCIAL_INVESTMENT_LAW" | "TAX_INCENTIVE_LAW";
  capital: number | null;
  npoId: number;
};

export function toNewProjectRequest(
  formData: NewProjectFormPayload,
): NewProjectRequest {
  const type =
    formData.tipoProjeto === "governamental"
      ? "TAX_INCENTIVE_LAW"
      : "SOCIAL_INVESTMENT_LAW";

  return {
    name: formData.nomeProjeto.trim(),
    description: formData.descricaoProjeto.trim(),
    type,
    capital:
      formData.tipoProjeto === "governamental" && formData.metaCaptacao.trim()
        ? Number(formData.metaCaptacao)
        : null,
    ods: formData.odsProjeto,
  };
}

export async function createNewProject(
  formData: NewProjectFormPayload,
  token: string,
): Promise<NewProjectResponse> {
  const { data } = await api.post<NewProjectResponse>(
    "/api/projects",
    toNewProjectRequest(formData),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
}
