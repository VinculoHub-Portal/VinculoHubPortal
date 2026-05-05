import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { CompanyIncentiveLawsPage } from "./index"

const mocks = vi.hoisted(() => ({
  fetchProjectsMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    isAuthenticated: true,
    isLoading: false,
  }),
}))

vi.mock("../../api/projects", () => ({
  fetchProjects: mocks.fetchProjectsMock,
}))

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}))

const makePageResponse = (items: { id: number; title: string; budgetNeeded?: number }[]) => ({
  content: items.map((p) => ({
    id: p.id,
    title: p.title,
    status: "ACTIVE",
    npoId: 1,
    npoName: "ONG",
    npoPhone: "51999",
    startDate: "2026-01-01",
    budgetNeeded: p.budgetNeeded ?? null,
    progressPercent: null,
  })),
  totalElements: items.length,
  totalPages: 1, number: 0, size: 50, first: true, last: true,
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/empresa/leis-de-incentivo"]}>
      <Routes>
        <Route path="/empresa/leis-de-incentivo" element={<CompanyIncentiveLawsPage />} />
        <Route path="/projeto/:projectId" element={<p>Detalhes do Projeto</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("CompanyIncentiveLawsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchProjectsMock.mockResolvedValue(makePageResponse([
      { id: 1, title: "Projeto Alpha", budgetNeeded: 50000 },
      { id: 2, title: "Projeto Beta", budgetNeeded: 80000 },
    ]))
  })

  it("renderiza o título 'Leis de Incentivo'", () => {
    renderPage()
    expect(screen.getByText("Leis de Incentivo")).toBeInTheDocument()
  })

  it("renderiza o link 'Voltar ao Dashboard'", () => {
    renderPage()
    expect(screen.getByText("Voltar ao Dashboard")).toBeInTheDocument()
  })

  it("não renderiza stats nem filtro de leis", () => {
    renderPage()
    expect(screen.queryByText("Projetos disponíveis")).not.toBeInTheDocument()
    expect(screen.queryByText("Filtrar por Lei de Incentivo")).not.toBeInTheDocument()
    expect(screen.queryByText("Lei Rouanet")).not.toBeInTheDocument()
  })

  it("exibe os projetos retornados pela service", async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText("Projeto Alpha")).toBeInTheDocument()
      expect(screen.getByText("Projeto Beta")).toBeInTheDocument()
    })
  })

  it("exibe badge de valor dos cards (Leis de Incentivo)", async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText("Projeto Alpha")).toBeInTheDocument())
    expect(screen.getByText("R$ 50.000")).toBeInTheDocument()
    expect(screen.getByText("R$ 80.000")).toBeInTheDocument()
  })

  it("exibe erro quando o fetch falha", async () => {
    mocks.fetchProjectsMock.mockRejectedValue(new Error("Servidor indisponível"))
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Servidor indisponível/)).toBeInTheDocument()
    })
  })
})
