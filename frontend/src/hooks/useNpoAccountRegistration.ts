import { useCallback, useState } from "react";
import type { WizardFormData } from "../types/wizard.types";
import { createNpoAccount } from "../services/npoAccountService";
import { mapWizardToNpoPayload } from "../utils/mapWizardToNpoPayload";
import { getFriendlyNpoRegistrationError } from "../utils/npoRegistrationErrors";

export function useNpoAccountRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setSuccess(false);
    setErrorMessage(null);
  }, []);

  const submit = useCallback(async (data: WizardFormData) => {
    setErrorMessage(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await createNpoAccount(mapWizardToNpoPayload(data));
      setSuccess(true);
    } catch (e) {
      setErrorMessage(getFriendlyNpoRegistrationError(e));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    submit,
    isSubmitting,
    success,
    errorMessage,
    reset,
  };
}
