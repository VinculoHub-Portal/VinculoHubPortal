import { Header } from "../../components/general/Header"
import { EsgImpactSection } from "./EsgImpactSection"
import { InvestmentBudgetCard } from "./InvestmentBudgetCard"
import { InvestmentModalitiesSection } from "./InvestmentModalitiesSection"
import { SupportedProjectsCard } from "./SupportedProjectsCard"
import {
  mockBudget,
  mockCompanyName,
  mockEsgFooterStats,
  mockEsgPillars,
  mockSupportedProjects,
} from "./mockData"

export const CompanyDashboard = () => {
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
          <InvestmentBudgetCard data={mockBudget} />
          <SupportedProjectsCard data={mockSupportedProjects} />
        </section>

        <InvestmentModalitiesSection />

        <EsgImpactSection pillars={mockEsgPillars} footerStats={mockEsgFooterStats} />
      </main>
    </div>
  )
}
