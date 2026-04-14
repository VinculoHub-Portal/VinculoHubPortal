import {
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { FieldErrors, WizardFormData } from "../types/wizard.types";

export type WizardFormContextValue = {
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
};

const WizardFormContext = createContext<WizardFormContextValue | null>(null);

export function WizardFormProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: WizardFormContextValue;
}) {
  return (
    <WizardFormContext.Provider value={value}>
      {children}
    </WizardFormContext.Provider>
  );
}

export function useWizardForm() {
  const ctx = useContext(WizardFormContext);
  if (!ctx) {
    throw new Error("useWizardForm deve ser usado dentro de WizardFormProvider.");
  }
  return ctx;
}
