import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { fetchCompanyEsgImpactDashboard } from "../../api/companyPortfolio"
import { Header } from "../../components/general/Header"
import { EsgImpactSection } from "./EsgImpactSection"
import { InvestmentModalitiesSection } from "./InvestmentModalitiesSection"
import { SupportedProjectsCard } from "./SupportedProjectsCard"
import { mapEsgImpactDashboardToPillars } from "./esgImpactMapper"
import {
  mockCompanyName,
  mockSupportedProjects,
  type EsgPillar,
} from "./mockData"

export const CompanyDashboard = () => {
  const { getAccessTokenSilently } = useAuth0()
  const [esgPillars, setEsgPillars] = useState<EsgPillar[]>([])
  const [esgLoading, setEsgLoading] = useState(true)
  const [esgError, setEsgError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadEsgImpactDashboard() {
      try {
        setEsgLoading(true)
        const token = await getAccessTokenSilently()
        const dashboard = await fetchCompanyEsgImpactDashboard(token)

        if (cancelled) return
        setEsgPillars(mapEsgImpactDashboardToPillars(dashboard))
        setEsgError(null)
      } catch {
        if (!cancelled) {
          setEsgError("Não foi possível carregar o impacto ESG.")
        }
      } finally {
        if (!cancelled) setEsgLoading(false)
      }
    }

    void loadEsgImpactDashboard()

    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col gap-8">
        <header>
          <h1 className="text-2xl font-medium leading-9 text-vinculo-dark">
            Dashboard Empresarial
          </h1>
          <p className="text-base font-normal leading-6 text-slate-600">
            Bem-vindo de volta, {mockCompanyName}
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SupportedProjectsCard data={mockSupportedProjects} />
        </section>

        <InvestmentModalitiesSection />

        {esgLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <p className="text-sm text-slate-600">Carregando impacto ESG...</p>
          </div>
        ) : esgError ? (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 sm:p-8">
            <p className="text-sm text-red-700">{esgError}</p>
          </div>
        ) : (
          <EsgImpactSection pillars={esgPillars} />
        )}
      </main>
    </div>
  )
}
