import type { ReactNode } from "react"
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

vi.mock("../pages/AdminOngsPage", () => ({
  AdminOngsPage: ({ children }: { children?: ReactNode }) => (
    <div>
      <p>Admin ONGs page</p>
      {children}
    </div>
  ),
}))

vi.mock("../pages/AdminOngsList", () => ({
  AdminOngsList: () => <p>Admin ONGs list</p>,
}))

vi.mock("../pages/AdminVinculosPage", () => ({
  AdminVinculosPage: ({ children }: { children?: ReactNode }) => (
    <div>
      <p>Admin vínculos page</p>
      {children}
    </div>
  ),
}))

vi.mock("../pages/AdminVinculosList", () => ({
  AdminVinculosList: () => <p>Admin vínculos list</p>,
}))

vi.mock("../pages/AdminNotificationsPage", () => ({
  AdminNotificationsPage: () => <p>Admin notificações page</p>,
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

describe("rotas administrativas", () => {
  beforeEach(() => {
    mocks.roles.splice(0, mocks.roles.length, "ADMIN")
  })

  it("compõe a rota /admin/ongs com page e list", () => {
    window.history.replaceState({}, "", "/admin/ongs")

    render(<AppRouter />)

    expect(screen.getByText("Admin ONGs page")).toBeInTheDocument()
    expect(screen.getByText("Admin ONGs list")).toBeInTheDocument()
  })

  it("compõe a rota /admin/vinculos com page e list", () => {
    window.history.replaceState({}, "", "/admin/vinculos")

    render(<AppRouter />)

    expect(screen.getByText("Admin vínculos page")).toBeInTheDocument()
    expect(screen.getByText("Admin vínculos list")).toBeInTheDocument()
  })

  it("mantém /admin/notificacoes sem a lista de vínculos", () => {
    window.history.replaceState({}, "", "/admin/notificacoes")

    render(<AppRouter />)

    expect(screen.getByText("Admin notificações page")).toBeInTheDocument()
    expect(screen.queryByText("Admin vínculos list")).not.toBeInTheDocument()
  })
})
