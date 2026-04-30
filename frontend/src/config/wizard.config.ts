import type { OrganizationType, StepValidator } from "../types/wizard.types";
import {
  validateSignupStep,
  validateNpoStepTwo,
  validateNpoStepThree,
  validateNpoStepFour,
  validateEnterpriseStepTwo,
} from "../utils/validation";

export const stepValidators: Record<OrganizationType, StepValidator[]> = {
  npo: [
    validateSignupStep,
    validateNpoStepTwo,
    validateNpoStepThree,
    validateNpoStepFour,
  ],
  enterprise: [
    validateSignupStep,
    validateEnterpriseStepTwo,
  ],
};
