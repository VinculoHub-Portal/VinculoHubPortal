import { render, screen, waitFor, act } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { usePaginatedProjects } from "./usePaginatedProjects"

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchProjectsMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    isAuthenticated: true,
    isLoading: false,
  }),
}))

vi.mock("../api/projects", () => ({
  fetchProjects: mocks.fetchProjectsMock,
}))

function makePageResponse(items: { id: number; title: string }[], total = items.length, pages = 1) {
  return {
    content: items.map((p) => ({
      id: p.id,
      title: p.title,
      status: "ACTIVE",
      npoId: 1,
      npoName: "ONG",
      npoPhone: "51999",
      startDate: "2026-01-01",
    })),
    totalElements: total,
    totalPages: pages,
    number: 0,
    size: 12,
    first: true,
    last: pages === 1,
  }
}

function HookConsumer({ type = "SOCIAL_INVESTMENT_LAW" as const }) {
  const { projects, loading, error, currentPage, totalPages, totalElements, setCurrentPage } =
    usePaginatedProjects({ type })

  if (loading) return <p>Carregando</p>
  if (error) return <p data-testid="error">{error}</p>

  return (
    <div>
      <p data-testid="count">{projects.length} projetos</p>
      <p data-testid="page">{currentPage}</p>
      <p data-testid="totalPages">{totalPages}</p>
      <p data-testid="totalElements">{totalElements}</p>
      {projects.map((p) => <span key={p.id}>{p.title}</span>)}
      <button onClick={() => setCurrentPage(1)}>Página 2</button>
    </div>
  )
}

describe("usePaginatedProjects", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchProjectsMock.mockResolvedValue(
      makePageResponse([{ id: 1, title: "Projeto A" }], 25, 3)
    )
  })

  it("busca a primeira página com page:0, size:12 ao montar", async () => {
    render(<HookConsumer />)

    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1 projetos"))

    expect(mocks.fetchProjectsMock).toHaveBeenCalledWith(
      { type: "SOCIAL_INVESTMENT_LAW", page: 0, size: 12 },
      "token",
    )
  })

  it("expõe totalPages e totalElements corretamente", async () => {
    render(<HookConsumer />)

    await waitFor(() => expect(screen.getByTestId("totalPages")).toHaveTextContent("3"))
    expect(screen.getByTestId("totalElements")).toHaveTextContent("25")
  })

  it("chamar setCurrentPage dispara novo fetch com a página correta", async () => {
    mocks.fetchProjectsMock
      .mockResolvedValueOnce(makePageResponse([{ id: 1, title: "Projeto A" }], 25, 3))
      .mockResolvedValueOnce(makePageResponse([{ id: 2, title: "Projeto B" }], 25, 3))

    render(<HookConsumer />)
    await waitFor(() => expect(screen.getByText("Projeto A")).toBeInTheDocument())

    act(() => {
      screen.getByRole("button", { name: "Página 2" }).click()
    })

    await waitFor(() =>
      expect(mocks.fetchProjectsMock).toHaveBeenCalledWith(
        { type: "SOCIAL_INVESTMENT_LAW", page: 1, size: 12 },
        "token",
      )
    )
    await waitFor(() => expect(screen.getByText("Projeto B")).toBeInTheDocument())
  })

  it("popula error quando fetchProjects falha", async () => {
    mocks.fetchProjectsMock.mockRejectedValue(new Error("Falha na rede"))

    render(<HookConsumer />)

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("Falha na rede")
    )
  })

  it("totalPages é 0 quando a lista vem vazia", async () => {
    mocks.fetchProjectsMock.mockResolvedValue(makePageResponse([], 0, 0))

    render(<HookConsumer />)

    await waitFor(() => expect(screen.getByTestId("totalPages")).toHaveTextContent("0"))
    expect(screen.getByTestId("count")).toHaveTextContent("0 projetos")
  })
})
