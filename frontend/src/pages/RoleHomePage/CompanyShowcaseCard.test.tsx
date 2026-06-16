import { act, render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CompanyShowcaseCard } from "./CompanyShowcaseCard"

const mocks = vi.hoisted(() => ({
  usePaginatedCompanies: vi.fn(),
}))

vi.mock("../../hooks/usePaginatedCompanies", () => ({
  usePaginatedCompanies: mocks.usePaginatedCompanies,
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ getAccessTokenSilently: vi.fn() }),
}))

const mockCompanies = [
  {
    id: 1,
    legalName: "Empresa Alpha LTDA",
    socialName: "Alpha",
    description: null,
    logoUrl: null,
    city: "São Paulo",
    state: "SP",
  },
  {
    id: 2,
    legalName: "Beta Tecnologia S.A.",
    socialName: null,
    description: "Desc",
    logoUrl: "https://example.com/beta.png",
    city: "Rio de Janeiro",
    state: "RJ",
  },
  {
    id: 3,
    legalName: "Gamma Soluções LTDA",
    socialName: "Gamma",
    description: null,
    logoUrl: null,
    city: null,
    state: null,
  },
]

const mockRefetch = vi.fn()
const mockSetCurrentPage = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mocks.usePaginatedCompanies.mockReturnValue({
    companies: mockCompanies,
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
      <CompanyShowcaseCard />
    </MemoryRouter>,
  )
}

describe("CompanyShowcaseCard", () => {
  describe("happy path — lista de empresas", () => {
    it("renderiza os nomes legais das 3 empresas", () => {
      renderCard()
      expect(screen.getByText("Empresa Alpha LTDA")).toBeInTheDocument()
      expect(screen.getByText("Beta Tecnologia S.A.")).toBeInTheDocument()
      expect(screen.getByText("Gamma Soluções LTDA")).toBeInTheDocument()
    })

    it("exibe localização 'São Paulo, SP' para empresa 1", () => {
      renderCard()
      expect(screen.getByText("São Paulo, SP")).toBeInTheDocument()
    })

    it("exibe '—' para empresa sem cidade e estado", () => {
      renderCard()
      expect(screen.getByText("—")).toBeInTheDocument()
    })

    it("exibe 3 botões de ação com aria-label contendo 'Ver perfil'", () => {
      renderCard()
      const buttons = screen.getAllByRole("button", { name: /ver perfil/i })
      expect(buttons).toHaveLength(3)
    })
  })

  describe("paginação", () => {
    it("exibe a paginação com 'Página 1 de 3' quando totalPages=3", () => {
      mocks.usePaginatedCompanies.mockReturnValue({
        companies: mockCompanies,
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

    it("não exibe a paginação quando totalPages=1", () => {
      renderCard()
      expect(screen.queryByRole("navigation", { name: "Paginação" })).not.toBeInTheDocument()
    })
  })

  describe("filtro por nome", () => {
    it("filtra empresas pelo nome após debounce de 400ms", () => {
      vi.useFakeTimers()
      renderCard()
      const input = screen.getByPlaceholderText("Buscar empresa...")
      fireEvent.change(input, { target: { value: "alpha" } })
      act(() => {
        vi.runAllTimers()
      })
      expect(screen.getByText("Empresa Alpha LTDA")).toBeInTheDocument()
      expect(screen.queryByText("Beta Tecnologia S.A.")).not.toBeInTheDocument()
      expect(screen.queryByText("Gamma Soluções LTDA")).not.toBeInTheDocument()
      vi.useRealTimers()
    })
  })

  describe("estado de carregamento", () => {
    it("exibe 'Carregando empresas...' quando loading=true", () => {
      mocks.usePaginatedCompanies.mockReturnValue({
        companies: [],
        loading: true,
        error: null,
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        setCurrentPage: mockSetCurrentPage,
        refetch: mockRefetch,
      })
      renderCard()
      expect(screen.getByText("Carregando empresas...")).toBeInTheDocument()
    })
  })

  describe("estado de erro", () => {
    it("exibe a mensagem de erro e botão 'Tentar novamente'", () => {
      mocks.usePaginatedCompanies.mockReturnValue({
        companies: [],
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
  })

  describe("estado vazio", () => {
    it("exibe 'Nenhuma empresa cadastrada ainda.' quando companies=[]", () => {
      mocks.usePaginatedCompanies.mockReturnValue({
        companies: [],
        loading: false,
        error: null,
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        setCurrentPage: mockSetCurrentPage,
        refetch: mockRefetch,
      })
      renderCard()
      expect(screen.getByText("Nenhuma empresa cadastrada ainda.")).toBeInTheDocument()
    })
  })
})
