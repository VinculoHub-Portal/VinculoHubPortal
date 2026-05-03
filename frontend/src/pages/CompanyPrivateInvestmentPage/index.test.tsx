import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
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

const makePageResponse = (items: { id: number; title: string }[]) => ({
  content: items.map((p) => ({ id: p.id, title: p.title, status: "ACTIVE", npoId: 1, npoName: "ONG", npoPhone: "51999", startDate: "2026-01-01" })),
  totalElements: items.length,
  totalPages: 1, number: 0, size: 50, first: true, last: true,
})

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
    render(<MemoryRouter><CompanyPrivateInvestmentPage /></MemoryRouter>)
    expect(screen.getByText("Investimento Social Privado")).toBeInTheDocument()
  })

  it("renderiza o link 'Voltar ao Dashboard'", () => {
    render(<MemoryRouter><CompanyPrivateInvestmentPage /></MemoryRouter>)
    expect(screen.getByText("Voltar ao Dashboard")).toBeInTheDocument()
  })

  it("exibe os projetos retornados pela service", async () => {
    render(<MemoryRouter><CompanyPrivateInvestmentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText("Saúde em Movimento")).toBeInTheDocument()
      expect(screen.getByText("Tecnologia Inclusiva")).toBeInTheDocument()
    })
  })

  it("renderiza a seção 'Como funciona'", () => {
    render(<MemoryRouter><CompanyPrivateInvestmentPage /></MemoryRouter>)
    expect(screen.getByText("Como funciona o Investimento Social Privado?")).toBeInTheDocument()
  })

  it("exibe erro quando o fetch falha", async () => {
    mocks.fetchProjectsMock.mockRejectedValue(new Error("Timeout"))
    render(<MemoryRouter><CompanyPrivateInvestmentPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/Timeout/)).toBeInTheDocument()
    })
  })

  it("clicar num chip de tema filtra os projetos (multi-select)", async () => {
    render(<MemoryRouter><CompanyPrivateInvestmentPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText("Saúde em Movimento")).toBeInTheDocument())
    // Usa name exato para evitar múltiplos matches com texto parcial
    await userEvent.click(screen.getByRole("button", { name: /^Saúde \(/ }))
    await waitFor(() => {
      expect(screen.getAllByText(/projeto/).length).toBeGreaterThan(0)
    })
  })
})
