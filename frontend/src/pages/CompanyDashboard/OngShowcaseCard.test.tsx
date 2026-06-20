import { act, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { OngShowcaseCard } from "./OngShowcaseCard"

const mocks = vi.hoisted(() => ({
  usePaginatedNpos: vi.fn(),
}))

vi.mock("../../hooks/usePaginatedNpos", () => ({
  usePaginatedNpos: mocks.usePaginatedNpos,
}))

const mockNpos = [
  {
    id: 1,
    name: "ONG Alpha",
    description: "Educação e inclusão social.",
    logoUrl: null,
    city: "São Paulo",
    stateCode: "SP",
  },
  {
    id: 2,
    name: "Instituto Beta",
    description: null,
    logoUrl: "https://example.com/beta.png",
    city: "Rio de Janeiro",
    stateCode: "RJ",
  },
  {
    id: 3,
    name: "Projeto Gama",
    description: null,
    logoUrl: null,
    city: null,
    stateCode: null,
  },
]

const mockRefetch = vi.fn()
const mockSetCurrentPage = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mocks.usePaginatedNpos.mockReturnValue({
    npos: mockNpos,
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 1,
    totalElements: 3,
    setCurrentPage: mockSetCurrentPage,
    refetch: mockRefetch,
  })
})

function renderCard() {
  return render(
    <MemoryRouter>
      <OngShowcaseCard />
    </MemoryRouter>,
  )
}

describe("OngShowcaseCard", () => {
  it("renderiza os nomes das 3 ONGs", () => {
    renderCard()
    expect(screen.getByText("ONG Alpha")).toBeInTheDocument()
    expect(screen.getByText("Instituto Beta")).toBeInTheDocument()
    expect(screen.getByText("Projeto Gama")).toBeInTheDocument()
  })

  it("exibe localização 'São Paulo, SP' para ONG com cidade e estado", () => {
    renderCard()
    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument()
  })

  it("exibe links de ver perfil para cada ONG", () => {
    renderCard()
    const links = screen.getAllByRole("link", { name: /ver perfil/i })
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAttribute("href", "/ong/publico/1")
  })

  it("exibe a paginação quando totalPages=3", () => {
    mocks.usePaginatedNpos.mockReturnValue({
      npos: mockNpos,
      loading: false,
      error: null,
      currentPage: 0,
      totalPages: 3,
      totalElements: 3,
      setCurrentPage: mockSetCurrentPage,
      refetch: mockRefetch,
    })

    renderCard()

    expect(screen.getByRole("navigation", { name: "Paginação" })).toBeInTheDocument()
    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument()
  })

  it("filtra ONGs pelo nome após debounce de 400ms", () => {
    vi.useFakeTimers()
    renderCard()
    const input = screen.getByPlaceholderText("Buscar ONG...")
    fireEvent.change(input, { target: { value: "alpha" } })
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByText("ONG Alpha")).toBeInTheDocument()
    expect(screen.queryByText("Instituto Beta")).not.toBeInTheDocument()
    expect(screen.queryByText("Projeto Gama")).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it("exibe 'Carregando ONGs...' quando loading=true", () => {
    mocks.usePaginatedNpos.mockReturnValue({
      npos: [],
      loading: true,
      error: null,
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      setCurrentPage: mockSetCurrentPage,
      refetch: mockRefetch,
    })

    renderCard()

    expect(screen.getByText("Carregando ONGs...")).toBeInTheDocument()
  })

  it("exibe erro e botão de retry", () => {
    mocks.usePaginatedNpos.mockReturnValue({
      npos: [],
      loading: false,
      error: "Erro de conexão",
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      setCurrentPage: mockSetCurrentPage,
      refetch: mockRefetch,
    })

    renderCard()

    expect(screen.getByText("Erro de conexão")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument()
  })

  it("exibe estado vazio quando não há ONGs", () => {
    mocks.usePaginatedNpos.mockReturnValue({
      npos: [],
      loading: false,
      error: null,
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      setCurrentPage: mockSetCurrentPage,
      refetch: mockRefetch,
    })

    renderCard()

    expect(screen.getByText("Nenhuma ONG cadastrada ainda.")).toBeInTheDocument()
  })
})
