import type { OrganizationType, StepValidator } from "../types/wizard.types";
import {
  validateSignupStep,
  validateNpoStepTwo,
  validateEnterpriseStepTwo,
} from "../utils/validation";

export const stepValidators: Record<OrganizationType, StepValidator[]> = {
  npo: [
    validateSignupStep,
    validateNpoStepTwo,
    () => ({}),
    () => ({}),
    () => ({}),
  ],
  enterprise: [
    validateSignupStep,
    validateEnterpriseStepTwo,
    () => ({}),
    () => ({}),
    () => ({}),
  ],
};
