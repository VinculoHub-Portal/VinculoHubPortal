import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header } from "../../components/general/Header";
import { api } from "../../services/api";
import { FundingProgress } from "./FundingProgress";
import { OdsTags } from "./OdsTags";
import { ProjectDetailsNotFound } from "./ProjectDetailsNotFound";
import { ProjectDetailsSkeleton } from "./ProjectDetailsSkeleton";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectInfoGrid } from "./ProjectInfoGrid";

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

const ROLES_CLAIM = "https://vinculohub/roles";

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

function computeProgress(invested: number | null, budget: number | null): number {
  if (invested == null || budget == null || budget <= 0) return 0;
  return Math.min(100, Math.round((invested / budget) * 100));
}

/** Maps API payload (camelCase or snake_case) to view model. Compatible with ProjectDetailResponse quando existir no backend. */
export function mapApiPayloadToProjectDetails(raw: unknown, routeId: string): ProjectDetails {
  const o = raw && typeof raw === "object" ? (raw as UnknownRecord) : {};

  const title = str(o.title || o.name);
  const description = str(o.description);
  const fundingType = str(
    o.fundingType || o.funding_type || o.captureType || o.capture_type || o.projectType || o.project_type,
  );
  const category = str(o.category || o.area || o.areaName || o.area_name);
  const city = str(o.city || o.locality);
  const stateUf = str(o.stateUf || o.state || o.uf);
  const mainObjective = str(o.mainObjective || o.main_objective || o.objective);
  const targetAudience = str(o.targetAudience || o.target_audience || o.publicoAlvo || o.publico_alvo);
  const scopeArea = str(o.scopeArea || o.scope_area || o.atuacao || o.areaAtuacao);

  const budget = num(o.budgetNeeded ?? o.budget_needed ?? o.requiredAmount ?? o.required_amount);
  const invested = num(o.investedAmount ?? o.invested_amount);
  const progressOverride = num(o.progressPercent ?? o.progress_percent);

  const sdgFromApi = strArr(o.sdgLabels ?? o.sdg_labels);
  const codes = intArr(o.odsCodes ?? o.ods_codes);
  const sdgFromCodes = codes.map((c) => ODS_BY_CODE[c] ?? `ODS ${c}`);
  const sdgLabels = sdgFromApi.length > 0 ? sdgFromApi : sdgFromCodes;

  const idRaw = o.id;
  const id =
    idRaw != null && (typeof idRaw === "string" || typeof idRaw === "number")
      ? String(idRaw)
      : routeId;

  const progressPercent =
    progressOverride != null && progressOverride >= 0
      ? Math.min(100, Math.round(progressOverride))
      : computeProgress(invested, budget);

  return {
    id,
    fundingType: fundingType || "—",
    category: category || "—",
    requiredAmount: budget ?? 0,
    name: title || "Projeto",
    city: city || "—",
    stateUf: stateUf || "—",
    description: description || "",
    mainObjective: mainObjective || "",
    targetAudience: targetAudience || "—",
    scopeArea: scopeArea || "—",
    sdgLabels,
    progressPercent,
  };
}

/** Mock por `projectId` quando `VITE_USE_PROJECT_DETAILS_MOCK=1`. */
const PROJECT_DETAILS_MOCKS: Record<string, ProjectDetails> = {
  "1": {
    id: "1",
    fundingType: "Lei de Incentivo",
    category: "Educação",
    requiredAmount: 150_000,
    name: "Educação Transformadora",
    city: "São Paulo",
    stateUf: "SP",
    description:
      "Programa de reforço escolar e formação profissionalizante para jovens em situação de vulnerabilidade social, oferecendo capacitação e desenvolvimento de habilidades.",
    mainObjective:
      "Aumentar a taxa de aprovação escolar e formar jovens para o mercado de trabalho, promovendo inclusão social e desenvolvimento de competências técnicas e comportamentais.",
    targetAudience: "Jovens de 14 a 18 anos em situação de vulnerabilidade social",
    scopeArea: "Educação",
    sdgLabels: ["Educação de Qualidade", "Redução das Desigualdades"],
    progressPercent: 75,
  },
  "2": {
    id: "2",
    fundingType: "Investimento Social Privado",
    category: "Saúde",
    requiredAmount: 320_000,
    name: "Saúde na Comunidade",
    city: "Porto Alegre",
    stateUf: "RS",
    description:
      "Texto longo de exemplo: ".repeat(12) +
      "Atendimento multidisciplinar e campanhas de prevenção em comunidades periféricas.",
    mainObjective: "Ampliar o acesso a consultas e vacinação para famílias em vulnerabilidade.",
    targetAudience: "Famílias com renda per capita inferior a meio salário mínimo.",
    scopeArea: "Saúde comunitária",
    sdgLabels: ["Saúde e Bem-Estar", "Redução das Desigualdades", "Cidades e Comunidades Sustentáveis"],
    progressPercent: 42,
  },
};

const useProjectDetailsMock =
  import.meta.env.VITE_USE_PROJECT_DETAILS_MOCK === "true" ||
  import.meta.env.VITE_USE_PROJECT_DETAILS_MOCK === "1";

async function fetchProjectDetails(projectId: string): Promise<ProjectDetails | null> {
  if (!projectId) return null;

  if (useProjectDetailsMock) {
    return PROJECT_DETAILS_MOCKS[projectId] ?? null;
  }

  try {
    const { data } = await api.get<unknown>(`/api/projects/${projectId}`);
    return mapApiPayloadToProjectDetails(data, projectId);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return null;
    }
    throw e;
  }
}


export function projectDetailsHref(projectId: string | number) {
  return `/projeto/${encodeURIComponent(String(projectId))}`;
}


export function useProjectDetailsNavigation() {
  const navigate = useNavigate();
  return useCallback( 
    (projectId: string | number) => {
      navigate(projectDetailsHref(projectId));
    },
    [navigate],
  );
}

function formatBrl(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function resolveDashboardPath(user: ReturnType<typeof useAuth0>["user"]) {
  const raw = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM];
  const roles: string[] = Array.isArray(raw) ? raw : [];
  const upper = roles.map((r) => String(r).toUpperCase());
  if (upper.includes("ADMIN")) return "/admin/dashboard";
  if (upper.includes("NPO")) return "/ong/dashboard";
  if (upper.includes("COMPANY")) return "/empresa/dashboard";
  return "/";
}

export function ProjectDetailsPage() {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const { user } = useAuth0();
  const dashboardPath = resolveDashboardPath(user);

  const query = useQuery({
    queryKey: ["project-details", projectId],
    queryFn: () => fetchProjectDetails(projectId),
    enabled: Boolean(projectId),
  });

  const project = query.data;

  const showNotFound =
    !projectId ||
    (Boolean(projectId) && !query.isLoading && !query.isError && !project);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <div className="flex-1 w-full px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-3xl mx-auto w-full">
          {!showNotFound && (
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-vinculo-dark hover:text-vinculo-dark-hover mb-6 transition-colors"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} aria-hidden />
              Voltar ao Dashboard
            </Link>
          )}

          {showNotFound && <ProjectDetailsNotFound dashboardPath={dashboardPath} />}

          {Boolean(projectId) && query.isLoading && <ProjectDetailsSkeleton />}

          {Boolean(projectId) && query.isError && (
            <div
              className="bg-white rounded-2xl border border-slate-200 px-6 py-12 text-center shadow-sm"
              role="alert"
            >
              <p className="text-slate-700 mb-4">
                Não foi possível carregar os dados do projeto. Verifique sua conexão e tente novamente.
              </p>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="inline-flex items-center justify-center rounded-lg bg-vinculo-dark px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {Boolean(projectId) && !query.isLoading && !query.isError && project && (
            <article className="bg-white rounded-2xl shadow-[var(--shadow-vinculo)] px-6 sm:px-10 py-8 sm:py-10 border border-slate-100">
              <ProjectHeader
                fundingType={project.fundingType}
                category={project.category}
                requiredAmountFormatted={formatBrl(project.requiredAmount)}
                name={project.name}
                city={project.city}
                stateUf={project.stateUf}
              />

              <section className="mt-10">
                <h2 className="text-base font-bold text-vinculo-dark mb-3">Sobre o Projeto</h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                  {project.description || "—"}
                </p>
              </section>

              <section className="mt-10">
                <h2 className="text-base font-bold text-vinculo-dark mb-3 flex items-center gap-2">
                  <TrackChangesOutlinedIcon className="text-vinculo-dark" sx={{ fontSize: 22 }} aria-hidden />
                  Objetivo Principal
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                  {project.mainObjective || "—"}
                </p>
              </section>

              <ProjectInfoGrid targetAudience={project.targetAudience} scopeArea={project.scopeArea} />

              <OdsTags labels={project.sdgLabels} />

              <FundingProgress progressPercent={project.progressPercent} />
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
