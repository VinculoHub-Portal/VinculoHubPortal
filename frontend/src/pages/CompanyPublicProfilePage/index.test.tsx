import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CompanyPublicProfilePage } from "./index"

const mocks = vi.hoisted(() => ({
  fetchCompanyPublicProfileMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
  userMock: { "https://vinculohub/roles": ["NPO"] } as Record<string, unknown>,
  useOngProjectsMock: vi.fn(),
  fetchRelationshipsMock: vi.fn(),
  createRelationshipMock: vi.fn(),
  showToastMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    user: mocks.userMock,
  }),
}))

vi.mock("../../api/companies", () => ({
  fetchCompanyPublicProfile: mocks.fetchCompanyPublicProfileMock,
}))

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="page-header" />,
}))

vi.mock("../OngProjectsPage/useOngProjects", () => ({
  useOngProjects: mocks.useOngProjectsMock,
}))

vi.mock("../../api/relationships", () => ({
  fetchRelationships: mocks.fetchRelationshipsMock,
  createRelationship: mocks.createRelationshipMock,
}))

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}))

function renderPage(companyId = "7") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/empresa/publico/${companyId}`]}>
        <Routes>
          <Route
            path="/empresa/publico/:companyId"
            element={<CompanyPublicProfilePage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const baseProfile = {
  id: 7,
  legalName: "ACME LTDA",
  socialName: "ACME",
  description: "Empresa de tecnologia",
  logoUrl: null,
  city: "São Paulo",
  stateCode: "SP",
  segment: null,
  website: null,
}

describe("CompanyPublicProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("tok")
    mocks.userMock = { "https://vinculohub/roles": ["NPO"] }
    mocks.useOngProjectsMock.mockReturnValue({
      projects: [],
      summary: { total: 0, taxIncentiveLaw: 0, socialInvestmentLaw: 0 },
      loading: false,
      error: null,
      currentPage: 0,
      totalPages: 0,
      setCurrentPage: vi.fn(),
      refetch: vi.fn(),
    })
    mocks.fetchRelationshipsMock.mockResolvedValue([])
    mocks.createRelationshipMock.mockReset()
    mocks.showToastMock.mockReset()
  })

  it("exibe dados da empresa após carregamento", async () => {
    mocks.fetchCompanyPublicProfileMock.mockResolvedValue(baseProfile)
    renderPage("7")
    await waitFor(() => {
      expect(screen.getByText("ACME LTDA")).toBeInTheDocument()
    })
    expect(screen.getByText("ACME")).toBeInTheDocument()
    expect(screen.getByText(/Empresa de tecnologia/)).toBeInTheDocument()
    expect(screen.getByText(/São Paulo - SP/)).toBeInTheDocument()
  })

  it("exibe mensagem de empresa não encontrada quando 404", async () => {
    mocks.fetchCompanyPublicProfileMock.mockRejectedValue({
      response: { status: 404 },
    })
    renderPage("7")
    await waitFor(() => {
      expect(screen.getByText(/empresa não encontrada/i)).toBeInTheDocument()
    })
  })

  it("não faz fetch quando companyId é inválido", async () => {
    renderPage("abc")
    await waitFor(() => {
      expect(screen.getByText(/empresa não encontrada/i)).toBeInTheDocument()
    })
    expect(mocks.fetchCompanyPublicProfileMock).not.toHaveBeenCalled()
  })

  it("exibe botão Tentar novamente em erro genérico", async () => {
    mocks.fetchCompanyPublicProfileMock.mockRejectedValue(new Error("Network"))
    renderPage("7")
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /tentar novamente/i }),
      ).toBeInTheDocument()
    })
  })

  describe("Propor Parceria — viewer NPO", () => {
    function renderAsNpoWithLoadedCompany() {
      mocks.userMock = { "https://vinculohub/roles": ["NPO"] }
      mocks.fetchCompanyPublicProfileMock.mockResolvedValue(baseProfile)
      return renderPage("7")
    }

    it("exibe botão 'Propor Parceria' habilitado quando NPO tem projetos ativos", async () => {
      mocks.useOngProjectsMock.mockReturnValue({
        projects: [
          { id: 1, title: "Projeto A", status: "Ativo" },
          { id: 2, title: "Projeto B", status: "Ativo" },
        ],
        summary: { total: 2, taxIncentiveLaw: 0, socialInvestmentLaw: 0 },
        loading: false,
        error: null,
        currentPage: 0,
        totalPages: 1,
        setCurrentPage: vi.fn(),
        refetch: vi.fn(),
      })
      renderAsNpoWithLoadedCompany()
      const button = await screen.findByRole("button", { name: /propor parceria/i })
      expect(button).toBeEnabled()
    })

    it("desabilita botão 'Propor Parceria' quando NPO não tem projetos ativos", async () => {
      mocks.useOngProjectsMock.mockReturnValue({
        projects: [{ id: 1, title: "Antigo", status: "Concluído" }],
        summary: { total: 1, taxIncentiveLaw: 0, socialInvestmentLaw: 0 },
        loading: false,
        error: null,
        currentPage: 0,
        totalPages: 1,
        setCurrentPage: vi.fn(),
        refetch: vi.fn(),
      })
      renderAsNpoWithLoadedCompany()
      const button = await screen.findByRole("button", { name: /propor parceria/i })
      expect(button).toBeDisabled()
    })

    it("não exibe botão 'Propor Parceria' para usuário Company", async () => {
      mocks.userMock = { "https://vinculohub/roles": ["COMPANY"] }
      mocks.fetchCompanyPublicProfileMock.mockResolvedValue(baseProfile)
      renderPage("7")
      await waitFor(() => {
        expect(screen.getByText("ACME LTDA")).toBeInTheDocument()
      })
      expect(
        screen.queryByRole("button", { name: /propor parceria/i }),
      ).not.toBeInTheDocument()
    })

    it("filtra projetos com vínculo existente para aquela empresa", async () => {
      mocks.useOngProjectsMock.mockReturnValue({
        projects: [
          { id: 1, title: "Projeto A", status: "Ativo" },
          { id: 2, title: "Projeto B", status: "Ativo" },
        ],
        summary: { total: 2, taxIncentiveLaw: 0, socialInvestmentLaw: 0 },
        loading: false,
        error: null,
        currentPage: 0,
        totalPages: 1,
        setCurrentPage: vi.fn(),
        refetch: vi.fn(),
      })
      mocks.fetchRelationshipsMock.mockResolvedValue([
        {
          projectId: 1,
          projectName: "Projeto A",
          partnerInstitutionId: 7,
          partnerInstitutionName: "ACME",
          status: "pending",
          partnerContactEmail: null,
          partnerContactPhone: null,
          canRespond: false,
          canConfirm: false,
        },
      ])
      const user = userEvent.setup()
      renderAsNpoWithLoadedCompany()

      await user.click(await screen.findByRole("button", { name: /propor parceria/i }))
      await user.click(screen.getByRole("combobox", { name: /projeto/i }))

      expect(await screen.findByRole("option", { name: /Projeto B/ })).toBeInTheDocument()
      expect(screen.queryByRole("option", { name: /Projeto A/ })).not.toBeInTheDocument()
    })

    it("confirmar chama createRelationship e mostra toast de sucesso", async () => {
      mocks.useOngProjectsMock.mockReturnValue({
        projects: [{ id: 1, title: "Projeto A", status: "Ativo" }],
        summary: { total: 1, taxIncentiveLaw: 0, socialInvestmentLaw: 0 },
        loading: false,
        error: null,
        currentPage: 0,
        totalPages: 1,
        setCurrentPage: vi.fn(),
        refetch: vi.fn(),
      })
      mocks.createRelationshipMock.mockResolvedValueOnce(undefined)
      const user = userEvent.setup()
      renderAsNpoWithLoadedCompany()

      await user.click(await screen.findByRole("button", { name: /propor parceria/i }))
      await user.click(screen.getByRole("combobox", { name: /projeto/i }))
      await user.click(await screen.findByRole("option", { name: /Projeto A/ }))
      await user.click(screen.getByRole("button", { name: /confirmar/i }))

      await waitFor(() => {
        expect(mocks.createRelationshipMock).toHaveBeenCalledWith(1, "tok", 7)
      })
      expect(mocks.showToastMock).toHaveBeenCalledWith(
        "Proposta enviada com sucesso!",
        "success",
      )
    })

    it("erro genérico ao propor mostra toast de erro", async () => {
      mocks.useOngProjectsMock.mockReturnValue({
        projects: [{ id: 1, title: "Projeto A", status: "Ativo" }],
        summary: { total: 1, taxIncentiveLaw: 0, socialInvestmentLaw: 0 },
        loading: false,
        error: null,
        currentPage: 0,
        totalPages: 1,
        setCurrentPage: vi.fn(),
        refetch: vi.fn(),
      })
      mocks.createRelationshipMock.mockRejectedValueOnce(new Error("boom"))
      const user = userEvent.setup()
      renderAsNpoWithLoadedCompany()

      await user.click(await screen.findByRole("button", { name: /propor parceria/i }))
      await user.click(screen.getByRole("combobox", { name: /projeto/i }))
      await user.click(await screen.findByRole("option", { name: /Projeto A/ }))
      await user.click(screen.getByRole("button", { name: /confirmar/i }))

      await waitFor(() => {
        expect(mocks.showToastMock).toHaveBeenCalledWith(
          "Não foi possível enviar a proposta. Tente novamente.",
          "error",
        )
      })
    })
  })
})
