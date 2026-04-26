import { useState, useEffect, useCallback } from "react";

export function useWizardPersistence<T>(
  key: string,
  initialState: T,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved) as T;
      }
    } catch {
      // JSON inválido ou sessionStorage indisponível
    }
    return initialState;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // sessionStorage indisponível ou cota excedida
    }
  }, [key, state]);

  const clearPersistence = useCallback(() => {
    sessionStorage.removeItem(key);
  }, [key]);

  return [state, setState, clearPersistence];
}
