import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

function makePageResponse(
  items: { id: number; title: string; budgetNeeded?: number }[],
  totalPages = 1,
) {
  return {
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
    totalElements: items.length * totalPages,
    totalPages,
    number: 0,
    size: 10,
    first: true,
    last: totalPages === 1,
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/empresa/investimento-social-privado"]}>
      <Routes>
        <Route path="/empresa/investimento-social-privado" element={<CompanyPrivateInvestmentPage />} />
        <Route path="/projeto/:projectId" element={<p>Detalhes do Projeto</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("CompanyPrivateInvestmentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchProjectsMock.mockResolvedValue(
      makePageResponse([
        { id: 1, title: "Saúde em Movimento" },
        { id: 2, title: "Tecnologia Inclusiva" },
      ]),
    )
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
  })

  it("exibe os projetos retornados pela service", async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText("Saúde em Movimento")).toBeInTheDocument()
      expect(screen.getByText("Tecnologia Inclusiva")).toBeInTheDocument()
    })
  })

  it("não mostra badge de valor nos cards (Investimento Social Privado)", async () => {
    mocks.fetchProjectsMock.mockResolvedValue(
      makePageResponse([{ id: 1, title: "Projeto X", budgetNeeded: 100000 }]),
    )
    renderPage()
    await waitFor(() => expect(screen.getByText("Projeto X")).toBeInTheDocument())
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument()
  })

  it("renderiza a seção 'Como funciona'", () => {
    renderPage()
    expect(screen.getByText("Como funciona o Investimento Social Privado?")).toBeInTheDocument()
  })

  it("exibe erro quando o fetch falha e paginação não aparece", async () => {
    mocks.fetchProjectsMock.mockRejectedValue(new Error("Timeout"))
    renderPage()
    await waitFor(() => expect(screen.getByText(/Timeout/)).toBeInTheDocument())
    expect(screen.queryByRole("navigation", { name: /paginação/i })).not.toBeInTheDocument()
  })

  it("não mostra paginação quando totalPages é 1", async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText("Saúde em Movimento")).toBeInTheDocument())
    expect(screen.queryByRole("navigation", { name: /paginação/i })).not.toBeInTheDocument()
  })

  it("mostra paginação e página atual quando totalPages > 1", async () => {
    mocks.fetchProjectsMock.mockResolvedValue(
      makePageResponse([{ id: 1, title: "Projeto A" }], 3),
    )
    renderPage()
    await waitFor(() => expect(screen.getByText("Página 1 de 3")).toBeInTheDocument())
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /próxima/i })).not.toBeDisabled()
  })

  it("clicar Próxima dispara fetch com page:1", async () => {
    mocks.fetchProjectsMock
      .mockResolvedValueOnce(makePageResponse([{ id: 1, title: "Projeto A" }], 3))
      .mockResolvedValueOnce(makePageResponse([{ id: 2, title: "Projeto B" }], 3))

    renderPage()
    await waitFor(() => expect(screen.getByText("Página 1 de 3")).toBeInTheDocument())

    await userEvent.click(screen.getByRole("button", { name: /próxima/i }))

    await waitFor(() =>
      expect(mocks.fetchProjectsMock).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, size: 12 }),
        "token",
      ),
    )
  })

  it("lista vazia mostra estado vazio e sem paginação", async () => {
    mocks.fetchProjectsMock.mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      first: true,
      last: true,
    })
    renderPage()
    await waitFor(() =>
      expect(screen.getByText("Nenhum projeto disponível no momento.")).toBeInTheDocument(),
    )
    expect(screen.queryByRole("navigation", { name: /paginação/i })).not.toBeInTheDocument()
  })
})
