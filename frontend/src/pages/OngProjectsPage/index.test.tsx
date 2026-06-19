import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import userEvent from "@testing-library/user-event"
import axios from "axios"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { OngProjectsPage } from "."
import { ProjectDetailsPage } from "../ProjectDetailsPage"
import type { ProjectDetails } from "../ProjectDetailsPage/projectDetails.types"
import { mockOngProjects } from "./mockData"

const mocks = vi.hoisted(() => ({
  fetchProjectDetailsMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
  useOngProjectsMock: vi.fn(),
  deleteProjectMock: vi.fn(),
  showToastMock: vi.fn(),
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

vi.mock("../../api/projects", () => ({
  deleteProject: mocks.deleteProjectMock,
}))

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
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
  generalProgress: 0,
  responsibleInstitution: null,
}

const mockRefetch = vi.fn()

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
          <Route
            path="/ong/projetos/:projectId/editar"
            element={<p>Página de Edição</p>}
          />
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
    mocks.deleteProjectMock.mockResolvedValue(undefined)
    mockRefetch.mockResolvedValue(undefined)
    mocks.useOngProjectsMock.mockReturnValue({
      projects: mockOngProjects,
      summary: { total: 3, taxIncentiveLaw: 1, socialInvestmentLaw: 0 },
      loading: false,
      error: null,
      currentPage: 0,
      totalPages: 1,
      setCurrentPage: vi.fn(),
      refetch: mockRefetch,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
      refetch: mockRefetch,
    })

    renderPage()

    expect(screen.getByText("Carregando projetos...")).toBeInTheDocument()
    expect(screen.getByLabelText("Total de Projetos: ...")).toBeInTheDocument()
  })

  it("exibe feedback de erro", () => {
    mocks.useOngProjectsMock.mockReturnValue({
      projects: [],
      summary: { total: 0, taxIncentiveLaw: 0, socialInvestmentLaw: 0 },
      loading: false,
      error: "Não foi possível carregar os projetos.",
      currentPage: 0,
      totalPages: 0,
      setCurrentPage: vi.fn(),
      refetch: mockRefetch,
    })

    renderPage()

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar os projetos.",
    )
  })

  it("exibe estado vazio", () => {
    mocks.useOngProjectsMock.mockReturnValue({
      projects: [],
      summary: { total: 0, taxIncentiveLaw: 0, socialInvestmentLaw: 0 },
      loading: false,
      error: null,
      currentPage: 0,
      totalPages: 0,
      setCurrentPage: vi.fn(),
      refetch: mockRefetch,
    })

    renderPage()

    expect(screen.getByText("Nenhum projeto encontrado")).toBeInTheDocument()
    expect(screen.getByLabelText("Total de Projetos: 0")).toBeInTheDocument()
  })

  it("navega para a página de edição ao clicar em Editar Projeto", async () => {
    renderPage()

    const editButtons = screen.getAllByRole("button", {
      name: "Editar Projeto",
    })
    await userEvent.click(editButtons[0])

    expect(screen.getByText("Página de Edição")).toBeInTheDocument()
  })

  it("renderiza botão Excluir Projeto habilitado em cada card", () => {
    renderPage()

    const deleteButtons = screen.getAllByRole("button", { name: "Excluir Projeto" })
    expect(deleteButtons.length).toBe(mockOngProjects.length)
    deleteButtons.forEach((btn) => expect(btn).not.toBeDisabled())
  })

  it("abre o modal de confirmação ao clicar em Excluir Projeto", async () => {
    renderPage()

    const deleteButtons = screen.getAllByRole("button", { name: "Excluir Projeto" })
    await userEvent.click(deleteButtons[0])

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText(/"Educação Transformadora"/)).toBeInTheDocument()
  })

  it("fecha o modal ao clicar em Cancelar sem chamar a API", async () => {
    renderPage()

    await userEvent.click(
      screen.getAllByRole("button", { name: "Excluir Projeto" })[0],
    )
    expect(screen.getByRole("dialog")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(mocks.deleteProjectMock).not.toHaveBeenCalled()
  })

  it("happy path: confirma exclusão, chama API, exibe toast de sucesso e refetch", async () => {
    renderPage()

    await userEvent.click(
      screen.getAllByRole("button", { name: "Excluir Projeto" })[0],
    )
    await userEvent.click(screen.getByRole("button", { name: "Excluir" }))

    await waitFor(() => {
      expect(mocks.deleteProjectMock).toHaveBeenCalledWith(
        mockOngProjects[0].id,
        "token-ong",
      )
    })

    expect(mocks.showToastMock).toHaveBeenCalledWith("Projeto excluído", "success")
    expect(mockRefetch).toHaveBeenCalled()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("unhappy path: erro genérico exibe toast de falha e fecha modal", async () => {
    mocks.deleteProjectMock.mockRejectedValue(new Error("Network Error"))
    renderPage()

    await userEvent.click(
      screen.getAllByRole("button", { name: "Excluir Projeto" })[0],
    )
    await userEvent.click(screen.getByRole("button", { name: "Excluir" }))

    await waitFor(() => {
      expect(mocks.showToastMock).toHaveBeenCalledWith(
        "Falha ao excluir projeto. Tente novamente.",
        "error",
      )
    })

    expect(mockRefetch).not.toHaveBeenCalled()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("unhappy path 403: exibe mensagem de permissão negada", async () => {
    const err = Object.assign(new Error("Forbidden"), {
      response: { status: 403 },
    })
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true)
    mocks.deleteProjectMock.mockRejectedValue(err)

    renderPage()

    await userEvent.click(
      screen.getAllByRole("button", { name: "Excluir Projeto" })[0],
    )
    await userEvent.click(screen.getByRole("button", { name: "Excluir" }))

    await waitFor(() => {
      expect(mocks.showToastMock).toHaveBeenCalledWith(
        "Você não tem permissão para excluir este projeto.",
        "error",
      )
    })
  })

  it("unhappy path 404: exibe mensagem de projeto não encontrado", async () => {
    const err = Object.assign(new Error("Not Found"), {
      response: { status: 404 },
    })
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true)
    mocks.deleteProjectMock.mockRejectedValue(err)

    renderPage()

    await userEvent.click(
      screen.getAllByRole("button", { name: "Excluir Projeto" })[0],
    )
    await userEvent.click(screen.getByRole("button", { name: "Excluir" }))

    await waitFor(() => {
      expect(mocks.showToastMock).toHaveBeenCalledWith(
        "Projeto não encontrado.",
        "error",
      )
    })
  })
})
