import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useOngProjects } from "./useOngProjects"

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchAuthenticatedProfileMock: vi.fn(),
  fetchProjectsMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    isAuthenticated: true,
    isLoading: false,
  }),
}))

vi.mock("../../api/me", () => ({
  fetchAuthenticatedProfile: mocks.fetchAuthenticatedProfileMock,
}))

vi.mock("../../api/projects", () => ({
  fetchProjects: mocks.fetchProjectsMock,
}))

function HookConsumer() {
  const { projects, loading, error } = useOngProjects()

  if (loading) return <p>Carregando</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <p>{projects.length} projetos</p>
      {projects.map((project) => (
        <article key={project.id}>
          <h2>{project.title}</h2>
          <span>{project.status}</span>
          <span data-testid={`funding-${project.id}`}>{project.fundingModel}</span>
          <span>{project.generalProgress}%</span>
        </article>
      ))}
    </div>
  )
}

describe("useOngProjects", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchAuthenticatedProfileMock.mockResolvedValue({ npoId: 42 })
    mocks.fetchProjectsMock.mockResolvedValue({
      content: [
        {
          id: 1,
          title: "Projeto Integrado",
          status: "ACTIVE",
          npoId: 42,
          npoName: "ONG",
          npoPhone: "51999",
          startDate: "2026-01-01",
          type: "SOCIAL_INVESTMENT_LAW",
          budgetNeeded: 1000,
          investedAmount: 250,
          progress: 30,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 50,
      first: true,
      last: true,
    })
  })

  it("busca perfil, lista projetos por npoId e mapeia dados para a tela", async () => {
    render(<HookConsumer />)

    await waitFor(() => {
      expect(screen.getByText("1 projetos")).toBeInTheDocument()
    })

    expect(mocks.fetchAuthenticatedProfileMock).toHaveBeenCalledWith("token")
    expect(mocks.fetchProjectsMock).toHaveBeenCalledWith(
      { npoId: 42, size: 50 },
      "token",
    )
    expect(screen.getByText("Projeto Integrado")).toBeInTheDocument()
    expect(screen.getByText("Ativo")).toBeInTheDocument()
    expect(screen.getByText("30%")).toBeInTheDocument()
  })

  it("mapeia SOCIAL_INVESTMENT_LAW para privateInvestment", async () => {
    render(<HookConsumer />)

    await waitFor(() => expect(screen.getByText("1 projetos")).toBeInTheDocument())
    expect(screen.getByTestId("funding-1")).toHaveTextContent("privateInvestment")
  })

  it("mapeia TAX_INCENTIVE_LAW para incentiveLaw", async () => {
    mocks.fetchProjectsMock.mockResolvedValue({
      content: [
        {
          id: 2,
          title: "Lei Incentivo",
          status: "ACTIVE",
          npoId: 42,
          npoName: "ONG",
          npoPhone: "51999",
          startDate: "2026-01-01",
          type: "TAX_INCENTIVE_LAW",
          budgetNeeded: 50000,
          investedAmount: 0,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 50,
      first: true,
      last: true,
    })

    render(<HookConsumer />)

    await waitFor(() => expect(screen.getByText("1 projetos")).toBeInTheDocument())
    expect(screen.getByTestId("funding-2")).toHaveTextContent("incentiveLaw")
  })

  it("exibe erro quando o perfil não possui npoId", async () => {
    mocks.fetchAuthenticatedProfileMock.mockResolvedValue({ npoId: null })

    render(<HookConsumer />)

    await waitFor(() => {
      expect(
        screen.getByText("Não foi possível carregar os projetos."),
      ).toBeInTheDocument()
    })
  })
})
