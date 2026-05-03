import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
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

const makePageResponse = (items: { id: number; title: string }[]) => ({
  content: items.map((p) => ({ id: p.id, title: p.title, status: "ACTIVE", npoId: 1, npoName: "ONG", npoPhone: "51999", startDate: "2026-01-01" })),
  totalElements: items.length,
  totalPages: 1, number: 0, size: 50, first: true, last: true,
})

describe("CompanyIncentiveLawsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchProjectsMock.mockResolvedValue(makePageResponse([
      { id: 1, title: "Projeto Alpha" },
      { id: 2, title: "Projeto Beta" },
    ]))
  })

  it("renderiza o título 'Leis de Incentivo'", async () => {
    render(<MemoryRouter><CompanyIncentiveLawsPage /></MemoryRouter>)
    expect(screen.getByText("Leis de Incentivo")).toBeInTheDocument()
  })

  it("renderiza o link 'Voltar ao Dashboard'", () => {
    render(<MemoryRouter><CompanyIncentiveLawsPage /></MemoryRouter>)
    expect(screen.getByText("Voltar ao Dashboard")).toBeInTheDocument()
  })

  it("exibe os projetos retornados pela service", async () => {
    render(<MemoryRouter><CompanyIncentiveLawsPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText("Projeto Alpha")).toBeInTheDocument()
      expect(screen.getByText("Projeto Beta")).toBeInTheDocument()
    })
  })

  it("exibe erro quando o fetch falha", async () => {
    mocks.fetchProjectsMock.mockRejectedValue(new Error("Servidor indisponível"))
    render(<MemoryRouter><CompanyIncentiveLawsPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/Servidor indisponível/)).toBeInTheDocument()
    })
  })

  it("filtrar por lei atualiza o chip selecionado para ativo", async () => {
    render(<MemoryRouter><CompanyIncentiveLawsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText("Projeto Alpha")).toBeInTheDocument())
    const chip = screen.getByRole("button", { name: "Lei Rouanet" })
    await userEvent.click(chip)
    expect(chip.className).toContain("bg-vinculo-dark")
  })
})
