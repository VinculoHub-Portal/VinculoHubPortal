import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axios from "axios"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EditProjectPage } from "."

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchProjectByIdMock: vi.fn(),
  updateProjectMock: vi.fn(),
  fetchOdsCatalogMock: vi.fn(),
  showToastMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    isAuthenticated: true,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    user: { "https://vinculohub/roles": ["NPO"] },
  }),
}))

vi.mock("../../api/projects", () => ({
  fetchProjectById: mocks.fetchProjectByIdMock,
  updateProject: mocks.updateProjectMock,
}))

vi.mock("../../api/ods", () => ({
  fetchOdsCatalog: mocks.fetchOdsCatalogMock,
}))

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}))

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}))

const mockOdsOptions = [
  { id: 1, name: "Sem Pobreza", description: "ODS 1" },
  { id: 4, name: "Educação de Qualidade", description: "ODS 4" },
]

const mockProject = {
  id: 42,
  npoId: 10,
  title: "Projeto Original",
  description:
    "Descrição original do projeto com mais de cinquenta caracteres para ser válida.",
  status: "ACTIVE",
  type: "TAX_INCENTIVE_LAW",
  budgetNeeded: 100000,
  investedAmount: null,
  startDate: null,
  endDate: null,
  ods: [{ id: 1, name: "Sem Pobreza", description: "ODS 1" }],
}

function renderPage(projectId = "42") {
  return render(
    <MemoryRouter initialEntries={[`/ong/projetos/${projectId}/editar`]}>
      <Routes>
        <Route
          path="/ong/projetos/:projectId/editar"
          element={<EditProjectPage />}
        />
        <Route path="/ong/projetos" element={<p>Lista de Projetos</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("EditProjectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token-ong")
    mocks.fetchProjectByIdMock.mockResolvedValue(mockProject)
    mocks.fetchOdsCatalogMock.mockResolvedValue(mockOdsOptions)
    mocks.updateProjectMock.mockResolvedValue({ ...mockProject, title: "Atualizado" })
  })

  it("exibe estado de carregamento enquanto busca o projeto", () => {
    mocks.fetchProjectByIdMock.mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByText("Carregando projeto...")).toBeInTheDocument()
  })

  it("pré-preenche o formulário com os dados do projeto", async () => {
    renderPage()

    expect(
      await screen.findByDisplayValue("Projeto Original"),
    ).toBeInTheDocument()
    expect(
      screen.getByDisplayValue(
        "Descrição original do projeto com mais de cinquenta caracteres para ser válida.",
      ),
    ).toBeInTheDocument()
  })

  it("pré-seleciona o tipo de projeto correto", async () => {
    renderPage()

    await screen.findByDisplayValue("Projeto Original")

    const select = screen.getByRole("combobox")
    expect(select).toHaveValue("tax_incentive_law")
  })

  it("pré-preenche o campo de valor quando o tipo é Leis de Incentivo", async () => {
    renderPage()

    await screen.findByDisplayValue("Projeto Original")

    expect(screen.getByLabelText(/Valor Necessário/i)).toBeInTheDocument()
  })

  it("não exibe o campo de valor quando o tipo é Investimento Social Privado", async () => {
    mocks.fetchProjectByIdMock.mockResolvedValue({
      ...mockProject,
      type: "SOCIAL_INVESTMENT_LAW",
      budgetNeeded: null,
    })
    renderPage()

    await screen.findByDisplayValue("Projeto Original")

    expect(screen.queryByLabelText(/Valor Necessário/i)).not.toBeInTheDocument()
  })

  it("exibe o campo de valor ao trocar tipo para Leis de Incentivo", async () => {
    mocks.fetchProjectByIdMock.mockResolvedValue({
      ...mockProject,
      type: "SOCIAL_INVESTMENT_LAW",
      budgetNeeded: null,
    })
    renderPage()

    await screen.findByDisplayValue("Projeto Original")

    expect(screen.queryByLabelText(/Valor Necessário/i)).not.toBeInTheDocument()

    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      "tax_incentive_law",
    )

    expect(screen.getByLabelText(/Valor Necessário/i)).toBeInTheDocument()
  })

  it("exibe erro de validação quando descrição é curta demais", async () => {
    renderPage()

    await screen.findByDisplayValue("Projeto Original")

    const descriptionField = screen.getByLabelText(/Descrição do Projeto/i)
    await userEvent.clear(descriptionField)
    await userEvent.type(descriptionField, "Curta")

    await userEvent.click(
      screen.getByRole("button", { name: "Salvar Alterações" }),
    )

    expect(
      screen.getByText("A descrição deve ter no mínimo 50 caracteres."),
    ).toBeInTheDocument()
    expect(mocks.updateProjectMock).not.toHaveBeenCalled()
  })

  it("exibe erro de validação quando nenhum ODS é selecionado", async () => {
    mocks.fetchProjectByIdMock.mockResolvedValue({
      ...mockProject,
      ods: [],
    })
    renderPage()

    await screen.findByDisplayValue("Projeto Original")

    await userEvent.click(
      screen.getByRole("button", { name: "Salvar Alterações" }),
    )

    expect(
      screen.getByText("Selecione ao menos um ODS."),
    ).toBeInTheDocument()
    expect(mocks.updateProjectMock).not.toHaveBeenCalled()
  })

  it("happy path: chama updateProject com payload correto e navega para a listagem", async () => {
    renderPage()

    await screen.findByDisplayValue("Projeto Original")

    await userEvent.click(
      screen.getByRole("button", { name: "Salvar Alterações" }),
    )

    await waitFor(() => {
      expect(mocks.updateProjectMock).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          title: "Projeto Original",
          type: "TAX_INCENTIVE_LAW",
          odsIds: [1],
        }),
        "token-ong",
      )
    })

    expect(mocks.showToastMock).toHaveBeenCalledWith("Projeto atualizado", "success")
    expect(screen.getByText("Lista de Projetos")).toBeInTheDocument()
  })

  it("unhappy path: preserva dados do formulário e exibe erro genérico em falha de API", async () => {
    mocks.updateProjectMock.mockRejectedValue(new Error("Network Error"))
    renderPage()

    await screen.findByDisplayValue("Projeto Original")

    await userEvent.click(
      screen.getByRole("button", { name: "Salvar Alterações" }),
    )

    await waitFor(() => {
      expect(
        screen.getByText("Falha ao atualizar projeto. Tente novamente."),
      ).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue("Projeto Original")).toBeInTheDocument()
    expect(mocks.showToastMock).toHaveBeenCalledWith(
      "Falha ao atualizar projeto. Tente novamente.",
      "error",
    )
    expect(screen.queryByText("Lista de Projetos")).not.toBeInTheDocument()
  })

  it("exibe mensagem de permissão negada em resposta 403", async () => {
    const err = Object.assign(new Error("Forbidden"), {
      isAxiosError: true,
      response: { status: 403 },
    })
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true)
    mocks.updateProjectMock.mockRejectedValue(err)

    renderPage()
    await screen.findByDisplayValue("Projeto Original")

    await userEvent.click(
      screen.getByRole("button", { name: "Salvar Alterações" }),
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          "Você não tem permissão para editar este projeto.",
        ),
      ).toBeInTheDocument()
    })
  })

  it("exibe estado de não encontrado quando o fetch inicial retorna 404", async () => {
    const err = Object.assign(new Error("Not Found"), {
      isAxiosError: true,
      response: { status: 404 },
    })
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true)
    mocks.fetchProjectByIdMock.mockRejectedValue(err)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText("Projeto não encontrado.")).toBeInTheDocument()
    })
  })

  it("exibe mensagem de erro quando o carregamento inicial falha", async () => {
    mocks.fetchProjectByIdMock.mockRejectedValue(new Error("Server Error"))
    renderPage()

    await waitFor(() => {
      expect(
        screen.getByText(
          "Não foi possível carregar o projeto. Tente novamente.",
        ),
      ).toBeInTheDocument()
    })
  })

  it("navega para a listagem ao clicar em Cancelar", async () => {
    renderPage()

    await screen.findByDisplayValue("Projeto Original")

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(screen.getByText("Lista de Projetos")).toBeInTheDocument()
  })

  it("navega para a listagem ao clicar em Voltar para Meus Projetos", async () => {
    renderPage()

    await screen.findByDisplayValue("Projeto Original")

    await userEvent.click(
      screen.getByRole("button", { name: "Voltar para Meus Projetos" }),
    )

    expect(screen.getByText("Lista de Projetos")).toBeInTheDocument()
  })
})
