import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAuthenticatedProfile } from "../../api/me";
import { fetchCompanyEsgImpactDashboard } from "../../api/companyPortfolio";
import { Header } from "../../components/general/Header";
import { EsgImpactSection } from "./EsgImpactSection";
import { InvestmentModalitiesSection } from "./InvestmentModalitiesSection";
import { OngShowcaseCard } from "./OngShowcaseCard";
import { SupportedProjectsCard } from "./SupportedProjectsCard";
import { mapEsgImpactDashboardToPillars } from "./esgImpactMapper";
import { type EsgPillar } from "./types";
import { useSupportedProjectsSummary } from "./useSupportedProjectsSummary";

export const CompanyDashboard = () => {
  const { getAccessTokenSilently } = useAuth0();
  const supportedProjectsSummary = useSupportedProjectsSummary();
  const [esgPillars, setEsgPillars] = useState<EsgPillar[]>([]);
  const [esgLoading, setEsgLoading] = useState(true);
  const [esgError, setEsgError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAuthenticatedProfile() {
      try {
        const token = await getAccessTokenSilently();
        const profile = await fetchAuthenticatedProfile(token);

        if (cancelled) return;
        setCompanyName(profile.companyName || profile.email || "Empresa");
      } catch {
        if (!cancelled) {
          setCompanyName("Empresa");
        }
      }
    }

    async function loadEsgImpactDashboard() {
      try {
        setEsgLoading(true);
        const token = await getAccessTokenSilently();
        const dashboard = await fetchCompanyEsgImpactDashboard(token);

        if (cancelled) return;
        setEsgPillars(mapEsgImpactDashboardToPillars(dashboard));
        setEsgError(null);
      } catch {
        if (!cancelled) {
          setEsgError("Não foi possível carregar o impacto ESG.");
        }
      } finally {
        if (!cancelled) setEsgLoading(false);
      }
    }

    void loadAuthenticatedProfile();
    void loadEsgImpactDashboard();

    return () => {
      cancelled = true;
    };
  }, [getAccessTokenSilently]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-6 sm:gap-10 pb-12 sm:pb-20">
      <Header />
      <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-medium leading-tight sm:leading-9 text-vinculo-dark">
              Dashboard Empresarial
            </h1>
            <p className="text-sm sm:text-base font-normal leading-6 text-slate-600">
              Bem-vindo de volta, {companyName ?? "Empresa"}
            </p>
          </div>
          <Link
            to="/meus-vinculos"
            className="w-fit rounded-lg border-2 border-vinculo-dark px-5 py-2 text-sm sm:text-base font-semibold text-vinculo-dark transition-all duration-200 hover:bg-vinculo-dark/5"
          >
            Ver vínculos
          </Link>
        </header>

        <section className="w-full">
          <SupportedProjectsCard
            data={supportedProjectsSummary.data}
            loading={supportedProjectsSummary.loading}
            error={supportedProjectsSummary.error}
          />
        </section>


        <InvestmentModalitiesSection />

        {esgLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
            <p className="text-sm text-slate-600">Carregando impacto ESG...</p>
          </div>
        ) : esgError ? (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 sm:p-8">
            <p className="text-sm text-red-700">{esgError}</p>
          </div>
        ) : (
          <EsgImpactSection pillars={esgPillars} />
        )}
        
        <section>
          <OngShowcaseCard />
        </section>
      </main>
    </div>
  );
};
