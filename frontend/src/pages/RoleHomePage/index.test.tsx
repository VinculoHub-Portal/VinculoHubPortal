import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RoleHomePage } from "."
import { formatCurrencyValue } from "../../utils/formatCurrency"

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchAuthenticatedProfileMock: vi.fn(),
  fetchProjectsMock: vi.fn(),
  fetchOdsCatalogMock: vi.fn(),
  createProjectMock: vi.fn(),
  showToastMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    isAuthenticated: true,
    isLoading: false,
  }),
}))

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}))

vi.mock("../../api/ods", () => ({
  fetchOdsCatalog: mocks.fetchOdsCatalogMock,
}))

vi.mock("../../api/projects", () => ({
  fetchProjects: mocks.fetchProjectsMock,
  createProject: mocks.createProjectMock,
}))

vi.mock("../../api/me", () => ({
  fetchAuthenticatedProfile: mocks.fetchAuthenticatedProfileMock,
}))

vi.mock("../../hooks/usePaginatedCompanies", () => ({
  usePaginatedCompanies: () => ({
    companies: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    setCurrentPage: vi.fn(),
    refetch: vi.fn(),
  }),
}))

const dashboardProjectsPage = {
  content: [
    {
      id: 1,
      title: "Projeto Ativo",
      status: "ACTIVE",
      type: "TAX_INCENTIVE_LAW",
      npoId: 42,
      npoName: "ONG Teste",
      npoPhone: "51999",
      startDate: "2026-01-01",
      budgetNeeded: 1000,
      investedAmount: 750,
    },
    {
      id: 2,
      title: "Projeto Concluído",
      status: "COMPLETED",
      type: "SOCIAL_INVESTMENT_LAW",
      npoId: 42,
      npoName: "ONG Teste",
      npoPhone: "51999",
      startDate: "2026-01-01",
      budgetNeeded: 1000,
      investedAmount: 1000,
    },
    {
      id: 3,
      title: "Projeto Cancelado",
      status: "CANCELLED",
      type: "GOVERNMENTAL",
      npoId: 42,
      npoName: "ONG Teste",
      npoPhone: "51999",
      startDate: "2026-01-01",
      budgetNeeded: 1000,
      investedAmount: 250,
    },
  ],
  totalElements: 3,
  totalPages: 1,
  number: 0,
  size: 50,
  first: true,
  last: true,
}

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

describe("RoleHomePage - dashboard da ONG", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchAuthenticatedProfileMock.mockResolvedValue({ npoId: 42 })
    mocks.fetchProjectsMock.mockResolvedValue(dashboardProjectsPage)
    mocks.fetchOdsCatalogMock.mockResolvedValue([
      { id: 1, name: "ODS 1", description: "Erradicação da pobreza" },
    ])
    mocks.createProjectMock.mockResolvedValue({ id: 1 })
  })

  it("renderiza o dashboard da ONG com projetos reais", async () => {
    renderOngDashboard()

    expect(screen.getByText("Dashboard da ONG")).toBeInTheDocument()
    expect(screen.getByText("Projetos por Tipo")).toBeInTheDocument()
    expect(screen.getByText("Status dos Projetos")).toBeInTheDocument()
    expect(await screen.findByText("Projeto Ativo")).toBeInTheDocument()
    expect(screen.getByText("Projeto Concluído")).toBeInTheDocument()
    expect(screen.getAllByText("Leis de Incentivo").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Investimento Social Privado").length).toBeGreaterThan(0)
    expect(screen.getByText("Novas Oportunidades de Financiamento Disponíveis")).toBeInTheDocument()
    expect(mocks.fetchAuthenticatedProfileMock).toHaveBeenCalledWith("token")
    expect(mocks.fetchProjectsMock).toHaveBeenCalledWith(
      { npoId: 42, size: 50 },
      "token",
    )
  })

  it("filtra projetos pelos status reais da aplicação", async () => {
    renderOngDashboard()

    expect(await screen.findByText("Projeto Ativo")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Em Captação" })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Concluídos" }))

    expect(screen.getByText("Projeto Concluído")).toBeInTheDocument()
    expect(screen.queryByText("Projeto Ativo")).not.toBeInTheDocument()
    expect(screen.queryByText("Projeto Cancelado")).not.toBeInTheDocument()
  })

  it("navega para meus projetos pelo link de todos os projetos", async () => {
    renderOngDashboard()

    await userEvent.click(
      screen.getByRole("button", { name: /Ver detalhes/i }),
    )

    expect(screen.getByText("Meus Projetos")).toBeInTheDocument()
  })

  it("abre o modal de novo projeto", async () => {
    renderOngDashboard()

    await userEvent.click(screen.getByRole("button", { name: /Novo Projeto/i }))

    expect(
      screen.getByRole("dialog", { name: "Cadastrar Novo Projeto" }),
    ).toBeInTheDocument()
  })
})

describe("CreateProjectModal - cadastro de novo projeto", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("fake-token")
    mocks.fetchAuthenticatedProfileMock.mockResolvedValue({ npoId: 42 })
    mocks.fetchProjectsMock.mockResolvedValue(dashboardProjectsPage)
    mocks.fetchOdsCatalogMock.mockResolvedValue([
      { id: 1, name: "ODS 1", description: "Erradicação da pobreza" },
      { id: 2, name: "ODS 2", description: "Fome Zero" },
    ])
    mocks.createProjectMock.mockResolvedValue({ id: 42 })
  })

  async function openModal() {
    renderOngDashboard()
    await waitFor(() => expect(mocks.fetchOdsCatalogMock).toHaveBeenCalled())
    await userEvent.click(screen.getByRole("button", { name: /Novo Projeto/i }))
  }

  async function fillRequiredFields(overrides: {
    name?: string
    description?: string
    type?: "Investimento Social Privado" | "Leis de Incentivo"
    budget?: string
    odsLabel?: string
  } = {}) {
    const {
      name = "Projeto de Teste",
      description = "Descrição com mais de cinquenta caracteres para passar na validação.",
      type = "Investimento Social Privado",
      budget,
      odsLabel = "ODS 1",
    } = overrides

    await userEvent.type(screen.getByLabelText(/Nome do Projeto/i), name)
    await userEvent.type(screen.getByLabelText(/Descrição do Projeto/i), description)
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Tipo de Projeto/i }), type)
    if (budget) {
      await userEvent.type(screen.getByLabelText(/Valor Necessário/i), budget)
    }
    await userEvent.click(screen.getByRole("button", { name: new RegExp(odsLabel, "i") }))
  }

  it("campos removidos não aparecem no modal", async () => {
    await openModal()

    expect(screen.queryByLabelText(/Área de Atuação/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Prazo de Captação/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Número de Beneficiados/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Localidade/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Objetivo Principal/i)).not.toBeInTheDocument()
  })

  it("campo Valor Necessário não aparece antes de selecionar o tipo", async () => {
    await openModal()

    expect(screen.queryByLabelText(/Valor Necessário/i)).not.toBeInTheDocument()
  })

  it("campo Valor Necessário aparece ao selecionar Leis de Incentivo", async () => {
    await openModal()

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Tipo de Projeto/i }), "Leis de Incentivo")

    expect(screen.getByLabelText(/Valor Necessário/i)).toBeInTheDocument()
  })

  it("formata Valor Necessário ao digitar", async () => {
    await openModal()

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Tipo de Projeto/i }), "Leis de Incentivo")
    const budgetInput = screen.getByLabelText(/Valor Necessário/i)

    await userEvent.type(budgetInput, "150000")

    expect(budgetInput).toHaveValue(formatCurrencyValue("150000"))
  })

  it("aceita valor colado e mantém a máscara", async () => {
    await openModal()

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Tipo de Projeto/i }), "Leis de Incentivo")
    const budgetInput = screen.getByLabelText(/Valor Necessário/i)

    fireEvent.paste(budgetInput, {
      clipboardData: {
        getData: () => "150000",
      },
    })

    expect(budgetInput).toHaveValue(formatCurrencyValue("150000"))
  })

  it("campo Valor Necessário some ao trocar para Investimento Social Privado", async () => {
    await openModal()

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Tipo de Projeto/i }), "Leis de Incentivo")
    await userEvent.type(screen.getByLabelText(/Valor Necessário/i), "50000")
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Tipo de Projeto/i }), "Investimento Social Privado")

    expect(screen.queryByLabelText(/Valor Necessário/i)).not.toBeInTheDocument()
  })

  it("exibe erros de validação ao submeter formulário vazio", async () => {
    await openModal()

    const form = screen.getByRole("dialog").querySelector("form")!
    fireEvent.submit(form)

    expect(screen.getByText("Informe o nome do projeto.")).toBeInTheDocument()
    expect(screen.getByText("Informe a descrição do projeto.")).toBeInTheDocument()
    expect(screen.getByText("Selecione o tipo de projeto.")).toBeInTheDocument()
    expect(screen.getByText("Selecione ao menos um ODS.")).toBeInTheDocument()
    expect(mocks.createProjectMock).not.toHaveBeenCalled()
  })

  it("exibe erro quando descrição tem menos de 50 caracteres", async () => {
    await openModal()

    await userEvent.type(screen.getByLabelText(/Nome do Projeto/i), "Projeto")
    await userEvent.type(screen.getByLabelText(/Descrição do Projeto/i), "Curta demais.")
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Tipo de Projeto/i }), "Investimento Social Privado")
    await userEvent.click(screen.getByRole("button", { name: /ODS 1/i }))
    await userEvent.click(screen.getByRole("button", { name: /Cadastrar Projeto/i }))

    expect(screen.getByText("A descrição deve ter no mínimo 50 caracteres.")).toBeInTheDocument()
    expect(mocks.createProjectMock).not.toHaveBeenCalled()
  })

  it("exige Valor Necessário quando tipo é Leis de Incentivo", async () => {
    await openModal()

    await userEvent.type(screen.getByLabelText(/Nome do Projeto/i), "Projeto")
    await userEvent.type(screen.getByLabelText(/Descrição do Projeto/i), "Descrição com mais de cinquenta caracteres para passar na validação.")
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Tipo de Projeto/i }), "Leis de Incentivo")
    await userEvent.click(screen.getByRole("button", { name: /ODS 1/i }))
    await userEvent.click(screen.getByRole("button", { name: /Cadastrar Projeto/i }))

    expect(screen.getByText("Informe o valor necessário.")).toBeInTheDocument()
    expect(mocks.createProjectMock).not.toHaveBeenCalled()
  })

  it("happy path: cria projeto como Investimento Social Privado sem budget", async () => {
    await openModal()
    await fillRequiredFields({ type: "Investimento Social Privado" })

    await userEvent.click(screen.getByRole("button", { name: /Cadastrar Projeto/i }))

    await screen.findByText("Projeto cadastrado com sucesso!")
    expect(mocks.createProjectMock).toHaveBeenCalledOnce()
    expect(mocks.createProjectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Projeto de Teste",
        type: "SOCIAL_INVESTMENT_LAW",
        budgetNeeded: null,
        odsIds: [1],
      }),
      "fake-token",
    )
    expect(mocks.createProjectMock.mock.calls[0][0]).not.toHaveProperty("focusArea")
    expect(mocks.createProjectMock.mock.calls[0][0]).not.toHaveProperty("fundraisingDeadline")
    expect(mocks.createProjectMock.mock.calls[0][0]).not.toHaveProperty("beneficiariesCount")
    expect(mocks.createProjectMock.mock.calls[0][0]).not.toHaveProperty("location")
    expect(mocks.createProjectMock.mock.calls[0][0]).not.toHaveProperty("mainObjective")
  })

  it("happy path: cria projeto como Leis de Incentivo com budget", async () => {
    await openModal()
    await fillRequiredFields({ type: "Leis de Incentivo", budget: "150000" })

    await userEvent.click(screen.getByRole("button", { name: /Cadastrar Projeto/i }))

    await screen.findByText("Projeto cadastrado com sucesso!")
    expect(mocks.createProjectMock).toHaveBeenCalledOnce()
    expect(mocks.createProjectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "TAX_INCENTIVE_LAW",
        budgetNeeded: 150000,
      }),
      "fake-token",
    )
  })

  it("modal fecha após submissão bem-sucedida", async () => {
    await openModal()
    await fillRequiredFields()

    await userEvent.click(screen.getByRole("button", { name: /Cadastrar Projeto/i }))

    await screen.findByText("Projeto cadastrado com sucesso!")
    expect(screen.queryByRole("dialog", { name: "Cadastrar Novo Projeto" })).not.toBeInTheDocument()
  })

  it("cancelar fecha o modal e reseta o formulário", async () => {
    await openModal()
    await userEvent.type(screen.getByLabelText(/Nome do Projeto/i), "Valor que deve sumir")

    await userEvent.click(screen.getByRole("button", { name: /Cancelar/i }))

    expect(screen.queryByRole("dialog", { name: "Cadastrar Novo Projeto" })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /Novo Projeto/i }))
    expect(screen.getByLabelText(/Nome do Projeto/i)).toHaveValue("")
  })
})
