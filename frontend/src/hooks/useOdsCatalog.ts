import { useQuery } from "@tanstack/react-query";
import { fetchOdsCatalog } from "../api/ods";

export function useOdsCatalog(enabled = true) {
  return useQuery({
    queryKey: ["ods-catalog"],
    queryFn: fetchOdsCatalog,
    enabled,
    staleTime: Infinity,
    retry: false,
  });
}
