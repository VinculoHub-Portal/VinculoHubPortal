import axios from "axios";
import { api } from "../../services/api";
import type { ProjectDetails } from "./projectDetails.types";
import { mapApiPayloadToProjectDetails } from "./projectDetailsMapping";

export async function fetchProjectDetails(
  projectId: string,
  token?: string,
): Promise<ProjectDetails | null> {
  if (!projectId) return null;

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
