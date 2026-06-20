import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CompanyPublicProfilePage } from "./index"

const mocks = vi.hoisted(() => ({
  fetchCompanyPublicProfileMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
  userMock: { "https://vinculohub/roles": ["NPO"] } as Record<string, unknown>,
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
})
