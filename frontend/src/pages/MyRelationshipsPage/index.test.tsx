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
