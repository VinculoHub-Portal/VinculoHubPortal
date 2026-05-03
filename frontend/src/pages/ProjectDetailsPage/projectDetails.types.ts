export type ProjectDetails = {
  id: string;
  fundingType: string;
  category: string;
  requiredAmount: number;
  name: string;
  city: string;
  stateUf: string;
  description: string;
  mainObjective: string;
  targetAudience: string;
  scopeArea: string;
  sdgLabels: string[];
  progressPercent: number;
};
