import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { OngProjectsPage } from "."
import { mockOngProjects } from "./mockData"

const mocks = vi.hoisted(() => ({
  useOngProjectsMock: vi.fn(),
}))

vi.mock("./useOngProjects", () => ({
  useOngProjects: mocks.useOngProjectsMock,
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/ong/projetos"]}>
      <Routes>
        <Route path="/ong/projetos" element={<OngProjectsPage />} />
        <Route path="/ong/dashboard" element={<p>Dashboard da ONG</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("OngProjectsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useOngProjectsMock.mockReturnValue({
      projects: mockOngProjects,
      loading: false,
      error: null,
    })
  })

  it("renderiza header, resumo e lista de projetos", () => {
    renderPage()

    expect(screen.getByText("VínculoHub Portal")).toBeInTheDocument()
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
