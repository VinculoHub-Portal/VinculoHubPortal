import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppRouter } from "."

const mocks = vi.hoisted(() => ({
  roles: ["NPO"],
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    loginWithRedirect: vi.fn(),
    user: { "https://vinculohub/roles": mocks.roles },
  }),
}))

vi.mock("../components/auth/AuthRoleRedirect", () => ({
  AuthRoleRedirect: () => null,
}))

vi.mock("../pages/LandingPage", () => ({
  LandingPage: () => <p>Página inicial</p>,
}))

vi.mock("../pages/RelationshipsPage", () => ({
  RelationshipsPage: () => <p>Página de vínculos</p>,
}))

describe("rota /vinculos", () => {
  beforeEach(() => {
    mocks.roles.splice(0, mocks.roles.length, "NPO")
    window.history.replaceState({}, "", "/vinculos")
  })

  it("permite acesso para NPO", () => {
    render(<AppRouter />)

    expect(screen.getByText("Página de vínculos")).toBeInTheDocument()
  })

  it("permite acesso para COMPANY", () => {
    mocks.roles.splice(0, mocks.roles.length, "COMPANY")

    render(<AppRouter />)

    expect(screen.getByText("Página de vínculos")).toBeInTheDocument()
  })

  it("redireciona outros perfis para a página inicial", async () => {
    mocks.roles.splice(0, mocks.roles.length, "ADMIN")

    render(<AppRouter />)

    expect(await screen.findByText("Página inicial")).toBeInTheDocument()
    expect(screen.queryByText("Página de vínculos")).not.toBeInTheDocument()
  })
})
