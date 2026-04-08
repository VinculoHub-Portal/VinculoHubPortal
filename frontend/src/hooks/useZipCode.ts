import { useQuery } from "@tanstack/react-query";
import { fetchZipCodeData } from "../api/zipCode";

export function useZipCode(zipCode: string) {
  const digits = zipCode.replace(/\D/g, "");

  return useQuery({
    queryKey: ["zipCode", digits],
    queryFn: () => fetchZipCodeData(digits),
    enabled: digits.length === 8,
    retry: false,
  });
}
