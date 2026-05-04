import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RoleHomePage } from "."
import { formatCurrencyValue } from "../../utils/formatCurrency"

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchOdsCatalogMock: vi.fn(),
  createNewProjectMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}))

vi.mock("../../api/ods", () => ({
  fetchOdsCatalog: mocks.fetchOdsCatalogMock,
}))

vi.mock("../../api/newProject", () => ({
  createNewProject: mocks.createNewProjectMock,
}))

function renderOngDashboard() {
  return render(
    <MemoryRouter initialEntries={["/ong/dashboard"]}>
      <Routes>
        <Route
          path="/ong/dashboard"
          element={
            <RoleHomePage
              title="Painel da ONG"
              description="Acompanhe seu cadastro, projetos e oportunidades para sua organização."
              showCreateProjectAction
            />
          }
        />
        <Route path="/ong/projetos" element={<p>Meus Projetos</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function openCreateProjectModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Novo Projeto/i }))
  expect(await screen.findByRole("dialog")).toBeInTheDocument()
  await waitFor(() => {
    expect(mocks.fetchOdsCatalogMock).toHaveBeenCalledTimes(1)
  }, { timeout: 5000 })
  await screen.findByText(/ODS 1/i, {}, { timeout: 5000 })
}

describe("RoleHomePage - dashboard da ONG", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchOdsCatalogMock.mockResolvedValue([
      { id: 1, name: "ODS 1", description: "Erradicação da pobreza" },
      { id: 4, name: "ODS 4", description: "Educação de qualidade" },
    ])
    mocks.createNewProjectMock.mockResolvedValue({
      id: 1,
      name: "Projeto Escola",
      description: "Projeto voltado para educação básica.",
      type: "SOCIAL_INVESTMENT_LAW",
      capital: null,
      npoId: 20,
    })
  })

  it("renderiza o dashboard da ONG", () => {
    renderOngDashboard()

    expect(screen.getByText("Dashboard da ONG")).toBeInTheDocument()
    expect(screen.getByText("Projetos por Tipo")).toBeInTheDocument()
    expect(screen.getByText("Status dos Projetos")).toBeInTheDocument()
    expect(screen.getByText("Educação Transformadora")).toBeInTheDocument()
    expect(
      screen.getByText("Novas Oportunidades de Financiamento Disponíveis"),
    ).toBeInTheDocument()
  })

  it("abre o modal de novo projeto pelo dashboard", async () => {
    const user = userEvent.setup()
    renderOngDashboard()

    await openCreateProjectModal(user)

    expect(
      screen.getByRole("dialog", { name: "Preencha os dados do projeto" }),
    ).toBeInTheDocument()
    expect(mocks.fetchOdsCatalogMock).toHaveBeenCalledTimes(1)
  })

  it("valida ODS obrigatório antes de salvar", async () => {
    const user = userEvent.setup()
    renderOngDashboard()

    await openCreateProjectModal(user)
    await user.type(screen.getByLabelText(/Nome do projeto/i), "Projeto Escola")
    await user.type(
      screen.getByLabelText(/Descrição do projeto/i),
      "Projeto voltado para educação básica.",
    )
    await user.selectOptions(screen.getByLabelText(/Tipo do projeto/i), "social")
    await user.click(screen.getByRole("button", { name: /Finalizar/i }))

    expect(await screen.findByText(/Selecione ao menos um ODS/i)).toBeInTheDocument()
    expect(mocks.createNewProjectMock).not.toHaveBeenCalled()
  })

  it("cadastra projeto social com o contrato do newProject", async () => {
    const user = userEvent.setup()
    renderOngDashboard()

    await openCreateProjectModal(user)
    await user.type(screen.getByLabelText(/Nome do projeto/i), "Projeto Escola")
    await user.type(
      screen.getByLabelText(/Descrição do projeto/i),
      "Projeto voltado para educação básica.",
    )
    await user.selectOptions(screen.getByLabelText(/Tipo do projeto/i), "social")
    await user.click(
      screen.getByRole("button", { name: /ODS 1/i }),
    )
    await user.click(screen.getByRole("button", { name: /Finalizar/i }))

    await waitFor(() => {
      expect(mocks.createNewProjectMock).toHaveBeenCalledTimes(1)
    })

    expect(mocks.createNewProjectMock).toHaveBeenCalledWith(
      {
        nomeProjeto: "Projeto Escola",
        tipoProjeto: "social",
        descricaoProjeto: "Projeto voltado para educação básica.",
        metaCaptacao: "",
        odsProjeto: ["1"],
      },
      "token",
    )
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(
      screen.getByText("Projeto cadastrado com sucesso!"),
    ).toBeInTheDocument()
  })

  it("cadastra projeto governamental com meta de captação", async () => {
    const user = userEvent.setup()
    renderOngDashboard()

    await openCreateProjectModal(user)
    await user.type(screen.getByLabelText(/Nome do projeto/i), "Projeto Escola")
    await user.type(
      screen.getByLabelText(/Descrição do projeto/i),
      "Projeto voltado para educação básica.",
    )
    await user.selectOptions(
      screen.getByLabelText(/Tipo do projeto/i),
      "governamental",
    )
    await user.type(screen.getByLabelText(/Meta de captação/i), "25000")
    expect(screen.getByLabelText(/Meta de captação/i)).toHaveValue(
      formatCurrencyValue("25000"),
    )
    await user.click(
      screen.getByRole("button", { name: /ODS 4/i }),
    )
    await user.click(screen.getByRole("button", { name: /Finalizar/i }))

    await waitFor(() => {
      expect(mocks.createNewProjectMock).toHaveBeenCalledTimes(1)
    })

    expect(mocks.createNewProjectMock).toHaveBeenCalledWith(
      {
        nomeProjeto: "Projeto Escola",
        tipoProjeto: "governamental",
        descricaoProjeto: "Projeto voltado para educação básica.",
        metaCaptacao: "25000",
        odsProjeto: ["4"],
      },
      "token",
    )
  })

  it("mantém o modal aberto e exibe erro quando o cadastro falha", async () => {
    const user = userEvent.setup()
    mocks.createNewProjectMock.mockRejectedValueOnce(new Error("network"))
    renderOngDashboard()

    await openCreateProjectModal(user)
    await user.type(screen.getByLabelText(/Nome do projeto/i), "Projeto Escola")
    await user.type(
      screen.getByLabelText(/Descrição do projeto/i),
      "Projeto voltado para educação básica.",
    )
    await user.selectOptions(screen.getByLabelText(/Tipo do projeto/i), "social")
    await user.click(
      screen.getByRole("button", { name: /ODS 1/i }),
    )
    await user.click(screen.getByRole("button", { name: /Finalizar/i }))

    expect(
      await screen.findByText(
        "Não foi possível cadastrar o projeto. Tente novamente.",
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("navega para meus projetos pelo link de todos os projetos", async () => {
    renderOngDashboard()

    await userEvent.click(
      screen.getByRole("button", { name: /Ver todos os projetos/i }),
    )

    expect(screen.getByText("Meus Projetos")).toBeInTheDocument()
  })
})
