import type { ProjectDetails, ResponsibleInstitution } from "./projectDetails.types";

const ODS_BY_CODE: Record<number, string> = {
  1: "Erradicação da Pobreza",
  2: "Fome Zero e Agricultura Sustentável",
  3: "Saúde e Bem-Estar",
  4: "Educação de Qualidade",
  5: "Igualdade de Gênero",
  6: "Água Potável e Saneamento",
  7: "Energia Limpa e Acessível",
  8: "Trabalho Decente e Crescimento Econômico",
  9: "Indústria, Inovação e Infraestrutura",
  10: "Redução das Desigualdades",
  11: "Cidades e Comunidades Sustentáveis",
  12: "Consumo e Produção Responsáveis",
  13: "Ação Contra a Mudança Global do Clima",
  14: "Vida na Água",
  15: "Vida Terrestre",
  16: "Paz, Justiça e Instituições Eficazes",
  17: "Parcerias e Meios de Implementação",
};

type UnknownRecord = Record<string, unknown>;

function num(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function intArr(v: unknown): number[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "number" ? x : Number(x)))
    .filter((n) => Number.isFinite(n));
}

function labelsFromOds(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return null;
      const record = item as UnknownRecord;
      return typeof record.name === "string" ? record.name : null;
    })
    .filter((label): label is string => Boolean(label));
}

function humanize(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function projectTypeLabel(value: string) {
  const labels: Record<string, string> = {
    SOCIAL: "Investimento Social Privado",
    GOVERNMENTAL: "Lei de Incentivo",
    CULTURAL: "Cultural",
    ENVIRONMENTAL: "Ambiental",
    SOCIAL_INVESTMENT_LAW: "Investimento Social Privado",
    TAX_INCENTIVE_LAW: "Lei de Incentivo",
  };

  return labels[value] ?? humanize(value);
}

function computeProgress(invested: number | null, budget: number | null): number {
  if (invested == null || budget == null || budget <= 0) return 0;
  return Math.min(100, Math.round((invested / budget) * 100));
}

function mapResponsibleInstitution(v: unknown): ResponsibleInstitution | null {
  if (!v || typeof v !== "object") return null;
  const o = v as UnknownRecord;
  const name = str(o.name);
  if (!name) return null;
  return {
    npoId: num(o.npoId ?? o.npo_id),
    name,
    logoUrl: str(o.logoUrl ?? o.logo_url) || null,
    city: str(o.city) || null,
    stateCode: str(o.stateCode ?? o.state_code) || null,
    description: str(o.description) || null,
  };
}

/** Maps API payload (camelCase or snake_case) to view model. */
export function mapApiPayloadToProjectDetails(raw: unknown, routeId: string): ProjectDetails {
  const o = raw && typeof raw === "object" ? (raw as UnknownRecord) : {};

  const title = str(o.title || o.name);
  const description = str(o.description);
  const fundingTypeRaw = str(
    o.fundingType || o.funding_type || o.captureType || o.capture_type || o.projectType || o.project_type,
  );
  const backendType = str(o.type);

  const budget = num(o.budgetNeeded ?? o.budget_needed ?? o.requiredAmount ?? o.required_amount);
  const invested = num(o.investedAmount ?? o.invested_amount);
  const progressOverride = num(o.progressPercent ?? o.progress_percent);

  const sdgFromApi = strArr(o.sdgLabels ?? o.sdg_labels);
  const sdgFromOds = labelsFromOds(o.ods);
  const codes = intArr(o.odsCodes ?? o.ods_codes);
  const sdgFromCodes = codes.map((c) => ODS_BY_CODE[c] ?? `ODS ${c}`);
  const sdgLabels =
    sdgFromApi.length > 0 ? sdgFromApi : sdgFromOds.length > 0 ? sdgFromOds : sdgFromCodes;

  const idRaw = o.id;
  const id =
    idRaw != null && (typeof idRaw === "string" || typeof idRaw === "number")
      ? String(idRaw)
      : routeId;

  const progressPercent =
    progressOverride != null && progressOverride >= 0
      ? Math.min(100, Math.round(progressOverride))
      : computeProgress(invested, budget);

  const fundingType = projectTypeLabel(fundingTypeRaw || backendType);

  const responsibleInstitution = mapResponsibleInstitution(
    o.responsibleInstitution ?? o.responsible_institution,
  );

  return {
    id,
    fundingType: fundingType || "—",
    requiredAmount: budget ?? 0,
    name: title || "Projeto",
    description: description || "",
    sdgLabels,
    progressPercent,
    responsibleInstitution,
  };
}
