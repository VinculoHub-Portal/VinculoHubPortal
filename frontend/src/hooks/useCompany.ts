import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@auth0/auth0-react";
import type { CompanyResult } from "../api/company";

const apiBasedUrl = import.meta.env.VITE_API_BASE_URL || "https://localhost:8000";

export const useCompany = (id: number | undefined) {
  const { getAccessTokenSilently } = useAuth();

  return useQuery<CompanyResult>({
    queryKey: ["company", id],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${apiBasedUrl}/company/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch company");
      return response.json();
    },
    enabled: id != null,
    retry: false,
  });
};
