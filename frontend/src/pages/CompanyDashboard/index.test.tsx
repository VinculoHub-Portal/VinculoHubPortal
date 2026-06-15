import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CompanyDashboard } from "./index";

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchCompanyEsgImpactDashboardMock: vi.fn(),
  fetchAuthenticatedProfileMock: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}));

vi.mock("../../api/me", () => ({
  fetchAuthenticatedProfile: mocks.fetchAuthenticatedProfileMock,
}));

vi.mock("../../api/companyPortfolio", () => ({
  fetchCompanyEsgImpactDashboard: mocks.fetchCompanyEsgImpactDashboardMock,
}));

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}));

async function renderCompanyDashboard() {
  render(
    <MemoryRouter>
      <CompanyDashboard />
    </MemoryRouter>,
  );
  await screen.findByText("Impacto ESG");
}

describe("CompanyDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.fetchAuthenticatedProfileMock.mockResolvedValue({
      auth0Id: "auth0|123",
      email: "empresa@teste.com",
      userId: 1,
      userType: "company",
      npoId: null,
      companyId: 42,
      companyName: "Empresa Teste",
      registrationCompleted: true,
    });
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
    });
  });

  it("renderiza o título 'Dashboard Empresarial'", async () => {
    await renderCompanyDashboard();
    expect(screen.getByText("Dashboard Empresarial")).toBeInTheDocument();
  });

  it("renderiza a saudação com o nome real da empresa", async () => {
    await renderCompanyDashboard();
    expect(
      screen.getByText(/Bem-vindo de volta, Empresa Teste/),
    ).toBeInTheDocument();
    expect(mocks.fetchAuthenticatedProfileMock).toHaveBeenCalledWith("token");
  });

  it("renderiza a saudação com fallback quando o perfil falha", async () => {
    mocks.fetchAuthenticatedProfileMock.mockRejectedValue(
      new Error("network error"),
    );
    await renderCompanyDashboard();
    expect(screen.getByText(/Bem-vindo de volta, Empresa/)).toBeInTheDocument();
  });

  it("renderiza acesso para a página de vínculos", async () => {
    await renderCompanyDashboard();
    expect(screen.getByRole("link", { name: "Ver vínculos" })).toHaveAttribute(
      "href",
      "/vinculos",
    );
  });

  it("renderiza as opções de modalidades de investimento", async () => {
    await renderCompanyDashboard();
    expect(screen.getByText("Leis de Incentivo")).toBeInTheDocument();
    expect(screen.getByText("Investimento Social Privado")).toBeInTheDocument();
  });

  it("renderiza a seção de projetos apoiados", async () => {
    await renderCompanyDashboard();
    expect(screen.getByText("Projetos Apoiados")).toBeInTheDocument();
  });

  it("renderiza a seção de modalidades de investimento", async () => {
    await renderCompanyDashboard();
    expect(screen.getByText("Modalidades de Investimento")).toBeInTheDocument();
  });

  it("renderiza a seção de impacto ESG com dados do backend", async () => {
    await renderCompanyDashboard();
    expect(screen.getByText("Impacto ESG")).toBeInTheDocument();
    expect(screen.getByText("1 projetos apoiados")).toBeInTheDocument();
    expect(mocks.fetchCompanyEsgImpactDashboardMock).toHaveBeenCalledWith(
      "token",
    );
  });
});
