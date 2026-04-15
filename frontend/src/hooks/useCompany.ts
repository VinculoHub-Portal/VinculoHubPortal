import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import type { CompanyResult } from "../api/company";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function useCompany(id: number | undefined) {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery<CompanyResult>({
    queryKey: ["company", id],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiBaseUrl}/company/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch company");
      return response.json();
    },
    enabled: id != null,
    retry: false,
  });
}
