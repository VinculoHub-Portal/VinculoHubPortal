import type { OrganizationType, StepValidator } from "../types/wizard.types";
import {
  validateSignupStep,
  validateNpoStepThree,
  validateNpoStepFour,
  validateEnterpriseStepTwo,
} from "../utils/validation";

export const stepValidators: Record<OrganizationType, StepValidator[]> = {
  npo: [
    validateSignupStep,    // step 1 — WizardSingUp
    validateNpoStepThree,  // step 2 — informações básicas + ESG
    validateNpoStepFour,   // step 3 — endereço
    () => ({}),            // step 4 — placeholder (projeto)
  ],
  enterprise: [
    validateSignupStep,
    validateEnterpriseStepTwo,
    () => ({}),
    () => ({}),
    () => ({}),
  ],
};
