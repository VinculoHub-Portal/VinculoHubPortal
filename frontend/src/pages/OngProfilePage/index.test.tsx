import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { OngProfilePage } from "."

const mocks = vi.hoisted(() => ({
  getAccessTokenSilently: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilently,
    isAuthenticated: true,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    user: { "https://vinculohub/roles": ["NPO"] },
  }),
}))

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/ong/perfil"]}>
      <Routes>
        <Route path="/ong/perfil" element={<OngProfilePage />} />
        <Route path="/ong/dashboard" element={<p>Dashboard da ONG</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("OngProfilePage", () => {
  it("renderiza todos os cards em modo visualização", () => {
    renderPage()

    // ProfileHeaderCard
    expect(screen.getByText("Instituto Educação para Todos")).toBeInTheDocument()
    expect(screen.getByText("(ONG I)")).toBeInTheDocument()
    // "Educação" aparece em badge e em Área de Atuação
    expect(screen.getAllByText("Educação").length).toBeGreaterThanOrEqual(2)

    // OrganizationInfoCard
    expect(screen.getByText("12.345.678/0001-90")).toBeInTheDocument()
    expect(screen.getByText("contato@educacaoparatodos.org.br")).toBeInTheDocument()

    // ResponsibleCard
    expect(screen.getByText("Maria Silva Santos")).toBeInTheDocument()
    expect(screen.getByText("Diretora Executiva")).toBeInTheDocument()

    // MissionCard
    expect(
      screen.getByText(/Nossa organização está comprometida/),
    ).toBeInTheDocument()

    // PublicProfileCard
    expect(screen.getByLabelText("Link do perfil público")).toBeInTheDocument()
  })

  it("alterna para modo edição ao clicar em 'Editar Perfil'", async () => {
    renderPage()

    await userEvent.click(screen.getByText("Editar Perfil"))

    expect(screen.getByLabelText("Nome da Organização")).toBeInTheDocument()
    expect(screen.getByText("Cancelar")).toBeInTheDocument()
    expect(screen.getByText("Salvar")).toBeInTheDocument()
  })

  it("cancela edição restaurando os valores originais", async () => {
    renderPage()

    await userEvent.click(screen.getByText("Editar Perfil"))

    const nameInput = screen.getByLabelText("Nome da Organização")
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "Nome Alterado")

    await userEvent.click(screen.getByText("Cancelar"))

    expect(screen.getByText("Instituto Educação para Todos")).toBeInTheDocument()
  })

  it("salva as alterações e volta ao modo visualização", async () => {
    renderPage()

    await userEvent.click(screen.getByText("Editar Perfil"))

    const nameInput = screen.getByLabelText("Nome da Organização")
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "ONG Atualizada")

    await userEvent.click(screen.getByText("Salvar"))

    expect(screen.getByText("ONG Atualizada")).toBeInTheDocument()
    expect(screen.queryByLabelText("Nome da Organização")).not.toBeInTheDocument()
  })

  it("navega para o dashboard ao clicar em 'Voltar ao Dashboard'", async () => {
    renderPage()

    await userEvent.click(screen.getByRole("button", { name: "Voltar ao Dashboard" }))

    expect(screen.getByText("Dashboard da ONG")).toBeInTheDocument()
  })
})
