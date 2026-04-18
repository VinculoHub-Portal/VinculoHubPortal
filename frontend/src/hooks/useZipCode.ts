import { useQuery } from "@tanstack/react-query";
import { fetchZipCodeData } from "../api/zipCode";

/**
 * Safe wrapper around useQuery for CEP lookups.
 */
export function useZipCode(zipCode: string) {
  const digits = zipCode.replace(/\D/g, "");

  try {
    return useQuery({
      queryKey: ["zipCode", digits],
      queryFn: () => fetchZipCodeData(digits),
      enabled: digits.length === 8,
      retry: false,
    });
  } catch (err) {
    return {
      data: undefined,
      error: undefined,
      isLoading: false,
      isFetching: false,
      status: "idle",
    };
  }
}
