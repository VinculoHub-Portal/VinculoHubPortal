import { useState } from "react";
import axios from "axios";
import { STATE_NAMES } from "../constants/states";

interface ZipCodeResult {
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  state_code: string;
  region: string;
  ibge: string;
  ddd: string;
}

interface UseZipCodeReturn {
  loading: boolean;
  error: string;
  fetchZipCode: (zipCode: string) => Promise<ZipCodeResult | null>;
}

export function useZipCode(): UseZipCodeReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchZipCode = async (zipCode: string): Promise<ZipCodeResult | null> => {
    const digits = zipCode.replace(/\D/g, "");
    if (digits.length !== 8) return null;

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get(
        `https://viacep.com.br/ws/${digits}/json/`,
        { timeout: 5000 }
      );

      if (data.erro) {
        setError("CEP não encontrado.");
        return null;
      }

      return {
        street: data.logradouro || "",
        complement: data.complemento || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state_code: data.uf || "",
        state: STATE_NAMES[data.uf] || "",
        region: data.regiao || "",
        ibge: data.ibge || "",
        ddd: data.ddd || "",
      };
    } catch (err) {
      if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
        setError("O servidor demorou demais para responder. Tente novamente.");
      } else {
        setError("Erro ao consultar o CEP. Tente novamente.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchZipCode };
}
