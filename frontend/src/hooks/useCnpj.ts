import { useQuery } from "@tanstack/react-query";
import { fetchCnpjData } from "../api/cnpj";

/**
 * Safe wrapper around useQuery for CNPJ lookups.
 * If useQuery throws synchronously because there's no QueryClient,
 * we catch and return a harmless fallback so the component tree won't crash.
 */
export function useCnpj(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "");

  try {
    return useQuery({
      queryKey: ["cnpj", digits],
      queryFn: () => fetchCnpjData(digits),
      enabled: digits.length === 14,
      retry: false,
    });
  } catch (err) {
    // Return a stable fallback shape matching useQuery's return
    return {
      data: undefined,
      error: undefined,
      isLoading: false,
      isFetching: false,
      status: "idle",
    };
  }
}
