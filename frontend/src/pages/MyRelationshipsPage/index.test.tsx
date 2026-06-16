import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MyRelationshipsPage } from "./index"

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    user: {
      name: "Admin",
      nickname: "Admin",
    },
  }),
}))

vi.mock("../../hooks/useAuthProfile", () => ({
  useAuthProfile: () => ({ data: { userType: "company" } }),
}))

vi.mock("../../hooks/useMyRelationships", () => ({
  useMyRelationships: () => ({
    data: [
      {
        projectId: 321,
        projectName: "Biblioteca Comunitária Sementes do Saber",
        partnerInstitutionId: 101,
        partnerInstitutionName: "Instituto Educação para Todos",
        status: "active",
        partnerContactEmail: "contato@educacaoparatodos.org.br",
        partnerContactPhone: "(11) 1234-5678",
        canRespond: false,
        canConfirm: false,
      },
      {
        projectId: 323,
        projectName: "Educação Ambiental nas Escolas",
        partnerInstitutionId: 103,
        partnerInstitutionName: "Eco Futuro",
        status: "negotiation",
        partnerContactEmail: "contato@ecofuturo.org.br",
        partnerContactPhone: "(31) 2345-6789",
        canRespond: false,
        canConfirm: false,
      },
    ],
    isPending: false,
    isError: false,
    isRefetching: false,
    refetch: vi.fn(),
  }),
}))

describe("MyRelationshipsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("filtra os vínculos ao clicar em Em Negociação", async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={["/meus-vinculos"]}>
        <MyRelationshipsPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByText("Biblioteca Comunitária Sementes do Saber"),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /Em Negociação/i }))

    expect(
      screen.queryByText("Biblioteca Comunitária Sementes do Saber"),
    ).not.toBeInTheDocument()
    expect(screen.getByText("Educação Ambiental nas Escolas")).toBeInTheDocument()
    expect(screen.getByText("Aguardando confirmação da ONG")).toBeInTheDocument()
  })
})
