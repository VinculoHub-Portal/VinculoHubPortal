import { api } from "../services/api";

export interface OdsCatalogItem {
  id: number;
  name: string;
  description: string;
}

export async function fetchOdsCatalog(): Promise<OdsCatalogItem[]> {
  const { data } = await api.get<OdsCatalogItem[]>("/public/ods");
  return data;
}
