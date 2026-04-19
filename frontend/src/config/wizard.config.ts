import type { OrganizationType, StepValidator } from "../types/wizard.types";
import {
  validateSignupStep,
  validateNpoStepTwo,
  validateNpoStepThree,
  validateNpoStepFour,
  validateNpoStepFive,
  validateEnterpriseStepTwo,
} from "../utils/validation";

export const stepValidators: Record<OrganizationType, StepValidator[]> = {
  npo: [
    validateSignupStep,
    validateNpoStepTwo,
    validateNpoStepThree,
    validateNpoStepFour,
    validateNpoStepFive,
  ],
  enterprise: [validateSignupStep, validateEnterpriseStepTwo],
};
