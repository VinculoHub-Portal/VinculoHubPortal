import type { OrganizationType, StepValidator } from "../types/wizard.types";
import {
  validateSignupStep,
  validateNpoStepFour,
  validateNpoStepThree,
  validateEnterpriseStepTwo,
} from "../utils/validation";

export const stepValidators: Record<OrganizationType, StepValidator[]> = {
  npo: [
    validateSignupStep,
    validateNpoStepThree,
    validateNpoStepFour,
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
