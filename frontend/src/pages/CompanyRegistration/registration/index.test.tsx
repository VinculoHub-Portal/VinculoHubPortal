import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CompanyRegistrationPage } from "./index"

const mocks = vi.hoisted(() => ({
  loginWithRedirectMock: vi.fn(),
  showToastMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    loginWithRedirect: mocks.loginWithRedirectMock,
  }),
}))

vi.mock("../../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}))

vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}))

vi.mock("../../../hooks/useCnpj", () => ({
  useCnpj: () => ({
    data: null,
    isFetching: false,
    error: null,
  }),
}))

vi.mock("../../../hooks/useZipCode", () => ({
  useZipCode: () => ({
    data: null,
    isFetching: false,
    error: null,
  }),
}))

describe("CompanyRegistrationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    })
  })

  it("rola para o topo ao avançar entre etapas", async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CompanyRegistrationPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/CNPJ/i), "11.222.333/0001-81")
    await user.click(screen.getByRole("button", { name: /Próximo/i }))

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" })
    })
    expect(screen.getByText("Informações de Contato")).toBeInTheDocument()
  })
})
