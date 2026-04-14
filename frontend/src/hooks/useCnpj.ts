import { useQuery } from "@tanstack/react-query";
import { fetchCnpjData } from "../api/cnpj";

export function useCnpj(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "");

  return useQuery({
    queryKey: ["cnpj", digits],
    queryFn: () => fetchCnpjData(digits),
    enabled: digits.length === 14,
    retry: false,
  });
}
