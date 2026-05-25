import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { CompanyDashboard } from "./index"

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchCompanyEsgImpactDashboardMock: vi.fn(),
}))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}))

vi.mock("../../api/companyPortfolio", () => ({
  fetchCompanyEsgImpactDashboard: mocks.fetchCompanyEsgImpactDashboardMock,
}))

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}))

async function renderCompanyDashboard() {
  render(<MemoryRouter><CompanyDashboard /></MemoryRouter>)
  await screen.findByText("Impacto ESG")
}

describe("CompanyDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchCompanyEsgImpactDashboardMock.mockResolvedValue({
      projectCount: 1,
      totalInvested: 3000,
      totalBudgetNeeded: 5000,
      pillars: [
        {
          pillar: "ENVIRONMENTAL",
          label: "Ambiental",
          projectCount: 1,
          totalInvested: 3000,
          budgetNeeded: 5000,
          investmentPercentage: 100,
        },
      ],
    })
  })

  it("renderiza o título 'Dashboard Empresarial'", async () => {
    await renderCompanyDashboard()
    expect(screen.getByText("Dashboard Empresarial")).toBeInTheDocument()
  })

  it("renderiza a saudação com o nome mockado", async () => {
    await renderCompanyDashboard()
    expect(screen.getByText(/Bem-vindo de volta, Empresa ABC/)).toBeInTheDocument()
  })
  
  it("renderiza as opções de modalidades de investimento", async () => {
    await renderCompanyDashboard()
    expect(screen.getByText("Leis de Incentivo")).toBeInTheDocument()
    expect(screen.getByText("Investimento Social Privado")).toBeInTheDocument()
  })

  it("renderiza a seção de projetos apoiados", async () => {
    await renderCompanyDashboard()
    expect(screen.getByText("Projetos Apoiados")).toBeInTheDocument()
  })

  it("renderiza a seção de modalidades de investimento", async () => {
    await renderCompanyDashboard()
    expect(screen.getByText("Modalidades de Investimento")).toBeInTheDocument()
  })

  it("renderiza a seção de impacto ESG com dados do backend", async () => {
    await renderCompanyDashboard()
    expect(screen.getByText("Impacto ESG")).toBeInTheDocument()
    expect(screen.getByText("1 projetos apoiados")).toBeInTheDocument()
    expect(mocks.fetchCompanyEsgImpactDashboardMock).toHaveBeenCalledWith("token")
  })
})
