import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { CompanyPrivateInvestmentPage } from "./index"

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
  })),
  totalElements: items.length,
  totalPages: 1, number: 0, size: 50, first: true, last: true,
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/empresa/investimento-social-privado"]}>
      <Routes>
        <Route path="/empresa/investimento-social-privado" element={<CompanyPrivateInvestmentPage />} />
        <Route path="/projeto/:projectId" element={<p>Detalhes do Projeto</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("CompanyPrivateInvestmentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchProjectsMock.mockResolvedValue(makePageResponse([
      { id: 1, title: "Saúde em Movimento" },
      { id: 2, title: "Tecnologia Inclusiva" },
    ]))
  })

  it("renderiza o título 'Investimento Social Privado'", () => {
    renderPage()
    expect(screen.getByText("Investimento Social Privado")).toBeInTheDocument()
  })

  it("renderiza o link 'Voltar ao Dashboard'", () => {
    renderPage()
    expect(screen.getByText("Voltar ao Dashboard")).toBeInTheDocument()
  })

  it("não renderiza stats, filtro de temas nem banner de sugestões", () => {
    renderPage()
    expect(screen.queryByText("Projetos sugeridos")).not.toBeInTheDocument()
    expect(screen.queryByText("Temas de Interesse")).not.toBeInTheDocument()
    expect(screen.queryByText("Projetos Sugeridos")).not.toBeInTheDocument()
  })

  it("exibe os projetos retornados pela service", async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText("Saúde em Movimento")).toBeInTheDocument()
      expect(screen.getByText("Tecnologia Inclusiva")).toBeInTheDocument()
    })
  })

  it("não mostra badge de valor nos cards (Investimento Social Privado)", async () => {
    mocks.fetchProjectsMock.mockResolvedValue(makePageResponse([{ id: 1, title: "Projeto X", budgetNeeded: 100000 }]))
    renderPage()
    await waitFor(() => expect(screen.getByText("Projeto X")).toBeInTheDocument())
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument()
  })

  it("renderiza a seção 'Como funciona'", () => {
    renderPage()
    expect(screen.getByText("Como funciona o Investimento Social Privado?")).toBeInTheDocument()
  })

  it("exibe erro quando o fetch falha", async () => {
    mocks.fetchProjectsMock.mockRejectedValue(new Error("Timeout"))
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Timeout/)).toBeInTheDocument()
    })
  })
})
