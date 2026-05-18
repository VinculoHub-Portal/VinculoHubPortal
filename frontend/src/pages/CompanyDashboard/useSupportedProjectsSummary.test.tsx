import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useSupportedProjectsSummary } from "./useSupportedProjectsSummary"

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchSummaryMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}))

vi.mock("../../api/companyPortfolio", () => ({
  fetchCompanySupportedProjectsSummary: mocks.fetchSummaryMock,
}))

function HookConsumer() {
  const { data, loading, error } = useSupportedProjectsSummary()

  if (loading) return <p>Carregando</p>
  if (error) return <p data-testid="error">{error}</p>

  return (
    <div>
      <p data-testid="active">{data.active}</p>
      <p data-testid="incentiveLaws">{data.incentiveLaws}</p>
      <p data-testid="privateInvestment">{data.privateInvestment}</p>
    </div>
  )
}

describe("useSupportedProjectsSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchSummaryMock.mockResolvedValue({
      active: 6,
      incentiveLaws: 4,
      privateInvestment: 2,
    })
  })

  it("busca o resumo autenticado ao montar", async () => {
    render(<HookConsumer />)

    await waitFor(() => expect(screen.getByTestId("active")).toHaveTextContent("6"))

    expect(mocks.getAccessTokenSilentlyMock).toHaveBeenCalled()
    expect(mocks.fetchSummaryMock).toHaveBeenCalledWith("token")
    expect(screen.getByTestId("incentiveLaws")).toHaveTextContent("4")
    expect(screen.getByTestId("privateInvestment")).toHaveTextContent("2")
  })

  it("expõe erro quando a API falha", async () => {
    mocks.fetchSummaryMock.mockRejectedValue(new Error("Servidor indisponível"))

    render(<HookConsumer />)

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("Servidor indisponível"),
    )
  })
})
