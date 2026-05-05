import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { OngProjectsPage } from "."
import { ProjectDetailsPage } from "../ProjectDetailsPage"
import type { ProjectDetails } from "../ProjectDetailsPage/projectDetails.types"
import { mockOngProjects } from "./mockData"

const mocks = vi.hoisted(() => ({
  fetchProjectDetailsMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
  useOngProjectsMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    isAuthenticated: true,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    user: {
      "https://vinculohub/roles": ["NPO"],
    },
  }),
}))

vi.mock("../ProjectDetailsPage/fetchProjectDetails", () => ({
  fetchProjectDetails: mocks.fetchProjectDetailsMock,
}))

vi.mock("./useOngProjects", () => ({
  useOngProjects: mocks.useOngProjectsMock,
}))

const mockProjectDetails: ProjectDetails = {
  id: "1",
  fundingType: "Lei de Incentivo",
  requiredAmount: 150000,
  name: "Educação Transformadora",
  description:
    "Programa de reforço escolar e formação profissionalizante para jovens em situação de vulnerabilidade social.",
  sdgLabels: ["Educação de Qualidade", "Redução das Desigualdades"],
  progressPercent: 75,
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/ong/projetos"]}>
        <Routes>
          <Route path="/ong/projetos" element={<OngProjectsPage />} />
          <Route path="/ong/dashboard" element={<p>Dashboard da ONG</p>} />
          <Route path="/projeto/:projectId" element={<ProjectDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("OngProjectsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token-ong")
    mocks.fetchProjectDetailsMock.mockResolvedValue(mockProjectDetails)
    mocks.useOngProjectsMock.mockReturnValue({
      projects: mockOngProjects,
      loading: false,
      error: null,
    })
  })

  it("renderiza header, resumo e lista de projetos", () => {
    renderPage()

    expect(screen.getByLabelText("Ir para a página inicial")).toBeInTheDocument()
    expect(screen.getByText("Meus Projetos")).toBeInTheDocument()
    expect(
      screen.getByText("Acompanhe todos os projetos da sua ONG."),
    ).toBeInTheDocument()

    expect(screen.getByLabelText("Total de Projetos: 3")).toBeInTheDocument()
    expect(screen.getByLabelText("Leis de Incentivo: 1")).toBeInTheDocument()
    expect(screen.getByLabelText("Investimento Privado: 0")).toBeInTheDocument()

    expect(screen.getByText("Educação Transformadora")).toBeInTheDocument()
    expect(screen.getByText("Saúde Comunitária")).toBeInTheDocument()
    expect(screen.getByText("Cultura para Todos")).toBeInTheDocument()
  })

  it("navega para o dashboard ao clicar em voltar", async () => {
    renderPage()

    await userEvent.click(
      screen.getByRole("button", { name: "Voltar ao Dashboard" }),
    )

    expect(screen.getByText("Dashboard da ONG")).toBeInTheDocument()
  })

  it("navega para os detalhes do projeto ao clicar no botão de detalhes", async () => {
    renderPage()

    const detailButtons = screen.getAllByRole("button", {
      name: "Detalhes do Projeto",
    })
    await userEvent.click(detailButtons[0])

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Educação Transformadora",
      }),
    ).toBeInTheDocument()
    expect(mocks.getAccessTokenSilentlyMock).toHaveBeenCalled()
    expect(mocks.fetchProjectDetailsMock).toHaveBeenCalledWith("1", "token-ong")
    expect(screen.getByText("Sobre o Projeto")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Programa de reforço escolar e formação profissionalizante para jovens em situação de vulnerabilidade social.",
      ),
    ).toBeInTheDocument()
    expect(screen.getByText("75% alcançado")).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole("link", { name: "Voltar aos Projetos" }),
    )

    expect(screen.getByText("Meus Projetos")).toBeInTheDocument()
  })

  it("exibe estado de carregamento", () => {
    mocks.useOngProjectsMock.mockReturnValue({
      projects: [],
      loading: true,
      error: null,
    })

    renderPage()

    expect(screen.getByText("Carregando projetos...")).toBeInTheDocument()
    expect(screen.getByLabelText("Total de Projetos: ...")).toBeInTheDocument()
  })

  it("exibe feedback de erro", () => {
    mocks.useOngProjectsMock.mockReturnValue({
      projects: [],
      loading: false,
      error: "Não foi possível carregar os projetos.",
    })

    renderPage()

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar os projetos.",
    )
  })

  it("exibe estado vazio", () => {
    mocks.useOngProjectsMock.mockReturnValue({
      projects: [],
      loading: false,
      error: null,
    })

    renderPage()

    expect(screen.getByText("Nenhum projeto encontrado")).toBeInTheDocument()
    expect(screen.getByLabelText("Total de Projetos: 0")).toBeInTheDocument()
  })
})
