import type { OrganizationType, StepValidator } from "../types/wizard.types";
import {
  validateSignupStep,
  validateNpoStepTwo,
  validateNpoStepThree,
  validateNpoStepFiveEsg,
  validateEnterpriseStepTwo,
} from "../utils/validation";

export const stepValidators: Record<OrganizationType, StepValidator[]> = {
  npo: [
    validateSignupStep,
    validateNpoStepTwo,
    validateNpoStepThree,
    () => ({}),
    validateNpoStepFiveEsg,
  ],
  enterprise: [
    validateSignupStep,
    validateEnterpriseStepTwo,
    () => ({}),
    () => ({}),
    () => ({}),
  ],
};
