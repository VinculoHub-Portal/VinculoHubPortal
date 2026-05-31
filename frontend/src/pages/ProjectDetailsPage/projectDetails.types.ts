export type ResponsibleInstitution = {
  npoId?: number | null;
  name: string;
  logoUrl: string | null;
  city: string | null;
  stateCode: string | null;
  description: string | null;
};

export type ProjectDetails = {
  id: string;
  fundingType: string;
  requiredAmount: number;
  name: string;
  description: string;
  sdgLabels: string[];
  progressPercent: number;
  responsibleInstitution: ResponsibleInstitution | null;
};
